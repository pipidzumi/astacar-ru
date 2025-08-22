import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const url = new URL(req.url)
    const pathname = url.pathname

    // POST /auction-engine/sweep - Close ended auctions (cron job)
    if (pathname.includes('/sweep') && req.method === 'POST') {
      const now = new Date().toISOString()

      // Get all live auctions that have ended
      const { data: endedAuctions, error: fetchError } = await supabase
        .from('listings')
        .select(`
          *,
          bids!inner(amount, bidder_id, placed_at)
        `)
        .eq('status', 'live')
        .lt('end_at', now)

      if (fetchError) {
        console.error('Failed to fetch ended auctions:', fetchError)
        return new Response(JSON.stringify({ error: 'Failed to fetch auctions' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const results = []

      for (const auction of endedAuctions) {
        try {
          // Get highest valid bid
          const { data: highestBid } = await supabase
            .from('bids')
            .select('*')
            .eq('listing_id', auction.id)
            .eq('valid', true)
            .order('amount', { ascending: false })
            .limit(1)
            .single()

          let winner = null
          let reserveMet = true

          if (highestBid) {
            // Check if reserve price is met
            if (auction.reserve_price && highestBid.amount < auction.reserve_price) {
              reserveMet = false
            } else {
              winner = highestBid.bidder_id
            }
          }

          // Update listing status
          const { error: updateError } = await supabase
            .from('listings')
            .update({
              status: 'finished',
              winner_id: winner,
              current_price: highestBid?.amount || auction.current_price
            })
            .eq('id', auction.id)

          if (updateError) {
            console.error(`Failed to update auction ${auction.id}:`, updateError)
            continue
          }

          // Process deposits
          if (winner) {
            // Capture winner's deposit as fee
            await supabase
              .from('deposits')
              .update({ status: 'captured' })
              .eq('listing_id', auction.id)
              .eq('user_id', winner)

            // Create transaction for winner
            const { data: settings } = await supabase.from('settings').select('*')
            const settingsMap = settings?.reduce((acc, setting) => {
              acc[setting.key] = setting.value
              return acc
            }, {} as Record<string, any>) || {}

            const buyerFee = parseInt(settingsMap.COMMISSION_BUYER_FIXED) || 15000
            const sellerFeeRate = parseFloat(settingsMap.COMMISSION_SELLER_PCT) || 2
            const sellerFee = Math.floor((highestBid.amount * sellerFeeRate) / 100)

            await supabase
              .from('transactions')
              .insert([{
                listing_id: auction.id,
                buyer_id: winner,
                seller_id: auction.seller_id,
                vehicle_amount: highestBid.amount,
                fee_amount: buyerFee + sellerFee,
                status: 'initiated'
              }])
          }

          // Release deposits for non-winners
          await supabase
            .from('deposits')
            .update({ status: 'released' })
            .eq('listing_id', auction.id)
            .neq('user_id', winner || '00000000-0000-0000-0000-000000000000')

          // Create audit log
          await supabase
            .from('audit_logs')
            .insert([{
              entity_type: 'listing',
              entity_id: auction.id,
              action: 'auction_closed',
              diff: {
                winner_id: winner,
                reserve_met: reserveMet,
                final_price: highestBid?.amount
              }
            }])

          results.push({
            listing_id: auction.id,
            winner_id: winner,
            final_price: highestBid?.amount,
            reserve_met: reserveMet
          })

          // Send notifications (simplified)
          if (winner) {
            await supabase
              .from('notifications')
              .insert([{
                user_id: winner,
                type: 'auction_won',
                channel: 'email',
                payload: {
                  listing_id: auction.id,
                  final_price: highestBid.amount
                }
              }])
          }

        } catch (error) {
          console.error(`Error processing auction ${auction.id}:`, error)
        }
      }

      return new Response(JSON.stringify({ 
        processed: results.length,
        results 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // POST /auction-engine/tick/{listing_id} - Manual auction state check
    if (pathname.includes('/tick/') && req.method === 'POST') {
      const listingId = pathname.split('/').pop()

      const { data: listing, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', listingId)
        .single()

      if (error || !listing) {
        return new Response(JSON.stringify({ error: 'Listing not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const now = new Date()
      const endAt = new Date(listing.end_at)
      const timeLeft = endAt.getTime() - now.getTime()

      return new Response(JSON.stringify({
        listing_id: listingId,
        status: listing.status,
        time_left_ms: Math.max(0, timeLeft),
        time_left_formatted: timeLeft > 0 ? 
          `${Math.floor(timeLeft / (1000 * 60 * 60))}ч ${Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))}м` :
          'Завершён',
        current_price: listing.current_price,
        winner_id: listing.winner_id
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Auction engine error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})