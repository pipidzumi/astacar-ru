-- Create enums
CREATE TYPE public.user_role AS ENUM ('guest', 'buyer', 'seller', 'expert', 'moderator', 'admin');
CREATE TYPE public.kyc_status AS ENUM ('pending', 'success', 'failed', 'not_required');
CREATE TYPE public.listing_status AS ENUM ('draft', 'moderation', 'live', 'finished', 'cancelled');
CREATE TYPE public.media_type AS ENUM ('photo', 'video', 'doc');
CREATE TYPE public.bid_source AS ENUM ('manual', 'autobid');
CREATE TYPE public.deposit_status AS ENUM ('hold', 'released', 'captured', 'failed');
CREATE TYPE public.transaction_status AS ENUM ('initiated', 'escrow', 'paid', 'released', 'refund', 'failed');
CREATE TYPE public.dispute_reason AS ENUM ('condition_mismatch', 'undisclosed_lien', 'doc_issue', 'other');
CREATE TYPE public.dispute_status AS ENUM ('open', 'in_review', 'resolved', 'rejected');
CREATE TYPE public.notification_channel AS ENUM ('email', 'sms', 'push', 'webhook');
CREATE TYPE public.notification_status AS ENUM ('pending', 'sent', 'failed');

-- Users table (extends auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE,
  role user_role NOT NULL DEFAULT 'buyer',
  kyc_status kyc_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Profiles table
CREATE TABLE public.profiles (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  full_name TEXT,
  dob DATE,
  id_doc_masked TEXT,
  address TEXT,
  rating NUMERIC(3,2) DEFAULT 0.0,
  ban_flags JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Vehicles table
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vin TEXT UNIQUE NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL CHECK (year > 1900 AND year <= EXTRACT(YEAR FROM NOW()) + 1),
  mileage INTEGER NOT NULL CHECK (mileage >= 0),
  engine TEXT,
  transmission TEXT,
  drivetrain TEXT,
  color TEXT,
  owners_count INTEGER CHECK (owners_count > 0),
  docs_status JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Listings table
CREATE TABLE public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE RESTRICT,
  seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  status listing_status NOT NULL DEFAULT 'draft',
  start_price BIGINT NOT NULL CHECK (start_price > 0),
  reserve_price BIGINT CHECK (reserve_price IS NULL OR reserve_price >= start_price),
  buy_now_price BIGINT CHECK (buy_now_price IS NULL OR buy_now_price >= start_price),
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  current_price BIGINT NOT NULL DEFAULT 0,
  winner_id UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_auction_times CHECK (start_at IS NULL OR end_at IS NULL OR start_at < end_at)
);

-- Inspections table
CREATE TABLE public.inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID UNIQUE NOT NULL REFERENCES public.listings(id) ON DELETE RESTRICT,
  expert_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  inspected_at TIMESTAMPTZ,
  checklist JSONB DEFAULT '{}',
  legal JSONB DEFAULT '{}',
  media JSONB DEFAULT '{}',
  expert_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Media assets table
CREATE TABLE public.media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  type media_type NOT NULL,
  url TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bids table
CREATE TABLE public.bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE RESTRICT,
  bidder_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  amount BIGINT NOT NULL CHECK (amount > 0),
  placed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid BOOLEAN NOT NULL DEFAULT true,
  source bid_source NOT NULL DEFAULT 'manual',
  ip INET,
  device JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Deposits table
CREATE TABLE public.deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE RESTRICT,
  amount BIGINT NOT NULL CHECK (amount > 0),
  status deposit_status NOT NULL DEFAULT 'hold',
  provider_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

-- Transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE RESTRICT,
  buyer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  vehicle_amount BIGINT NOT NULL CHECK (vehicle_amount > 0),
  fee_amount BIGINT NOT NULL CHECK (fee_amount >= 0),
  status transaction_status NOT NULL DEFAULT 'initiated',
  escrow_ref TEXT,
  documents JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Disputes table
CREATE TABLE public.disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE RESTRICT,
  initiator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  reason_type dispute_reason NOT NULL,
  description TEXT NOT NULL,
  evidence JSONB DEFAULT '[]',
  status dispute_status NOT NULL DEFAULT 'open',
  resolution JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Q&A table
CREATE TABLE public.qa_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT,
  questioner_id UUID REFERENCES public.users(id),
  answerer_id UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  channel notification_channel NOT NULL,
  payload JSONB DEFAULT '{}',
  status notification_status NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Settings table
CREATE TABLE public.settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  user_id UUID REFERENCES public.users(id),
  diff JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Outbox table for domain events
CREATE TABLE public.outbox_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregate_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_phone ON public.users(phone);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_kyc_status ON public.users(kyc_status);

CREATE INDEX idx_listings_status ON public.listings(status);
CREATE INDEX idx_listings_seller_id ON public.listings(seller_id);
CREATE INDEX idx_listings_status_end_at ON public.listings(status, end_at);
CREATE INDEX idx_listings_start_price ON public.listings(start_price);
CREATE INDEX idx_listings_current_price ON public.listings(current_price);

CREATE INDEX idx_bids_listing_id_placed_at ON public.bids(listing_id, placed_at DESC);
CREATE INDEX idx_bids_bidder_id ON public.bids(bidder_id);
CREATE INDEX idx_bids_amount ON public.bids(amount);

CREATE INDEX idx_deposits_user_id_listing_id ON public.deposits(user_id, listing_id);
CREATE INDEX idx_deposits_status ON public.deposits(status);

CREATE INDEX idx_transactions_status_created_at ON public.transactions(status, created_at);
CREATE INDEX idx_transactions_buyer_id ON public.transactions(buyer_id);
CREATE INDEX idx_transactions_seller_id ON public.transactions(seller_id);

CREATE INDEX idx_disputes_status_created_at ON public.disputes(status, created_at);
CREATE INDEX idx_disputes_listing_id ON public.disputes(listing_id);

CREATE INDEX idx_notifications_user_id_status ON public.notifications(user_id, status);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at);

CREATE INDEX idx_media_assets_listing_id_order ON public.media_assets(listing_id, order_index);

CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);

CREATE INDEX idx_outbox_events_processed ON public.outbox_events(processed_at) WHERE processed_at IS NULL;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON public.listings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_inspections_updated_at BEFORE UPDATE ON public.inspections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_deposits_updated_at BEFORE UPDATE ON public.deposits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_disputes_updated_at BEFORE UPDATE ON public.disputes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_qa_threads_updated_at BEFORE UPDATE ON public.qa_threads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings
INSERT INTO public.settings (key, value) VALUES
  ('MIN_BID_STEP', '5000'),
  ('SNIPE_EXTENSION_MIN', '30'),
  ('DEPOSIT_POLICY', '"fixed"'),
  ('DEPOSIT_FIXED', '15000'),
  ('DEPOSIT_PCT', '5'),
  ('COMMISSION_BUYER_FIXED', '15000'),
  ('COMMISSION_BUYER_PCT', '0'),
  ('COMMISSION_SELLER_PCT', '2'),
  ('RESERVE_ALLOWED', 'true'),
  ('BUY_NOW_ALLOWED', 'true'),
  ('DISPUTE_WINDOW_HOURS', '48'),
  ('ESCROW_PROVIDER', '"mock"'),
  ('MEDIA_REQUIREMENTS', '{"photos_min": 60, "videos_min": 2}');

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qa_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outbox_events ENABLE ROW LEVEL SECURITY;

-- Create security definer functions to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS user_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.users WHERE id = user_uuid;
$$;

CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role = 'admin' FROM public.users WHERE id = user_uuid;
$$;

CREATE OR REPLACE FUNCTION public.is_moderator_or_admin(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role IN ('moderator', 'admin') FROM public.users WHERE id = user_uuid;
$$;

-- RLS Policies for users table
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update any user" ON public.users
  FOR UPDATE USING (public.is_admin(auth.uid()));

-- RLS Policies for profiles table
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public profiles are viewable" ON public.profiles
  FOR SELECT USING (true);

-- RLS Policies for vehicles table
CREATE POLICY "Vehicles are publicly viewable" ON public.vehicles
  FOR SELECT USING (true);

CREATE POLICY "Sellers can create vehicles" ON public.vehicles
  FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) IN ('seller', 'admin'));

CREATE POLICY "Admins can manage vehicles" ON public.vehicles
  FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for listings table
CREATE POLICY "Listings are publicly viewable" ON public.listings
  FOR SELECT USING (true);

CREATE POLICY "Sellers can create their own listings" ON public.listings
  FOR INSERT WITH CHECK (auth.uid() = seller_id AND public.get_user_role(auth.uid()) IN ('seller', 'admin'));

CREATE POLICY "Sellers can update their own listings" ON public.listings
  FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Moderators can update listings" ON public.listings
  FOR UPDATE USING (public.is_moderator_or_admin(auth.uid()));

-- RLS Policies for inspections table
CREATE POLICY "Inspections are publicly viewable" ON public.inspections
  FOR SELECT USING (true);

CREATE POLICY "Experts can create inspections" ON public.inspections
  FOR INSERT WITH CHECK (auth.uid() = expert_id AND public.get_user_role(auth.uid()) IN ('expert', 'admin'));

CREATE POLICY "Experts can update their inspections" ON public.inspections
  FOR UPDATE USING (auth.uid() = expert_id);

-- RLS Policies for media assets table
CREATE POLICY "Media assets are publicly viewable" ON public.media_assets
  FOR SELECT USING (true);

CREATE POLICY "Listing owners can manage media" ON public.media_assets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.listings 
      WHERE id = listing_id AND seller_id = auth.uid()
    )
  );

CREATE POLICY "Experts can manage media for their inspections" ON public.media_assets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.inspections 
      WHERE listing_id = media_assets.listing_id AND expert_id = auth.uid()
    )
  );

-- RLS Policies for bids table
CREATE POLICY "Bids are publicly viewable" ON public.bids
  FOR SELECT USING (true);

CREATE POLICY "Buyers can create bids" ON public.bids
  FOR INSERT WITH CHECK (auth.uid() = bidder_id AND public.get_user_role(auth.uid()) IN ('buyer', 'admin'));

-- RLS Policies for deposits table
CREATE POLICY "Users can view their own deposits" ON public.deposits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all deposits" ON public.deposits
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can create their own deposits" ON public.deposits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for transactions table
CREATE POLICY "Users can view their own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() IN (buyer_id, seller_id));

CREATE POLICY "Admins can view all transactions" ON public.transactions
  FOR SELECT USING (public.is_admin(auth.uid()));

-- RLS Policies for disputes table
CREATE POLICY "Dispute participants can view" ON public.disputes
  FOR SELECT USING (
    auth.uid() = initiator_id OR 
    public.is_moderator_or_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.transactions 
      WHERE listing_id = disputes.listing_id 
      AND (buyer_id = auth.uid() OR seller_id = auth.uid())
    )
  );

CREATE POLICY "Users can create disputes" ON public.disputes
  FOR INSERT WITH CHECK (auth.uid() = initiator_id);

CREATE POLICY "Moderators can update disputes" ON public.disputes
  FOR UPDATE USING (public.is_moderator_or_admin(auth.uid()));

-- RLS Policies for Q&A table
CREATE POLICY "Q&A threads are publicly viewable" ON public.qa_threads
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can ask questions" ON public.qa_threads
  FOR INSERT WITH CHECK (auth.uid() = questioner_id);

CREATE POLICY "Experts and moderators can answer" ON public.qa_threads
  FOR UPDATE USING (
    public.get_user_role(auth.uid()) IN ('expert', 'moderator', 'admin')
    AND auth.uid() = answerer_id
  );

-- RLS Policies for notifications table
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for settings table
CREATE POLICY "Settings are publicly readable" ON public.settings
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify settings" ON public.settings
  FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for audit logs table
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (public.is_admin(auth.uid()));

-- RLS Policies for outbox events table
CREATE POLICY "System can manage outbox events" ON public.outbox_events
  FOR ALL USING (true);