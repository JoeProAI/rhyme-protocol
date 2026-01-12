/**
 * JoePro Content Factory
 * Unified AI content generation across all platforms
 * 
 * Capabilities:
 * - Blog Posts: SEOPro AI, Claude, Grok
 * - Presentations: Gamma
 * - Images: Ideogram, DALL-E, Luma Photon
 * - Videos: Luma Ray 3
 * - Audio: ElevenLabs
 * - Social: Claude, Grok
 */

export * from './gamma';
export * from './ideogram';
export * from './claude';
export * from './grok';
export * from './openai';
export * from './google';

// Re-export existing integrations
export { getSEOProAIClient } from '../seoproai';

// Content types
export type ContentType = 
  | 'blog_post'
  | 'presentation'
  | 'document'
  | 'social_post'
  | 'x_thread'
  | 'image'
  | 'dalle_image'
  | 'video'
  | 'audio'
  | 'research_report'
  | 'email'
  | 'landing_page'
  | 'trend_analysis'
  | 'content_ideas'
  | 'places_search'
  | 'seo_blog';

// AI Provider mapping - Which AI to use for what
export const AI_PROVIDERS = {
  blog_post: ['claude_haiku', 'gpt4o_mini', 'grok_fast'],      // Fast models for blogs
  presentation: ['gamma'],                                      // Gamma for slides
  document: ['gamma', 'claude_haiku'],                         // Gamma or Claude
  social_post: ['claude_haiku', 'grok_fast'],                  // Fast for social
  x_thread: ['grok_fast'],                                     // Grok knows X best
  image: ['ideogram', 'dalle3'],                               // Image generation
  dalle_image: ['dalle3'],                                     // DALL-E specifically
  video: ['luma_ray3'],                                        // Luma for video
  audio: ['elevenlabs'],                                       // ElevenLabs for audio
  research_report: ['claude_opus', 'grok'],                    // Deep models for research
  email: ['gpt4o_mini', 'claude_haiku'],                       // Fast for emails
  landing_page: ['gamma'],                                      // Gamma for pages
  trend_analysis: ['grok'],                                    // Grok has real-time info
  content_ideas: ['grok_fast'],                                // Quick ideas from Grok
} as const;

// Content Factory unified interface
export interface ContentRequest {
  type: ContentType;
  topic: string;
  keywords?: string[];
  tone?: string;
  audience?: string;
  language?: string;
  additionalInstructions?: string;
  provider?: string; // Specific AI provider to use
}

export interface ContentResult {
  type: ContentType;
  provider: string;
  content: string | object;
  url?: string;
  exportUrl?: string;
  metadata?: Record<string, unknown>;
  generatedAt: string;
}

/**
 * Generate content using the best available AI
 * Automatically selects the right provider based on content type
 */
export async function generateContent(request: ContentRequest): Promise<ContentResult> {
  const { type, topic, keywords = [], tone = 'professional' } = request;
  
  const generatedAt = new Date().toISOString();
  
  switch (type) {
    case 'presentation': {
      const { getGammaClient } = await import('./gamma');
      const gamma = getGammaClient();
      const result = await gamma.generate({
        inputText: `${topic}\n\nKey points: ${keywords.join(', ')}`,
        textMode: 'generate',
        format: 'presentation',
        numCards: 10,
        additionalInstructions: request.additionalInstructions,
        textOptions: {
          tone,
          audience: request.audience,
          language: request.language,
        },
      });
      return {
        type,
        provider: 'gamma',
        content: result,
        url: result.url,
        exportUrl: result.exportUrl,
        generatedAt,
      };
    }
    
    case 'image': {
      const { getIdeogramClient } = await import('./ideogram');
      const ideogram = getIdeogramClient();
      const result = await ideogram.generate({
        prompt: `${topic}. ${keywords.join(', ')}. ${request.additionalInstructions || ''}`,
        aspectRatio: '16:9',
        styleType: 'AUTO',
      });
      return {
        type,
        provider: 'ideogram',
        content: result.data,
        url: result.data[0]?.url,
        generatedAt,
      };
    }
    
    case 'blog_post': {
      const { getClaudeClient } = await import('./claude');
      const claude = getClaudeClient();
      const content = await claude.generateBlogPost(topic, keywords, tone);
      return {
        type,
        provider: 'claude',
        content,
        generatedAt,
      };
    }
    
    case 'research_report': {
      const { getClaudeClient } = await import('./claude');
      const claude = getClaudeClient();
      const content = await claude.generateResearchReport(topic, 'detailed');
      return {
        type,
        provider: 'claude',
        content,
        generatedAt,
      };
    }
    
    case 'social_post': {
      const { getClaudeClient } = await import('./claude');
      const claude = getClaudeClient();
      const content = await claude.generateSocialContent(topic, ['twitter', 'linkedin']);
      return {
        type,
        provider: 'claude',
        content,
        generatedAt,
      };
    }
    
    case 'document': {
      const { getGammaClient } = await import('./gamma');
      const gamma = getGammaClient();
      const result = await gamma.generate({
        inputText: `${topic}\n\n${keywords.join('\n')}`,
        textMode: 'generate',
        format: 'document',
        additionalInstructions: request.additionalInstructions,
      });
      return {
        type,
        provider: 'gamma',
        content: result,
        url: result.url,
        exportUrl: result.exportUrl,
        generatedAt,
      };
    }
    
    case 'x_thread': {
      const { getGrokClient } = await import('./grok');
      const grok = getGrokClient();
      const content = await grok.generateXThread(topic);
      return {
        type,
        provider: 'grok',
        content,
        generatedAt,
      };
    }
    
    case 'trend_analysis': {
      const { getGrokClient } = await import('./grok');
      const grok = getGrokClient();
      const content = await grok.analyzeTrend(topic);
      return {
        type,
        provider: 'grok',
        content,
        generatedAt,
      };
    }
    
    case 'content_ideas': {
      const { getGrokClient } = await import('./grok');
      const grok = getGrokClient();
      const content = await grok.generateContentIdeas(topic, 15);
      return {
        type,
        provider: 'grok',
        content,
        generatedAt,
      };
    }
    
    case 'dalle_image': {
      const { getOpenAIClient } = await import('./openai');
      const openai = getOpenAIClient();
      const result = await openai.generateImage({
        prompt: `${topic}. ${keywords.join(', ')}. ${request.additionalInstructions || ''}`,
        size: '1792x1024',
        quality: 'hd',
        style: 'vivid',
      });
      return {
        type,
        provider: 'dalle3',
        content: result.data,
        url: result.data[0]?.url,
        generatedAt,
      };
    }
    
    case 'email': {
      const { getOpenAIClient } = await import('./openai');
      const openai = getOpenAIClient();
      const content = await openai.generateEmail(topic, request.audience || 'general', tone);
      return {
        type,
        provider: 'gpt4o_mini',
        content,
        generatedAt,
      };
    }
    
    case 'places_search': {
      try {
        const { getGoogleClient } = await import('./google');
        const google = getGoogleClient();
        const places = await google.searchPlaces({ query: topic, maxResults: 10 });
        return {
          type,
          provider: 'google_places',
          content: places,
          generatedAt,
        };
      } catch {
        // If Google API not configured, use Grok to generate local business ideas
        const { getGrokClient } = await import('./grok');
        const grok = getGrokClient();
        const response = await grok.generate({
          prompt: `Research local businesses and places related to: ${topic}. Provide a list of 10 relevant businesses with names, descriptions, and why they're relevant.`,
        });
        return {
          type,
          provider: 'grok',
          content: response.choices[0]?.message?.content || '',
          generatedAt,
        };
      }
    }
    
    case 'seo_blog': {
      const { getSEOProAIClient } = await import('../seoproai');
      const client = getSEOProAIClient();
      const today = new Date().toISOString().split('T')[0];
      const result = await client.generateBlogForDate(today, keywords);
      return {
        type,
        provider: 'seoproai',
        content: result,
        metadata: { date: today, keywords },
        generatedAt,
      };
    }
    
    case 'video': {
      // Redirect to video generator page
      return {
        type,
        provider: 'luma_ray3',
        content: 'Video generation requires the dedicated video generator. Visit /apps/video-gen',
        url: '/apps/video-gen',
        generatedAt,
      };
    }
    
    default:
      throw new Error(`Content type '${type}' not yet implemented`);
  }
}
