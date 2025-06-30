import { StoriesDatabase, Story, Activity, Step } from './database.js';

export function createSimpleTestStory(db: StoriesDatabase): void {
  // Simple test story
  const testStory: Story = {
    id: 'hello-claude',
    title: 'Hello Claude Test',
    description: 'Simple test to verify Claude CLI integration is working',
    initial_state: {
      test_started: false,
      claude_responded: false
    },
    expected_outcomes: {
      successful_communication: true,
      response_received: true
    },
    completion_criteria: 'Claude responds successfully to a simple greeting'
  };

  // Single activity with two quick steps
  const greetingActivity: Activity = {
    id: 'test-greeting',
    story_id: 'hello-claude',
    title: 'Test Greeting',
    description: 'Send a simple greeting to Claude and get a response',
    instructions: 'Test basic communication with Claude CLI',
    prompt_template: 'greeting',
    state: {
      greeting_sent: false,
      response_received: false
    },
    expected_outcome: 'Claude responds with a friendly greeting'
  };

  // Two simple, fast steps
  const greetingSteps: Step[] = [
    {
      id: 'say-hello',
      activity_id: 'test-greeting',
      order_index: 1,
      prompt: 'Hello Claude! Please respond with just "Hello! Integration working!" to confirm the Stories CLI is connected.',
      input_request: 'No input needed - just testing connection',
      state_update_logic: '{"greeting_sent": true}',
      outcome_check: 'Claude responds with the requested message'
    },
    {
      id: 'ask-question',
      activity_id: 'test-greeting',
      order_index: 2,
      prompt: 'What is 2 + 2? Please respond with just the number.',
      input_request: 'Simple math question for quick response',
      state_update_logic: '{"response_received": true, "claude_responded": true}',
      outcome_check: 'Claude provides the correct answer: 4'
    }
  ];

  // Save to database
  try {
    db.createStory(testStory);
    db.createActivity(greetingActivity);
    
    for (const step of greetingSteps) {
      db.createStep(step);
    }
    
    console.log('✅ Simple test story "hello-claude" created!');
  } catch (error) {
    console.log('ℹ️  Test story already exists, skipping creation');
  }
}