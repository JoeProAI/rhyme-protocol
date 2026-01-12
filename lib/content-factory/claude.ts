/**
 * Anthropic Claude API Client - Long-form Content Generation
 * Best for: research reports, detailed analysis, long documents
 */

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1';

// Claude Models - Use Haiku for fast, Opus for deep
export type ClaudeModel = 
  | 'claude-3-5-haiku-20241022'  // FAST - use for quick tasks
  | 'claude-3-5-sonnet-20241022' // BALANCED
  | 'claude-3-opus-20240229';     // DEEP - use for research/analysis

interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ClaudeGenerateParams {
  prompt: string;
  systemPrompt?: string;
  model?: ClaudeModel;
  maxTokens?: number;
  temperature?: number;
}

interface ClaudeResponse {
  id: string;
  type: string;
  role: string;
  content: { type: string; text: string }[];
  model: string;
  stop_reason: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

class ClaudeClient {
  private apiKey: string;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }
    this.apiKey = apiKey;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${ANTHROPIC_API_URL}${endpoint}`, {
      ...options,
      headers: {
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  /**
   * Generate content with Claude
   */
  async generate(params: ClaudeGenerateParams): Promise<ClaudeResponse> {
    const messages: ClaudeMessage[] = [
      { role: 'user', content: params.prompt },
    ];

    return this.request('/messages', {
      method: 'POST',
      body: JSON.stringify({
        model: params.model || 'claude-3-5-haiku-20241022', // Default to fast Haiku
        max_tokens: params.maxTokens || 4096,
        temperature: params.temperature ?? 0.7,
        system: params.systemPrompt || 'You are a helpful AI assistant that creates high-quality content.',
        messages,
      }),
    });
  }

  /**
   * Generate a blog post
   */
  async generateBlogPost(topic: string, keywords: string[], tone: string = 'professional'): Promise<string> {
    const response = await this.generate({
      systemPrompt: `You are an expert SEO content writer. Write engaging, well-structured blog posts optimized for search engines. Include relevant headings (H2, H3), bullet points, and a compelling introduction and conclusion.`,
      prompt: `Write a comprehensive blog post about: ${topic}

Target keywords to include naturally: ${keywords.join(', ')}
Tone: ${tone}

Requirements:
- 1500-2000 words
- SEO-optimized with keyword usage
- Engaging introduction with a hook
- Clear H2 and H3 headings
- Actionable takeaways
- Strong conclusion with CTA
- Format in Markdown`,
      maxTokens: 8192,
    });

    return response.content[0]?.text || '';
  }

  /**
   * Generate a research report - Uses Opus for deep analysis
   */
  async generateResearchReport(topic: string, depth: 'brief' | 'detailed' | 'comprehensive' = 'detailed'): Promise<string> {
    const wordCounts = { brief: 1000, detailed: 2500, comprehensive: 5000 };
    
    const response = await this.generate({
      model: 'claude-3-opus-20240229', // Use Opus for deep research
      systemPrompt: `You are a research analyst creating in-depth reports. Your reports are well-sourced, analytical, and provide actionable insights.`,
      prompt: `Create a ${depth} research report on: ${topic}

Include:
- Executive Summary
- Key Findings
- Market/Industry Analysis
- Trends and Patterns
- Opportunities and Challenges
- Recommendations
- Conclusion

Target length: ~${wordCounts[depth]} words
Format in Markdown with proper headings.`,
      maxTokens: 8192,
    });

    return response.content[0]?.text || '';
  }

  /**
   * Generate social media content
   */
  async generateSocialContent(topic: string, platforms: ('twitter' | 'linkedin' | 'instagram')[]): Promise<Record<string, string>> {
    const response = await this.generate({
      systemPrompt: `You are a social media expert who creates engaging, platform-optimized content.`,
      prompt: `Create social media content about: ${topic}

Generate content for these platforms: ${platforms.join(', ')}

For each platform, provide:
- Twitter/X: A viral thread (5-7 tweets) with hooks and engagement prompts
- LinkedIn: A professional post with storytelling and a clear CTA
- Instagram: Caption with emojis, hashtags, and engagement question

Return as JSON with platform names as keys.`,
      maxTokens: 2048,
    });

    try {
      const text = response.content[0]?.text || '{}';
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch {
      return { raw: response.content[0]?.text || '' };
    }
  }
}

let client: ClaudeClient | null = null;

export function getClaudeClient(): ClaudeClient {
  if (!client) {
    client = new ClaudeClient();
  }
  return client;
}

export type { ClaudeGenerateParams, ClaudeResponse };
