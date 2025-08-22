import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateListingRequest {
  vehicle: {
    vin: string
    make: string
    model: string
    year: number
    mileage: number
    engine?: string
    transmission?: string
    drivetrain?: string
    color?: string
    owners_count?: number
  }
  start_price: number
  reserve_price?: number
  buy_now_price?: number
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

    // GET /listings - List all listings with filters
    if (req.method === 'GET') {
      const params = url.searchParams
      let query = supabase
        .from('listings')
        .select(`
          *,
          vehicle:vehicles(*),
          seller:users(id, email),
          seller_profile:profiles!seller_id(full_name, rating),
          inspection:inspections(*),
          media:media_assets(*),
          bids(count),
          current_bid:bids(amount, bidder_id, placed_at) ORDER BY amount DESC LIMIT 1
        `)

      // Apply filters
      if (params.get('status')) {
        query = query.eq('status', params.get('status'))
      }
      if (params.get('make')) {
        query = query.eq('vehicle.make', params.get('make'))
      }
      if (params.get('no_reserve') === 'true') {
        query = query.is('reserve_price', null)
      }

      // Pagination
      const page = parseInt(params.get('page') || '1')
      const limit = parseInt(params.get('limit') || '20')
      const offset = (page - 1) * limit

      query = query.range(offset, offset + limit - 1)

      const { data, error } = await query

      if (error) {
        console.error('Listings query error:', error)
        return new Response(JSON.stringify({ error: 'Failed to fetch listings' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // POST /listings - Create new listing
    if (req.method === 'POST') {
      const body: CreateListingRequest = await req.json()

      // Check if user is seller
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!userData || !['seller', 'admin'].includes(userData.role)) {
        return new Response(JSON.stringify({ error: 'Only sellers can create listings' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Create vehicle first
      const { data: vehicle, error: vehicleError } = await supabase
        .from('vehicles')
        .insert([body.vehicle])
        .select()
        .single()

      if (vehicleError) {
        console.error('Vehicle creation error:', vehicleError)
        return new Response(JSON.stringify({ error: 'Failed to create vehicle' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Create listing
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .insert([{
          vehicle_id: vehicle.id,
          seller_id: user.id,
          start_price: body.start_price,
          reserve_price: body.reserve_price,
          buy_now_price: body.buy_now_price,
          current_price: body.start_price
        }])
        .select()
        .single()

      if (listingError) {
        console.error('Listing creation error:', listingError)
        return new Response(JSON.stringify({ error: 'Failed to create listing' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Create audit log
      await supabase
        .from('audit_logs')
        .insert([{
          entity_type: 'listing',
          entity_id: listing.id,
          action: 'created',
          user_id: user.id,
          diff: { created: listing }
        }])

      return new Response(JSON.stringify({ data: listing }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Listings function error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})