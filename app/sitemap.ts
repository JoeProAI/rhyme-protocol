import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://joepro.ai'
  const now = new Date()
  
  return [
    // Main pages - highest priority
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/apps`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/agents`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    
    // Individual apps - high priority for SEO
    {
      url: `${baseUrl}/apps/video-gen`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/apps/nano-banana`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/apps/ai-chat`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    
    // Dev environment
    {
      url: `${baseUrl}/devenv`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    
    // Blog - updates frequently
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/blog/2026-developer-platform-checklist`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/blog/food-empire-ai-production`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog/step-by-step-ai-development-guides`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/blog/building-prompt-racer`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/claude-code-windows-setup`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    
    // Utility pages
    {
      url: `${baseUrl}/dashboard`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    
    // About/Brand pages
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    
    // SEO Power Pages - High priority for organic traffic
    {
      url: `${baseUrl}/best-ai-tools`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/prompt-library`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/start-here`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
  ]
}
