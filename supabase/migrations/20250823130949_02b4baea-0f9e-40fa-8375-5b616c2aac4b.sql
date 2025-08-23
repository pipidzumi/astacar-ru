-- Create stored procedure for atomic bid placement
CREATE OR REPLACE FUNCTION public.place_bid_transaction(
  p_listing_id UUID,
  p_bidder_id UUID,
  p_amount BIGINT,
  p_new_end_at TIMESTAMPTZ,
  p_user_ip TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  current_price BIGINT;
  current_end_at TIMESTAMPTZ;
BEGIN
  -- Lock the listing row for update
  SELECT listings.current_price, listings.end_at
  INTO current_price, current_end_at
  FROM public.listings
  WHERE id = p_listing_id
  FOR UPDATE;

  -- Verify bid is still valid (in case of race condition)
  IF p_amount <= current_price THEN
    RAISE EXCEPTION 'Bid amount must be higher than current price of %', current_price;
  END IF;

  -- Insert the bid
  INSERT INTO public.bids (
    listing_id,
    bidder_id,
    amount,
    placed_at,
    valid,
    source,
    ip
  ) VALUES (
    p_listing_id,
    p_bidder_id,
    p_amount,
    NOW(),
    true,
    'manual',
    p_user_ip::INET
  );

  -- Update listing with new current price and potentially extended end time
  UPDATE public.listings
  SET 
    current_price = p_amount,
    end_at = p_new_end_at,
    updated_at = NOW()
  WHERE id = p_listing_id;

  -- Create audit log
  INSERT INTO public.audit_logs (
    entity_type,
    entity_id,
    action,
    user_id,
    diff
  ) VALUES (
    'bid',
    p_listing_id,
    'bid_placed',
    p_bidder_id,
    jsonb_build_object(
      'amount', p_amount,
      'previous_price', current_price,
      'anti_snipe', CASE WHEN p_new_end_at > current_end_at THEN true ELSE false END
    )
  );
END;
$$;