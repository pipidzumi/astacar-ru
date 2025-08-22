import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PlaceBidRequest {
  listing_id: string
  amount: number
}

interface CreateDepositRequest {
  listing_id: string
  amount?: number
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: req.headers.get('Authorization')! } }
    })

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const url = new URL(req.url)
    const pathname = url.pathname

    // POST /bidding/deposits - Create deposit
    if (pathname.includes('/deposits') && req.method === 'POST') {
      const body: CreateDepositRequest = await req.json()

      // Check if user is buyer and KYC approved
      const { data: userData } = await supabase
        .from('users')
        .select('role, kyc_status')
        .eq('id', user.id)
        .single()

      if (!userData || !['buyer', 'admin'].includes(userData.role)) {
        return new Response(JSON.stringify({ error: 'Only buyers can create deposits' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      if (userData.kyc_status !== 'success' && userData.role !== 'admin') {
        return new Response(JSON.stringify({ error: 'KYC verification required to place deposits' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Get deposit amount from settings
      const { data: settings } = await supabase
        .from('settings')
        .select('*')

      const settingsMap = settings?.reduce((acc, setting) => {
        acc[setting.key] = setting.value
        return acc
      }, {} as Record<string, any>) || {}

      const depositPolicy = settingsMap.DEPOSIT_POLICY
      const depositFixed = parseInt(settingsMap.DEPOSIT_FIXED) || 15000
      const depositPct = parseInt(settingsMap.DEPOSIT_PCT) || 5

      let depositAmount = body.amount
      if (!depositAmount) {
        if (depositPolicy === 'fixed') {
          depositAmount = depositFixed
        } else {
          // For percentage, we'd need the listing start price
          const { data: listing } = await supabase
            .from('listings')
            .select('start_price')
            .eq('id', body.listing_id)
            .single()
          
          depositAmount = listing ? Math.floor((listing.start_price * depositPct) / 100) : depositFixed
        }
      }

      // Create deposit (mock payment processing)
      const { data: deposit, error: depositError } = await supabase
        .from('deposits')
        .insert([{
          user_id: user.id,
          listing_id: body.listing_id,
          amount: depositAmount,
          status: 'hold',
          provider_ref: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }])
        .select()
        .single()

      if (depositError) {
        console.error('Deposit creation error:', depositError)
        return new Response(JSON.stringify({ error: 'Failed to create deposit' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ data: deposit }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // POST /bidding/bids - Place bid
    if (pathname.includes('/bids') && req.method === 'POST') {
      const body: PlaceBidRequest = await req.json()

      // Verify user has deposit for this listing
      const { data: deposit } = await supabase
        .from('deposits')
        .select('*')
        .eq('user_id', user.id)
        .eq('listing_id', body.listing_id)
        .eq('status', 'hold')
        .single()

      if (!deposit) {
        return new Response(JSON.stringify({ error: 'Active deposit required to place bids' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Get listing and current state
      const { data: listing } = await supabase
        .from('listings')
        .select('*, vehicle:vehicles(*)')
        .eq('id', body.listing_id)
        .single()

      if (!listing || listing.status !== 'live') {
        return new Response(JSON.stringify({ error: 'Listing not available for bidding' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Check auction timing
      const now = new Date()
      const startAt = new Date(listing.start_at)
      const endAt = new Date(listing.end_at)

      if (now < startAt || now > endAt) {
        return new Response(JSON.stringify({ error: 'Auction not active' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Get settings
      const { data: settings } = await supabase.from('settings').select('*')
      const settingsMap = settings?.reduce((acc, setting) => {
        acc[setting.key] = setting.value
        return acc
      }, {} as Record<string, any>) || {}

      const minBidStep = parseInt(settingsMap.MIN_BID_STEP) || 5000
      const snipeExtensionMin = parseInt(settingsMap.SNIPE_EXTENSION_MIN) || 30

      // Validate bid amount
      const requiredMinBid = listing.current_price + minBidStep
      if (body.amount < requiredMinBid || body.amount % minBidStep !== 0) {
        return new Response(JSON.stringify({ 
          error: `Bid must be at least ${requiredMinBid} and in increments of ${minBidStep}`
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Check for anti-sniping
      const timeLeft = endAt.getTime() - now.getTime()
      const snipeThreshold = snipeExtensionMin * 60 * 1000 // Convert to milliseconds
      let newEndAt = endAt

      if (timeLeft < snipeThreshold) {
        // Extend auction by snipe extension time
        newEndAt = new Date(now.getTime() + (snipeExtensionMin * 60 * 1000))
      }

      // Start transaction
      const { error: bidError } = await supabase.rpc('place_bid_transaction', {
        p_listing_id: body.listing_id,
        p_bidder_id: user.id,
        p_amount: body.amount,
        p_new_end_at: newEndAt.toISOString(),
        p_user_ip: req.headers.get('x-forwarded-for') || 'unknown'
      })

      if (bidError) {
        console.error('Bid placement error:', bidError)
        return new Response(JSON.stringify({ error: 'Failed to place bid' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Get the new bid
      const { data: newBid } = await supabase
        .from('bids')
        .select('*')
        .eq('listing_id', body.listing_id)
        .eq('bidder_id', user.id)
        .eq('amount', body.amount)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      return new Response(JSON.stringify({ 
        data: newBid,
        anti_snipe_triggered: timeLeft < snipeThreshold,
        new_end_time: newEndAt.toISOString()
      }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // GET /bidding/bids/{listing_id} - Get bid history
    if (pathname.includes('/bids/') && req.method === 'GET') {
      const listingId = pathname.split('/').pop()
      
      const { data, error } = await supabase
        .from('bids')
        .select(`
          id,
          amount,
          placed_at,
          valid,
          source,
          bidder:users(id, email),
          bidder_profile:profiles!bidder_id(full_name)
        `)
        .eq('listing_id', listingId)
        .eq('valid', true)
        .order('amount', { ascending: false })

      if (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch bids' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Bidding function error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})