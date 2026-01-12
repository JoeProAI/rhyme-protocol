import fs from 'fs/promises';
import path from 'path';

export interface AgentConfig {
  id: string;
  name: string;
  systemPrompt: string;
  model: string;
  provider: 'xai';
  temperature: number;
  tools: string[];
  createdAt: string;
  updatedAt: string;
}

const AGENTS_DIR = path.join(process.cwd(), 'data', 'agents');

export async function ensureAgentsDir() {
  try {
    await fs.mkdir(AGENTS_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating agents directory:', error);
  }
}

export async function saveAgentConfig(config: AgentConfig): Promise<void> {
  await ensureAgentsDir();
  const filePath = path.join(AGENTS_DIR, `${config.id}.json`);
  await fs.writeFile(filePath, JSON.stringify(config, null, 2));
}

export async function loadAgentConfig(id: string): Promise<AgentConfig | null> {
  try {
    const filePath = path.join(AGENTS_DIR, `${id}.json`);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
}

export async function listAgentConfigs(): Promise<AgentConfig[]> {
  await ensureAgentsDir();
  try {
    const files = await fs.readdir(AGENTS_DIR);
    const configs: AgentConfig[] = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const data = await fs.readFile(path.join(AGENTS_DIR, file), 'utf-8');
        configs.push(JSON.parse(data));
      }
    }
    
    return configs.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  } catch (error) {
    return [];
  }
}

export async function deleteAgentConfig(id: string): Promise<void> {
  const filePath = path.join(AGENTS_DIR, `${id}.json`);
  await fs.unlink(filePath);
}