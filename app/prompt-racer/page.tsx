export const metadata = {
  title: 'Prompt Racer - Race AI Models | JoePro.ai',
  description: 'Race 4 leading AI models simultaneously to see which responds fastest. GPT-4o vs Claude vs Gemini vs Grok.',
}

export default function PromptRacerPage() {
  return (
    <iframe
      src="https://prompt-racer.vercel.app"
      className="w-full h-full border-0"
      title="Prompt Racer"
      allow="clipboard-write"
    />
  )
}
