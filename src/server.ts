import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';
import { StoriesDatabase, Story, Activity, Step } from './database.js';
import { StoryRunner } from './storyRunner.js';
import chalk from 'chalk';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Database instance
const db = new StoriesDatabase();
const runner = new StoryRunner(db);

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from web directory (will create later)
app.use(express.static(path.join(process.cwd(), 'web', 'dist')));

// API Routes

// Stories endpoints
app.get('/api/stories', (req, res) => {
  try {
    const stories = db.getStories();
    res.json(stories);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get('/api/stories/:id', (req, res) => {
  try {
    const story = db.getStory(req.params.id);
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    res.json(story);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/api/stories', (req, res) => {
  try {
    const story: Story = req.body;
    db.createStory(story);
    res.status(201).json(story);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.put('/api/stories/:id', (req, res) => {
  try {
    const story = db.getStory(req.params.id);
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    // For now, we'll implement update by delete + create
    // TODO: Add proper update method to database
    res.json({ message: 'Update not yet implemented' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.delete('/api/stories/:id', (req, res) => {
  try {
    // TODO: Add delete method to database
    res.json({ message: 'Delete not yet implemented' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Activities endpoints
app.get('/api/stories/:storyId/activities', (req, res) => {
  try {
    const activities = db.getActivitiesForStory(req.params.storyId);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get('/api/activities/:id', (req, res) => {
  try {
    const activity = db.getActivity(req.params.id);
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/api/activities', (req, res) => {
  try {
    const activity: Activity = req.body;
    db.createActivity(activity);
    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Steps endpoints
app.get('/api/activities/:activityId/steps', (req, res) => {
  try {
    const steps = db.getStepsForActivity(req.params.activityId);
    res.json(steps);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/api/steps', (req, res) => {
  try {
    const step: Step = req.body;
    db.createStep(step);
    res.status(201).json(step);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Story execution endpoints
app.post('/api/stories/:id/run', (req, res) => {
  try {
    const storyId = req.params.id;
    const story = db.getStory(storyId);
    
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    // For now, run synchronously
    // TODO: Make this async with WebSocket progress updates
    runner.runStory(storyId);
    
    res.json({ message: 'Story execution completed', storyId });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/api/activities/:id/run', (req, res) => {
  try {
    const activityId = req.params.id;
    const activity = db.getActivity(activityId);
    
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    runner.runActivity(activityId);
    
    res.json({ message: 'Activity execution completed', activityId });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// WebSocket for live updates
wss.on('connection', (ws) => {
  console.log(chalk.green('WebSocket client connected'));
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('Received:', data);
      
      // Echo back for now
      ws.send(JSON.stringify({ type: 'echo', data }));
    } catch (error) {
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }));
    }
  });
  
  ws.on('close', () => {
    console.log(chalk.yellow('WebSocket client disconnected'));
  });
});

// Catch-all handler for React router
app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'web', 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(chalk.green(`
🚀 Stories UI Server running!

📍 Server: http://localhost:${PORT}
🗄️  Database: stories.db
📡 WebSocket: Available for live updates

${chalk.yellow('Available endpoints:')}
${chalk.cyan('GET    /api/stories')}          - List all stories
${chalk.cyan('POST   /api/stories')}          - Create new story  
${chalk.cyan('GET    /api/stories/:id')}      - Get story details
${chalk.cyan('POST   /api/stories/:id/run')}  - Execute story

${chalk.cyan('GET    /api/activities/:id')}   - Get activity details
${chalk.cyan('POST   /api/activities/:id/run')} - Execute activity

Press ${chalk.magenta('Ctrl+C')} to stop the server
  `));
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n🛑 Shutting down server...'));
  db.close();
  server.close(() => {
    console.log(chalk.green('✅ Server stopped gracefully'));
    process.exit(0);
  });
});