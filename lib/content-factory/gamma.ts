/**
 * Gamma API Client - AI Presentation Generation
 * Docs: https://developers.gamma.app/docs/getting-started
 */

const GAMMA_API_URL = 'https://public-api.gamma.app/v1.0';

export type GammaFormat = 'presentation' | 'document' | 'social' | 'webpage';
export type GammaTextMode = 'generate' | 'condense' | 'preserve';
export type GammaImageSource = 'aiGenerated' | 'webSearch' | 'noImages';

interface GammaTextOptions {
  amount?: 'brief' | 'medium' | 'detailed';
  tone?: string;
  audience?: string;
  language?: string;
}

interface GammaImageOptions {
  source?: GammaImageSource;
  model?: string;
  style?: string;
}

interface GammaGenerateParams {
  inputText: string;
  textMode: GammaTextMode;
  format?: GammaFormat;
  numCards?: number;
  additionalInstructions?: string;
  textOptions?: GammaTextOptions;
  imageOptions?: GammaImageOptions;
  exportAs?: 'pdf' | 'pptx';
}

interface GammaGenerateResponse {
  id: string;
  url: string;
  title: string;
  exportUrl?: string;
  status: string;
}

class GammaClient {
  private apiKey: string;

  constructor() {
    const apiKey = process.env.GAMMA_API_KEY;
    if (!apiKey) {
      throw new Error('GAMMA_API_KEY environment variable is required');
    }
    this.apiKey = apiKey;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${GAMMA_API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gamma API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  /**
   * Generate a presentation, document, social post, or webpage
   */
  async generate(params: GammaGenerateParams): Promise<GammaGenerateResponse> {
    return this.request('/generations', {
      method: 'POST',
      body: JSON.stringify({
        inputText: params.inputText,
        textMode: params.textMode,
        format: params.format || 'presentation',
        numCards: params.numCards || 10,
        additionalInstructions: params.additionalInstructions,
        textOptions: {
          amount: params.textOptions?.amount || 'medium',
          tone: params.textOptions?.tone,
          audience: params.textOptions?.audience,
          language: params.textOptions?.language || 'en',
        },
        imageOptions: {
          source: params.imageOptions?.source || 'aiGenerated',
          model: params.imageOptions?.model,
          style: params.imageOptions?.style,
        },
        exportAs: params.exportAs,
      }),
    });
  }

  /**
   * List available themes
   */
  async listThemes(): Promise<{ themes: { id: string; name: string }[] }> {
    return this.request('/themes');
  }

  /**
   * List folders
   */
  async listFolders(): Promise<{ folders: { id: string; name: string }[] }> {
    return this.request('/folders');
  }
}

let client: GammaClient | null = null;

export function getGammaClient(): GammaClient {
  if (!client) {
    client = new GammaClient();
  }
  return client;
}

export type { GammaGenerateParams, GammaGenerateResponse };
