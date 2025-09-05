-- CRITICAL FIX C1: Secure RLS Policies for Data Protection

-- Fix users table - only allow users to see their own data and admins to see all
DROP POLICY IF EXISTS "Public profiles are viewable" ON public.profiles;
DROP POLICY IF EXISTS "Bids are publicly viewable" ON public.bids;
DROP POLICY IF EXISTS "Vehicles are publicly viewable" ON public.vehicles;

-- Secure profiles table - remove public access
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (is_admin(auth.uid()));

-- Secure bids table - only show to participants and admins
CREATE POLICY "Listing participants can view bids"
ON public.bids FOR SELECT
USING (
  auth.uid() = bidder_id 
  OR is_moderator_or_admin(auth.uid())
  OR EXISTS (
    SELECT 1 FROM listings 
    WHERE listings.id = bids.listing_id 
    AND listings.seller_id = auth.uid()
  )
);

-- Secure vehicles table - only authenticated users
CREATE POLICY "Authenticated users can view vehicles"
ON public.vehicles FOR SELECT
TO authenticated
USING (true);

-- Add function to check if user has valid deposit for listing
CREATE OR REPLACE FUNCTION public.has_valid_deposit(user_uuid uuid, listing_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.deposits
    WHERE user_id = user_uuid
    AND listing_id = listing_uuid
    AND status = 'hold'
  );
$$;

-- Add function to validate bid amount
CREATE OR REPLACE FUNCTION public.is_valid_bid_amount(listing_uuid uuid, bid_amount bigint)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.listings
    WHERE id = listing_uuid
    AND status = 'live'
    AND bid_amount > current_price
    AND bid_amount % 25000 = 0  -- Must be multiple of min step
    AND (reserve_price IS NULL OR bid_amount >= reserve_price)
  );
$$;

-- Enhanced bid policy with deposit requirement
DROP POLICY IF EXISTS "Buyers can create bids" ON public.bids;
CREATE POLICY "Verified users with deposits can create bids"
ON public.bids FOR INSERT
WITH CHECK (
  auth.uid() = bidder_id
  AND get_user_role(auth.uid()) IN ('buyer', 'admin')
  AND has_valid_deposit(auth.uid(), listing_id)
  AND is_valid_bid_amount(listing_id, amount)
);

-- Add immutable fields protection function
CREATE OR REPLACE FUNCTION public.protect_immutable_listing_fields()
RETURNS trigger AS $$
BEGIN
  -- Check if listing has any valid bids
  IF EXISTS (
    SELECT 1 FROM public.bids 
    WHERE listing_id = NEW.id 
    AND valid = true
  ) THEN
    -- Protect economic fields after first valid bid
    IF OLD.start_price != NEW.start_price THEN
      RAISE EXCEPTION 'Cannot modify start_price after first valid bid';
    END IF;
    
    IF OLD.reserve_price != NEW.reserve_price THEN
      RAISE EXCEPTION 'Cannot modify reserve_price after first valid bid';
    END IF;
    
    IF OLD.buy_now_price != NEW.buy_now_price THEN
      RAISE EXCEPTION 'Cannot modify buy_now_price after first valid bid';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for immutable field protection
DROP TRIGGER IF EXISTS protect_listing_economic_fields ON public.listings;
CREATE TRIGGER protect_listing_economic_fields
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.protect_immutable_listing_fields();

-- Add audit logging function for sensitive operations
CREATE OR REPLACE FUNCTION public.log_sensitive_operation(
  p_entity_type text,
  p_entity_id uuid,
  p_action text,
  p_old_values jsonb DEFAULT '{}',
  p_new_values jsonb DEFAULT '{}'
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.audit_logs (
    entity_type,
    entity_id,
    action,
    user_id,
    diff
  ) VALUES (
    p_entity_type,
    p_entity_id,
    p_action,
    auth.uid(),
    jsonb_build_object(
      'before', p_old_values,
      'after', p_new_values,
      'timestamp', now(),
      'ip_address', current_setting('request.headers', true)::json->>'x-forwarded-for'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;