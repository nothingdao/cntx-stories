import chalk from 'chalk';
import { StoriesDatabase, Story, Activity, Step } from './database.js';
import { getPrompt } from './promptLib.js';
import { AgentExecutor, agentProviders } from './agentProviders.js';
import { ConfigManager } from './config.js';
import readline from 'readline';

export class StoryRunner {
  private config: ConfigManager;
  private agentExecutor: AgentExecutor | null = null;
  private rl: readline.Interface | null = null;

  constructor(private db: StoriesDatabase) {
    this.config = new ConfigManager();
  }

  private async ensureAgentInitialized(): Promise<void> {
    if (this.agentExecutor === null) {
      await this.initializeAgent();
    }
  }

  private getReadlineInterface(): readline.Interface {
    if (!this.rl) {
      this.rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
    }
    return this.rl;
  }

  private async initializeAgent(): Promise<void> {
    const config = this.config.get();
    const provider = agentProviders[config.agent.provider];
    
    if (!provider) {
      console.log(chalk.yellow(`⚠️  Agent provider '${config.agent.provider}' not found. Running in simulation mode.`));
      return;
    }

    const isAvailable = await AgentExecutor.checkAvailable(config.agent.provider);
    if (!isAvailable) {
      console.log(chalk.yellow(`⚠️  Agent CLI '${provider.command}' not found. Running in simulation mode.`));
      console.log(chalk.dim(`   Install it or run: npm run agent config agent`));
      return;
    }

    this.agentExecutor = new AgentExecutor(provider);
    console.log(chalk.green(`🤖 Agent initialized: ${provider.name}`));
  }

  private async askConfirmation(message: string): Promise<boolean> {
    const rl = this.getReadlineInterface();
    return new Promise((resolve) => {
      rl.question(chalk.yellow(`${message} (y/N): `), (answer) => {
        resolve(answer.toLowerCase().startsWith('y'));
      });
    });
  }

  async runStory(storyId: string): Promise<void> {
    await this.ensureAgentInitialized();
    
    const story = this.db.getStory(storyId);
    if (!story) {
      throw new Error(`Story not found: ${storyId}`);
    }

    console.log(chalk.blue.bold(`📖 Story: ${story.title}`));
    console.log(chalk.gray(story.description));
    console.log();

    const activities = this.db.getActivitiesForStory(storyId);
    
    for (const activity of activities) {
      await this.runActivity(activity.id);
    }
  }

  async continueStory(storyId: string): Promise<void> {
    console.log(chalk.yellow('Continue story functionality not yet implemented'));
    await this.runStory(storyId);
  }

  async runActivity(activityId: string): Promise<void> {
    await this.ensureAgentInitialized();
    
    const activity = this.db.getActivity(activityId);
    if (!activity) {
      throw new Error(`Activity not found: ${activityId}`);
    }

    console.log(chalk.cyan.bold(`⚡ Activity: ${activity.title}`));
    console.log(chalk.gray(activity.description));
    
    if (activity.instructions) {
      console.log(chalk.yellow(`📋 Instructions: ${activity.instructions}`));
    }
    
    console.log();

    const steps = this.db.getStepsForActivity(activityId);
    
    let currentState = JSON.parse(activity.state || '{}');
    
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      console.log(chalk.magenta(`🔸 Step ${i + 1}: ${step.prompt || 'Executing step...'}`));
      
      if (step.input_request) {
        console.log(chalk.blue(`📥 Input needed: ${step.input_request}`));
      }
      
      currentState = await this.executeStep(step, currentState, activity);
      
      this.db.updateActivityState(activityId, currentState);
      
      console.log(chalk.green(`✓ Step ${i + 1} completed`));
      console.log();
    }

    console.log(chalk.green.bold(`✅ Activity "${activity.title}" completed!`));
    console.log(chalk.gray(`Expected outcome: ${activity.expected_outcome}`));
    console.log();
  }

  private async executeStep(step: Step, currentState: any, activity: Activity): Promise<any> {
    let updatedState = { ...currentState };
    const config = this.config.get();

    console.log(chalk.magenta(`🔸 Step: ${step.prompt || 'Executing step...'}`));
    
    if (step.input_request) {
      console.log(chalk.blue(`📥 Input needed: ${step.input_request}`));
    }

    // Show current state if not empty
    if (Object.keys(currentState).length > 0) {
      console.log(chalk.dim(`📊 Current state: ${JSON.stringify(currentState, null, 2)}`));
    }

    // Ask for confirmation if not in auto mode
    if (!config.execution.autoConfirm && step.prompt) {
      const confirmed = await this.askConfirmation(`Execute this step?`);
      if (!confirmed) {
        console.log(chalk.yellow('⏭️  Skipping step...'));
        return updatedState;
      }
    }

    // Execute the prompt with agent if available
    if (step.prompt && this.agentExecutor) {
      try {
        console.log(chalk.blue(`🤖 Calling agent...`));
        
        // Use just the prompt for now to avoid formatting issues
        const agentResponse = await this.agentExecutor.execute(step.prompt);
        
        console.log(chalk.green(`✅ Agent response received:`));
        console.log(chalk.cyan(`${agentResponse.substring(0, 200)}${agentResponse.length > 200 ? '...' : ''}`));
        
        // Store agent response in state
        updatedState.last_agent_response = agentResponse;
        updatedState.step_completed = true;
        
      } catch (error) {
        console.log(chalk.red(`❌ Agent execution failed: ${error}`));
        updatedState.step_error = (error as Error).message;
      }
    } else if (step.prompt) {
      // Simulation mode
      console.log(chalk.yellow(`🎭 SIMULATION MODE: ${step.prompt}`));
      console.log(chalk.dim(`   (No agent configured - install aichat, claude-cli, etc.)`));
    }

    // Apply state updates
    if (step.state_update_logic) {
      try {
        const stateUpdate = JSON.parse(step.state_update_logic);
        updatedState = { ...updatedState, ...stateUpdate };
        console.log(chalk.cyan(`🔄 State updated: ${JSON.stringify(stateUpdate)}`));
      } catch (error) {
        console.log(chalk.yellow(`⚠️  Invalid state update logic: ${step.state_update_logic}`));
      }
    }
    
    // Check outcome
    if (step.outcome_check) {
      console.log(chalk.green(`✅ Outcome check: ${step.outcome_check}`));
    }

    // Pause between steps
    if (config.execution.pauseBetweenSteps > 0) {
      await new Promise(resolve => setTimeout(resolve, config.execution.pauseBetweenSteps));
    }
    
    return updatedState;
  }

  close(): void {
    if (this.rl) {
      this.rl.close();
      this.rl = null;
    }
  }
}