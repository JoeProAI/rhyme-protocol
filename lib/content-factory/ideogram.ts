/**
 * Ideogram API Client - AI Image Generation with Text
 * Best for images that need readable text
 */

const IDEOGRAM_API_URL = 'https://api.ideogram.ai';

export type IdeogramAspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4' | '3:2' | '2:3';
export type IdeogramModel = 'V_2' | 'V_2_TURBO' | 'V_1' | 'V_1_TURBO';
export type IdeogramStyleType = 'AUTO' | 'GENERAL' | 'REALISTIC' | 'DESIGN' | 'RENDER_3D' | 'ANIME';

interface IdeogramGenerateParams {
  prompt: string;
  aspectRatio?: IdeogramAspectRatio;
  model?: IdeogramModel;
  styleType?: IdeogramStyleType;
  negativePrompt?: string;
  seed?: number;
}

interface IdeogramImage {
  url: string;
  prompt: string;
  resolution: string;
  is_image_safe: boolean;
  seed: number;
}

interface IdeogramGenerateResponse {
  created: string;
  data: IdeogramImage[];
}

class IdeogramClient {
  private apiKey: string;

  constructor() {
    const apiKey = process.env.IDEOGRAM_API_KEY;
    if (!apiKey) {
      throw new Error('IDEOGRAM_API_KEY environment variable is required');
    }
    this.apiKey = apiKey;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${IDEOGRAM_API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Api-Key': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ideogram API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  /**
   * Generate images from text prompt
   */
  async generate(params: IdeogramGenerateParams): Promise<IdeogramGenerateResponse> {
    return this.request('/generate', {
      method: 'POST',
      body: JSON.stringify({
        image_request: {
          prompt: params.prompt,
          aspect_ratio: params.aspectRatio || 'ASPECT_1_1',
          model: params.model || 'V_2',
          style_type: params.styleType || 'AUTO',
          negative_prompt: params.negativePrompt,
          seed: params.seed,
        },
      }),
    });
  }

  /**
   * Generate with magic prompt enhancement
   */
  async generateWithMagicPrompt(params: IdeogramGenerateParams): Promise<IdeogramGenerateResponse> {
    return this.request('/generate', {
      method: 'POST',
      body: JSON.stringify({
        image_request: {
          prompt: params.prompt,
          aspect_ratio: params.aspectRatio || 'ASPECT_1_1',
          model: params.model || 'V_2',
          style_type: params.styleType || 'AUTO',
          magic_prompt_option: 'AUTO',
          negative_prompt: params.negativePrompt,
          seed: params.seed,
        },
      }),
    });
  }
}

let client: IdeogramClient | null = null;

export function getIdeogramClient(): IdeogramClient {
  if (!client) {
    client = new IdeogramClient();
  }
  return client;
}

export type { IdeogramGenerateParams, IdeogramGenerateResponse, IdeogramImage };
