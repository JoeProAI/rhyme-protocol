/**
 * xAI Grok API Client - Real-time AI Content Generation
 * Best for: X (Twitter) content, real-time info, trending topics
 */

const XAI_API_URL = 'https://api.x.ai/v1';

// Grok Models
// Note: xAI's OpenAI-compatible API expects dash-separated model IDs (e.g. grok-4-1-fast)
export type GrokModel =
  | 'grok-4-1'
  | 'grok-4-1-fast';

function normalizeGrokModel(model: string): string {
  // Support legacy dot-notation inputs (e.g. grok-4.1-fast) and normalize to dash notation.
  return model.replace('grok-4.1-fast', 'grok-4-1-fast').replace('grok-4.1', 'grok-4-1');
}

interface GrokMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GrokGenerateParams {
  prompt: string;
  systemPrompt?: string;
  model?: GrokModel;
  maxTokens?: number;
  temperature?: number;
}

interface GrokChoice {
  index: number;
  message: {
    role: string;
    content: string;
  };
  finish_reason: string;
}

interface GrokResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: GrokChoice[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class GrokClient {
  private apiKey: string;

  constructor() {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      throw new Error('XAI_API_KEY environment variable is required');
    }
    this.apiKey = apiKey;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${XAI_API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Grok API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  /**
   * Generate content with Grok
   */
  async generate(params: GrokGenerateParams): Promise<GrokResponse> {
    const messages: GrokMessage[] = [];
    
    if (params.systemPrompt) {
      messages.push({ role: 'system', content: params.systemPrompt });
    }
    messages.push({ role: 'user', content: params.prompt });

    const defaultModel = normalizeGrokModel(process.env.XAI_MODEL || 'grok-4-1-fast');
    const requestedModel = normalizeGrokModel(params.model || defaultModel);

    return this.request('/chat/completions', {
      method: 'POST',
      body: JSON.stringify({
        model: requestedModel,
        messages,
        max_tokens: params.maxTokens || 4096,
        temperature: params.temperature ?? 0.7,
      }),
    });
  }

  /**
   * Generate X thread - Grok knows X best
   */
  async generateXThread(topic: string, posts: number = 7): Promise<string> {
    const response = await this.generate({
      model: 'grok-4-1-fast',
      systemPrompt: `You are a viral X (formerly Twitter) content creator. You understand what makes content spread on X. Create engaging, scroll-stopping threads.`,
      prompt: `Create a viral X thread about: ${topic}

Requirements:
- ${posts} posts total
- First post: killer hook that stops the scroll
- Each post should be <280 characters
- Use numbers, bold claims, and curiosity gaps
- Include engagement prompts
- End with a CTA and "Follow @JoePro for more"

Format each post on its own line, numbered 1/, 2/, etc.`,
    });

    return response.choices[0]?.message?.content || '';
  }

  /**
   * Generate trending topic analysis - Grok has real-time info
   */
  async analyzeTrend(topic: string): Promise<string> {
    const response = await this.generate({
      model: 'grok-4-1', // Use full model for analysis
      systemPrompt: `You are a trend analyst with access to real-time information. Provide actionable insights about current trends and what they mean.`,
      prompt: `Analyze the current trend/topic: ${topic}

Include:
- What's happening and why it's trending
- Key players and perspectives
- Potential opportunities
- Risks to be aware of
- Actionable recommendations

Be specific and current. Reference recent events if relevant.`,
    });

    return response.choices[0]?.message?.content || '';
  }

  /**
   * Generate quick content ideas
   */
  async generateContentIdeas(niche: string, count: number = 10): Promise<string> {
    const response = await this.generate({
      model: 'grok-4-1-fast',
      systemPrompt: `You are a content strategist who knows what performs well on social media.`,
      prompt: `Generate ${count} content ideas for the ${niche} niche.

For each idea, provide:
- Topic/headline
- Hook angle
- Best platform (Twitter, LinkedIn, YouTube, etc.)
- Content format (thread, carousel, video, etc.)

Make them timely, engaging, and shareable. Focus on what's working NOW.`,
    });

    return response.choices[0]?.message?.content || '';
  }
}

let client: GrokClient | null = null;

export function getGrokClient(): GrokClient {
  if (!client) {
    client = new GrokClient();
  }
  return client;
}

export type { GrokGenerateParams, GrokResponse };
