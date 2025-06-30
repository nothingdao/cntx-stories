export interface Story {
  id: string;
  title: string;
  description: string;
  initial_state: any;
  expected_outcomes: any;
  completion_criteria: string;
}

export interface Activity {
  id: string;
  story_id: string;
  title: string;
  description: string;
  instructions: string;
  prompt_template: string;
  state: any;
  expected_outcome: string;
}

export interface Step {
  id: string;
  activity_id: string;
  order_index: number;
  prompt: string;
  input_request: string;
  state_update_logic: string;
  outcome_check: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}