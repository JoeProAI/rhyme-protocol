import Hero from '@/components/Hero';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JoePro | AI Development Platform - Custom Agents, Video Generation & Dev Tools',
  description: 'JoePro is the AI development platform for builders. Create custom AI agents with Grok, generate cinematic videos with Luma AI, and access instant cloud dev environments. Production-ready tools built by JoePro.',
  openGraph: {
    title: 'JoePro | AI Development Platform',
    description: 'JoePro - Custom AI agents, video generation, and dev tools for builders',
  },
};

export default function Home() {
  return (
    <>
      {/* SEO-optimized content - server-rendered */}
      <div className="sr-only">
        <h1>JoePro - AI Development Platform</h1>
        <p>JoePro is an AI development platform offering custom AI agents powered by Grok 4.1, AI video generation with Luma Ray-2, instant cloud development environments, and a library of production-ready AI prompts. Built by JoePro for developers and creators.</p>
        <p>JoePro features: AI Video Generator, Custom AI Agents, Dev Sandbox, Prompt Library, and more AI tools.</p>
      </div>
      <Hero />
    </>
  );
}