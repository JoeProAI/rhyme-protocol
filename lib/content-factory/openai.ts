/**
 * OpenAI GPT API Client - General AI Content Generation
 * Best for: writing, coding, images (DALL-E)
 */

const OPENAI_API_URL = 'https://api.openai.com/v1';

// GPT Models
export type GPTModel = 
  | 'gpt-4o'              // Most capable multimodal
  | 'gpt-4o-mini'         // Fast and cheap
  | 'gpt-4-turbo'         // GPT-4 Turbo
  | 'o1'                  // Reasoning model
  | 'o1-mini';            // Fast reasoning

interface GPTMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GPTGenerateParams {
  prompt: string;
  systemPrompt?: string;
  model?: GPTModel;
  maxTokens?: number;
  temperature?: number;
}

interface GPTChoice {
  index: number;
  message: {
    role: string;
    content: string;
  };
  finish_reason: string;
}

interface GPTResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: GPTChoice[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface DALLEGenerateParams {
  prompt: string;
  model?: 'dall-e-3' | 'dall-e-2';
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
}

interface DALLEImage {
  url: string;
  revised_prompt?: string;
}

interface DALLEResponse {
  created: number;
  data: DALLEImage[];
}

class OpenAIClient {
  private apiKey: string;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    this.apiKey = apiKey;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${OPENAI_API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  /**
   * Generate text with GPT
   */
  async generate(params: GPTGenerateParams): Promise<GPTResponse> {
    const messages: GPTMessage[] = [];
    
    if (params.systemPrompt) {
      messages.push({ role: 'system', content: params.systemPrompt });
    }
    messages.push({ role: 'user', content: params.prompt });

    return this.request('/chat/completions', {
      method: 'POST',
      body: JSON.stringify({
        model: params.model || 'gpt-4o-mini', // Default to fast mini
        messages,
        max_tokens: params.maxTokens || 4096,
        temperature: params.temperature ?? 0.7,
      }),
    });
  }

  /**
   * Generate image with DALL-E 3
   */
  async generateImage(params: DALLEGenerateParams): Promise<DALLEResponse> {
    return this.request('/images/generations', {
      method: 'POST',
      body: JSON.stringify({
        model: params.model || 'dall-e-3',
        prompt: params.prompt,
        n: 1,
        size: params.size || '1024x1024',
        quality: params.quality || 'standard',
        style: params.style || 'vivid',
      }),
    });
  }

  /**
   * Generate blog post with GPT-4o
   */
  async generateBlogPost(topic: string, keywords: string[], tone: string = 'professional'): Promise<string> {
    const response = await this.generate({
      model: 'gpt-4o',
      systemPrompt: `You are an expert content writer. Write engaging, well-structured blog posts that rank well in search engines.`,
      prompt: `Write a comprehensive blog post about: ${topic}

Target keywords: ${keywords.join(', ')}
Tone: ${tone}

Requirements:
- 1500-2000 words
- SEO-optimized structure
- Compelling introduction
- Clear H2 and H3 headings
- Actionable content
- Strong conclusion
- Format in Markdown`,
      maxTokens: 4096,
    });

    return response.choices[0]?.message?.content || '';
  }

  /**
   * Generate email copy
   */
  async generateEmail(purpose: string, audience: string, tone: string = 'professional'): Promise<string> {
    const response = await this.generate({
      model: 'gpt-4o-mini', // Fast for emails
      systemPrompt: `You are an expert email copywriter who writes high-converting emails.`,
      prompt: `Write an email for: ${purpose}

Target audience: ${audience}
Tone: ${tone}

Include:
- Subject line (3 variations)
- Preview text
- Email body with clear CTA
- P.S. line

Make it compelling and action-oriented.`,
    });

    return response.choices[0]?.message?.content || '';
  }

  /**
   * Use O1 for complex reasoning tasks
   */
  async complexReasoning(problem: string): Promise<string> {
    const response = await this.generate({
      model: 'o1-mini', // O1 for reasoning
      prompt: problem,
      temperature: 1, // O1 works best with temp 1
    });

    return response.choices[0]?.message?.content || '';
  }
}

let client: OpenAIClient | null = null;

export function getOpenAIClient(): OpenAIClient {
  if (!client) {
    client = new OpenAIClient();
  }
  return client;
}

export type { GPTGenerateParams, GPTResponse, DALLEGenerateParams, DALLEResponse };
