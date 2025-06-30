// Direct API integration (no external CLI needed)
// Uncomment and use if you prefer direct API calls

/*
import { AgentProvider } from './agentProviders.js';

export const directClaudeProvider: AgentProvider = {
  name: 'Direct Claude API',
  command: 'direct-claude',
  args: () => [],
  parseResponse: (output: string) => output.trim()
};

export async function executeDirectClaude(prompt: string, context?: any): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable not set');
  }

  const fullPrompt = context 
    ? `Context: ${JSON.stringify(context, null, 2)}\n\nPrompt: ${prompt}`
    : prompt;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: fullPrompt
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.content[0].text;
}
*/