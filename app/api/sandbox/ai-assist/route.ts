import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import OpenAI from 'openai'
import { checkUsage, trackUsage, generateSessionId } from '@/lib/usage-system'

/**
 * AI Assistant for Sandbox Development
 * Provides code generation, explanation, and debugging help
 */

const getClient = () => {
  // Use xAI (Grok) for code assistance
  const apiKey = process.env.XAI_API_KEY
  if (!apiKey) {
    throw new Error('XAI_API_KEY not configured')
  }
  return new OpenAI({
    apiKey,
    baseURL: 'https://api.x.ai/v1',
  })
}

interface AssistRequest {
  action: 'generate' | 'explain' | 'fix' | 'chat'
  prompt: string
  code?: string
  language?: string
  error?: string
  context?: string
}

const SYSTEM_PROMPTS: Record<string, string> = {
  generate: `You are an expert programmer. Generate clean, well-commented, production-ready code based on the user's request. 
Always include necessary imports. Provide code that can run immediately.
Format your response as:
1. Brief explanation (1-2 sentences)
2. The code in a code block with the appropriate language tag
3. How to run it (if applicable)`,

  explain: `You are a patient coding teacher. Explain the provided code clearly and concisely.
Cover:
- What the code does (high level)
- Key functions/components and their purpose
- Any important patterns or techniques used
Keep explanations beginner-friendly but technically accurate.`,

  fix: `You are a debugging expert. Analyze the error and code provided.
Provide:
1. What caused the error (1-2 sentences)
2. The fixed code in a code block
3. Brief explanation of what you changed and why
Be direct and focus on the solution.`,

  chat: `You are JoePro's AI coding assistant. Help developers with their questions.
Be concise, practical, and code-focused. When providing code examples, always use proper code blocks.
You specialize in: JavaScript, TypeScript, Python, React, Next.js, Node.js, and AI/ML.
Keep responses focused and actionable.`,
}

export async function POST(req: NextRequest) {
  try {
    // Get or create session for rate limiting
    const cookieStore = cookies()
    let sessionId = cookieStore.get('anon_session')?.value
    if (!sessionId) {
      sessionId = generateSessionId()
    }

    // Check rate limit
    const usage = await checkUsage(sessionId, 'ai_assists')
    if (!usage.allowed) {
      const response = NextResponse.json({
        error: usage.reason,
        limit: usage.limit,
        used: usage.used,
        remaining: 0,
        upgrade_url: '/dashboard',
      }, { status: 429 })
      
      if (!cookieStore.get('anon_session')?.value) {
        response.cookies.set('anon_session', sessionId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 365 * 24 * 60 * 60,
          path: '/',
        })
      }
      return response
    }

    const body: AssistRequest = await req.json()
    const { action, prompt, code, language, error, context } = body

    if (!action || !prompt) {
      return NextResponse.json(
        { error: 'action and prompt are required' },
        { status: 400 }
      )
    }

    // Track usage
    await trackUsage(sessionId, 'ai_assists', 1)

    const client = getClient()
    const systemPrompt = SYSTEM_PROMPTS[action] || SYSTEM_PROMPTS.chat

    // Build the user message based on action
    let userMessage = prompt

    if (action === 'explain' && code) {
      userMessage = `Explain this ${language || ''} code:\n\n\`\`\`${language || ''}\n${code}\n\`\`\``
    } else if (action === 'fix' && code && error) {
      userMessage = `Fix this error in my ${language || ''} code:\n\nError:\n${error}\n\nCode:\n\`\`\`${language || ''}\n${code}\n\`\`\``
    } else if (action === 'generate') {
      userMessage = `Generate ${language || ''} code for: ${prompt}`
    }

    if (context) {
      userMessage = `Context: ${context}\n\n${userMessage}`
    }

    console.log(`[AI Assist] Action: ${action}, Language: ${language || 'auto'}`)

    const response = await client.chat.completions.create({
      model: 'grok-4.1-fast',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.3, // Lower for more precise code
      max_tokens: 2000,
    })

    const assistantMessage = response.choices[0]?.message?.content || 'No response generated'

    return NextResponse.json({
      success: true,
      action,
      response: assistantMessage,
      usage: {
        promptTokens: response.usage?.prompt_tokens,
        completionTokens: response.usage?.completion_tokens,
      },
    })

  } catch (error) {
    console.error('[AI Assist] Error:', error)
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    )
  }
}
