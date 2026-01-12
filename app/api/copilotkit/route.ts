import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from '@copilotkit/runtime';
import { NextRequest } from 'next/server';

function getServiceAdapter() {
  return new OpenAIAdapter({
    openai: {
      apiKey: process.env.OPENAI_API_KEY!,
    } as any,
  });
}

export const POST = async (req: NextRequest) => {
  const runtime = new CopilotRuntime();
  const serviceAdapter = getServiceAdapter();
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: '/api/copilotkit',
  });

  return handleRequest(req);
};
