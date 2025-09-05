// CRITICAL FIX C4: Input Sanitization for Q&A System
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Enhanced HTML sanitization
function sanitizeHTML(input: string): string {
  if (!input) return ''
  
  return input
    // Remove all HTML tags
    .replace(/<[^>]*>/g, '')
    // Encode HTML entities
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    // Remove potentially dangerous patterns
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/onload/gi, '')
    .replace(/onerror/gi, '')
    .replace(/onclick/gi, '')
    // Limit length
    .substring(0, 2000)
    .trim()
}

function validateQuestionInput(text: string): { valid: boolean; error?: string } {
  if (!text || text.trim().length === 0) {
    return { valid: false, error: 'Question cannot be empty' }
  }
  
  if (text.length < 10) {
    return { valid: false, error: 'Question must be at least 10 characters long' }
  }
  
  if (text.length > 2000) {
    return { valid: false, error: 'Question cannot exceed 2000 characters' }
  }
  
  // Check for spam patterns
  const spamPatterns = [
    /(.)\1{10,}/, // Repeated characters
    /\b(?:https?:\/\/|www\.)\S+/gi, // URLs
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, // Email addresses
    /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, // Phone numbers
  ]
  
  for (const pattern of spamPatterns) {
    if (pattern.test(text)) {
      return { valid: false, error: 'Question contains prohibited content' }
    }
  }
  
  return { valid: true }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Authentication check
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

    const url = new URL(req.url)
    const pathname = url.pathname

    // POST /secure-qa/ask-question - Submit a question with sanitization
    if (pathname.includes('/ask-question') && req.method === 'POST') {
      const body = await req.json()
      const { listing_id, question } = body

      if (!listing_id || !question) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Validate and sanitize the question
      const validation = validateQuestionInput(question)
      if (!validation.valid) {
        return new Response(JSON.stringify({ error: validation.error }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const sanitizedQuestion = sanitizeHTML(question)

      // Check rate limiting - max 3 questions per hour per user
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
      const { count } = await supabase
        .from('qa_threads')
        .select('*', { count: 'exact', head: true })
        .eq('questioner_id', user.id)
        .gte('created_at', oneHourAgo)

      if ((count || 0) >= 3) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Maximum 3 questions per hour.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Verify listing exists
      const { data: listing } = await supabase
        .from('listings')
        .select('id, status')
        .eq('id', listing_id)
        .single()

      if (!listing) {
        return new Response(JSON.stringify({ error: 'Listing not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Insert the sanitized question
      const { data: qaThread, error: insertError } = await supabase
        .from('qa_threads')
        .insert([{
          listing_id: listing_id,
          questioner_id: user.id,
          question: sanitizedQuestion
        }])
        .select()
        .single()

      if (insertError) {
        console.error('Failed to insert question:', insertError)
        return new Response(JSON.stringify({ error: 'Failed to submit question' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Log for moderation
      await supabase
        .from('audit_logs')
        .insert([{
          entity_type: 'qa_thread',
          entity_id: qaThread.id,
          action: 'question_submitted',
          user_id: user.id,
          diff: {
            original_question: question,
            sanitized_question: sanitizedQuestion,
            ip_address: req.headers.get('x-forwarded-for'),
            user_agent: req.headers.get('user-agent')
          }
        }])

      return new Response(JSON.stringify({ 
        success: true,
        question: qaThread
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // POST /secure-qa/answer-question - Answer a question (experts/moderators only)
    if (pathname.includes('/answer-question') && req.method === 'POST') {
      const body = await req.json()
      const { question_id, answer } = body

      if (!question_id || !answer) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Check if user is expert or moderator
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!userData || !['expert', 'moderator', 'admin'].includes(userData.role)) {
        return new Response(JSON.stringify({ error: 'Unauthorized. Only experts and moderators can answer questions.' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const sanitizedAnswer = sanitizeHTML(answer)

      // Update the Q&A thread
      const { data: updatedThread, error: updateError } = await supabase
        .from('qa_threads')
        .update({
          answer: sanitizedAnswer,
          answerer_id: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', question_id)
        .select()
        .single()

      if (updateError) {
        console.error('Failed to update question:', updateError)
        return new Response(JSON.stringify({ error: 'Failed to submit answer' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ 
        success: true,
        thread: updatedThread
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Secure Q&A error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})