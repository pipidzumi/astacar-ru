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

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Starting seed data creation...')

    // Create demo users
    const users = [
      {
        email: 'admin@astacar.ru',
        password: 'Admin123!',
        role: 'admin',
        kyc_status: 'not_required',
        full_name: 'Администратор Системы'
      },
      {
        email: 'moderator@astacar.ru',
        password: 'Mod123!',
        role: 'moderator',
        kyc_status: 'success',
        full_name: 'Модератор Платформы'
      },
      {
        email: 'expert1@astacar.ru',
        password: 'Expert123!',
        role: 'expert',
        kyc_status: 'success',
        full_name: 'Эксперт Автомобилей'
      },
      {
        email: 'expert2@astacar.ru',
        password: 'Expert123!',
        role: 'expert',
        kyc_status: 'success',
        full_name: 'Эксперт Техосмотра'
      },
      {
        email: 'seller1@astacar.ru',
        password: 'Seller123!',
        role: 'seller',
        kyc_status: 'success',
        full_name: 'Продавец Иванов'
      },
      {
        email: 'seller2@astacar.ru',
        password: 'Seller123!',
        role: 'seller',
        kyc_status: 'success',
        full_name: 'Продавец Петров'
      },
      {
        email: 'buyer1@astacar.ru',
        password: 'Buyer123!',
        role: 'buyer',
        kyc_status: 'success',
        full_name: 'Покупатель Сидоров'
      },
      {
        email: 'buyer2@astacar.ru',
        password: 'Buyer123!',
        role: 'buyer',
        kyc_status: 'success',
        full_name: 'Покупатель Козлов'
      }
    ]

    const createdUsers = []

    // Create auth users and profiles
    for (const userData of users) {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true
      })

      if (authError) {
        console.error(`Failed to create user ${userData.email}:`, authError)
        continue
      }

      // Create user record
      const { error: userError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          email: userData.email,
          role: userData.role,
          kyc_status: userData.kyc_status
        }])

      if (userError) {
        console.error(`Failed to create user profile for ${userData.email}:`, userError)
        continue
      }

      // Create profile
      await supabase
        .from('profiles')
        .insert([{
          user_id: authData.user.id,
          full_name: userData.full_name,
          rating: userData.role === 'expert' ? 4.8 : 0.0
        }])

      createdUsers.push({
        id: authData.user.id,
        email: userData.email,
        role: userData.role
      })

      console.log(`Created user: ${userData.email} (${userData.role})`)
    }

    // Get seller and expert IDs
    const sellers = createdUsers.filter(u => u.role === 'seller')
    const experts = createdUsers.filter(u => u.role === 'expert')
    const buyers = createdUsers.filter(u => u.role === 'buyer')

    // Create demo vehicles and listings
    const vehicles = [
      {
        vin: 'WBAJB1C55KWC12345',
        make: 'BMW',
        model: 'M3 Competition',
        year: 2022,
        mileage: 15000,
        engine: '3.0L Twin-Turbo I6',
        transmission: 'Автомат',
        drivetrain: 'RWD',
        color: 'Альпийский белый',
        owners_count: 1
      },
      {
        vin: 'WDC1671061A123456',
        make: 'Mercedes-Benz',
        model: 'G 63 AMG',
        year: 2023,
        mileage: 8500,
        engine: '4.0L Twin-Turbo V8',
        transmission: 'Автомат',
        drivetrain: 'AWD',
        color: 'Чёрный обсидиан',
        owners_count: 1
      },
      {
        vin: 'WP0ZZZ99ZTS123456',
        make: 'Porsche',
        model: '911 Turbo S',
        year: 2021,
        mileage: 22000,
        engine: '3.8L Twin-Turbo H6',
        transmission: 'PDK',
        drivetrain: 'AWD',
        color: 'Вулканический серый',
        owners_count: 2
      }
    ]

    const createdVehicles = []
    const createdListings = []

    for (let i = 0; i < vehicles.length; i++) {
      const vehicleData = vehicles[i]
      const sellerId = sellers[i % sellers.length].id

      // Create vehicle
      const { data: vehicle, error: vehicleError } = await supabase
        .from('vehicles')
        .insert([vehicleData])
        .select()
        .single()

      if (vehicleError) {
        console.error('Failed to create vehicle:', vehicleError)
        continue
      }

      createdVehicles.push(vehicle)

      // Create listing
      const now = new Date()
      const startAt = new Date(now.getTime() + (i * 2 * 60 * 60 * 1000)) // Stagger start times
      const endAt = new Date(startAt.getTime() + (24 * 60 * 60 * 1000)) // 24 hour auctions

      const startPrice = [3800000, 8000000, 8800000][i]
      const reservePrice = i === 2 ? null : Math.floor(startPrice * 1.1) // No reserve for Porsche
      const buyNowPrice = Math.floor(startPrice * 1.4)

      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .insert([{
          vehicle_id: vehicle.id,
          seller_id: sellerId,
          status: 'live',
          start_price: startPrice,
          reserve_price: reservePrice,
          buy_now_price: buyNowPrice,
          start_at: startAt.toISOString(),
          end_at: endAt.toISOString(),
          current_price: startPrice
        }])
        .select()
        .single()

      if (listingError) {
        console.error('Failed to create listing:', listingError)
        continue
      }

      createdListings.push(listing)

      // Create inspection
      const expertId = experts[i % experts.length].id
      await supabase
        .from('inspections')
        .insert([{
          listing_id: listing.id,
          expert_id: expertId,
          inspected_at: new Date(now.getTime() - (24 * 60 * 60 * 1000)).toISOString(),
          checklist: {
            exterior: { paint_condition: 'excellent', body_damage: 'none' },
            interior: { seats_condition: 'good', electronics: 'working' },
            mechanical: { engine: 'excellent', transmission: 'good', brakes: 'good' }
          },
          legal: {
            title_status: 'clean',
            liens: 'none',
            registration: 'current'
          },
          expert_summary: `Автомобиль находится в отличном состоянии. ${vehicleData.make} ${vehicleData.model} ${vehicleData.year} года с пробегом ${vehicleData.mileage} км. Рекомендуется к покупке.`
        }])

      // Create some demo bids
      for (let j = 0; j < Math.min(buyers.length, 3); j++) {
        const buyerId = buyers[j].id
        const bidAmount = startPrice + ((j + 1) * 50000)

        // Create deposit first
        await supabase
          .from('deposits')
          .insert([{
            user_id: buyerId,
            listing_id: listing.id,
            amount: 15000,
            status: 'hold',
            provider_ref: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          }])

        // Create bid
        await supabase
          .from('bids')
          .insert([{
            listing_id: listing.id,
            bidder_id: buyerId,
            amount: bidAmount,
            placed_at: new Date(startAt.getTime() + (j * 60 * 60 * 1000)).toISOString(),
            valid: true,
            source: 'manual'
          }])

        // Update listing current price
        await supabase
          .from('listings')
          .update({ current_price: bidAmount })
          .eq('id', listing.id)
      }

      console.log(`Created listing: ${vehicleData.make} ${vehicleData.model}`)
    }

    // Create some Q&A threads
    for (const listing of createdListings) {
      await supabase
        .from('qa_threads')
        .insert([
          {
            listing_id: listing.id,
            question: 'Есть ли сервисная история автомобиля?',
            answer: 'Да, автомобиль обслуживался только у официального дилера. Все документы в наличии.',
            questioner_id: buyers[0].id,
            answerer_id: experts[0].id
          },
          {
            listing_id: listing.id,
            question: 'Были ли ДТП?',
            answer: 'Согласно экспертизе и документам - ДТП не было.',
            questioner_id: buyers[1].id,
            answerer_id: experts[0].id
          }
        ])
    }

    return new Response(JSON.stringify({
      message: 'Seed data created successfully',
      users: createdUsers.length,
      vehicles: createdVehicles.length,
      listings: createdListings.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Seed data creation error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})