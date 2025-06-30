# cntx-stories

> **Note**: This project may be integrated into [cntx-ui](https://www.npmjs.com/package/cntx-ui) in the future as part of a broader context management ecosystem for AI interactions. It may become a module within cntx-ui or remain standalone - this is still being evaluated.

A structured AI agent workflow framework that organizes AI interactions into **Stories** → **Activities** → **Steps**. Build complex AI workflows with persistence, state management, and both CLI and web interfaces.

## Installation

```bash
npm install -g cntx-stories
```

## Usage

The package provides three CLI aliases:
- `cntx-stories` - Full package name
- `stories` - Short alias  
- `strs` - Ultra-short alias

```bash
# All of these work the same:
cntx-stories init
stories init
strs init
```

## Quick Start

```bash
# Initialize with example stories
stories init

# List all available AI agents
stories agent list

# Add a custom AI agent
stories agent add myai "myai-command" --args "{prompt}"

# Switch to an agent
stories agent switch claude

# List all stories
stories list

# Run a story
stories run website-builder

# Launch web UI
stories ui
```

## Features

### 🏗️ Structured Workflows
- **Stories**: Complete workflows (e.g., "Build a Website")
- **Activities**: Major phases (e.g., "Setup", "Development", "Testing")  
- **Steps**: Individual actions (e.g., "Create package.json")

### 🤖 Multi-Agent Support
- Built-in support for Claude, GPT, Gemini, Ollama, aichat, llm
- Add custom AI agents with flexible command templates
- Switch between agents seamlessly
- Agent availability detection

### 💾 State Management
- SQLite database for persistence
- Resume interrupted workflows
- Track execution history and results

### 🎨 Dual Interface
- **CLI**: Full command-line interface with beautiful output
- **Web UI**: React-based visual management interface with dark mode

### ⚙️ Configuration
- Flexible agent configuration
- Execution settings (auto-confirm, pause timing, logging)
- Custom agent templates with placeholder support

## Commands

### Story Management
```bash
stories list              # List all stories
stories run <story-id>    # Run a complete story
stories continue <id>     # Resume a paused story
stories activity <id>     # Run single activity
```

### Agent Management  
```bash
stories agent list                    # List all agents
stories agent add <name> <command>    # Add custom agent
stories agent remove <name>           # Remove custom agent
stories agent switch <name>           # Switch active agent
```

### Configuration
```bash
stories config                    # Show current config
stories config agent             # Show agent status
stories config agent set claude  # Set default agent
```

### Development
```bash
stories init    # Create example stories
stories test    # Add test stories
stories ui      # Launch web interface
```

## Architecture

### Story Structure
```typescript
interface Story {
  id: string
  title: string
  description: string
  activities: Activity[]
}

interface Activity {
  id: string
  title: string
  description: string
  steps: Step[]
}

interface Step {
  id: string
  title: string
  prompt: string
  expectedOutput?: string
}
```

### Agent Integration
The framework supports any CLI-based AI tool through a provider system:

```typescript
interface AgentProvider {
  name: string
  command: string
  args: (prompt: string) => string[]
  parseResponse: (output: string) => string
}
```

## Web Interface

Launch the web UI for visual story management:

```bash
stories ui --port 3000
```

Features:
- 📊 Visual story and activity management
- 🌙 Dark mode support  
- 📱 Responsive design
- 🔄 Real-time execution monitoring

## Development

```bash
git clone https://github.com/nothingdao/cntx-stories.git
cd cntx-stories
npm install

# Install web dependencies
cd web && npm install && cd ..

# Development
npm run dev          # Watch CLI changes
npm run agent ui     # Start dev server

# Build
npm run build        # Build both CLI and web
```

## Examples

The framework includes example stories:

- **Website Builder**: Complete web development workflow
- **Code Audit**: Security and quality analysis  
- **Test Stories**: Simple examples for testing agent integration

## Related Projects

- [cntx-ui](https://www.npmjs.com/package/cntx-ui) - Context management tool for AI interactions

## License

MIT © nothingdao

---

## Original Abstract

The core concept behind cntx-stories is to create structured, reusable workflows for AI agent interactions with clear rules, expected outcomes, and persistent state tracking. 

The framework organizes work into hierarchical units: Stories contain Activities, which contain Steps. Each level maintains state and expected outcomes that can be defined as defaults but modified throughout execution. A SQLite database stores all workflow definitions and execution state, while a TypeScript/React frontend provides comprehensive CRUD operations for managing these components.

The system delivers context-aware instructions at each execution step, ensuring workflows progress toward their defined outcomes. Stories are organized in a folder structure where each story contains its activities, allowing for easy management and version control.

The CLI interface reads agent instructions and enables listing, executing, and managing stories through a pre-defined process. Agents understand how to perform each task within an activity, including automatic database updates to track progress and maintain state consistency throughout the workflow execution.

## Vision

We are building a structured, scriptable framework for AI agent execution with traceable, editable logic — almost like a programmable adventure engine for agents, where “**Stories**” are composed of “**Activities**” and each activity consists of **Steps**, **State**, and **Expected Outcomes**.

Here’s how we can lay out this system clearly:

---

## 🧠 Core Taxonomy

### 1. **Story**

- A high-level workflow or goal (e.g., “Build a website,” “Audit codebase”).
- Composed of multiple **Activities**.
- Has `initialState`, `expectedOutcomes`, and `completionCriteria`.

### 2. **Activity**

- A unit of work toward the story's goal (e.g., “Scaffold frontend,” “Run linter”).
- Composed of **Steps**.
- Has its own `state`, `instructions`, `promptTemplate`, and `outcomeTracker`.

### 3. **Step**

- The smallest unit: a single prompt-execution/evaluation.
- Optionally contains:

  - `inputRequest` (what it needs),
  - `agentPrompt` (from `promptLib`),
  - `stateUpdates`,
  - `checkOutcome`.

---

## 🗃️ Folder and DB Structure

### File Layout

```
/stories/
  website-builder/
    story.json
    activities/
      scaffold-frontend.json
      run-linter.json
      write-tests.json
```

Each file defines a Story or Activity with structured JSON or YAML.

### SQLite Schema

```sql
-- Stories
CREATE TABLE stories (
  id TEXT PRIMARY KEY,
  title TEXT,
  description TEXT,
  initial_state JSON,
  expected_outcomes JSON,
  completion_criteria TEXT
);

-- Activities
CREATE TABLE activities (
  id TEXT PRIMARY KEY,
  story_id TEXT,
  title TEXT,
  description TEXT,
  instructions TEXT,
  prompt_template TEXT,
  state JSON,
  expected_outcome TEXT,
  FOREIGN KEY(story_id) REFERENCES stories(id)
);

-- Steps
CREATE TABLE steps (
  id TEXT PRIMARY KEY,
  activity_id TEXT,
  order_index INTEGER,
  prompt TEXT,
  input_request TEXT,
  state_update_logic TEXT,
  outcome_check TEXT,
  FOREIGN KEY(activity_id) REFERENCES activities(id)
);
```

---

## 🧪 CLI + Agent Runtime

### `agent-instructions.md`

Contains top-level directives for the agent runtime:

```md
# Agent Instructions

You can run stories and follow each activity step-by-step.

## Available Commands

- `list stories`
- `run story <story-id>`
- `continue story <story-id>`
- `run activity <activity-id>`

Each activity step will provide:

- A minimal prompt from the promptLib.
- State updates stored in SQLite.
- Checks to determine if the expected outcome was met.
```

### Example CLI usage:

```sh
$ agent list stories
1. Website Builder

$ agent run story website-builder
➡ Starting activity: scaffold-frontend
🧾 Step 1: Generate Tailwind layout...
...
```

---

## 🧰 PromptLib

A small TS module or DB table that maps reusable prompt types:

```ts
{
  "generate-ui": "Given the following spec, generate minimal HTML/TSX with Tailwind:",
  "lint-code": "Given the code below, check for lint issues and suggest fixes:",
  ...
}
```

---

## 🖥 Frontend (React/TS)

A simple CRUD UI:

- **Story Manager**: List/create/edit stories
- **Activity Editor**: Add/edit steps, state updates, prompt templates
- **Step Debugger**: Simulate agent responses, validate expected outcomes
- **State Viewer**: See live progress of a running story

---

## ✅ Flow Summary

1. Define story and its activities (via UI or JSON/YAML).
2. Agent CLI runs with context from `agent-instructions.md`.
3. Each activity step is executed:

   - Pulls prompt from `promptLib`
   - Passes state context
   - Agent responds
   - Step logic updates state
   - Step verifies outcome met

4. SQLite tracks all progress.

---

## ✅ Complete Implementation

The Stories framework is now fully implemented with:

### 🚀 **CLI Interface** 
- Beautiful pink ASCII welcome banner
- All commands: `list`, `run`, `activity`, `ui`, `init`
- Robust error handling and colored output
- Direct executable support

### 🖥️ **Web UI Interface**
- Modern React/TypeScript frontend with Tailwind CSS
- Visual story management and CRUD operations
- Live story/activity detail views with state tracking
- Responsive design with Stories branding
- Express server with REST API and WebSocket support

### 🗄️ **Database & State Management**
- SQLite database with Stories → Activities → Steps hierarchy
- Persistent state tracking during execution
- Shared database between CLI and web interfaces

### 📁 **Example Content**
- Pre-built "Website Builder" and "Code Audit" stories
- Complete activity definitions with steps
- JSON story format examples

### 🔧 **Developer Experience**
- TypeScript throughout for type safety
- Modular architecture with clear separation
- Easy deployment and development setup

## 🎯 **Quick Start**

```bash
# Install dependencies
npm install && cd web && npm install && cd ..

# Initialize with examples
npm run agent init

# Use CLI
npm run agent list
npm run agent run website-builder

# Launch web UI
npm run agent ui
```

This framework provides a powerful foundation for managing AI agent workflows with both CLI automation and visual management capabilities.
