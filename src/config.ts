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
  database: {
    url: string;
    provider: 'sqlite' | 'postgres' | 'mysql';
    host?: string;
    port?: number;
    database?: string;
    username?: string;
    password?: string;
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
  },
  database: {
    url: 'sqlite://~/.cntx/database.db',
    provider: 'sqlite'
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

  setDatabaseUrl(url: string): void {
    // Parse URL to determine provider
    let provider: 'sqlite' | 'postgres' | 'mysql' = 'sqlite';
    if (url.startsWith('postgres://') || url.startsWith('postgresql://')) {
      provider = 'postgres';
    } else if (url.startsWith('mysql://')) {
      provider = 'mysql';
    }

    this.config.database = {
      ...this.config.database,
      url,
      provider
    };
    this.saveConfig();
  }

  setDatabaseConnection(host: string, port: number, database: string, username: string, password: string, provider: 'postgres' | 'mysql'): void {
    const url = `${provider}://${username}:${password}@${host}:${port}/${database}`;
    
    this.config.database = {
      url,
      provider,
      host,
      port,
      database,
      username,
      password
    };
    this.saveConfig();
  }

  getDatabaseUrl(): string {
    return this.config.database.url;
  }

  resetDatabase(): void {
    this.config.database = {
      url: 'sqlite://~/.cntx/database.db',
      provider: 'sqlite'
    };
    this.saveConfig();
  }
}