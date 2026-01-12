/**
 * SEOPro AI API Client
 * Generates SEO-optimized blog posts automatically
 * Docs: https://seoproai.featurebase.app/en/help/articles/4935330-api-integration-guide
 * Content History: https://seoproai.co/content-history/{website_id}
 */

const SEOPROAI_BASE_URL = 'https://api.seoproai.co/api';
const SEOPROAI_WEB_URL = 'https://seoproai.co';

interface BlogGenerationResponse {
  status: string;
  keyword_id: number;
  scheduled_date: string;
  message?: string;
}

interface BlogStatusResponse {
  date_statuses: {
    [date: string]: {
      has_blog: boolean;
      blog_id?: number;
      status?: 'processing' | 'draft' | 'published';
      title?: string;
      scheduled_date?: string;
    };
  };
}

interface BlogDraft {
  id: number;
  title: string;
  slug: string;
  content: string;
  meta_description: string;
  focus_keyword: string;
  status: string;
  scheduled_date: string;
  created_at: string;
  featured_image_url?: string;
  word_count: number;
}

interface PublishResponse {
  status: string;
  blog_id: number;
  published_url?: string;
  message: string;
}

interface ContentHistoryItem {
  id: number;
  title: string;
  slug: string;
  content: string;
  meta_description: string;
  focus_keyword: string;
  status: 'draft' | 'published' | 'processing';
  scheduled_date: string;
  created_at: string;
  updated_at?: string;
  featured_image_url?: string;
  word_count: number;
  published_url?: string;
}

interface ContentHistoryResponse {
  success: boolean;
  data: ContentHistoryItem[];
  total: number;
  page: number;
  per_page: number;
}

class SEOProAIClient {
  private apiKey: string;
  private websiteId: string;

  constructor() {
    const apiKey = process.env.SEOPROAI_API_KEY;
    const websiteId = process.env.SEOPROAI_WEBSITE_ID;

    if (!apiKey) {
      throw new Error('SEOPROAI_API_KEY environment variable is required');
    }
    if (!websiteId) {
      throw new Error('SEOPROAI_WEBSITE_ID environment variable is required');
    }

    this.apiKey = apiKey;
    this.websiteId = websiteId;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${SEOPROAI_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SEOPro AI API Error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  /**
   * Generate a blog post for a specific date (async - returns immediately)
   * Blog generation takes 5-10 minutes in the background
   */
  async generateBlogForDate(
    date: string, // YYYY-MM-DD format
    keywords: string[],
    languageCode: string = 'en'
  ): Promise<BlogGenerationResponse> {
    return this.request(`/websites/${this.websiteId}/generate-blog-for-date`, {
      method: 'POST',
      body: JSON.stringify({
        scheduled_date: date,
        keywords,
        language_code: languageCode,
      }),
    });
  }

  /**
   * Check blog status for a date range (use for polling)
   * Poll every 30-60 seconds until status is "draft"
   */
  async getBlogStatusByDate(
    startDate: string,
    endDate: string
  ): Promise<BlogStatusResponse> {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
    });

    return this.request(`/websites/${this.websiteId}/blog-status-by-date?${params}`);
  }

  /**
   * Fetch complete HTML content of a draft blog
   */
  async getBlogDraft(blogId: number): Promise<BlogDraft> {
    return this.request(`/blog-drafts/${blogId}`);
  }

  /**
   * Update blog with published URL (required before marking as published)
   */
  async updateBlogUrl(blogId: number, publishedUrl: string): Promise<void> {
    await this.request(`/blog-drafts/${blogId}`, {
      method: 'PATCH',
      body: JSON.stringify({ published_url: publishedUrl }),
    });
  }

  /**
   * Mark blog as published in SEOPro AI
   */
  async markBlogAsPublished(blogId: number): Promise<PublishResponse> {
    return this.request(`/blog-drafts/${blogId}/publish`, {
      method: 'POST',
    });
  }

  /**
   * Publish blog for a specific date
   */
  async publishBlogForDate(date: string): Promise<PublishResponse> {
    return this.request(`/websites/${this.websiteId}/blogs/publish-for-date`, {
      method: 'POST',
      body: JSON.stringify({ date }),
    });
  }

  /**
   * Get content history for this website - the primary method for fetching all articles
   * This fetches from the content-history endpoint which is more reliable
   */
  async getContentHistory(page: number = 1, perPage: number = 50): Promise<ContentHistoryItem[]> {
    try {
      const response = await this.request<ContentHistoryResponse>(
        `/websites/${this.websiteId}/content-history?page=${page}&per_page=${perPage}`
      );
      return response.data || [];
    } catch (error) {
      console.error('[SEOPro AI] Content history endpoint failed, trying fallback:', error);
      // Fallback to the older method if content-history endpoint doesn't exist
      return this.getAllBlogsFallback(90);
    }
  }

  /**
   * Get all content (paginated, fetches all pages)
   */
  async getAllContent(): Promise<ContentHistoryItem[]> {
    const allContent: ContentHistoryItem[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      try {
        const items = await this.getContentHistory(page, 100);
        if (items.length === 0) {
          hasMore = false;
        } else {
          allContent.push(...items);
          page++;
          // Safety limit
          if (page > 10) hasMore = false;
        }
      } catch {
        hasMore = false;
      }
    }

    // Sort by date, newest first
    return allContent.sort((a, b) => 
      new Date(b.scheduled_date || b.created_at).getTime() - 
      new Date(a.scheduled_date || a.created_at).getTime()
    );
  }

  /**
   * Fallback: Get all blogs using the date-based status endpoint
   */
  async getAllBlogsFallback(daysBack: number = 30): Promise<ContentHistoryItem[]> {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const status = await this.getBlogStatusByDate(startDate, endDate);
    const blogs: ContentHistoryItem[] = [];
    
    for (const [, info] of Object.entries(status.date_statuses || {})) {
      if (info.has_blog && info.blog_id && (info.status === 'draft' || info.status === 'published')) {
        try {
          const blog = await this.getBlogDraft(info.blog_id);
          blogs.push({
            id: blog.id,
            title: blog.title,
            slug: blog.slug,
            content: blog.content,
            meta_description: blog.meta_description,
            focus_keyword: blog.focus_keyword,
            status: blog.status as 'draft' | 'published' | 'processing',
            scheduled_date: blog.scheduled_date,
            created_at: blog.created_at,
            featured_image_url: blog.featured_image_url,
            word_count: blog.word_count,
          });
        } catch (e) {
          console.error(`Failed to fetch blog ${info.blog_id}:`, e);
        }
      }
    }
    
    return blogs.sort((a, b) => 
      new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime()
    );
  }

  /**
   * Get all blogs for this website (legacy method - now uses getAllContent)
   */
  async getAllBlogs(daysBack: number = 30): Promise<BlogDraft[]> {
    // Try the new content history method first
    try {
      const content = await this.getAllContent();
      return content.map(item => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        content: item.content,
        meta_description: item.meta_description,
        focus_keyword: item.focus_keyword,
        status: item.status,
        scheduled_date: item.scheduled_date,
        created_at: item.created_at,
        featured_image_url: item.featured_image_url,
        word_count: item.word_count,
      }));
    } catch (error) {
      console.log('[SEOPro AI] Falling back to date-based fetch');
      // Fallback to the old method
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const status = await this.getBlogStatusByDate(startDate, endDate);
      const blogs: BlogDraft[] = [];
      
      for (const [, info] of Object.entries(status.date_statuses || {})) {
        if (info.has_blog && info.blog_id && (info.status === 'draft' || info.status === 'published')) {
          try {
            const blog = await this.getBlogDraft(info.blog_id);
            blogs.push(blog);
          } catch (e) {
            console.error(`Failed to fetch blog ${info.blog_id}:`, e);
          }
        }
      }
      
      return blogs.sort((a, b) => new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime());
    }
  }

  /**
   * Get a single blog by slug
   */
  async getBlogBySlug(slug: string, daysBack: number = 90): Promise<BlogDraft | null> {
    const blogs = await this.getAllBlogs(daysBack);
    return blogs.find(b => b.slug === slug) || null;
  }

  /**
   * Wait for blog generation to complete (with polling)
   */
  async waitForBlogGeneration(
    date: string,
    maxWaitMinutes: number = 15,
    pollIntervalSeconds: number = 30
  ): Promise<{ ready: boolean; blog_id?: number; title?: string }> {
    const maxAttempts = (maxWaitMinutes * 60) / pollIntervalSeconds;
    let attempts = 0;

    while (attempts < maxAttempts) {
      attempts++;

      const status = await this.getBlogStatusByDate(date, date);
      const dateStatus = status.date_statuses?.[date];

      if (dateStatus?.has_blog && dateStatus?.status === 'draft') {
        console.log(`[SEOPro AI] Blog ready after ${attempts * pollIntervalSeconds} seconds`);
        return {
          ready: true,
          blog_id: dateStatus.blog_id,
          title: dateStatus.title,
        };
      }

      console.log(`[SEOPro AI] Blog still processing... (attempt ${attempts}/${maxAttempts})`);

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollIntervalSeconds * 1000));
    }

    throw new Error(`Blog generation timeout after ${maxWaitMinutes} minutes`);
  }
}

// Singleton instance
let client: SEOProAIClient | null = null;

export function getSEOProAIClient(): SEOProAIClient {
  if (!client) {
    client = new SEOProAIClient();
  }
  return client;
}

export type { BlogGenerationResponse, BlogStatusResponse, BlogDraft, PublishResponse, ContentHistoryItem, ContentHistoryResponse };
