export const promptLib = {
  "generate-ui": "Given the following spec, generate minimal HTML/TSX with Tailwind:",
  "lint-code": "Given the code below, check for lint issues and suggest fixes:",
  "create-component": "Create a React component with the following requirements:",
  "setup-database": "Set up a database with the following schema:",
  "write-tests": "Write comprehensive tests for the following code:",
  "refactor-code": "Refactor the following code to improve readability and maintainability:",
  "debug-issue": "Debug the following issue and provide a solution:",
  "optimize-performance": "Analyze and optimize the performance of the following code:",
  "validate-outcome": "Validate that the following outcome has been achieved:",
  "update-state": "Update the current state based on the following changes:"
};

export function getPrompt(type: string, context?: string): string {
  const basePrompt = promptLib[type as keyof typeof promptLib];
  if (!basePrompt) {
    throw new Error(`Unknown prompt type: ${type}`);
  }
  
  return context ? `${basePrompt}\n\n${context}` : basePrompt;
}