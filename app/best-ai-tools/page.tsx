import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'The 2025 AI Toolbox – 150+ Best AI Tools Curated by JoePro | JoeProAI',
  description: 'The refined 2025 AI tools list curated by JoePro (JoeProAI). 150+ high-impact AI tools for developers, creators, and entrepreneurs. No fluff, only tools that actually work.',
  keywords: [
    'best AI tools 2025', 'AI tools list', 'JoePro AI tools', 'JoeProAI recommendations',
    'AI toolbox', 'top AI tools', 'AI software list', 'JoePro curated', 'AI resources'
  ],
  openGraph: {
    title: 'The 2025 AI Toolbox – Curated by JoePro',
    description: '150+ best AI tools for 2025, personally tested and rated by JoePro (JoeProAI). No fluff.',
  },
}

// Tool categories and tools - Refined 2025 Edition
const toolCategories = [
  {
    name: 'AI Chatbots & Assistants',
    tools: [
      { name: 'ChatGPT', rating: 5, url: 'https://chat.openai.com', desc: 'The OG. Best for general tasks, coding, writing.', tier: 'Essential' },
      { name: 'Claude', rating: 5, url: 'https://claude.ai', desc: 'Best for long documents, nuanced writing, coding.', tier: 'Essential' },
      { name: 'Grok', rating: 4, url: 'https://grok.com', desc: 'Real-time info, unfiltered responses. X integration.', tier: 'Great' },
      { name: 'Gemini', rating: 4, url: 'https://gemini.google.com', desc: 'Google\'s multimodal AI. Great for research.', tier: 'Great' },
      { name: 'Perplexity', rating: 5, url: 'https://perplexity.ai', desc: 'AI-powered search. Best for research with sources.', tier: 'Essential' },
      { name: 'Poe', rating: 4, url: 'https://poe.com', desc: 'Access multiple AI models in one place.', tier: 'Great' },
      { name: 'Copilot', rating: 4, url: 'https://copilot.microsoft.com', desc: 'Microsoft\'s AI assistant. Good Office integration.', tier: 'Great' },
      { name: 'Merlin', rating: 4, url: 'https://getmerlin.in', desc: 'Browser AI assistant. Great for research.', tier: 'Great' },
    ]
  },
  {
    name: 'AI Image Generation',
    tools: [
      { name: 'Midjourney', rating: 5, url: 'https://midjourney.com', desc: 'Best aesthetic quality. Discord-based.', tier: 'Essential' },
      { name: 'DALL-E 3', rating: 5, url: 'https://openai.com/dall-e-3', desc: 'Best text rendering, prompt adherence.', tier: 'Essential' },
      { name: 'Grok Imagine', rating: 5, url: 'https://grok.com/imagine', desc: 'Fast, high quality image gen from xAI.', tier: 'Essential' },
      { name: 'Flux', rating: 5, url: 'https://blackforestlabs.ai', desc: 'New king of open source image gen.', tier: 'Essential' },
      { name: 'Stable Diffusion', rating: 4, url: 'https://stability.ai', desc: 'Open source. Run locally, full control.', tier: 'Essential' },
      { name: 'Leonardo.ai', rating: 4, url: 'https://leonardo.ai', desc: 'Great for game assets, consistent styles.', tier: 'Great' },
      { name: 'Ideogram', rating: 4, url: 'https://ideogram.ai', desc: 'Best free option for text in images.', tier: 'Great' },
      { name: 'Adobe Firefly', rating: 4, url: 'https://firefly.adobe.com', desc: 'Commercially safe, Adobe integration.', tier: 'Great' },
      { name: 'Luma Photon', rating: 4, url: 'https://lumalabs.ai', desc: 'Fast, high quality. API available.', tier: 'Great' },
      { name: 'Google Imagen', rating: 5, url: 'https://deepmind.google/imagen', desc: 'Fast, precise with multilingual support.', tier: 'Essential' },
    ]
  },
  {
    name: 'AI Video Generation',
    tools: [
      { name: 'Luma Ray 3', rating: 5, url: 'https://lumalabs.ai', desc: 'Best quality text-to-video. JoePro\'s choice.', tier: 'Essential' },
      { name: 'Veo 3', rating: 5, url: 'https://deepmind.google/veo', desc: 'Google\'s latest. Incredible quality.', tier: 'Essential' },
      { name: 'Kling AI', rating: 5, url: 'https://klingai.com', desc: 'Impressive results, great motion.', tier: 'Essential' },
      { name: 'Wan 2.1', rating: 4, url: 'https://wan.video', desc: 'Open source video gen. Great quality.', tier: 'Great' },
      { name: 'Runway Gen-3', rating: 5, url: 'https://runwayml.com', desc: 'Professional video AI. Great motion.', tier: 'Essential' },
      { name: 'Pika', rating: 4, url: 'https://pika.art', desc: 'Fun effects, good for short clips.', tier: 'Great' },
      { name: 'Sora', rating: 5, url: 'https://openai.com/sora', desc: 'OpenAI\'s video model. When available.', tier: 'Essential' },
      { name: 'HeyGen', rating: 4, url: 'https://heygen.com', desc: 'AI avatars, great for marketing videos.', tier: 'Great' },
      { name: 'Synthesia', rating: 4, url: 'https://synthesia.io', desc: 'Enterprise AI avatars, training videos.', tier: 'Great' },
      { name: 'LTX Studio', rating: 4, url: 'https://ltx.studio', desc: 'Full video production with AI.', tier: 'Great' },
    ]
  },
  {
    name: 'AI Audio & Music',
    tools: [
      { name: 'ElevenLabs', rating: 5, url: 'https://elevenlabs.io', desc: 'Best voice cloning & TTS. JoePro uses this.', tier: 'Essential' },
      { name: 'Suno', rating: 5, url: 'https://suno.ai', desc: 'Best AI music generation. Full songs.', tier: 'Essential' },
      { name: 'Udio', rating: 5, url: 'https://udio.com', desc: 'Suno competitor. Great quality.', tier: 'Essential' },
      { name: 'Murf.ai', rating: 4, url: 'https://murf.ai', desc: 'Professional voiceovers.', tier: 'Great' },
      { name: 'Descript', rating: 5, url: 'https://descript.com', desc: 'Transcript-based editing with AI cleanup.', tier: 'Essential' },
      { name: 'Adobe Podcast', rating: 4, url: 'https://podcast.adobe.com', desc: 'Free audio enhancement.', tier: 'Great' },
      { name: 'Resemble.AI', rating: 4, url: 'https://resemble.ai', desc: 'Voice cloning for developers.', tier: 'Great' },
      { name: 'Mureka AI', rating: 4, url: 'https://mureka.ai', desc: 'Song generation from lyrics with stems.', tier: 'Great' },
    ]
  },
  {
    name: 'AI Coding Tools',
    tools: [
      { name: 'Windsurf', rating: 5, url: 'https://codeium.com/windsurf', desc: 'JoePro\'s go-to. Cascade is the best agent.', tier: 'Essential' },
      { name: 'Claude Code', rating: 5, url: 'https://claude.ai', desc: 'Second choice for coding. Great reasoning.', tier: 'Essential' },
      { name: 'GitHub Copilot', rating: 5, url: 'https://github.com/features/copilot', desc: 'Best IDE integration. Essential for devs.', tier: 'Essential' },
      { name: 'v0.dev', rating: 5, url: 'https://v0.dev', desc: 'AI UI generation. Vercel\'s gem.', tier: 'Essential' },
      { name: 'Replit', rating: 4, url: 'https://replit.com', desc: 'AI-powered cloud IDE. Great for beginners.', tier: 'Great' },
      { name: 'Bolt.new', rating: 4, url: 'https://bolt.new', desc: 'Full-stack app generation in browser.', tier: 'Great' },
      { name: 'Lovable', rating: 4, url: 'https://lovable.dev', desc: 'AI app builder. Good for MVPs.', tier: 'Great' },
      { name: 'Codeium', rating: 4, url: 'https://codeium.com', desc: 'Free Copilot alternative.', tier: 'Great' },
      { name: 'Aider', rating: 4, url: 'https://aider.chat', desc: 'Terminal-based AI coding. Open source.', tier: 'Great' },
    ]
  },
  {
    name: 'AI Writing & Content',
    tools: [
      { name: 'Jasper', rating: 4, url: 'https://jasper.ai', desc: 'Marketing copy, blog posts.', tier: 'Great' },
      { name: 'Copy.ai', rating: 4, url: 'https://copy.ai', desc: 'Marketing copy generation.', tier: 'Great' },
      { name: 'Notion AI', rating: 4, url: 'https://notion.so', desc: 'AI in your workspace. Great integration.', tier: 'Great' },
      { name: 'Grammarly', rating: 4, url: 'https://grammarly.com', desc: 'Grammar + AI writing suggestions.', tier: 'Great' },
      { name: 'Hemingway', rating: 3, url: 'https://hemingwayapp.com', desc: 'Make writing clear and bold.', tier: 'Good' },
      { name: 'Sudowrite', rating: 4, url: 'https://sudowrite.com', desc: 'AI for fiction writers.', tier: 'Niche' },
      { name: 'Lex', rating: 3, url: 'https://lex.page', desc: 'AI-powered word processor.', tier: 'Good' },
      { name: 'Wordtune', rating: 3, url: 'https://wordtune.com', desc: 'Rewrite and improve text.', tier: 'Good' },
    ]
  },
  {
    name: 'AI Research & Knowledge',
    tools: [
      { name: 'Perplexity', rating: 5, url: 'https://perplexity.ai', desc: 'AI search with sources. Best for research.', tier: 'Essential' },
      { name: 'NotebookLM', rating: 5, url: 'https://notebooklm.google.com', desc: 'Google\'s AI notebook. Amazing for research.', tier: 'Essential' },
      { name: 'Consensus', rating: 4, url: 'https://consensus.app', desc: 'AI search for academic papers.', tier: 'Great' },
      { name: 'Elicit', rating: 4, url: 'https://elicit.com', desc: 'AI research assistant for papers.', tier: 'Great' },
      { name: 'Semantic Scholar', rating: 4, url: 'https://semanticscholar.org', desc: 'AI-powered academic search.', tier: 'Great' },
      { name: 'Scite', rating: 4, url: 'https://scite.ai', desc: 'Smart citations for research.', tier: 'Great' },
      { name: 'Connected Papers', rating: 4, url: 'https://connectedpapers.com', desc: 'Visualize paper connections.', tier: 'Great' },
    ]
  },
  {
    name: 'AI Productivity & Automation',
    tools: [
      { name: 'Make', rating: 5, url: 'https://make.com', desc: 'Visual automation builder. JoePro\'s choice.', tier: 'Essential' },
      { name: 'n8n', rating: 5, url: 'https://n8n.io', desc: 'Self-hosted workflow automation + AI.', tier: 'Essential' },
      { name: 'Zapier', rating: 4, url: 'https://zapier.com', desc: 'AI automation between apps.', tier: 'Great' },
      { name: 'Bardeen', rating: 4, url: 'https://bardeen.ai', desc: 'Browser automation with AI.', tier: 'Great' },
      { name: 'Reclaim.ai', rating: 4, url: 'https://reclaim.ai', desc: 'AI calendar scheduling.', tier: 'Great' },
      { name: 'Motion', rating: 4, url: 'https://usemotion.com', desc: 'AI project management.', tier: 'Great' },
      { name: 'Otter.ai', rating: 4, url: 'https://otter.ai', desc: 'AI meeting transcription.', tier: 'Great' },
      { name: 'Fireflies.ai', rating: 4, url: 'https://fireflies.ai', desc: 'Meeting notes & transcription.', tier: 'Great' },
      { name: 'Fathom', rating: 5, url: 'https://fathom.video', desc: 'Free AI meeting assistant. Essential.', tier: 'Essential' },
    ]
  },
  {
    name: 'AI Marketing & Sales',
    tools: [
      { name: 'HubSpot AI', rating: 4, url: 'https://hubspot.com', desc: 'AI-powered CRM & marketing.', tier: 'Great' },
      { name: 'Apollo.io', rating: 4, url: 'https://apollo.io', desc: 'AI sales intelligence.', tier: 'Great' },
      { name: 'Lavender', rating: 4, url: 'https://lavender.ai', desc: 'AI email coaching for sales.', tier: 'Great' },
      { name: 'Drift', rating: 4, url: 'https://drift.com', desc: 'AI chatbots for sales.', tier: 'Great' },
      { name: 'Intercom Fin', rating: 4, url: 'https://intercom.com', desc: 'AI customer support.', tier: 'Great' },
      { name: 'Gong.io', rating: 4, url: 'https://gong.io', desc: 'Analyzes sales conversations for insights.', tier: 'Great' },
      { name: 'AdCreative', rating: 4, url: 'https://adcreative.ai', desc: 'Generates ad designs for platforms.', tier: 'Great' },
      { name: 'Clearbit', rating: 4, url: 'https://clearbit.com', desc: 'AI data enrichment.', tier: 'Great' },
    ]
  },
  {
    name: 'AI Design & Creative',
    tools: [
      { name: 'Canva Magic Studio', rating: 5, url: 'https://canva.com', desc: 'AI for design edits, animations, templates.', tier: 'Essential' },
      { name: 'Figma AI', rating: 4, url: 'https://figma.com', desc: 'AI features in Figma.', tier: 'Great' },
      { name: 'Framer', rating: 5, url: 'https://framer.com', desc: 'AI website builder. Beautiful results.', tier: 'Essential' },
      { name: 'Relume', rating: 4, url: 'https://relume.io', desc: 'AI wireframes & sitemaps.', tier: 'Great' },
      { name: 'Galileo AI', rating: 4, url: 'https://usegalileo.ai', desc: 'AI UI generation.', tier: 'Great' },
      { name: 'Remove.bg', rating: 4, url: 'https://remove.bg', desc: 'AI background removal.', tier: 'Great' },
      { name: 'Cleanup.pictures', rating: 4, url: 'https://cleanup.pictures', desc: 'Remove objects from photos.', tier: 'Great' },
      { name: 'PhotoRoom', rating: 4, url: 'https://photoroom.com', desc: 'AI photo editing.', tier: 'Great' },
      { name: 'Luminar Neo', rating: 4, url: 'https://skylum.com/luminar', desc: 'AI photo enhancement and masking.', tier: 'Great' },
    ]
  },
  {
    name: 'AI Agents & Frameworks',
    tools: [
      { name: 'LangChain', rating: 5, url: 'https://langchain.com', desc: 'Build AI applications. Developer essential.', tier: 'Essential' },
      { name: 'CrewAI', rating: 4, url: 'https://crewai.com', desc: 'Multi-agent orchestration.', tier: 'Great' },
      { name: 'LlamaIndex', rating: 4, url: 'https://llamaindex.ai', desc: 'Data framework for LLMs.', tier: 'Great' },
      { name: 'Flowise', rating: 4, url: 'https://flowiseai.com', desc: 'Visual LLM flow builder.', tier: 'Great' },
      { name: 'Dify', rating: 4, url: 'https://dify.ai', desc: 'LLM app development platform.', tier: 'Great' },
      { name: 'ComfyUI', rating: 5, url: 'https://github.com/comfyanonymous/ComfyUI', desc: 'Node-based UI for image/video workflows.', tier: 'Essential' },
      { name: 'Relevance AI', rating: 4, url: 'https://relevanceai.com', desc: 'AI workforce platform.', tier: 'Great' },
      { name: 'Lindy', rating: 4, url: 'https://lindy.ai', desc: 'AI assistant builder.', tier: 'Great' },
      { name: 'Manus', rating: 4, url: 'https://manus.im', desc: 'AI agent for slides, analysis, web building.', tier: 'Great' },
    ]
  },
  {
    name: 'AI for Social Media',
    tools: [
      { name: 'Opus Clip', rating: 5, url: 'https://opus.pro', desc: 'AI short clips from long videos.', tier: 'Essential' },
      { name: 'Vidyo.ai', rating: 4, url: 'https://vidyo.ai', desc: 'Repurpose video for social.', tier: 'Great' },
      { name: 'Castmagic', rating: 4, url: 'https://castmagic.io', desc: 'Podcast to content pipeline.', tier: 'Great' },
      { name: 'Taplio', rating: 4, url: 'https://taplio.com', desc: 'LinkedIn AI tool.', tier: 'Great' },
      { name: 'Tweet Hunter', rating: 4, url: 'https://tweethunter.io', desc: 'AI for X growth.', tier: 'Great' },
    ]
  },
  {
    name: 'AI Developer Tools',
    tools: [
      { name: 'OpenAI API', rating: 5, url: 'https://platform.openai.com', desc: 'GPT-4, DALL-E, Whisper APIs.', tier: 'Essential' },
      { name: 'Anthropic API', rating: 5, url: 'https://anthropic.com', desc: 'Claude API. Best for coding.', tier: 'Essential' },
      { name: 'Google AI Studio', rating: 4, url: 'https://aistudio.google.com', desc: 'Gemini API access.', tier: 'Great' },
      { name: 'Hugging Face', rating: 5, url: 'https://huggingface.co', desc: 'ML model hub. Essential.', tier: 'Essential' },
      { name: 'Replicate', rating: 4, url: 'https://replicate.com', desc: 'Run ML models via API.', tier: 'Great' },
      { name: 'Together AI', rating: 4, url: 'https://together.ai', desc: 'Open source model hosting.', tier: 'Great' },
      { name: 'Groq', rating: 5, url: 'https://groq.com', desc: 'Fastest LLM inference. Free tier!', tier: 'Essential' },
      { name: 'Ollama', rating: 5, url: 'https://ollama.ai', desc: 'Run LLMs locally. Free.', tier: 'Essential' },
      { name: 'LM Studio', rating: 4, url: 'https://lmstudio.ai', desc: 'Local LLM GUI.', tier: 'Great' },
      { name: 'DeepSeek', rating: 4, url: 'https://deepseek.com', desc: 'Open-weight models for precision deployment.', tier: 'Great' },
    ]
  },
  {
    name: 'AI Learning & Education',
    tools: [
      { name: 'Fast.ai', rating: 5, url: 'https://fast.ai', desc: 'Free deep learning course. Best.', tier: 'Essential' },
      { name: 'DeepLearning.AI', rating: 5, url: 'https://deeplearning.ai', desc: 'Andrew Ng\'s courses.', tier: 'Essential' },
      { name: 'Khan Academy Khanmigo', rating: 4, url: 'https://khanacademy.org', desc: 'AI tutor for students.', tier: 'Great' },
      { name: 'Duolingo Max', rating: 4, url: 'https://duolingo.com', desc: 'AI language learning.', tier: 'Great' },
      { name: 'Coursera', rating: 4, url: 'https://coursera.org', desc: 'AI courses from universities.', tier: 'Great' },
      { name: 'DataCamp', rating: 4, url: 'https://datacamp.com', desc: 'Learn AI/ML with AI help.', tier: 'Great' },
      { name: 'Brilliant', rating: 4, url: 'https://brilliant.org', desc: 'Interactive AI/ML learning.', tier: 'Great' },
    ]
  },
  {
    name: 'AI Local & Privacy',
    tools: [
      { name: 'Ollama', rating: 5, url: 'https://ollama.ai', desc: 'Run LLMs locally. Free & essential.', tier: 'Essential' },
      { name: 'LM Studio', rating: 4, url: 'https://lmstudio.ai', desc: 'Local LLM GUI. Easy to use.', tier: 'Great' },
      { name: 'Jan', rating: 4, url: 'https://jan.ai', desc: 'Local AI assistant. Open source.', tier: 'Great' },
      { name: 'GPT4All', rating: 4, url: 'https://gpt4all.io', desc: 'Run LLMs locally on any hardware.', tier: 'Great' },
      { name: 'PrivateGPT', rating: 4, url: 'https://privategpt.io', desc: 'Chat with docs privately.', tier: 'Great' },
      { name: 'OpenWebUI', rating: 4, url: 'https://openwebui.com', desc: 'Self-hosted ChatGPT UI.', tier: 'Great' },
      { name: 'AnythingLLM', rating: 4, url: 'https://anythingllm.com', desc: 'Private document AI.', tier: 'Great' },
      { name: 'Text Generation WebUI', rating: 4, url: 'https://github.com/oobabooga', desc: 'Self-hosted LLM interface.', tier: 'Great' },
    ]
  },
  {
    name: 'AI Gaming & 3D',
    tools: [
      { name: 'Luma AI', rating: 5, url: 'https://lumalabs.ai', desc: '3D capture & generation.', tier: 'Essential' },
      { name: 'Meshy', rating: 5, url: 'https://meshy.ai', desc: 'Text/image to 3D models. JoePro uses this.', tier: 'Essential' },
      { name: 'Scenario', rating: 4, url: 'https://scenario.com', desc: 'AI game asset generation.', tier: 'Great' },
      { name: 'Kaedim', rating: 4, url: 'https://kaedim3d.com', desc: '2D to 3D conversion.', tier: 'Great' },
      { name: 'Blockade Labs', rating: 4, url: 'https://blockadelabs.com', desc: 'AI skybox generation.', tier: 'Great' },
      { name: 'Spline AI', rating: 4, url: 'https://spline.design', desc: '3D design with AI features.', tier: 'Great' },
      { name: 'Move.ai', rating: 4, url: 'https://move.ai', desc: 'AI motion capture.', tier: 'Great' },
      { name: 'Wonder Dynamics', rating: 4, url: 'https://wonderdynamics.com', desc: 'AI VFX for film.', tier: 'Great' },
      { name: 'Inworld AI', rating: 4, url: 'https://inworld.ai', desc: 'AI NPCs for games.', tier: 'Great' },
    ]
  },
  {
    name: 'AI Presentations & Video Editing',
    tools: [
      { name: 'Gamma', rating: 5, url: 'https://gamma.app', desc: 'AI slide decks. JoePro uses this.', tier: 'Essential' },
      { name: 'Tome', rating: 4, url: 'https://tome.app', desc: 'AI presentations.', tier: 'Great' },
      { name: 'Veed.io', rating: 4, url: 'https://veed.io', desc: 'AI video editing.', tier: 'Great' },
      { name: 'Kapwing', rating: 4, url: 'https://kapwing.com', desc: 'AI video creation.', tier: 'Great' },
      { name: 'Nanonets', rating: 4, url: 'https://nanonets.com', desc: 'AI document extraction.', tier: 'Great' },
      { name: 'Harvey', rating: 4, url: 'https://harvey.ai', desc: 'AI for lawyers.', tier: 'Great' },
      { name: 'Casetext', rating: 4, url: 'https://casetext.com', desc: 'Legal AI research.', tier: 'Great' },
    ]
  },
]

// JoePro's personal recommendations
const joeprosPicks = [
  { name: 'Windsurf', reason: 'My go-to IDE. Cascade is the best AI coding agent.' },
  { name: 'Claude Code', reason: 'Second choice for coding. Great reasoning.' },
  { name: 'Video Gen', reason: 'Grok Imagine, Veo3, Kling, Ray 3, Wan2.1' },
  { name: 'ElevenLabs', reason: 'Voice cloning that actually works.' },
  { name: 'ComfyUI', reason: 'Ultimate control for image/video workflows.' },
  { name: 'Local LLMs', reason: 'Ollama + LM Studio for private AI.' },
]

function getRatingStars(rating: number) {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating)
}

function getTierColor(tier: string) {
  switch (tier) {
    case 'Essential': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
    case 'Great': return 'text-green-400 bg-green-400/10 border-green-400/30'
    case 'Good': return 'text-blue-400 bg-blue-400/10 border-blue-400/30'
    case 'Niche': return 'text-purple-400 bg-purple-400/10 border-purple-400/30'
    default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30'
  }
}

export default function BestAIToolsPage() {
  const totalTools = toolCategories.reduce((acc, cat) => acc + cat.tools.length, 0)
  
  return (
    <main className="min-h-screen relative z-10 p-4 md:p-8">
      <div className="container mx-auto max-w-6xl">
        {/* Hero */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-white">The 2025 AI Toolbox</span>
          </h1>
          <p className="text-xl text-[var(--primary)] mb-2">
            Curated by JoePro (JoeProAI)
          </p>
          <p className="text-[var(--text-muted)] max-w-2xl mx-auto">
            {totalTools}+ AI tools personally tested and rated. Updated weekly. 
            These are the tools JoePro actually uses to build JoePro.ai and ship products.
          </p>
        </header>

        {/* JoePro's Picks */}
        <section className="glass card-border p-6 mb-12">
          <h2 className="text-2xl font-bold text-[var(--primary)] mb-4">
            JoePro&apos;s Personal Picks
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {joeprosPicks.map((pick, i) => (
              <div key={i} className="p-4 bg-[var(--card-bg)] border border-[var(--primary)]/30 rounded-lg">
                <h3 className="font-bold text-white">{pick.name}</h3>
                <p className="text-sm text-[var(--text-muted)]">{pick.reason}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Rating Legend */}
        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          <span className={`px-3 py-1 rounded border text-sm ${getTierColor('Essential')}`}>Essential</span>
          <span className={`px-3 py-1 rounded border text-sm ${getTierColor('Great')}`}>Great</span>
          <span className={`px-3 py-1 rounded border text-sm ${getTierColor('Good')}`}>Good</span>
          <span className={`px-3 py-1 rounded border text-sm ${getTierColor('Niche')}`}>Niche</span>
        </div>

        {/* Tool Categories */}
        {toolCategories.map((category, catIndex) => (
          <section key={catIndex} className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">{category.name}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {category.tools.map((tool, toolIndex) => (
                <a
                  key={toolIndex}
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass card-border p-4 hover:border-[var(--primary)] transition-all group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-white group-hover:text-[var(--primary)] transition-colors">
                      {tool.name} →
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-xs border ${getTierColor(tool.tier)}`}>
                      {tool.tier}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-muted)] mb-2">{tool.desc}</p>
                  <div className="text-yellow-400 text-sm">{getRatingStars(tool.rating)}</div>
                </a>
              ))}
            </div>
          </section>
        ))}

        {/* CTA */}
        <section className="glass card-border p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Missing a Tool?
          </h2>
          <p className="text-[var(--text-muted)] mb-4">
            DM JoePro on X to suggest additions to this list.
          </p>
          <div className="flex gap-4 justify-center">
            <a 
              href="https://x.com/JoePro" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-lg transition-colors"
            >
              @JoePro on X
            </a>
            <Link 
              href="/apps"
              className="px-6 py-3 border border-[var(--border)] hover:border-[var(--primary)] rounded-lg transition-colors"
            >
              Try JoePro&apos;s Apps
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
