import { StoriesDatabase, Story, Activity, Step } from './database.js';

export function createQuickTest(db: StoriesDatabase): void {
  // Ultra simple one-step story
  const quickStory: Story = {
    id: 'quick-test',
    title: 'Quick Claude Test',
    description: 'Single step test for instant Claude response',
    initial_state: {},
    expected_outcomes: { response_received: true },
    completion_criteria: 'Claude responds quickly'
  };

  const quickActivity: Activity = {
    id: 'instant-test',
    story_id: 'quick-test',
    title: 'Instant Test',
    description: 'One quick question to Claude',
    instructions: 'Get instant response from Claude',
    prompt_template: 'quick-question',
    state: {},
    expected_outcome: 'Quick response received'
  };

  // Single super simple step
  const quickStep: Step = {
    id: 'ask-quick',
    activity_id: 'instant-test',
    order_index: 1,
    prompt: 'Say "Working!" if you can see this.',
    input_request: 'Quick test',
    state_update_logic: '{"done": true}',
    outcome_check: 'Claude says Working!'
  };

  try {
    db.createStory(quickStory);
    db.createActivity(quickActivity);
    db.createStep(quickStep);
    console.log('✅ Quick test story created!');
  } catch (error) {
    console.log('ℹ️  Quick test already exists');
  }
}