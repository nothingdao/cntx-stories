import fs from 'fs';
import path from 'path';

export interface StoriesConfig {
  agent: {
    provider: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };
  execution: {
    pauseBetweenSteps: number;
    autoConfirm: boolean;
    logLevel: 'minimal' | 'normal' | 'verbose';
  };
}

const defaultConfig: StoriesConfig = {
  agent: {
    provider: 'aichat', // Default to aichat as it's most versatile
    temperature: 0.7,
    maxTokens: 2000
  },
  execution: {
    pauseBetweenSteps: 1000, // 1 second between steps
    autoConfirm: true, // Ask before each step
    logLevel: 'normal'
  }
};

export class ConfigManager {
  private configPath = './stories.config.json';
  private config: StoriesConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): StoriesConfig {
    try {
      if (fs.existsSync(this.configPath)) {
        const configData = fs.readFileSync(this.configPath, 'utf-8');
        return { ...defaultConfig, ...JSON.parse(configData) };
      }
    } catch (error) {
      console.warn('Failed to load config, using defaults');
    }
    return defaultConfig;
  }

  saveConfig(): void {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  }

  get(): StoriesConfig {
    return this.config;
  }

  set(updates: Partial<StoriesConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
  }

  setAgentProvider(provider: string, model?: string): void {
    this.config.agent.provider = provider;
    if (model) this.config.agent.model = model;
    this.saveConfig();
  }
}