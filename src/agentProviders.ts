import { spawn } from 'child_process';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

export interface AgentProvider {
  name: string;
  command: string;
  args: (prompt: string) => string[];
  parseResponse: (output: string) => string;
}

// Default built-in providers
const builtInProviders: Record<string, AgentProvider> = {
  aichat: {
    name: 'AI Chat',
    command: 'aichat',
    args: (prompt: string) => [prompt],
    parseResponse: (output: string) => output.trim()
  },
  
  claude: {
    name: 'Claude CLI',
    command: 'claude',
    args: (prompt: string) => ['-p', prompt],
    parseResponse: (output: string) => output.trim()
  },
  
  gpt: {
    name: 'GPT CLI',
    command: 'gpt',
    args: (prompt: string) => [prompt],
    parseResponse: (output: string) => output.trim()
  },
  
  gemini: {
    name: 'Gemini CLI',
    command: 'gemini',
    args: (prompt: string) => ['--prompt', prompt],
    parseResponse: (output: string) => output.trim()
  },
  
  ollama: {
    name: 'Ollama (Local)',
    command: 'ollama',
    args: (prompt: string) => ['run', 'llama2', prompt],
    parseResponse: (output: string) => output.trim()
  },
  
  llm: {
    name: 'Universal LLM CLI',
    command: 'llm',
    args: (prompt: string) => [prompt],
    parseResponse: (output: string) => output.trim()
  }
};

// Custom agent storage
const CUSTOM_AGENTS_FILE = path.join(process.cwd(), 'custom-agents.json');

interface SerializableAgentProvider {
  name: string;
  command: string;
  argsTemplate: string;
}

function loadCustomAgents(): Record<string, AgentProvider> {
  try {
    if (fs.existsSync(CUSTOM_AGENTS_FILE)) {
      const data = fs.readFileSync(CUSTOM_AGENTS_FILE, 'utf8');
      const serialized: Record<string, SerializableAgentProvider> = JSON.parse(data);
      
      const agents: Record<string, AgentProvider> = {};
      for (const [name, config] of Object.entries(serialized)) {
        agents[name] = {
          name: config.name,
          command: config.command,
          args: (prompt: string) => {
            if (config.argsTemplate.includes('{prompt}')) {
              return config.argsTemplate.replace('{prompt}', prompt).split(' ');
            }
            return [config.argsTemplate, prompt];
          },
          parseResponse: (output: string) => output.trim()
        };
      }
      return agents;
    }
  } catch (error) {
    console.warn('Failed to load custom agents:', error);
  }
  return {};
}

function saveCustomAgents(agents: Record<string, AgentProvider>): void {
  try {
    const serialized: Record<string, SerializableAgentProvider> = {};
    for (const [name, provider] of Object.entries(agents)) {
      serialized[name] = {
        name: provider.name,
        command: provider.command,
        argsTemplate: (provider as any).argsTemplate || '{prompt}'
      };
    }
    fs.writeFileSync(CUSTOM_AGENTS_FILE, JSON.stringify(serialized, null, 2));
  } catch (error) {
    console.warn('Failed to save custom agents:', error);
  }
}

let customProviders: Record<string, AgentProvider> = loadCustomAgents();

// Combined providers (built-in + custom)
export const agentProviders = new Proxy({}, {
  get(target, prop: string) {
    return customProviders[prop] || builtInProviders[prop];
  },
  has(target, prop: string) {
    return prop in customProviders || prop in builtInProviders;
  },
  ownKeys(target) {
    return [...Object.keys(builtInProviders), ...Object.keys(customProviders)];
  },
  getOwnPropertyDescriptor(target, prop: string) {
    if (prop in customProviders || prop in builtInProviders) {
      return { enumerable: true, configurable: true };
    }
    return undefined;
  }
}) as Record<string, AgentProvider>;

export class AgentManager {
  static addCustomAgent(name: string, provider: AgentProvider, argsTemplate: string = '{prompt}'): void {
    customProviders[name] = provider;
    // Store the args template for persistence
    (provider as any).argsTemplate = argsTemplate;
    saveCustomAgents(customProviders);
  }

  static removeCustomAgent(name: string): boolean {
    if (name in builtInProviders) {
      throw new Error(`Cannot remove built-in provider: ${name}`);
    }
    if (name in customProviders) {
      delete customProviders[name];
      saveCustomAgents(customProviders);
      return true;
    }
    return false;
  }

  static listAgents(): { name: string; provider: AgentProvider; isCustom: boolean }[] {
    const agents = [];
    
    for (const [name, provider] of Object.entries(builtInProviders)) {
      agents.push({ name, provider, isCustom: false });
    }
    
    for (const [name, provider] of Object.entries(customProviders)) {
      agents.push({ name, provider, isCustom: true });
    }
    
    return agents;
  }

  static getAgent(name: string): AgentProvider | undefined {
    return agentProviders[name];
  }
}

export class AgentExecutor {
  constructor(private provider: AgentProvider) {}

  async execute(prompt: string): Promise<string> {
    const fullPrompt = prompt;

    console.log(chalk.blue(`🤖 Executing with ${this.provider.name}...`));
    console.log(chalk.dim(`Command: ${this.provider.command} ${this.provider.args(fullPrompt).join(' ')}`));

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        childProcess.kill();
        reject(new Error('Agent execution timed out after 30 seconds'));
      }, 30000);

      const childProcess = spawn(this.provider.command, this.provider.args(fullPrompt), {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      childProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      childProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      childProcess.on('close', (code) => {
        clearTimeout(timeout);
        if (code === 0) {
          const response = this.provider.parseResponse(stdout);
          console.log(chalk.green(`✅ Agent response received (${response.length} chars)`));
          resolve(response);
        } else {
          console.error(chalk.red(`❌ Agent execution failed: ${stderr}`));
          reject(new Error(`Agent execution failed with code ${code}: ${stderr}`));
        }
      });

      childProcess.on('error', (error) => {
        clearTimeout(timeout);
        reject(new Error(`Failed to spawn agent process: ${error.message}`));
      });
    });
  }

  static async checkAvailable(providerName: string): Promise<boolean> {
    const provider = agentProviders[providerName];
    if (!provider) return false;

    return new Promise((resolve) => {
      const process = spawn('which', [provider.command], { stdio: 'pipe' });
      process.on('close', (code) => resolve(code === 0));
      process.on('error', () => resolve(false));
    });
  }

  static async detectAvailable(): Promise<string[]> {
    const available = [];
    for (const [name, provider] of Object.entries(agentProviders)) {
      if (await this.checkAvailable(name)) {
        available.push(name);
      }
    }
    return available;
  }
}