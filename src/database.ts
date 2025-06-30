import Database from 'better-sqlite3';

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

export class StoriesDatabase {
  private db: Database.Database;

  constructor(dbPath: string = './stories.db') {
    this.db = new Database(dbPath);
    this.initialize();
  }

  private initialize(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS stories (
        id TEXT PRIMARY KEY,
        title TEXT,
        description TEXT,
        initial_state JSON,
        expected_outcomes JSON,
        completion_criteria TEXT
      )
    `);

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY,
        story_id TEXT,
        title TEXT,
        description TEXT,
        instructions TEXT,
        prompt_template TEXT,
        state JSON,
        expected_outcome TEXT,
        FOREIGN KEY(story_id) REFERENCES stories(id)
      )
    `);

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS steps (
        id TEXT PRIMARY KEY,
        activity_id TEXT,
        order_index INTEGER,
        prompt TEXT,
        input_request TEXT,
        state_update_logic TEXT,
        outcome_check TEXT,
        FOREIGN KEY(activity_id) REFERENCES activities(id)
      )
    `);
  }

  getStories(): Story[] {
    const stmt = this.db.prepare('SELECT * FROM stories ORDER BY title');
    return stmt.all() as Story[];
  }

  getStory(id: string): Story | null {
    const stmt = this.db.prepare('SELECT * FROM stories WHERE id = ?');
    return stmt.get(id) as Story || null;
  }

  createStory(story: Story): void {
    const stmt = this.db.prepare(
      'INSERT INTO stories (id, title, description, initial_state, expected_outcomes, completion_criteria) VALUES (?, ?, ?, ?, ?, ?)'
    );
    stmt.run(story.id, story.title, story.description, JSON.stringify(story.initial_state), JSON.stringify(story.expected_outcomes), story.completion_criteria);
  }

  getActivitiesForStory(storyId: string): Activity[] {
    const stmt = this.db.prepare('SELECT * FROM activities WHERE story_id = ? ORDER BY title');
    return stmt.all(storyId) as Activity[];
  }

  getActivity(id: string): Activity | null {
    const stmt = this.db.prepare('SELECT * FROM activities WHERE id = ?');
    return stmt.get(id) as Activity || null;
  }

  createActivity(activity: Activity): void {
    const stmt = this.db.prepare(
      'INSERT INTO activities (id, story_id, title, description, instructions, prompt_template, state, expected_outcome) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    stmt.run(activity.id, activity.story_id, activity.title, activity.description, activity.instructions, activity.prompt_template, JSON.stringify(activity.state), activity.expected_outcome);
  }

  getStepsForActivity(activityId: string): Step[] {
    const stmt = this.db.prepare('SELECT * FROM steps WHERE activity_id = ? ORDER BY order_index');
    return stmt.all(activityId) as Step[];
  }

  createStep(step: Step): void {
    const stmt = this.db.prepare(
      'INSERT INTO steps (id, activity_id, order_index, prompt, input_request, state_update_logic, outcome_check) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    stmt.run(step.id, step.activity_id, step.order_index, step.prompt, step.input_request, step.state_update_logic, step.outcome_check);
  }

  updateActivityState(activityId: string, state: any): void {
    const stmt = this.db.prepare('UPDATE activities SET state = ? WHERE id = ?');
    stmt.run(JSON.stringify(state), activityId);
  }

  close(): void {
    this.db.close();
  }
}