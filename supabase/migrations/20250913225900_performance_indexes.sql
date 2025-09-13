-- Performance Optimization: Add Database Indexes
-- Date: 2025-09-13
-- Purpose: Optimize query performance for common filter and join patterns

-- Listings table performance indexes
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_end_at ON public.listings(end_at) WHERE status = 'live';
CREATE INDEX IF NOT EXISTS idx_listings_seller_status ON public.listings(seller_id, status);
CREATE INDEX IF NOT EXISTS idx_listings_vehicle_status ON public.listings(vehicle_id, status);
CREATE INDEX IF NOT EXISTS idx_listings_reserve_price ON public.listings(reserve_price) WHERE reserve_price IS NOT NULL;

-- Bids table performance indexes (critical for auction performance)
CREATE INDEX IF NOT EXISTS idx_bids_listing_amount ON public.bids(listing_id, amount DESC) WHERE valid = true;
CREATE INDEX IF NOT EXISTS idx_bids_listing_placed ON public.bids(listing_id, placed_at DESC);
CREATE INDEX IF NOT EXISTS idx_bids_bidder_listing ON public.bids(bidder_id, listing_id);
CREATE INDEX IF NOT EXISTS idx_bids_valid_amount ON public.bids(amount DESC) WHERE valid = true;

-- Deposits table performance indexes (critical for bid validation)
CREATE INDEX IF NOT EXISTS idx_deposits_user_listing_status ON public.deposits(user_id, listing_id, status);
CREATE INDEX IF NOT EXISTS idx_deposits_listing_status ON public.deposits(listing_id, status);
CREATE INDEX IF NOT EXISTS idx_deposits_user_status ON public.deposits(user_id, status);

-- Vehicles table performance indexes (for filtering)
CREATE INDEX IF NOT EXISTS idx_vehicles_make ON public.vehicles(make);
CREATE INDEX IF NOT EXISTS idx_vehicles_make_model ON public.vehicles(make, model);
CREATE INDEX IF NOT EXISTS idx_vehicles_year ON public.vehicles(year);
CREATE INDEX IF NOT EXISTS idx_vehicles_mileage ON public.vehicles(mileage);
CREATE INDEX IF NOT EXISTS idx_vehicles_vin ON public.vehicles(vin) WHERE vin IS NOT NULL;

-- Users table performance indexes
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_kyc_status ON public.users(kyc_status);
CREATE INDEX IF NOT EXISTS idx_users_role_kyc ON public.users(role, kyc_status);

-- Media assets table performance indexes
CREATE INDEX IF NOT EXISTS idx_media_listing_type ON public.media_assets(listing_id, media_type);
CREATE INDEX IF NOT EXISTS idx_media_listing_order ON public.media_assets(listing_id, order_position);

-- Audit logs table performance indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created ON public.audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- QA table performance indexes
CREATE INDEX IF NOT EXISTS idx_qa_listing ON public.qa(listing_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_qa_user ON public.qa(user_id, created_at DESC);

-- Transactions table performance indexes
CREATE INDEX IF NOT EXISTS idx_transactions_listing_status ON public.transactions(listing_id, status);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer_status ON public.transactions(buyer_id, status);
CREATE INDEX IF NOT EXISTS idx_transactions_seller_status ON public.transactions(seller_id, status);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON public.transactions(created_at DESC);

-- Disputes table performance indexes  
CREATE INDEX IF NOT EXISTS idx_disputes_listing_status ON public.disputes(listing_id, status);
CREATE INDEX IF NOT EXISTS idx_disputes_reporter_created ON public.disputes(reporter_id, created_at DESC);

-- Notifications table performance indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, read_at) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON public.notifications(user_id, created_at DESC);

-- Profiles table performance indexes
CREATE INDEX IF NOT EXISTS idx_profiles_rating ON public.profiles(rating DESC) WHERE rating > 0;
CREATE INDEX IF NOT EXISTS idx_profiles_city ON public.profiles(city_id) WHERE city_id IS NOT NULL;

-- Settings table performance indexes
CREATE INDEX IF NOT EXISTS idx_settings_key ON public.settings(key);

-- Performance optimization for auction engine queries
-- Composite index for ended auctions sweep
CREATE INDEX IF NOT EXISTS idx_listings_ended_auctions ON public.listings(status, end_at) 
  WHERE status = 'live' AND end_at < NOW();

-- Composite index for bid history queries  
CREATE INDEX IF NOT EXISTS idx_bids_history ON public.bids(listing_id, placed_at DESC, amount DESC)
  WHERE valid = true;

-- Add statistics refresh for better query planning
ANALYZE public.listings;
ANALYZE public.bids;
ANALYZE public.deposits;
ANALYZE public.vehicles;
ANALYZE public.users;

-- Add comments for maintenance
COMMENT ON INDEX idx_listings_status IS 'Optimizes filtering by listing status';
COMMENT ON INDEX idx_bids_listing_amount IS 'Critical for finding highest bids in auctions';
COMMENT ON INDEX idx_deposits_user_listing_status IS 'Critical for bid validation - checks if user has valid deposit';
COMMENT ON INDEX idx_vehicles_make_model IS 'Optimizes vehicle search and filtering';
COMMENT ON INDEX idx_users_role_kyc IS 'Optimizes user authentication and access control';