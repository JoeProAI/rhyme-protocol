import OpenAI from 'openai';

// xAI uses OpenAI-compatible API
export function getXAIClient(): OpenAI {
  const apiKey = process.env.XAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('XAI_API_KEY is not configured');
  }
  
  return new OpenAI({
    apiKey,
    baseURL: 'https://api.x.ai/v1',
  });
}

export async function createXAICompletion(
  messages: Array<{ role: string; content: string }>,
  model: string = 'grok-4-1-fast',
  temperature: number = 0.7,
  stream: boolean = false
) {
  const client = getXAIClient();
  
  try {
    const response = await client.chat.completions.create({
      model,
      messages: messages as any,
      temperature,
      stream,
    });
    
    return response;
  } catch (error: any) {
    console.error('xAI API Error:', error);
    
    if (error.status === 429) {
      throw new Error('xAI rate limit exceeded. Please try again later.');
    }
    
    if (error.status === 401) {
      throw new Error('Invalid xAI API key.');
    }
    
    if (error.status === 404) {
      throw new Error('xAI model not found. Please check the model name.');
    }
    
    throw new Error(`xAI API error: ${error.message}`);
  }
}

export async function createXAIStreamCompletion(
  messages: Array<{ role: string; content: string }>,
  model: string = 'grok-4-1-fast',
  temperature: number = 0.7
) {
  const client = getXAIClient();
  
  try {
    const stream = await client.chat.completions.create({
      model,
      messages: messages as any,
      temperature,
      stream: true,
    });
    
    return stream;
  } catch (error: any) {
    console.error('xAI Stream Error:', error);
    throw new Error(`xAI streaming error: ${error.message}`);
  }
}