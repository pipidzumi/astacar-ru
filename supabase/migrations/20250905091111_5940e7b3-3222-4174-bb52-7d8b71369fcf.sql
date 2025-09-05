-- CRITICAL FIX C1: Secure RLS Policies for Data Protection (Fixed)

-- Drop all existing problematic policies first
DROP POLICY IF EXISTS "Public profiles are viewable" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Bids are publicly viewable" ON public.bids;
DROP POLICY IF EXISTS "Vehicles are publicly viewable" ON public.vehicles;
DROP POLICY IF EXISTS "Buyers can create bids" ON public.bids;

-- Secure profiles table - remove public access
CREATE POLICY "profile_select_own"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "profile_select_admin"
ON public.profiles FOR SELECT
USING (is_admin(auth.uid()));

-- Secure bids table - only show to participants and admins
CREATE POLICY "bids_select_participants"
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
CREATE POLICY "vehicles_select_authenticated"
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

-- Enhanced bid policy with deposit requirement
CREATE POLICY "bids_insert_verified_with_deposit"
ON public.bids FOR INSERT
WITH CHECK (
  auth.uid() = bidder_id
  AND get_user_role(auth.uid()) IN ('buyer', 'admin')
  AND has_valid_deposit(auth.uid(), listing_id)
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
    IF OLD.start_price IS DISTINCT FROM NEW.start_price THEN
      RAISE EXCEPTION 'Cannot modify start_price after first valid bid';
    END IF;
    
    IF OLD.reserve_price IS DISTINCT FROM NEW.reserve_price THEN
      RAISE EXCEPTION 'Cannot modify reserve_price after first valid bid';
    END IF;
    
    IF OLD.buy_now_price IS DISTINCT FROM NEW.buy_now_price THEN
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