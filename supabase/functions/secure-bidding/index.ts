// CRITICAL FIX C2 & C3: Secure Bidding with Authentication and Business Logic
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(clientId: string, maxRequests = 10, windowMs = 60000): boolean {
  const now = Date.now()
  const key = clientId
  const record = rateLimitStore.get(key)
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (record.count >= maxRequests) {
    return false
  }
  
  record.count++
  return true
}

function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    // Remove HTML tags and encode special characters
    return input
      .replace(/<[^>]*>/g, '')
      .replace(/[&<>"']/g, function(m) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[m] || m
      })
      .trim()
  }
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value)
    }
    return sanitized
  }
  return input
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // CRITICAL: Authentication check
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authentication' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Rate limiting
    const clientId = user.id + (req.headers.get('x-forwarded-for') || 'unknown')
    if (!checkRateLimit(clientId)) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const url = new URL(req.url)
    const pathname = url.pathname

    // POST /secure-bidding/place-bid - Secure bid placement
    if (pathname.includes('/place-bid') && req.method === 'POST') {
      const body = sanitizeInput(await req.json())
      const { listing_id, amount } = body

      if (!listing_id || !amount || typeof amount !== 'number' || amount <= 0) {
        return new Response(JSON.stringify({ error: 'Invalid bid parameters' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Verify user has valid deposit
      const { data: deposit } = await supabase
        .from('deposits')
        .select('*')
        .eq('user_id', user.id)
        .eq('listing_id', listing_id)
        .eq('status', 'hold')
        .single()

      if (!deposit) {
        return new Response(JSON.stringify({ error: 'Valid deposit required to bid' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Get listing details for validation
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .select('*')
        .eq('id', listing_id)
        .single()

      if (listingError || !listing) {
        return new Response(JSON.stringify({ error: 'Listing not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Server-side business logic validation
      if (listing.status !== 'live') {
        return new Response(JSON.stringify({ error: 'Auction is not active' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const now = new Date()
      const endTime = new Date(listing.end_at)
      if (now >= endTime) {
        return new Response(JSON.stringify({ error: 'Auction has ended' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      if (amount <= listing.current_price) {
        return new Response(JSON.stringify({ 
          error: `Bid must be higher than current price of ₽${listing.current_price.toLocaleString()}` 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      if (amount % 25000 !== 0) {
        return new Response(JSON.stringify({ error: 'Bid must be multiple of ₽25,000' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Anti-sniping logic - extend auction if bid in last 10 minutes
      const timeLeft = endTime.getTime() - now.getTime()
      const antiSnipeMinutes = 10 * 60 * 1000 // 10 minutes in milliseconds
      let newEndTime = listing.end_at

      if (timeLeft < antiSnipeMinutes) {
        newEndTime = new Date(now.getTime() + antiSnipeMinutes).toISOString()
      }

      // Use the secure place_bid_transaction function
      const { error: bidError } = await supabase
        .rpc('place_bid_transaction', {
          p_listing_id: listing_id,
          p_bidder_id: user.id,
          p_amount: amount,
          p_new_end_at: newEndTime,
          p_user_ip: req.headers.get('x-forwarded-for') || 'unknown'
        })

      if (bidError) {
        console.error('Bid placement failed:', bidError)
        return new Response(JSON.stringify({ error: 'Bid placement failed' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ 
        success: true,
        amount: amount,
        anti_snipe_triggered: timeLeft < antiSnipeMinutes,
        new_end_time: newEndTime
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // POST /secure-bidding/create-deposit - Secure deposit creation
    if (pathname.includes('/create-deposit') && req.method === 'POST') {
      const body = sanitizeInput(await req.json())
      const { listing_id, amount } = body

      if (!listing_id) {
        return new Response(JSON.stringify({ error: 'Listing ID required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Check if user already has a deposit for this listing
      const { data: existingDeposit } = await supabase
        .from('deposits')
        .select('*')
        .eq('user_id', user.id)
        .eq('listing_id', listing_id)
        .eq('status', 'hold')
        .single()

      if (existingDeposit) {
        return new Response(JSON.stringify({ 
          success: true,
          deposit: existingDeposit,
          message: 'Deposit already exists'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Get deposit amount from settings or default
      const defaultDepositAmount = amount || 15000 // Default ₽150

      const { data: deposit, error: depositError } = await supabase
        .from('deposits')
        .insert([{
          user_id: user.id,
          listing_id: listing_id,
          amount: defaultDepositAmount,
          status: 'hold',
          provider_ref: `secure_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }])
        .select()
        .single()

      if (depositError) {
        return new Response(JSON.stringify({ error: 'Failed to create deposit' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ 
        success: true,
        deposit: deposit
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Secure bidding error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})