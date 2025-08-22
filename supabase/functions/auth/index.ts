import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RegisterRequest {
  email: string
  password: string
  phone?: string
  role?: 'buyer' | 'seller'
  full_name?: string
}

interface LoginRequest {
  email: string
  password: string
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

    if (pathname.includes('/register') && req.method === 'POST') {
      const body: RegisterRequest = await req.json()
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: body.email,
        password: body.password,
        email_confirm: true
      })

      if (authError) {
        return new Response(JSON.stringify({ error: authError.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Create user record
      const { error: userError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          email: body.email,
          phone: body.phone,
          role: body.role || 'buyer',
          kyc_status: body.role === 'admin' ? 'not_required' : 'pending'
        }])

      if (userError) {
        console.error('User creation error:', userError)
        return new Response(JSON.stringify({ error: 'Failed to create user profile' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Create profile if full_name provided
      if (body.full_name) {
        await supabase
          .from('profiles')
          .insert([{
            user_id: authData.user.id,
            full_name: body.full_name
          }])
      }

      return new Response(JSON.stringify({ 
        user: authData.user,
        message: 'User registered successfully'
      }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (pathname.includes('/login') && req.method === 'POST') {
      const body: LoginRequest = await req.json()
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: body.email,
        password: body.password
      })

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ 
        user: data.user,
        session: data.session
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Auth function error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})