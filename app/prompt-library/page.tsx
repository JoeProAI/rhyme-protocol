'use client'

import { Metadata } from 'next'
import { useState } from 'react'
import { Copy, Check, Search } from 'lucide-react'

// Enhanced prompt structure with inputs and outputs
interface PromptItem {
  title: string
  prompt: string
  inputs: string[]
  output: string
  example?: string
}

// Prompt categories with 500+ prompts
const promptCategories = [
  {
    name: 'Business & Marketing',
    prompts: [
      { 
        title: 'Product Launch Email', 
        prompt: 'Write a compelling product launch email for [PRODUCT]. Include: attention-grabbing subject line, key benefits (not features), social proof, urgency element, and clear CTA. Target audience: [AUDIENCE]. Tone: excited but professional.',
        inputs: ['PRODUCT', 'AUDIENCE'],
        output: 'Complete email with subject line, body copy, and CTA',
        example: 'PRODUCT: "AI Writing Tool" | AUDIENCE: "Content Marketers"'
      },
      { 
        title: 'Competitor Analysis', 
        prompt: 'Analyze [COMPETITOR] as if you\'re a business strategist. Cover: their value proposition, target market, pricing strategy, marketing channels, strengths, weaknesses, and opportunities we can exploit. Be specific and actionable.',
        inputs: ['COMPETITOR'],
        output: 'Strategic analysis report with actionable insights',
        example: 'COMPETITOR: "Notion"'
      },
      { 
        title: 'Sales Objection Handler', 
        prompt: 'I sell [PRODUCT/SERVICE]. The prospect said: "[OBJECTION]". Give me 3 ways to handle this objection that acknowledge their concern, reframe the issue, and move toward a close. Include specific language I can use.',
        inputs: ['PRODUCT/SERVICE', 'OBJECTION'],
        output: '3 objection handling approaches with exact scripts',
        example: 'PRODUCT/SERVICE: "CRM Software" | OBJECTION: "Too expensive"'
      },
      { 
        title: 'Value Proposition Canvas', 
        prompt: 'Create a value proposition canvas for [PRODUCT]. Include: customer jobs (functional, social, emotional), pains, gains, and how our product addresses each. Format as a structured document I can share with my team.',
        inputs: ['PRODUCT'],
        output: 'Structured canvas with jobs, pains, gains, and solutions',
        example: 'PRODUCT: "Project Management Tool"'
      },
      { 
        title: 'Cold Email Sequence', 
        prompt: 'Write a 3-email cold outreach sequence for [PRODUCT/SERVICE] targeting [ROLE] at [COMPANY TYPE]. Email 1: pattern interrupt + value. Email 2: case study + social proof. Email 3: breakup email. Keep each under 100 words.',
        inputs: ['PRODUCT/SERVICE', 'ROLE', 'COMPANY TYPE'],
        output: '3 complete emails with subject lines (<100 words each)',
        example: 'PRODUCT: "Sales Analytics" | ROLE: "VP Sales" | COMPANY: "B2B SaaS"'
      },
      { 
        title: 'Brand Voice Guide', 
        prompt: 'Create a brand voice guide for [COMPANY]. Include: personality traits (3-5), tone attributes, words to use, words to avoid, example phrases for different scenarios (welcome, error, success, support). Make it actionable for any team member.',
        inputs: ['COMPANY'],
        output: 'Complete brand voice guide with traits, examples, and guidelines',
        example: 'COMPANY: "Fintech Startup"'
      },
      { 
        title: 'Customer Persona', 
        prompt: 'Create a detailed customer persona for [PRODUCT]. Include: demographics, psychographics, goals, frustrations, buying behavior, objections, preferred channels, and a day-in-the-life narrative. Name the persona and make them feel real.',
        inputs: ['PRODUCT'],
        output: 'Named persona with complete profile and day-in-life story',
        example: 'PRODUCT: "Online Course Platform"'
      },
      { 
        title: 'Pricing Strategy', 
        prompt: 'Help me develop a pricing strategy for [PRODUCT]. Current situation: [CONTEXT]. Analyze: value-based pricing, competitive positioning, psychological pricing tactics, tier structure, and recommended price points with reasoning.',
        inputs: ['PRODUCT', 'CONTEXT'],
        output: 'Pricing analysis with tier structure and recommended price points',
        example: 'PRODUCT: "AI Tool" | CONTEXT: "Launching in 30 days, competitors at $29-99/mo"'
      },
      { 
        title: 'Social Proof Request', 
        prompt: 'Write a testimonial request email to send to happy customers of [PRODUCT]. Make it easy to respond, suggest specific questions they can answer, and include a template they can fill in. Tone: appreciative, not desperate.',
        inputs: ['PRODUCT'],
        output: 'Email with questions and fill-in template for customer',
        example: 'PRODUCT: "Design Tool"'
      },
      { 
        title: 'Affiliate Program Pitch', 
        prompt: 'Write a pitch to recruit affiliates for [PRODUCT]. Include: commission structure, why they should promote us, support we provide, success stories, and application process. Target: [INFLUENCER TYPE].',
        inputs: ['PRODUCT', 'INFLUENCER TYPE'],
        output: 'Complete affiliate pitch with program details and CTA',
        example: 'PRODUCT: "Productivity App" | INFLUENCER: "Tech YouTubers"'
      },
      { 
        title: 'Quarterly Business Review', 
        prompt: 'Create a framework for a Quarterly Business Review presentation. Include: executive summary template, KPI sections, wins/challenges format, next quarter priorities, and resource requests. Make it boardroom-ready.',
        inputs: [],
        output: 'QBR presentation framework with all sections',
        example: 'No variables - generates reusable template'
      },
      { 
        title: 'Partnership Proposal', 
        prompt: 'Write a partnership proposal email to [COMPANY] for [TYPE OF PARTNERSHIP]. Include: why them specifically, mutual benefits, proposed structure, next steps. Be concise but compelling.',
        inputs: ['COMPANY', 'TYPE OF PARTNERSHIP'],
        output: 'Partnership proposal email with benefits and next steps',
        example: 'COMPANY: "Stripe" | TYPE: "Integration Partnership"'
      },
      { 
        title: 'Crisis Communication', 
        prompt: 'Our company is facing [CRISIS]. Write a communication plan including: internal memo to employees, external statement to customers, social media response template, and FAQ for support team.',
        inputs: ['CRISIS'],
        output: 'Complete crisis communication plan with 4 templates',
        example: 'CRISIS: "Data breach affecting 5,000 users"'
      },
      { 
        title: 'Product Positioning Statement', 
        prompt: 'Create a positioning statement for [PRODUCT]: For [TARGET], who [NEED/OPPORTUNITY], [PRODUCT] is a [CATEGORY] that [KEY BENEFIT]. Unlike [ALTERNATIVE], we [DIFFERENTIATOR]. Make it memorable and defensible.',
        inputs: ['PRODUCT', 'TARGET', 'NEED/OPPORTUNITY', 'CATEGORY', 'KEY BENEFIT', 'ALTERNATIVE', 'DIFFERENTIATOR'],
        output: 'Complete positioning statement following framework',
        example: 'PRODUCT: "TaskFlow" | TARGET: "Remote teams" | CATEGORY: "Project management"'
      },
      { 
        title: 'Meeting Agenda Template', 
        prompt: 'Create an effective meeting agenda template for [MEETING TYPE]. Include: pre-meeting prep, time allocations, discussion topics, decision points, action items capture, and follow-up process. Optimize for outcomes, not duration.',
        inputs: ['MEETING TYPE'],
        output: 'Reusable agenda template with all sections',
        example: 'MEETING TYPE: "Product Sprint Planning"'
      },
    ]
  },
  {
    name: 'Content Writing',
    prompts: [
      { 
        title: 'Blog Post Outline', 
        prompt: 'Create a detailed outline for a blog post about [TOPIC]. Include: SEO-optimized title (with keyword), meta description, H2/H3 structure, key points per section, internal linking opportunities, and CTA. Target length: [WORDS].',
        inputs: ['TOPIC', 'WORDS'],
        output: 'Complete SEO-optimized blog outline with H2/H3 structure',
        example: 'TOPIC: "AI Prompting Tips" | WORDS: "2000"'
      },
      { 
        title: 'LinkedIn Post Hook', 
        prompt: 'Write 10 hook variations for a LinkedIn post about [TOPIC]. Each hook should: stop the scroll, create curiosity, and be under 15 words. Mix formats: questions, contrarian takes, stories, data points.',
        inputs: ['TOPIC'],
        output: '10 hook variations (<15 words each)',
        example: 'TOPIC: "Productivity myths"'
      },
      { 
        title: 'X Thread', 
        prompt: 'Write a viral X thread about [TOPIC]. Structure: hook tweet, 8-10 value tweets, callback to hook, CTA. Each tweet should stand alone but flow together. Include engagement prompts.',
        inputs: ['TOPIC'],
        output: 'Complete thread (10-12 tweets) with hook and CTA',
        example: 'TOPIC: "Building in public"'
      },
      { 
        title: 'Newsletter Introduction', 
        prompt: 'Write 5 newsletter intro variations for a piece about [TOPIC]. Each should: hook immediately, establish relevance, and transition to main content. Tone: [TONE]. Keep under 50 words each.',
        inputs: ['TOPIC', 'TONE'],
        output: '5 intro variations (<50 words each)',
        example: 'TOPIC: "AI Automation" | TONE: "Professional but conversational"'
      },
      { 
        title: 'YouTube Script', 
        prompt: 'Write a YouTube video script about [TOPIC]. Include: hook (first 30 seconds), pattern interrupts every 2 minutes, clear sections, b-roll suggestions, and end screen CTA. Target length: [MINUTES] minutes.',
        inputs: ['TOPIC', 'MINUTES'],
        output: 'Full video script with timestamps and b-roll notes',
        example: 'TOPIC: "AI Tools Review" | MINUTES: "10"'
      },
      { 
        title: 'Podcast Episode Outline', 
        prompt: 'Create a podcast episode outline for [TOPIC]. Include: cold open hook, intro, 3-4 main segments with talking points, listener engagement moment, sponsor read placement, and outro with CTA.',
        inputs: ['TOPIC'],
        output: 'Complete episode outline with segments and talking points',
        example: 'TOPIC: "Future of remote work"'
      },
      { 
        title: 'Case Study Framework', 
        prompt: 'Write a case study about [CLIENT/PROJECT]. Structure: Challenge (with metrics), Solution (our approach), Results (specific numbers), Testimonial placeholder, Key learnings. Make it skimmable but detailed.',
        inputs: ['CLIENT/PROJECT'],
        output: 'Complete case study with Challenge/Solution/Results',
        example: 'CLIENT: "TechCorp" | PROJECT: "CRM Migration"'
      },
      { 
        title: 'Landing Page Copy', 
        prompt: 'Write landing page copy for [PRODUCT/OFFER]. Include: headline, subheadline, 3 benefit blocks, social proof section, objection handlers, FAQ, and 3 CTA variations. Focus on conversion, not cleverness.',
        inputs: ['PRODUCT/OFFER'],
        output: 'Complete landing page copy with all sections',
        example: 'PRODUCT: "Email Course on AI"'
      },
      { 
        title: 'Email Subject Lines', 
        prompt: 'Generate 20 email subject lines for [EMAIL PURPOSE]. Mix: curiosity, urgency, personalization, questions, numbers. Include preview text suggestions. A/B test ready.',
        inputs: ['EMAIL PURPOSE'],
        output: '20 subject lines with preview text',
        example: 'EMAIL PURPOSE: "Product launch announcement"'
      },
      { 
        title: 'Product Description', 
        prompt: 'Write a compelling product description for [PRODUCT]. Include: headline, key features as benefits, use cases, specifications, and emotional close. Optimize for both SEO and conversion.',
        inputs: ['PRODUCT'],
        output: 'SEO-optimized product description with features/benefits',
        example: 'PRODUCT: "Wireless Noise-Canceling Headphones"'
      },
      { 
        title: 'Press Release', 
        prompt: 'Write a press release for [ANNOUNCEMENT]. Include: headline, dateline, lead paragraph (who/what/when/where/why), quotes, boilerplate, contact info. AP style, newsworthy angle.',
        inputs: ['ANNOUNCEMENT'],
        output: 'AP-style press release with all required sections',
        example: 'ANNOUNCEMENT: "Series A funding round"'
      },
      { 
        title: 'Testimonial Questions', 
        prompt: 'Create 10 questions to ask customers to get great testimonials for [PRODUCT]. Questions should elicit: specific results, emotional transformation, and recommendation. Easy to answer but produce quotable content.',
        inputs: ['PRODUCT'],
        output: '10 testimonial questions optimized for quotable responses',
        example: 'PRODUCT: "Project Management Software"'
      },
      { 
        title: 'Content Repurposing', 
        prompt: 'I have a [CONTENT TYPE] about [TOPIC]. Give me 15 ways to repurpose this into other content formats. Include: platform, format, angle, and estimated time to create each.',
        inputs: ['CONTENT TYPE', 'TOPIC'],
        output: '15 repurposing ideas with platform/format/time',
        example: 'CONTENT TYPE: "Podcast episode" | TOPIC: "Productivity hacks"'
      },
      { 
        title: 'SEO Content Brief', 
        prompt: 'Create an SEO content brief for [KEYWORD]. Include: search intent analysis, competitor content gaps, recommended word count, headings to include, questions to answer, and internal/external linking strategy.',
        inputs: ['KEYWORD'],
        output: 'Complete SEO brief with intent analysis and strategy',
        example: 'KEYWORD: "best project management tools"'
      },
      { 
        title: 'About Page Copy', 
        prompt: 'Write an About page for [COMPANY/PERSON]. Include: origin story, mission, values, team highlights, and CTA. Make it human, not corporate. Show personality while building trust.',
        inputs: ['COMPANY/PERSON'],
        output: 'Complete About page with story, mission, and personality',
        example: 'COMPANY: "AI Startup" or PERSON: "Freelance Designer"'
      },
    ]
  },
  {
    name: 'Coding & Development',
    prompts: [
      { 
        title: 'Code Review', 
        prompt: 'Review this code for: bugs, security issues, performance problems, readability, and best practices. Explain each issue, why it matters, and show the fix. Code: [CODE]',
        inputs: ['CODE'],
        output: 'Detailed review with issues, explanations, and corrected code',
        example: 'CODE: "function fetchData() { return fetch(url).then(r => r.json()) }"'
      },
      { 
        title: 'Refactor Request', 
        prompt: 'Refactor this code to be more [GOAL: maintainable/performant/readable/testable]. Explain your changes and the principles behind them. Preserve functionality. Code: [CODE]',
        inputs: ['GOAL', 'CODE'],
        output: 'Refactored code with explanations and principles',
        example: 'GOAL: "testable" | CODE: "Complex function with side effects"'
      },
      { 
        title: 'Debug This Error', 
        prompt: 'I\'m getting this error: [ERROR]. Here\'s my code: [CODE]. And context: [CONTEXT]. Explain: what\'s causing it, why, and how to fix it. Include the corrected code.',
        inputs: ['ERROR', 'CODE', 'CONTEXT'],
        output: 'Root cause analysis, explanation, and fixed code',
        example: 'ERROR: "TypeError: Cannot read property" | CONTEXT: "React component mounting"'
      },
      { 
        title: 'Write Tests', 
        prompt: 'Write comprehensive tests for this function/component: [CODE]. Include: unit tests, edge cases, error scenarios, and integration test suggestions. Use [TESTING FRAMEWORK].',
        inputs: ['CODE', 'TESTING FRAMEWORK'],
        output: 'Complete test suite with unit, edge case, and error tests',
        example: 'CODE: "validateEmail(email)" | FRAMEWORK: "Jest"'
      },
      { 
        title: 'API Design', 
        prompt: 'Design a REST API for [FEATURE]. Include: endpoints, HTTP methods, request/response schemas, authentication, error handling, and rate limiting strategy. Follow best practices.',
        inputs: ['FEATURE'],
        output: 'Complete API spec with endpoints, schemas, and auth strategy',
        example: 'FEATURE: "User notification system"'
      },
      { 
        title: 'Database Schema', 
        prompt: 'Design a database schema for [APPLICATION]. Include: tables, columns with types, relationships, indexes, and explain your normalization decisions. Consider: [REQUIREMENTS].',
        inputs: ['APPLICATION', 'REQUIREMENTS'],
        output: 'Database schema with tables, relationships, and indexes',
        example: 'APPLICATION: "E-commerce platform" | REQUIREMENTS: "Multi-vendor support"'
      },
      { 
        title: 'Architecture Decision', 
        prompt: 'I need to decide between [OPTION A] and [OPTION B] for [SYSTEM]. Analyze: pros/cons, scalability, maintainability, cost, and team expertise requirements. Give a recommendation with reasoning.',
        inputs: ['OPTION A', 'OPTION B', 'SYSTEM'],
        output: 'Comparative analysis with recommendation and reasoning',
        example: 'A: "Microservices" | B: "Monolith" | SYSTEM: "SaaS platform"'
      },
      { 
        title: 'Code Documentation', 
        prompt: 'Write documentation for this code: [CODE]. Include: JSDoc/docstrings, README section, usage examples, and common pitfalls. Make it helpful for developers of all levels.',
        inputs: ['CODE'],
        output: 'Complete documentation with JSDoc, examples, and pitfalls',
        example: 'CODE: "Custom React hook for API calls"'
      },
      { 
        title: 'Convert Code', 
        prompt: 'Convert this [SOURCE LANGUAGE] code to [TARGET LANGUAGE]. Maintain functionality, use idiomatic patterns for the target language, and note any behavioral differences. Code: [CODE]',
        inputs: ['SOURCE LANGUAGE', 'TARGET LANGUAGE', 'CODE'],
        output: 'Converted code with notes on differences',
        example: 'SOURCE: "Python" | TARGET: "TypeScript" | CODE: "list comprehension"'
      },
      { 
        title: 'Regex Builder', 
        prompt: 'Create a regex pattern to [GOAL]. Include: the pattern, explanation of each part, test cases (matches and non-matches), and common edge cases to consider.',
        inputs: ['GOAL'],
        output: 'Regex pattern with explanation and test cases',
        example: 'GOAL: "validate US phone numbers"'
      },
      { 
        title: 'SQL Query', 
        prompt: 'Write a SQL query to [GOAL]. Tables: [SCHEMA]. Include: the query, explanation, optimization notes, and how to modify for common variations. Consider performance.',
        inputs: ['GOAL', 'SCHEMA'],
        output: 'Optimized SQL query with explanation and variations',
        example: 'GOAL: "Find top 10 customers" | SCHEMA: "users, orders, payments"'
      },
      { 
        title: 'Git Workflow', 
        prompt: 'My team uses [CURRENT WORKFLOW]. We\'re having issues with [PROBLEMS]. Suggest an improved Git workflow with: branch naming, commit conventions, PR process, and merge strategy.',
        inputs: ['CURRENT WORKFLOW', 'PROBLEMS'],
        output: 'Complete Git workflow with conventions and processes',
        example: 'WORKFLOW: "GitFlow" | PROBLEMS: "Merge conflicts, slow reviews"'
      },
      { 
        title: 'Performance Optimization', 
        prompt: 'Analyze this code for performance issues: [CODE]. Identify bottlenecks, explain why they\'re slow, and provide optimized versions with before/after complexity analysis.',
        inputs: ['CODE'],
        output: 'Performance analysis with optimized code and complexity',
        example: 'CODE: "Nested loops processing large dataset"'
      },
      { 
        title: 'Security Audit', 
        prompt: 'Perform a security audit on this code: [CODE]. Check for: injection vulnerabilities, authentication issues, data exposure, and other OWASP Top 10 concerns. Severity rate each finding.',
        inputs: ['CODE'],
        output: 'Security audit report with severity-rated findings',
        example: 'CODE: "Express.js API endpoint handling user input"'
      },
      { 
        title: 'CLI Tool Design', 
        prompt: 'Design a CLI tool for [PURPOSE]. Include: command structure, flags/options, help text, error messages, and example usage. Follow POSIX conventions where applicable.',
        inputs: ['PURPOSE'],
        output: 'Complete CLI tool spec with commands and help text',
        example: 'PURPOSE: "Deploying static sites"'
      },
    ]
  },
  {
    name: 'Creative & Design',
    prompts: [
      { 
        title: 'Logo Concept Brief', 
        prompt: 'Create a creative brief for a logo design. Brand: [BRAND]. Include: brand personality, target audience, competitors to differentiate from, must-haves, avoid list, and 3 conceptual directions to explore.',
        inputs: ['BRAND'],
        output: 'Creative brief with 3 conceptual directions',
        example: 'BRAND: "Eco-friendly coffee brand"'
      },
      { 
        title: 'Color Palette', 
        prompt: 'Generate a color palette for [PROJECT/BRAND]. Include: primary, secondary, accent colors with hex codes, usage guidelines, accessibility notes (contrast ratios), and mood/emotion each color evokes.',
        inputs: ['PROJECT/BRAND'],
        output: 'Color palette with hex codes, usage, and accessibility notes',
        example: 'PROJECT: "Meditation app"'
      },
      { 
        title: 'UI Copy Audit', 
        prompt: 'Audit this UI copy for [SCREEN/FLOW]: [COPY]. Check for: clarity, consistency, tone, error handling, empty states, and accessibility. Provide specific rewrites.',
        inputs: ['SCREEN/FLOW', 'COPY'],
        output: 'Audit report with specific copy improvements',
        example: 'SCREEN: "Login flow" | COPY: "Error: Invalid credentials"'
      },
      { 
        title: 'Illustration Brief', 
        prompt: 'Write a brief for an illustration depicting [CONCEPT]. Include: style reference, composition, focal point, color mood, emotional tone, and technical specs needed.',
        inputs: ['CONCEPT'],
        output: 'Detailed illustration brief with style and technical specs',
        example: 'CONCEPT: "Team collaboration in remote work"'
      },
      { 
        title: 'UX Microcopy', 
        prompt: 'Write microcopy for these UI elements in [APP/WEBSITE]: buttons, error messages, empty states, loading states, success messages, tooltips. Match tone: [TONE]. Be helpful and human.',
        inputs: ['APP/WEBSITE', 'TONE'],
        output: 'Complete microcopy set for all UI states',
        example: 'APP: "Banking app" | TONE: "Trustworthy but friendly"'
      },
      { 
        title: 'Brand Naming', 
        prompt: 'Generate 20 brand name ideas for [BUSINESS TYPE]. Include: domain availability format, meaning/etymology, pros/cons of each, and how they\'d look as a logo. Mix: invented, compound, real words.',
        inputs: ['BUSINESS TYPE'],
        output: '20 brand names with etymology, pros/cons, and domain format',
        example: 'BUSINESS TYPE: "Plant-based protein powder"'
      },
      { 
        title: 'Mood Board Brief', 
        prompt: 'Create a mood board brief for [PROJECT]. Include: themes to explore, visual references to find, textures/patterns, typography direction, and overall feeling we\'re going for.',
        inputs: ['PROJECT'],
        output: 'Mood board brief with themes, references, and direction',
        example: 'PROJECT: "Luxury hotel rebrand"'
      },
      { 
        title: 'Photo Direction', 
        prompt: 'Write photo direction for [SHOOT PURPOSE]. Include: shot list, styling notes, model direction, lighting mood, composition guidelines, and post-processing style.',
        inputs: ['SHOOT PURPOSE'],
        output: 'Complete photo direction with shot list and styling',
        example: 'SHOOT PURPOSE: "Product launch campaign"'
      },
      { 
        title: 'Motion Design Script', 
        prompt: 'Write a motion graphics script for [PURPOSE]. Include: scene-by-scene breakdown, timing, transitions, text animations, sound design notes, and delivery specs.',
        inputs: ['PURPOSE'],
        output: 'Motion script with scenes, timing, and specs',
        example: 'PURPOSE: "App explainer video (30 seconds)"'
      },
      { 
        title: 'Icon Set Spec', 
        prompt: 'Specify an icon set for [APP/BRAND]. Include: style (line/fill/duotone), grid size, stroke weight, corner radius, metaphors for each icon needed, and consistency rules.',
        inputs: ['APP/BRAND'],
        output: 'Icon spec with style guide and consistency rules',
        example: 'APP: "Fitness tracking app"'
      },
      { 
        title: 'Email Template Design', 
        prompt: 'Specify an email template design for [PURPOSE]. Include: layout structure, mobile considerations, image guidelines, CTA styling, and dark mode compatibility notes.',
        inputs: ['PURPOSE'],
        output: 'Email template spec with layout and responsive design',
        example: 'PURPOSE: "Weekly newsletter"'
      },
      { 
        title: 'Presentation Theme', 
        prompt: 'Design a presentation theme for [PURPOSE/BRAND]. Include: slide master types, typography system, color usage, image treatment, chart styling, and animation guidelines.',
        inputs: ['PURPOSE/BRAND'],
        output: 'Presentation theme with slide masters and guidelines',
        example: 'BRAND: "Tech startup pitch deck"'
      },
      { 
        title: 'Social Media Templates', 
        prompt: 'Design a social media template system for [BRAND] across [PLATFORMS]. Include: post types, stories format, grid strategy, visual consistency elements, and content buckets.',
        inputs: ['BRAND', 'PLATFORMS'],
        output: 'Template system with formats and consistency guide',
        example: 'BRAND: "Fashion brand" | PLATFORMS: "Instagram, TikTok"'
      },
      { 
        title: 'Packaging Copy', 
        prompt: 'Write packaging copy for [PRODUCT]. Include: front panel, side panels, back panel (story, ingredients/specs, instructions), and any required legal text placement notes.',
        inputs: ['PRODUCT'],
        output: 'Complete packaging copy for all panels',
        example: 'PRODUCT: "Organic energy bar"'
      },
      { 
        title: 'Store/Office Design Brief', 
        prompt: 'Write a design brief for [SPACE TYPE] for [BRAND]. Include: customer journey, key moments, brand expression opportunities, functional requirements, and mood reference.',
        inputs: ['SPACE TYPE', 'BRAND'],
        output: 'Design brief with journey mapping and requirements',
        example: 'SPACE: "Retail flagship store" | BRAND: "Sneaker brand"'
      },
    ]
  },
  {
    name: 'Data & Analysis',
    prompts: [
      { 
        title: 'Data Analysis Plan', 
        prompt: 'Create a data analysis plan for [QUESTION/HYPOTHESIS]. Include: data sources needed, cleaning steps, analysis methods, visualizations to create, and how to present findings.',
        inputs: ['QUESTION/HYPOTHESIS'],
        output: 'Complete analysis plan with methods and visualization strategy',
        example: 'QUESTION: "What factors drive customer churn?"'
      },
      { 
        title: 'Dashboard Design', 
        prompt: 'Design a dashboard for [USER TYPE] to track [METRICS]. Include: KPI hierarchy, chart types for each metric, filter options, drill-down paths, and alert thresholds.',
        inputs: ['USER TYPE', 'METRICS'],
        output: 'Dashboard spec with KPI hierarchy and chart types',
        example: 'USER: "Sales Manager" | METRICS: "Revenue, pipeline, conversion"'
      },
      { 
        title: 'A/B Test Design', 
        prompt: 'Design an A/B test for [HYPOTHESIS]. Include: control/variant description, sample size calculation, success metrics, guardrail metrics, test duration, and analysis plan.',
        inputs: ['HYPOTHESIS'],
        output: 'Complete A/B test plan with sample size and metrics',
        example: 'HYPOTHESIS: "Green CTA button increases signups by 10%"'
      },
      { 
        title: 'Survey Design', 
        prompt: 'Create a survey to measure [OBJECTIVE]. Include: screener questions, core questions (mix of types), demographic questions, and analysis plan. Optimize for completion rate and data quality.',
        inputs: ['OBJECTIVE'],
        output: 'Survey questionnaire with analysis plan',
        example: 'OBJECTIVE: "Customer satisfaction with support team"'
      },
      { 
        title: 'Funnel Analysis', 
        prompt: 'Analyze this funnel data: [DATA]. Identify: drop-off points, potential causes, segment differences, and prioritized recommendations to improve conversion. Show your calculations.',
        inputs: ['DATA'],
        output: 'Funnel analysis with drop-off points and recommendations',
        example: 'DATA: "Homepage: 10k, Signup: 2k, Onboarding: 500, Active: 200"'
      },
      { 
        title: 'Cohort Analysis', 
        prompt: 'Perform a cohort analysis on [METRIC] using this data: [DATA]. Include: cohort definition, retention curves, insights about user behavior over time, and actionable recommendations.',
        inputs: ['METRIC', 'DATA'],
        output: 'Cohort analysis with retention curves and insights',
        example: 'METRIC: "7-day retention" | DATA: "Monthly signup cohorts"'
      },
      { 
        title: 'Metric Definition', 
        prompt: 'Define a metric framework for [PRODUCT/TEAM]. Include: North Star metric, supporting metrics, health metrics, and for each: definition, calculation, data source, owner, and target.',
        inputs: ['PRODUCT/TEAM'],
        output: 'Metric framework with definitions and targets',
        example: 'PRODUCT: "SaaS collaboration tool"'
      },
      { 
        title: 'Data Cleaning Script', 
        prompt: 'Write a data cleaning script for [DATASET DESCRIPTION]. Handle: missing values, duplicates, outliers, type conversions, and validation. Include: logging and error handling. Use [LANGUAGE].',
        inputs: ['DATASET DESCRIPTION', 'LANGUAGE'],
        output: 'Data cleaning script with validation and error handling',
        example: 'DATASET: "Customer transactions CSV" | LANGUAGE: "Python pandas"'
      },
      { 
        title: 'Statistical Test Selection', 
        prompt: 'I want to test if [HYPOTHESIS] using [DATA DESCRIPTION]. Recommend the appropriate statistical test, explain why, show the implementation, and how to interpret results.',
        inputs: ['HYPOTHESIS', 'DATA DESCRIPTION'],
        output: 'Test recommendation with implementation and interpretation',
        example: 'HYPOTHESIS: "Feature A increases conversion" | DATA: "2 groups, 1000 users each"'
      },
      { 
        title: 'Report Automation', 
        prompt: 'Design an automated reporting system for [REPORT TYPE]. Include: data sources, transformation logic, scheduling, delivery method, and error handling. Document for handoff.',
        inputs: ['REPORT TYPE'],
        output: 'Automated reporting system design with documentation',
        example: 'REPORT TYPE: "Weekly executive dashboard"'
      },
      { 
        title: 'Segmentation Analysis', 
        prompt: 'Perform customer segmentation on [DATA]. Use [METHOD: RFM/clustering/etc]. Include: segment definitions, size, characteristics, and recommended actions for each segment.',
        inputs: ['DATA', 'METHOD'],
        output: 'Segmentation with definitions and action recommendations',
        example: 'DATA: "Customer purchase history" | METHOD: "RFM analysis"'
      },
      { 
        title: 'Forecasting Model', 
        prompt: 'Build a forecasting model for [METRIC]. Data: [DESCRIPTION]. Include: method selection rationale, implementation, validation approach, confidence intervals, and limitations.',
        inputs: ['METRIC', 'DESCRIPTION'],
        output: 'Forecasting model with validation and confidence intervals',
        example: 'METRIC: "Monthly revenue" | DESCRIPTION: "3 years historical data"'
      },
      { 
        title: 'Data Quality Audit', 
        prompt: 'Audit data quality for [DATASET]. Check: completeness, accuracy, consistency, timeliness, and validity. Report findings with severity and remediation recommendations.',
        inputs: ['DATASET'],
        output: 'Quality audit report with severity ratings and fixes',
        example: 'DATASET: "User events tracking table"'
      },
      { 
        title: 'Visualization Critique', 
        prompt: 'Critique this data visualization: [DESCRIPTION/IMAGE]. Assess: clarity, accuracy, design, accessibility, and storytelling. Provide specific improvement suggestions with examples.',
        inputs: ['DESCRIPTION/IMAGE'],
        output: 'Critique with specific improvements and examples',
        example: 'DESCRIPTION: "Line chart showing monthly revenue by product category"'
      },
      { 
        title: 'ML Model Evaluation', 
        prompt: 'Evaluate this ML model for [TASK]. Include: appropriate metrics, confusion matrix analysis, bias assessment, feature importance, and production monitoring recommendations.',
        inputs: ['TASK'],
        output: 'Model evaluation with metrics, bias analysis, and monitoring plan',
        example: 'TASK: "Customer churn prediction (binary classification)"'
      },
    ]
  },
  {
    name: 'Productivity & Learning',
    prompts: [
      { 
        title: 'Learning Roadmap', 
        prompt: 'Create a 30-day learning roadmap for [SKILL]. Include: daily time commitment, resources (free priority), projects to build, milestones, and how to verify progress. Assume I\'m starting from [LEVEL].',
        inputs: ['SKILL', 'LEVEL'],
        output: '30-day roadmap with daily activities and milestones',
        example: 'SKILL: "React" | LEVEL: "Know JavaScript basics"'
      },
      { 
        title: 'Book Summary Request', 
        prompt: 'Summarize [BOOK] as if I need to implement its ideas immediately. Include: core thesis, key frameworks, actionable takeaways, and how it connects to [MY GOAL]. Skip the fluff.',
        inputs: ['BOOK', 'MY GOAL'],
        output: 'Actionable summary with frameworks and takeaways',
        example: 'BOOK: "Atomic Habits" | GOAL: "Build better work habits"'
      },
      { 
        title: 'Weekly Review Template', 
        prompt: 'Create a weekly review template for [ROLE/GOAL]. Include: reflection questions, metrics to track, planning prompts, and improvement identification. Make it completable in 20 minutes.',
        inputs: ['ROLE/GOAL'],
        output: 'Weekly review template (<20 minutes to complete)',
        example: 'ROLE: "Product Manager"'
      },
      { 
        title: 'Habit Design', 
        prompt: 'Design a habit system to achieve [GOAL]. Include: keystone habit, habit stacking opportunities, environment design, tracking method, and failure recovery protocol. Use behavioral science.',
        inputs: ['GOAL'],
        output: 'Habit system with triggers, tracking, and recovery plan',
        example: 'GOAL: "Write daily for 30 minutes"'
      },
      { 
        title: 'Decision Framework', 
        prompt: 'I need to decide [DECISION] by [DEADLINE]. Help me create a decision framework including: criteria, weights, options analysis, risks, and recommendation. Make it rigorous but practical.',
        inputs: ['DECISION', 'DEADLINE'],
        output: 'Decision framework with weighted criteria and recommendation',
        example: 'DECISION: "Accept job offer or stay" | DEADLINE: "1 week"'
      },
      { 
        title: 'Time Audit', 
        prompt: 'Help me audit how I spend my time. Create: a tracking template for one week, categories to track, analysis questions to ask after, and optimization suggestions based on common patterns.',
        inputs: [],
        output: 'Week-long time tracking template with analysis framework',
        example: 'No variables - generates reusable template'
      },
      { 
        title: 'Meeting Reduction', 
        prompt: 'I have [X] hours of meetings per week. Help me: identify which to eliminate/async, create a meeting audit checklist, and write polite decline templates for unnecessary meetings.',
        inputs: ['X'],
        output: 'Meeting audit with elimination strategy and decline templates',
        example: 'X: "15"'
      },
      { 
        title: 'Focus Protocol', 
        prompt: 'Design a deep work protocol for [TYPE OF WORK]. Include: pre-work ritual, environment setup, time blocking structure, break protocol, and end-of-session review. Account for [CONSTRAINTS].',
        inputs: ['TYPE OF WORK', 'CONSTRAINTS'],
        output: 'Deep work protocol with rituals and time blocking',
        example: 'WORK: "Writing" | CONSTRAINTS: "Young kids at home"'
      },
      { 
        title: 'Goal Setting Framework', 
        prompt: 'Help me set goals for [TIMEFRAME] in [AREA]. Use a proven framework (OKRs, SMART, etc). Include: vision, measurable targets, key actions, and tracking system. Make them ambitious but achievable.',
        inputs: ['TIMEFRAME', 'AREA'],
        output: 'Goal framework with vision, targets, and tracking',
        example: 'TIMEFRAME: "Q1 2026" | AREA: "Health & fitness"'
      },
      { 
        title: 'Skill Gap Analysis', 
        prompt: 'I want to become [ROLE/GOAL]. Analyze the skill gap between my current state: [CURRENT SKILLS] and requirements. Prioritize what to learn first based on impact and build order.',
        inputs: ['ROLE/GOAL', 'CURRENT SKILLS'],
        output: 'Gap analysis with prioritized learning path',
        example: 'GOAL: "Senior Engineer" | CURRENT: "Mid-level, know React"'
      },
      { 
        title: 'Morning Routine Design', 
        prompt: 'Design a morning routine for [GOAL: energy/productivity/creativity]. Include: timeline, activities, why each matters, flexibility options, and troubleshooting common problems.',
        inputs: ['GOAL'],
        output: 'Morning routine with timeline and troubleshooting',
        example: 'GOAL: "High energy for creative work"'
      },
      { 
        title: 'Delegation Framework', 
        prompt: 'Help me delegate [TASK TYPE] effectively. Include: what to delegate vs keep, how to brief someone, checkpoints, quality criteria, and feedback template. Current team: [CONTEXT].',
        inputs: ['TASK TYPE', 'CONTEXT'],
        output: 'Delegation framework with briefing and quality criteria',
        example: 'TASK: "Content creation" | CONTEXT: "2 junior writers"'
      },
      { 
        title: 'Energy Management', 
        prompt: 'Create an energy management plan for [MY SCHEDULE]. Include: identifying high/low energy periods, task-energy matching, recovery activities, and early warning signs of burnout.',
        inputs: ['MY SCHEDULE'],
        output: 'Energy management plan with task-energy matching',
        example: 'SCHEDULE: "9-5 remote, back-to-back meetings"'
      },
      { 
        title: 'Career Planning', 
        prompt: 'Help me create a 5-year career plan. Current: [CURRENT ROLE]. Goal: [TARGET]. Include: skills to develop, experiences to seek, relationships to build, and quarterly milestones.',
        inputs: ['CURRENT ROLE', 'TARGET'],
        output: '5-year plan with skills, experiences, and milestones',
        example: 'CURRENT: "IC Engineer" | TARGET: "Engineering Director"'
      },
      { 
        title: 'Knowledge Management', 
        prompt: 'Design a personal knowledge management system for [TYPE OF INFORMATION]. Include: capture methods, organization structure, review cadence, and retrieval process. Tool-agnostic approach.',
        inputs: ['TYPE OF INFORMATION'],
        output: 'PKM system with capture, organize, and review processes',
        example: 'TYPE: "Technical articles and code snippets"'
      },
    ]
  },
  {
    name: 'AI & Prompting',
    prompts: [
      { 
        title: 'Prompt Improvement', 
        prompt: 'Improve this prompt: [PROMPT]. Make it: more specific, better structured, include examples, add constraints, and optimize for [MODEL]. Explain each improvement.',
        inputs: ['PROMPT', 'MODEL'],
        output: 'Improved prompt with explanations for each change',
        example: 'PROMPT: "Write a blog post" | MODEL: "GPT-4"'
      },
      { 
        title: 'System Prompt Design', 
        prompt: 'Design a system prompt for an AI assistant that [ROLE/PURPOSE]. Include: persona, capabilities, limitations, tone, formatting preferences, and edge case handling.',
        inputs: ['ROLE/PURPOSE'],
        output: 'Complete system prompt with persona and guidelines',
        example: 'ROLE: "Customer support AI for SaaS product"'
      },
      { 
        title: 'Chain of Thought', 
        prompt: 'Solve [PROBLEM] using chain-of-thought reasoning. Show your thinking step by step, consider alternatives, identify assumptions, and arrive at a well-reasoned conclusion.',
        inputs: ['PROBLEM'],
        output: 'Step-by-step reasoning with conclusion',
        example: 'PROBLEM: "Should we build or buy this feature?"'
      },
      { 
        title: 'Few-Shot Examples', 
        prompt: 'I need the AI to [TASK]. Create 3-5 few-shot examples that demonstrate the exact input/output format I want. Vary the examples to cover edge cases.',
        inputs: ['TASK'],
        output: '3-5 few-shot examples covering edge cases',
        example: 'TASK: "Extract key metrics from product reviews"'
      },
      { 
        title: 'Prompt Template', 
        prompt: 'Create a reusable prompt template for [REPEATED TASK]. Include: variable placeholders with descriptions, example filled-in version, and tips for best results.',
        inputs: ['REPEATED TASK'],
        output: 'Reusable template with placeholders and example',
        example: 'TASK: "Weekly blog post generation"'
      },
      { 
        title: 'Evaluation Criteria', 
        prompt: 'Create evaluation criteria for AI outputs on [TASK]. Include: quality dimensions, scoring rubric, example good/bad outputs, and inter-rater reliability guidance.',
        inputs: ['TASK'],
        output: 'Evaluation rubric with quality dimensions and examples',
        example: 'TASK: "Blog post generation"'
      },
      { 
        title: 'Prompt Debugging', 
        prompt: 'My prompt isn\'t working well: [PROMPT]. The AI outputs [PROBLEM]. Diagnose why and fix it. Show before/after prompts with explanations.',
        inputs: ['PROMPT', 'PROBLEM'],
        output: 'Diagnosis with before/after prompts and explanations',
        example: 'PROMPT: "Summarize this" | PROBLEM: "Too verbose, misses key points"'
      },
      { 
        title: 'Output Format Design', 
        prompt: 'Design an output format for [USE CASE]. Consider: parseability, readability, completeness, and flexibility. Include: format spec, example output, and validation rules.',
        inputs: ['USE CASE'],
        output: 'Format spec with example output and validation rules',
        example: 'USE CASE: "API response for product search"'
      },
      { 
        title: 'Persona Creation', 
        prompt: 'Create a detailed AI persona for [PURPOSE]. Include: name, background, expertise, communication style, quirks, limitations, and example interactions.',
        inputs: ['PURPOSE'],
        output: 'Detailed persona with background and example interactions',
        example: 'PURPOSE: "Technical writing assistant"'
      },
      { 
        title: 'Multi-Turn Conversation', 
        prompt: 'Design a multi-turn conversation flow for AI [PURPOSE]. Include: opening, key decision points, handling tangents, graceful failures, and successful conclusion paths.',
        inputs: ['PURPOSE'],
        output: 'Conversation flow with decision points and failure handling',
        example: 'PURPOSE: "Customer onboarding chatbot"'
      },
      { 
        title: 'Context Window Optimization', 
        prompt: 'I have [AMOUNT] of context to provide but limited tokens. Help me: prioritize what to include, summarize efficiently, and structure for maximum AI comprehension.',
        inputs: ['AMOUNT'],
        output: 'Prioritization strategy with optimized structure',
        example: 'AMOUNT: "50 pages of documentation"'
      },
      { 
        title: 'AI Tool Comparison', 
        prompt: 'Compare [AI TOOL A] vs [AI TOOL B] for [USE CASE]. Include: strengths, weaknesses, pricing, integration, and recommendation based on [MY REQUIREMENTS].',
        inputs: ['AI TOOL A', 'AI TOOL B', 'USE CASE', 'MY REQUIREMENTS'],
        output: 'Comparison with recommendation',
        example: 'A: "GPT-4" | B: "Claude" | USE CASE: "Code generation"'
      },
      { 
        title: 'Prompt Library Design', 
        prompt: 'Design a prompt library structure for [TEAM/USE CASE]. Include: categorization system, metadata fields, version control approach, and quality maintenance process.',
        inputs: ['TEAM/USE CASE'],
        output: 'Library structure with categorization and version control',
        example: 'TEAM: "Content marketing team"'
      },
      { 
        title: 'Fine-Tuning Data', 
        prompt: 'I want to fine-tune a model for [TASK]. Help me: define data requirements, create example format, identify data sources, and quality criteria.',
        inputs: ['TASK'],
        output: 'Data requirements with example format and quality criteria',
        example: 'TASK: "Technical support ticket classification"'
      },
      { 
        title: 'AI Workflow Design', 
        prompt: 'Design an AI-powered workflow for [PROCESS]. Include: which steps to automate, human checkpoints, tool selection, error handling, and continuous improvement mechanism.',
        inputs: ['PROCESS'],
        output: 'Workflow design with automation and checkpoints',
        example: 'PROCESS: "Content creation pipeline"'
      },
    ]
  },
  {
    name: 'Communication',
    prompts: [
      { 
        title: 'Difficult Conversation', 
        prompt: 'Help me prepare for a difficult conversation about [TOPIC] with [PERSON/ROLE]. Include: opening statement, key points, anticipated objections with responses, and desired outcome. Keep it professional and constructive.',
        inputs: ['TOPIC', 'PERSON/ROLE'],
        output: 'Conversation prep with opening, points, and objection responses',
        example: 'TOPIC: "Performance issues" | PERSON: "Direct report"'
      },
      { 
        title: 'Feedback Delivery', 
        prompt: 'Help me give feedback to [PERSON] about [BEHAVIOR/OUTCOME]. Use the SBI model or similar. Make it specific, actionable, and balanced. Include both written and verbal versions.',
        inputs: ['PERSON', 'BEHAVIOR/OUTCOME'],
        output: 'SBI feedback in written and verbal formats',
        example: 'PERSON: "Team member" | BEHAVIOR: "Missing deadlines"'
      },
      { 
        title: 'Salary Negotiation', 
        prompt: 'Help me negotiate salary for [ROLE]. Current offer: [AMOUNT]. Market rate: [RATE]. Include: research talking points, anchoring strategy, and responses to pushback. Confident but not arrogant.',
        inputs: ['ROLE', 'AMOUNT', 'RATE'],
        output: 'Negotiation strategy with talking points and responses',
        example: 'ROLE: "Senior Engineer" | OFFER: "$120k" | MARKET: "$140k"'
      },
      { 
        title: 'Apology Email', 
        prompt: 'Write an apology email for [SITUATION]. Include: acknowledgment of mistake, impact understanding, explanation (not excuse), remediation steps, and prevention plan. Sincere and professional.',
        inputs: ['SITUATION'],
        output: 'Apology email with acknowledgment and remediation plan',
        example: 'SITUATION: "Missed client deadline"'
      },
      { 
        title: 'Networking Message', 
        prompt: 'Write a networking message to [PERSON] who [CONTEXT]. Goal: [GOAL]. Include: personalized hook, clear ask, value offer, and easy call-to-action. Keep under 100 words.',
        inputs: ['PERSON', 'CONTEXT', 'GOAL'],
        output: 'Networking message (<100 words)',
        example: 'PERSON: "Sarah Chen" | CONTEXT: "Spoke at AI conference" | GOAL: "Advice on career"'
      },
      { 
        title: 'Status Update', 
        prompt: 'Write a status update for [PROJECT] to [AUDIENCE]. Include: progress summary, key metrics, blockers, decisions needed, and next steps. Executive-friendly but substantive.',
        inputs: ['PROJECT', 'AUDIENCE'],
        output: 'Status update with metrics, blockers, and next steps',
        example: 'PROJECT: "Product launch" | AUDIENCE: "Executive team"'
      },
      { 
        title: 'Rejection Response', 
        prompt: 'Write a response to being rejected for [OPPORTUNITY]. Ask for: feedback, future consideration, and alternative paths. Maintain relationship while showing continued interest.',
        inputs: ['OPPORTUNITY'],
        output: 'Graceful rejection response with feedback request',
        example: 'OPPORTUNITY: "Senior PM role at StartupCo"'
      },
      { 
        title: 'Introduction Request', 
        prompt: 'Write an email asking [PERSON] to introduce me to [TARGET]. Include: why I want to connect, what I offer, and make it easy to forward. Minimize friction.',
        inputs: ['PERSON', 'TARGET'],
        output: 'Introduction request email (easy to forward)',
        example: 'PERSON: "John" | TARGET: "VP Engineering at TechCorp"'
      },
      { 
        title: 'Reference Request', 
        prompt: 'Write a reference request to [PERSON] for [OPPORTUNITY]. Include: context refresh, specific qualities to highlight, and any prep materials I can provide. Respectful of their time.',
        inputs: ['PERSON', 'OPPORTUNITY'],
        output: 'Reference request with context and prep materials',
        example: 'PERSON: "Former manager" | OPPORTUNITY: "Director role"'
      },
      { 
        title: 'Late Reply', 
        prompt: 'Write a reply to an email I should have responded to [TIME] ago about [TOPIC]. Acknowledge the delay without over-apologizing, address their points, and move forward constructively.',
        inputs: ['TIME', 'TOPIC'],
        output: 'Late reply that acknowledges delay and addresses points',
        example: 'TIME: "2 weeks" | TOPIC: "Partnership proposal"'
      },
      { 
        title: 'Boundary Setting', 
        prompt: 'Help me communicate a boundary about [SITUATION] to [PERSON]. Include: clear statement of the boundary, reasoning, and what I need from them. Firm but kind.',
        inputs: ['SITUATION', 'PERSON'],
        output: 'Boundary communication (firm but kind)',
        example: 'SITUATION: "After-hours messages" | PERSON: "Manager"'
      },
      { 
        title: 'Persuasion Email', 
        prompt: 'Write an email to persuade [PERSON] to [ACTION]. Use: Cialdini\'s principles where appropriate, address likely objections, and include clear next steps. Professional but compelling.',
        inputs: ['PERSON', 'ACTION'],
        output: 'Persuasive email with objection handling',
        example: 'PERSON: "CTO" | ACTION: "Approve new tooling budget"'
      },
      { 
        title: 'Bad News Delivery', 
        prompt: 'Write a communication delivering bad news: [NEWS] to [AUDIENCE]. Include: clear statement, context, impact mitigation, next steps, and support available. Direct but compassionate.',
        inputs: ['NEWS', 'AUDIENCE'],
        output: 'Bad news communication with mitigation and next steps',
        example: 'NEWS: "Product delay" | AUDIENCE: "Customers"'
      },
      { 
        title: 'Recommendation Letter', 
        prompt: 'Write a recommendation letter for [PERSON] applying to [OPPORTUNITY]. Include: relationship context, specific achievements with impact, character qualities, and strong endorsement.',
        inputs: ['PERSON', 'OPPORTUNITY'],
        output: 'Strong recommendation letter with specific achievements',
        example: 'PERSON: "Jane Smith" | OPPORTUNITY: "MBA program"'
      },
      { 
        title: 'Follow-Up Sequence', 
        prompt: 'Create a 4-email follow-up sequence for [SITUATION] where I haven\'t heard back. Each email should: add value, not just ask, and have increasing directness. Include timing.',
        inputs: ['SITUATION'],
        output: '4-email sequence with timing and value-add',
        example: 'SITUATION: "Sales proposal sent, no response"'
      },
    ]
  },
  {
    name: 'Startup & Product',
    prompts: [
      { 
        title: 'Pitch Deck Outline', 
        prompt: 'Create a pitch deck outline for [STARTUP]. Include: 10-12 slides with purpose of each, key points, and common VC questions per slide. Stage: [STAGE]. Asking: [AMOUNT].',
        inputs: ['STARTUP', 'STAGE', 'AMOUNT'],
        output: '10-12 slide outline with VC questions per slide',
        example: 'STARTUP: "B2B SaaS" | STAGE: "Seed" | AMOUNT: "$2M"'
      },
      { 
        title: 'User Interview Script', 
        prompt: 'Create a user interview script to validate [HYPOTHESIS]. Include: warm-up, problem exploration, solution testing, and closing. Use Jobs-to-be-Done framework. 30 minutes max.',
        inputs: ['HYPOTHESIS'],
        output: '30-minute interview script with JTBD framework',
        example: 'HYPOTHESIS: "Designers need better collaboration tools"'
      },
      { 
        title: 'Feature Prioritization', 
        prompt: 'Help prioritize these features: [LIST]. Use RICE or similar framework. Consider: user impact, effort, strategic value, and dependencies. Provide ranked list with reasoning.',
        inputs: ['LIST'],
        output: 'Ranked feature list with RICE scores and reasoning',
        example: 'LIST: "Dark mode, API, Mobile app, Team permissions"'
      },
      { 
        title: 'Product Requirements', 
        prompt: 'Write a PRD for [FEATURE]. Include: problem statement, success metrics, user stories, requirements (must/should/could), edge cases, and launch criteria. Technical enough but accessible.',
        inputs: ['FEATURE'],
        output: 'Complete PRD with metrics and MoSCoW requirements',
        example: 'FEATURE: "Real-time collaboration"'
      },
      { 
        title: 'Go-to-Market Plan', 
        prompt: 'Create a GTM plan for [PRODUCT] launching to [MARKET]. Include: positioning, channels, timeline, budget allocation, launch checklist, and success metrics.',
        inputs: ['PRODUCT', 'MARKET'],
        output: 'GTM plan with channels, timeline, and budget',
        example: 'PRODUCT: "AI writing tool" | MARKET: "Content marketers"'
      },
      { 
        title: 'Competitive Moat', 
        prompt: 'Analyze potential competitive moats for [STARTUP]. Consider: network effects, switching costs, data advantages, brand, scale, and technology. Prioritize what to build.',
        inputs: ['STARTUP'],
        output: 'Moat analysis with prioritized defensibility strategies',
        example: 'STARTUP: "AI customer support platform"'
      },
      { 
        title: 'Pivot Analysis', 
        prompt: 'We\'re considering pivoting from [CURRENT] to [NEW]. Analyze: market opportunity, resource requirements, team fit, risks, and decision criteria. Recommend: pivot or persevere.',
        inputs: ['CURRENT', 'NEW'],
        output: 'Pivot analysis with recommendation and decision framework',
        example: 'CURRENT: "B2C app" | NEW: "B2B SaaS"'
      },
      { 
        title: 'Unit Economics', 
        prompt: 'Help me calculate unit economics for [BUSINESS MODEL]. Include: CAC, LTV, payback period, margins, and sensitivity analysis. Identify key levers and benchmarks.',
        inputs: ['BUSINESS MODEL'],
        output: 'Unit economics with CAC, LTV, and sensitivity analysis',
        example: 'BUSINESS MODEL: "Subscription SaaS with free trial"'
      },
      { 
        title: 'MVP Definition', 
        prompt: 'Define an MVP for [PRODUCT IDEA]. Include: core hypothesis to test, minimum features, excluded features (and why), build vs buy decisions, and success criteria.',
        inputs: ['PRODUCT IDEA'],
        output: 'MVP definition with hypothesis and success criteria',
        example: 'PRODUCT IDEA: "AI-powered code review tool"'
      },
      { 
        title: 'Investor Update', 
        prompt: 'Write an investor update for [MONTH]. Include: highlights, lowlights, key metrics, burn rate, runway, asks, and upcoming milestones. Transparent but narrative-driven.',
        inputs: ['MONTH'],
        output: 'Investor update with metrics and narrative',
        example: 'MONTH: "December 2025"'
      },
      { 
        title: 'Beta Launch Plan', 
        prompt: 'Create a beta launch plan for [PRODUCT]. Include: beta user criteria, recruitment strategy, feedback collection, bug tracking, success metrics, and graduation criteria.',
        inputs: ['PRODUCT'],
        output: 'Beta plan with user criteria and graduation metrics',
        example: 'PRODUCT: "Team collaboration tool"'
      },
      { 
        title: 'Pricing Experiment', 
        prompt: 'Design a pricing experiment for [PRODUCT]. Include: hypothesis, test design, segment selection, metrics to track, and decision criteria. Minimize revenue risk.',
        inputs: ['PRODUCT'],
        output: 'Pricing experiment design with risk mitigation',
        example: 'PRODUCT: "SaaS with 3 tiers"'
      },
      { 
        title: 'Customer Development', 
        prompt: 'Create a customer development plan for [STAGE] startup. Include: who to talk to, how many conversations, question themes, synthesis approach, and decision triggers.',
        inputs: ['STAGE'],
        output: 'Customer development plan with conversation targets',
        example: 'STAGE: "Pre-product market fit"'
      },
      { 
        title: 'Burn Rate Reduction', 
        prompt: 'Our burn rate is [AMOUNT] and we have [RUNWAY]. Help identify: cost reduction opportunities, impact on growth, and prioritized recommendations. Preserve core capabilities.',
        inputs: ['AMOUNT', 'RUNWAY'],
        output: 'Cost reduction plan with growth impact analysis',
        example: 'AMOUNT: "$100k/month" | RUNWAY: "6 months"'
      },
      { 
        title: 'Product Launch Checklist', 
        prompt: 'Create a comprehensive product launch checklist for [PRODUCT]. Include: pre-launch (2 weeks), launch day, and post-launch (2 weeks) tasks across all functions.',
        inputs: ['PRODUCT'],
        output: 'Launch checklist with timeline across all functions',
        example: 'PRODUCT: "Mobile app"'
      },
    ]
  },
  {
    name: 'Teaching & Explaining',
    prompts: [
      { 
        title: 'Explain Like I\'m 5', 
        prompt: 'Explain [COMPLEX TOPIC] like I\'m 5 years old. Use: simple analogies, everyday examples, no jargon. Then level up the explanation for: high school, undergrad, and expert levels.',
        inputs: ['COMPLEX TOPIC'],
        output: '4-level explanation (age 5, high school, undergrad, expert)',
        example: 'TOPIC: "Blockchain"'
      },
      { 
        title: 'Tutorial Outline', 
        prompt: 'Create a tutorial outline for teaching [SKILL] to [AUDIENCE]. Include: learning objectives, prerequisites, modules, hands-on exercises, and assessment. Duration: [TIME].',
        inputs: ['SKILL', 'AUDIENCE', 'TIME'],
        output: 'Tutorial outline with modules and exercises',
        example: 'SKILL: "Python" | AUDIENCE: "Beginners" | TIME: "2 hours"'
      },
      { 
        title: 'Analogy Creation', 
        prompt: 'Create 5 analogies to explain [CONCEPT]. Vary the domains (sports, cooking, everyday life, etc). For each, explain why it works and where it breaks down.',
        inputs: ['CONCEPT'],
        output: '5 analogies with explanations and limitations',
        example: 'CONCEPT: "APIs"'
      },
      { 
        title: 'FAQ Generator', 
        prompt: 'Generate a comprehensive FAQ for [TOPIC/PRODUCT]. Include: beginner questions, intermediate questions, edge cases, and troubleshooting. Answer each concisely but completely.',
        inputs: ['TOPIC/PRODUCT'],
        output: 'Comprehensive FAQ with answers at all levels',
        example: 'PRODUCT: "SaaS collaboration tool"'
      },
      { 
        title: 'Workshop Design', 
        prompt: 'Design a workshop on [TOPIC] for [AUDIENCE]. Include: learning outcomes, agenda, activities, materials needed, facilitation notes, and follow-up resources. Duration: [TIME].',
        inputs: ['TOPIC', 'AUDIENCE', 'TIME'],
        output: 'Workshop plan with agenda, activities, and materials',
        example: 'TOPIC: "Design thinking" | AUDIENCE: "Product managers" | TIME: "Half day"'
      },
      { 
        title: 'Concept Comparison', 
        prompt: 'Compare and contrast [CONCEPT A] vs [CONCEPT B]. Include: similarities, differences, when to use each, common misconceptions, and a summary table.',
        inputs: ['CONCEPT A', 'CONCEPT B'],
        output: 'Comparison with similarities, differences, and summary table',
        example: 'A: "React" | B: "Vue"'
      },
      { 
        title: 'Mental Model', 
        prompt: 'Explain the [MENTAL MODEL] and how to apply it to [CONTEXT]. Include: origin, core principle, examples, limitations, and when not to use it.',
        inputs: ['MENTAL MODEL', 'CONTEXT'],
        output: 'Mental model explanation with examples and limitations',
        example: 'MODEL: "First Principles Thinking" | CONTEXT: "Product development"'
      },
      { 
        title: 'Cheat Sheet', 
        prompt: 'Create a one-page cheat sheet for [TOPIC]. Include: key concepts, formulas/frameworks, common mistakes, pro tips, and quick reference table. Optimized for scanning.',
        inputs: ['TOPIC'],
        output: 'One-page cheat sheet optimized for quick reference',
        example: 'TOPIC: "Git commands"'
      },
      { 
        title: 'Learning Path', 
        prompt: 'Design a learning path for [SKILL] from beginner to advanced. Include: stages, resources for each (free preferred), projects to build, and time estimates. Consider different learning styles.',
        inputs: ['SKILL'],
        output: 'Complete learning path from beginner to advanced',
        example: 'SKILL: "Machine Learning"'
      },
      { 
        title: 'Misconception Clarification', 
        prompt: 'What are the top 10 misconceptions about [TOPIC]? For each: state the misconception, explain the truth, why the misconception exists, and how to remember the correct understanding.',
        inputs: ['TOPIC'],
        output: '10 misconceptions with truth and memory aids',
        example: 'TOPIC: "SEO"'
      },
      { 
        title: 'Curriculum Design', 
        prompt: 'Design a curriculum for [COURSE TOPIC]. Include: course description, learning outcomes, weekly breakdown, assignments, readings, and grading rubric. Duration: [WEEKS].',
        inputs: ['COURSE TOPIC', 'WEEKS'],
        output: 'Complete curriculum with weekly breakdown',
        example: 'COURSE: "Web Development" | WEEKS: "12"'
      },
      { 
        title: 'Study Guide', 
        prompt: 'Create a study guide for [TOPIC/EXAM]. Include: key topics, important facts, practice questions, memory aids, and study schedule recommendation.',
        inputs: ['TOPIC/EXAM'],
        output: 'Study guide with practice questions and schedule',
        example: 'EXAM: "AWS Solutions Architect certification"'
      },
      { 
        title: 'Onboarding Doc', 
        prompt: 'Create an onboarding document for new [ROLE] joining [TEAM/COMPANY]. Include: first week checklist, key resources, who to meet, common questions, and 30-60-90 day expectations.',
        inputs: ['ROLE', 'TEAM/COMPANY'],
        output: 'Onboarding doc with checklist and 30-60-90 plan',
        example: 'ROLE: "Engineer" | COMPANY: "Tech startup"'
      },
      { 
        title: 'Technical to Non-Technical', 
        prompt: 'Translate this technical explanation: [TECHNICAL CONTENT] for a non-technical [AUDIENCE]. Preserve accuracy while making it accessible. Include analogies and examples.',
        inputs: ['TECHNICAL CONTENT', 'AUDIENCE'],
        output: 'Non-technical translation with analogies',
        example: 'CONTENT: "API rate limiting" | AUDIENCE: "Business stakeholders"'
      },
      { 
        title: 'Quiz Generator', 
        prompt: 'Generate a quiz on [TOPIC] with 15 questions. Mix: multiple choice, true/false, and short answer. Include: questions, answers, and explanations for wrong answers. Vary difficulty.',
        inputs: ['TOPIC'],
        output: '15-question quiz with varied difficulty and explanations',
        example: 'TOPIC: "JavaScript fundamentals"'
      },
    ]
  },
  {
    name: 'Strategy & Planning',
    prompts: [
      { 
        title: 'SWOT Analysis', 
        prompt: 'Conduct a SWOT analysis for [COMPANY/PRODUCT]. Be specific and actionable. Include: prioritized items in each quadrant, SO/WO/ST/WT strategies, and recommended focus areas.',
        inputs: ['COMPANY/PRODUCT'],
        output: 'SWOT with prioritized items and strategies',
        example: 'COMPANY: "E-commerce startup"'
      },
      { 
        title: 'OKR Setting', 
        prompt: 'Help me set OKRs for [TEAM/INDIVIDUAL] for [PERIOD]. Include: 3-5 objectives with 3-4 key results each, make them ambitious but achievable, and explain the thinking.',
        inputs: ['TEAM/INDIVIDUAL', 'PERIOD'],
        output: 'OKRs with 3-5 objectives and key results',
        example: 'TEAM: "Engineering" | PERIOD: "Q1 2026"'
      },
      { 
        title: 'Strategic Planning', 
        prompt: 'Facilitate strategic planning for [ORGANIZATION]. Include: vision clarification, current state assessment, strategic options, evaluation criteria, and implementation roadmap. Time horizon: [YEARS].',
        inputs: ['ORGANIZATION', 'YEARS'],
        output: 'Strategic plan with vision, options, and roadmap',
        example: 'ORGANIZATION: "Mid-size SaaS company" | YEARS: "3"'
      },
      { 
        title: 'Risk Assessment', 
        prompt: 'Conduct a risk assessment for [PROJECT/INITIATIVE]. Include: risk identification, likelihood/impact scoring, mitigation strategies, contingency plans, and risk monitoring approach.',
        inputs: ['PROJECT/INITIATIVE'],
        output: 'Risk assessment with likelihood/impact and mitigation',
        example: 'PROJECT: "Cloud migration"'
      },
      { 
        title: 'Resource Allocation', 
        prompt: 'Help allocate [RESOURCE: budget/headcount/time] across [OPTIONS]. Consider: strategic priorities, expected returns, dependencies, and flexibility needs. Provide recommendation with reasoning.',
        inputs: ['RESOURCE', 'OPTIONS'],
        output: 'Resource allocation with recommendations and reasoning',
        example: 'RESOURCE: "$500k budget" | OPTIONS: "Product, Marketing, Sales"'
      },
      { 
        title: 'Stakeholder Analysis', 
        prompt: 'Create a stakeholder analysis for [INITIATIVE]. Include: stakeholder map, influence/interest matrix, communication strategy for each, and potential blockers to address.',
        inputs: ['INITIATIVE'],
        output: 'Stakeholder map with influence/interest and communication plan',
        example: 'INITIATIVE: "Company-wide tool rollout"'
      },
      { 
        title: 'Scenario Planning', 
        prompt: 'Develop scenarios for [UNCERTAINTY]. Create 3-4 distinct scenarios with: narrative, indicators, implications, and strategic responses. Help us prepare for multiple futures.',
        inputs: ['UNCERTAINTY'],
        output: '3-4 scenarios with narratives and strategic responses',
        example: 'UNCERTAINTY: "AI regulation changes"'
      },
      { 
        title: 'Change Management', 
        prompt: 'Create a change management plan for [CHANGE]. Include: stakeholder impact, communication plan, training needs, resistance handling, and success metrics.',
        inputs: ['CHANGE'],
        output: 'Change plan with communication and resistance handling',
        example: 'CHANGE: "New CRM system rollout"'
      },
      { 
        title: 'Post-Mortem Template', 
        prompt: 'Create a post-mortem template for [PROJECT TYPE]. Include: timeline reconstruction, what went well, what didn\'t, root cause analysis, and action items. Blame-free format.',
        inputs: ['PROJECT TYPE'],
        output: 'Post-mortem template with blame-free format',
        example: 'PROJECT TYPE: "Product launch"'
      },
      { 
        title: 'Roadmap Planning', 
        prompt: 'Help create a roadmap for [PRODUCT/TEAM] for [TIMEFRAME]. Include: themes, initiatives, dependencies, milestones, and resource requirements. Balance ambition with realism.',
        inputs: ['PRODUCT/TEAM', 'TIMEFRAME'],
        output: 'Roadmap with themes, milestones, and dependencies',
        example: 'PRODUCT: "Mobile app" | TIMEFRAME: "2026"'
      },
      { 
        title: 'Buy vs Build', 
        prompt: 'Analyze buy vs build for [CAPABILITY]. Include: total cost of ownership, time to value, strategic fit, risks, and recommendation with decision criteria.',
        inputs: ['CAPABILITY'],
        output: 'Buy vs build analysis with TCO and recommendation',
        example: 'CAPABILITY: "Payment processing"'
      },
      { 
        title: 'Market Entry', 
        prompt: 'Develop a market entry strategy for [PRODUCT] in [MARKET]. Include: market analysis, entry mode options, localization needs, partnerships, and go-to-market timeline.',
        inputs: ['PRODUCT', 'MARKET'],
        output: 'Market entry strategy with analysis and timeline',
        example: 'PRODUCT: "SaaS tool" | MARKET: "European Union"'
      },
      { 
        title: 'Exit Strategy', 
        prompt: 'Outline exit strategy options for [COMPANY/INVESTMENT]. Include: potential exit types, timing considerations, value maximization tactics, and preparation requirements.',
        inputs: ['COMPANY/INVESTMENT'],
        output: 'Exit options with timing and value maximization',
        example: 'COMPANY: "B2B SaaS startup"'
      },
      { 
        title: 'Capacity Planning', 
        prompt: 'Help with capacity planning for [TEAM/SYSTEM]. Include: current capacity, demand forecast, gap analysis, and scaling options with tradeoffs.',
        inputs: ['TEAM/SYSTEM'],
        output: 'Capacity plan with forecast and scaling options',
        example: 'TEAM: "Customer support (15 people)"'
      },
      { 
        title: 'Portfolio Review', 
        prompt: 'Facilitate a portfolio review for [PROJECTS/PRODUCTS]. Include: evaluation criteria, performance assessment, recommendation (invest/hold/divest) for each, and resource reallocation.',
        inputs: ['PROJECTS/PRODUCTS'],
        output: 'Portfolio review with invest/hold/divest recommendations',
        example: 'PROJECTS: "5 internal tools"'
      },
    ]
  },
]

export default function PromptLibraryPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null)
  
  const totalPrompts = promptCategories.reduce((acc, cat) => acc + cat.prompts.length, 0)
  
  const filteredCategories = promptCategories.map(cat => ({
    ...cat,
    prompts: cat.prompts.filter(p => 
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.prompt.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(cat => 
    (!selectedCategory || cat.name === selectedCategory) &&
    (cat.prompts.length > 0 || !searchTerm)
  )
  
  const copyToClipboard = async (text: string, index: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }
  
  return (
    <main className="min-h-screen relative z-10 p-4 md:p-8">
      <div className="container mx-auto max-w-6xl">
        {/* Hero */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-white">JoePro&apos;s Prompt Library</span>
          </h1>
          <p className="text-xl text-[var(--primary)] mb-2">
            {totalPrompts}+ Ready-to-Copy Prompts
          </p>
          <p className="text-[var(--text-muted)] max-w-2xl mx-auto">
            Battle-tested prompts from JoePro (JoeProAI). Copy, customize, and use immediately. 
            Updated regularly with new prompts that actually work.
          </p>
        </header>

        {/* Search & Filter */}
        <div className="glass card-border p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={20} />
              <input
                type="text"
                placeholder="Search prompts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg focus:border-[var(--primary)] focus:outline-none"
              />
            </div>
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="px-4 py-3 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg focus:border-[var(--primary)] focus:outline-none"
            >
              <option value="">All Categories</option>
              {promptCategories.map((cat, i) => (
                <option key={i} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Prompts */}
        {filteredCategories.map((category, catIndex) => (
          <section key={catIndex} className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">{category.name}</h2>
            <div className="space-y-4">
              {category.prompts.map((prompt, promptIndex) => {
                const uniqueKey = `${catIndex}-${promptIndex}`
                const hasMetadata = 'inputs' in prompt && 'output' in prompt
                return (
                  <div key={promptIndex} className="glass card-border p-5 hover:border-[var(--primary)]/30 transition-all">
                    {/* Title & Copy Button */}
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-white text-lg">{prompt.title}</h3>
                      <button
                        onClick={() => copyToClipboard(prompt.prompt, uniqueKey)}
                        className="p-2 hover:bg-[var(--primary)]/10 rounded transition-colors flex-shrink-0 group"
                        title="Copy prompt"
                      >
                        {copiedIndex === uniqueKey ? (
                          <Check size={18} className="text-green-400" />
                        ) : (
                          <Copy size={18} className="text-[var(--text-muted)] group-hover:text-[var(--primary)]" />
                        )}
                      </button>
                    </div>

                    {/* Inputs & Output Format (if available) */}
                    {hasMetadata && (
                      <div className="grid md:grid-cols-2 gap-3 mb-3">
                        <div className="bg-[var(--card-bg)]/50 p-3 rounded border border-[var(--border)]">
                          <div className="text-xs font-semibold text-[var(--primary)] mb-1.5 uppercase tracking-wide">Required Inputs</div>
                          <div className="flex flex-wrap gap-1.5">
                            {(prompt as PromptItem).inputs.map((input, i) => (
                              <span key={i} className="text-xs px-2 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded font-mono">
                                [{input}]
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="bg-[var(--card-bg)]/50 p-3 rounded border border-[var(--border)]">
                          <div className="text-xs font-semibold text-green-400 mb-1.5 uppercase tracking-wide">Output Format</div>
                          <div className="text-sm text-[var(--text-muted)]">{(prompt as PromptItem).output}</div>
                        </div>
                      </div>
                    )}

                    {/* Example (if available) */}
                    {hasMetadata && (prompt as PromptItem).example && (
                      <div className="bg-blue-500/5 border border-blue-500/20 rounded p-3 mb-3">
                        <div className="text-xs font-semibold text-blue-400 mb-1 uppercase tracking-wide">Example</div>
                        <div className="text-sm text-blue-300/80 font-mono">{(prompt as PromptItem).example}</div>
                      </div>
                    )}

                    {/* Prompt */}
                    <div className="bg-[var(--card-bg)] p-4 rounded border border-[var(--border)]">
                      <div className="text-xs font-semibold text-[var(--text-muted)] mb-2 uppercase tracking-wide">Prompt Template</div>
                      <p className="text-[var(--text-muted)] text-sm font-mono leading-relaxed">
                        {prompt.prompt}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        ))}

        {/* CTA */}
        <section className="glass card-border p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Want More Prompts?
          </h2>
          <p className="text-[var(--text-muted)] mb-4">
            Follow JoePro on X for daily prompt tips and AI strategies.
          </p>
          <a 
            href="https://x.com/JoePro" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-lg transition-colors"
          >
            Follow @JoePro
          </a>
        </section>
      </div>
    </main>
  )
}
