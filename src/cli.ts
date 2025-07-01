#!/usr/bin/env npx tsx

import { Command } from 'commander'
import chalk from 'chalk'
import { StoriesDatabase } from './database.js'
import { StoryRunner } from './storyRunner.js'
import { ConfigManager } from './config.js'
import { AgentExecutor, agentProviders, AgentManager } from './agentProviders.js'
import readline from 'readline'

const program = new Command()
const db = new StoriesDatabase()
const runner = new StoryRunner(db)

// Interactive setup function
async function runInteractiveSetup(): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  const ask = (question: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        resolve(answer.trim())
      })
    })
  }

  const config = new ConfigManager()

  try {
    console.log(chalk.magenta('\n🎉 Welcome to cntx-stories!'))
    console.log(chalk.cyan('Let\'s get you set up with a personalized configuration.\n'))

    // Database setup
    console.log(chalk.yellow('📊 Database Setup'))
    console.log('1. SQLite (local file - recommended for getting started)')
    console.log('2. PostgreSQL (Neon, Supabase, or your own server)')
    console.log('3. MySQL (your own server)')
    
    const dbChoice = await ask('\nChoose your database (1-3) [1]: ')
    
    if (dbChoice === '2') {
      console.log(chalk.dim('\nPostgreSQL Examples:'))
      console.log(chalk.dim('  Neon:     postgres://user:pass@ep-cool.neon.tech/cntx'))
      console.log(chalk.dim('  Supabase: postgres://postgres:pass@db.project.supabase.co:5432/postgres'))
      
      const dbUrl = await ask('Enter your PostgreSQL connection string: ')
      if (dbUrl) {
        config.setDatabaseUrl(dbUrl)
        console.log(chalk.green('✅ PostgreSQL database configured'))
      }
    } else if (dbChoice === '3') {
      const dbUrl = await ask('Enter your MySQL connection string: ')
      if (dbUrl) {
        config.setDatabaseUrl(dbUrl)
        console.log(chalk.green('✅ MySQL database configured'))
      }
    } else {
      console.log(chalk.green('✅ Using SQLite (default)'))
    }

    // Agent setup
    console.log(chalk.yellow('\n🤖 AI Agent Setup'))
    const availableAgents = await AgentExecutor.detectAvailable()
    
    if (availableAgents.length === 0) {
      console.log(chalk.red('❌ No AI agents found installed!'))
      console.log(chalk.dim('You can install agents later and configure them with:'))
      console.log(chalk.dim('  stories config agent set <agent-name>'))
    } else {
      console.log('Available AI agents:')
      availableAgents.forEach((name, index) => {
        console.log(`${index + 1}. ${name} (${agentProviders[name].name})`)
      })
      
      const agentChoice = await ask(`\nChoose your AI agent (1-${availableAgents.length}) [1]: `)
      const selectedIndex = parseInt(agentChoice) - 1 || 0
      
      if (selectedIndex >= 0 && selectedIndex < availableAgents.length) {
        const selectedAgent = availableAgents[selectedIndex]
        config.setAgentProvider(selectedAgent)
        console.log(chalk.green(`✅ ${selectedAgent} configured as your AI agent`))
      } else {
        console.log(chalk.green(`✅ ${availableAgents[0]} configured as your AI agent (default)`))
        config.setAgentProvider(availableAgents[0])
      }
    }

    // Execution preferences
    console.log(chalk.yellow('\n⚙️  Execution Preferences'))
    
    const autoConfirm = await ask('Auto-confirm steps without prompting? (y/N) [N]: ')
    const pauseTime = await ask('Pause between steps in milliseconds [1000]: ')
    const logLevel = await ask('Log level (minimal/normal/verbose) [normal]: ')

    const currentConfig = config.get()
    config.set({
      ...currentConfig,
      execution: {
        autoConfirm: autoConfirm.toLowerCase() === 'y' || autoConfirm.toLowerCase() === 'yes',
        pauseBetweenSteps: parseInt(pauseTime) || 1000,
        logLevel: (logLevel as any) || 'normal'
      }
    })

    console.log(chalk.green('\n✅ Configuration saved!'))
    
  } catch (error) {
    if (error.message !== 'readline was closed') {
      console.error(chalk.red('Setup interrupted:', error))
    }
  } finally {
    if (!rl.closed) {
      rl.close()
    }
  }
}

// ASCII art banner
const banner = `
${chalk.magenta('  ███████╗████████╗ ██████╗ ██████╗ ██╗███████╗███████╗')}
${chalk.magenta('  ██╔════╝╚══██╔══╝██╔═══██╗██╔══██╗██║██╔════╝██╔════╝')}
${chalk.magenta('  ███████╗   ██║   ██║   ██║██████╔╝██║█████╗  ███████╗')}
${chalk.magenta('  ╚════██║   ██║   ██║   ██║██╔══██╗██║██╔══╝  ╚════██║')}
${chalk.magenta('  ███████║   ██║   ╚██████╔╝██║  ██║██║███████╗███████║')}
${chalk.magenta('  ╚══════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝╚══════╝╚══════╝')}

${chalk.cyan('  part of the cntx ecosystem - by @nothingdao')}

${chalk.yellow('  📚 Top Level Commands:')}
${chalk.green('    list         ')}${chalk.gray('List all available stories')}
${chalk.green('    run <id>     ')}${chalk.gray('Execute a complete story')}
${chalk.green('    activity <id>')}${chalk.gray('Run a single activity')}
${chalk.green('    ui           ')}${chalk.gray(
  'Launch web UI for visual management'
)}
${chalk.green('    config       ')}${chalk.gray('Configure agent settings')}
${chalk.green('    agent        ')}${chalk.gray('Manage AI agents (list/add/remove)')}
${chalk.green('    init         ')}${chalk.gray('Create example stories')}

${chalk.yellow('  🚀 Quick Start:')}
${chalk.gray('    stories init               # Setup examples')}
${chalk.gray('    stories agent list         # List available AIs')}
${chalk.gray('    stories run website-builder')}
`

// Show banner when no command is provided
if (process.argv.length === 2) {
  console.log(banner)
  process.exit(0)
}

program
  .name('cntx-stories')
  .description('cntx-stories - Structured AI agent workflow framework')
  .version('1.0.0')

program
  .command('list')
  .alias('ls')
  .description('List all available stories')
  .action(async () => {
    try {
      const stories = db.getStories()

      if (stories.length === 0) {
        console.log(
          chalk.yellow('No stories found. Create some stories first!')
        )
        return
      }

      console.log(chalk.blue.bold('\n📚 Available Stories:\n'))

      stories.forEach((story, index) => {
        console.log(chalk.green(`${index + 1}. ${story.title}`))
        console.log(chalk.gray(`   ID: ${story.id}`))
        console.log(chalk.gray(`   ${story.description}\n`))
      })
    } catch (error) {
      console.error(chalk.red('Error listing stories:'), error)
    }
  })

program
  .command('run')
  .description('Run a story by ID')
  .argument('<story-id>', 'Story ID to run')
  .action(async (storyId: string) => {
    try {
      console.log(chalk.blue(`\n🚀 Starting story: ${storyId}\n`))
      await runner.runStory(storyId)
      console.log(chalk.green('\n✅ Story completed successfully!'))
    } catch (error) {
      console.error(chalk.red('Error running story:'), error)
      process.exit(1)
    }
  })

program
  .command('continue')
  .description('Continue a paused story')
  .argument('<story-id>', 'Story ID to continue')
  .action(async (storyId: string) => {
    try {
      console.log(chalk.blue(`\n🔄 Continuing story: ${storyId}\n`))
      await runner.continueStory(storyId)
      console.log(chalk.green('\n✅ Story continued successfully!'))
    } catch (error) {
      console.error(chalk.red('Error continuing story:'), error)
      process.exit(1)
    }
  })

program
  .command('activity')
  .description('Run a single activity by ID')
  .argument('<activity-id>', 'Activity ID to run')
  .action(async (activityId: string) => {
    try {
      console.log(chalk.blue(`\n⚡ Running activity: ${activityId}\n`))
      await runner.runActivity(activityId)
      console.log(chalk.green('\n✅ Activity completed successfully!'))
    } catch (error) {
      console.error(chalk.red('Error running activity:'), error)
      process.exit(1)
    }
  })

program
  .command('init')
  .description('Initialize with example stories and configure cntx-stories')
  .option('--no-interactive', 'Skip interactive setup and use defaults')
  .action(async (options) => {
    try {
      // Run interactive setup unless --no-interactive is specified
      if (options.interactive !== false) {
        await runInteractiveSetup()
      }

      console.log(chalk.blue('\n🏗️  Creating example stories...\n'))

      const { createExampleStories } = await import('./examples.js')
      createExampleStories(db)

      const { createSimpleTestStory } = await import('./simpleTestStory.js')
      createSimpleTestStory(db)

      console.log(chalk.green('\n✅ Setup complete!\n'))
      
      console.log(chalk.cyan('🚀 Quick start:'))
      console.log(chalk.dim('  stories list                    # See your stories'))
      console.log(chalk.dim('  stories run website-builder     # Try your first workflow'))
      console.log(chalk.dim('  stories ui                      # Launch web interface'))
      
    } catch (error) {
      console.error(chalk.red('Error during initialization:'), error)
      process.exit(1)
    }
  })

program
  .command('ui')
  .description('Launch the web UI for visual story management')
  .option('-p, --port <port>', 'Port to run the server on', '3000')
  .option('--no-open', "Don't automatically open browser")
  .action(async (options) => {
    try {
      console.log(chalk.blue('\n🚀 Starting Stories UI server...\n'))

      // Import and start the server
      const { spawn } = await import('child_process')
      const open = await import('open')

      // Set port environment variable
      process.env.PORT = options.port

      // Start the server
      const serverProcess = spawn('npx', ['tsx', 'src/server.ts'], {
        stdio: 'inherit',
        env: { ...process.env, PORT: options.port },
      })

      // Wait a moment for server to start, then open browser
      if (options.open) {
        setTimeout(async () => {
          try {
            await open.default(`http://localhost:${options.port}`)
          } catch (error) {
            console.log(
              chalk.yellow(
                'Could not auto-open browser. Please visit http://localhost:' +
                  options.port
              )
            )
          }
        }, 2000)
      }

      // Handle cleanup
      process.on('SIGINT', () => {
        console.log(chalk.yellow('\n🛑 Stopping UI server...'))
        serverProcess.kill('SIGTERM')
        process.exit(0)
      })
    } catch (error) {
      console.error(chalk.red('Error starting UI server:'), error)
      process.exit(1)
    }
  })

program
  .command('test')
  .description('Add simple test story for Claude CLI integration')
  .action(async () => {
    try {
      console.log(chalk.blue('\n🧪 Adding test stories...\n'))

      const { createSimpleTestStory } = await import('./simpleTestStory.js')
      createSimpleTestStory(db)

      const { createQuickTest } = await import('./quickTest.js')
      createQuickTest(db)

      console.log(chalk.green('✅ Test stories added!'))
      console.log(chalk.cyan('   npm run agent run hello-claude  # Full test'))
      console.log(
        chalk.cyan('   npm run agent run quick-test    # Super quick test')
      )
    } catch (error) {
      console.log(
        chalk.yellow('ℹ️  Test stories already exist or error occurred')
      )
    }
  })

program
  .command('agent')
  .description('Manage AI agent providers')
  .argument('[action]', 'Action: list, add, remove, switch')
  .argument('[name]', 'Agent name')
  .argument('[command]', 'Command to run agent')
  .option('--args <args>', 'Command arguments template (use {prompt} placeholder)')
  .action(async (action?: string, name?: string, command?: string, options?: any) => {
    try {
      if (!action || action === 'list') {
        // List all agents
        console.log(chalk.blue('\n🤖 Available AI Agents:\n'))
        
        const agents = AgentManager.listAgents()
        const available = await AgentExecutor.detectAvailable()
        
        if (agents.length === 0) {
          console.log(chalk.yellow('No agents configured.'))
          return
        }
        
        agents.forEach(({ name, provider, isCustom }) => {
          const isAvailable = available.includes(name)
          const status = isAvailable ? chalk.green('✅') : chalk.red('❌')
          const type = isCustom ? chalk.cyan('(custom)') : chalk.gray('(built-in)')
          
          console.log(`${status} ${chalk.bold(name)} ${type}`)
          console.log(`   Command: ${provider.command}`)
          console.log(`   Description: ${provider.name}`)
          console.log()
        })
        return
      }
      
      if (action === 'add') {
        if (!name || !command) {
          console.log(chalk.red('❌ Usage: agent add <name> <command> [--args "<template>"]'))
          console.log(chalk.dim('Example: agent add mychat "mychat" --args "{prompt}"'))
          return
        }
        
        const argsTemplate = options?.args || '{prompt}'
        
        AgentManager.addCustomAgent(name, {
          name: `Custom ${name}`,
          command: command,
          args: (prompt: string) => {
            if (argsTemplate.includes('{prompt}')) {
              return argsTemplate.replace('{prompt}', prompt).split(' ')
            }
            return [argsTemplate, prompt]
          },
          parseResponse: (output: string) => output.trim()
        }, argsTemplate)
        
        console.log(chalk.green(`✅ Added custom agent: ${name}`))
        console.log(chalk.dim(`   Command: ${command}`))
        console.log(chalk.dim(`   Args template: ${argsTemplate}`))
        return
      }
      
      if (action === 'remove') {
        if (!name) {
          console.log(chalk.red('❌ Usage: agent remove <name>'))
          return
        }
        
        try {
          const removed = AgentManager.removeCustomAgent(name)
          if (removed) {
            console.log(chalk.green(`✅ Removed agent: ${name}`))
          } else {
            console.log(chalk.yellow(`⚠️  Agent not found: ${name}`))
          }
        } catch (error) {
          console.log(chalk.red(`❌ ${error instanceof Error ? error.message : 'Unknown error'}`))
        }
        return
      }
      
      if (action === 'switch') {
        if (!name) {
          console.log(chalk.red('❌ Usage: agent switch <name>'))
          return
        }
        
        if (!agentProviders[name]) {
          console.log(chalk.red(`❌ Unknown agent: ${name}`))
          console.log(chalk.dim('Available agents:', AgentManager.listAgents().map(a => a.name).join(', ')))
          return
        }
        
        const isAvailable = await AgentExecutor.checkAvailable(name)
        if (!isAvailable) {
          console.log(chalk.red(`❌ Agent '${name}' CLI not found: ${agentProviders[name].command}`))
          return
        }
        
        const config = new ConfigManager()
        config.setAgentProvider(name)
        console.log(chalk.green(`✅ Switched to agent: ${name}`))
        return
      }
      
      console.log(chalk.red('❌ Unknown action. Use: list, add, remove, switch'))
    } catch (error) {
      console.error(chalk.red('Error managing agents:'), error)
      process.exit(1)
    }
  })

program
  .command('config')
  .description('Configure Stories settings')
  .argument('[section]', 'Configuration section (agent, execution)')
  .argument('[action]', 'Action (set)')
  .argument('[value]', 'Value to set')
  .action(async (section?: string, action?: string, value?: string) => {
    const config = new ConfigManager()

    // Handle agent set command
    if (section === 'agent' && action === 'set' && value) {
      if (!agentProviders[value]) {
        console.log(chalk.red(`❌ Unknown provider: ${value}`))
        console.log(
          chalk.dim(
            'Available providers:',
            Object.keys(agentProviders).join(', ')
          )
        )
        return
      }

      const isAvailable = await AgentExecutor.checkAvailable(value)
      if (!isAvailable) {
        console.log(
          chalk.red(
            `❌ Provider '${value}' CLI not found: ${agentProviders[value].command}`
          )
        )
        return
      }

      config.setAgentProvider(value)
      console.log(chalk.green(`✅ Agent provider set to: ${value}`))
      return
    }

    if (!section) {
      // Show current config
      console.log(chalk.blue('\n📋 Current Configuration:\n'))
      const currentConfig = config.get()
      console.log(chalk.cyan('Agent:'))
      console.log(`  Provider: ${currentConfig.agent.provider}`)
      console.log(`  Model: ${currentConfig.agent.model || 'default'}`)
      console.log(`  Temperature: ${currentConfig.agent.temperature}`)

      console.log(chalk.cyan('\nDatabase:'))
      console.log(`  Provider: ${currentConfig.database.provider}`)
      console.log(`  URL: ${currentConfig.database.url}`)

      console.log(chalk.cyan('\nExecution:'))
      console.log(`  Auto-confirm: ${currentConfig.execution.autoConfirm}`)
      console.log(
        `  Pause between steps: ${currentConfig.execution.pauseBetweenSteps}ms`
      )
      console.log(`  Log level: ${currentConfig.execution.logLevel}`)
      return
    }

    if (section === 'agent') {
      console.log(chalk.blue('\n🤖 Agent Configuration\n'))

      // Check available providers
      const available = await AgentExecutor.detectAvailable()
      const all = Object.keys(agentProviders)

      console.log(chalk.green('Available AI CLIs:'))
      available.forEach((name) => {
        console.log(
          chalk.green(`  ✅ ${name} (${agentProviders[name].command})`)
        )
      })

      console.log(chalk.yellow('\nNot installed:'))
      all
        .filter((name) => !available.includes(name))
        .forEach((name) => {
          console.log(
            chalk.gray(`  ❌ ${name} (${agentProviders[name].command})`)
          )
        })

      if (available.length === 0) {
        console.log(chalk.red('\n❌ No AI CLIs found! Install one of:'))
        console.log(
          chalk.dim('  brew install aichat           # Universal AI CLI')
        )
        console.log(chalk.dim('  npm install -g @anthropic/claude-cli'))
        console.log(chalk.dim('  curl -fsSL https://ollama.ai/install.sh | sh'))
      } else {
        console.log(
          chalk.blue(
            `\n💡 To set default agent: npm run agent config agent set ${available[0]}`
          )
        )
      }
    }

    if (section === 'database') {
      console.log(chalk.blue('\n🗄️  Database Configuration\n'))
      
      const currentConfig = config.get()
      console.log(chalk.cyan('Current Database:'))
      console.log(`  Provider: ${currentConfig.database.provider}`)
      console.log(`  URL: ${currentConfig.database.url}`)
      
      if (action === 'set' && value) {
        config.setDatabaseUrl(value)
        console.log(chalk.green(`✅ Database URL set to: ${value}`))
        return
      }
      
      if (action === 'setup') {
        console.log(chalk.yellow('\n🚧 Interactive database setup coming soon!'))
        console.log(chalk.dim('For now, use: stories config database set <url>'))
        console.log(chalk.dim('\nExamples:'))
        console.log(chalk.dim('  SQLite:     stories config database set "sqlite://~/.cntx/database.db"'))
        console.log(chalk.dim('  Neon:       stories config database set "postgres://user:pass@ep-cool.neon.tech/cntx"'))
        console.log(chalk.dim('  Supabase:   stories config database set "postgres://postgres:pass@db.project.supabase.co:5432/postgres"'))
        return
      }
      
      if (action === 'reset') {
        config.resetDatabase()
        console.log(chalk.green('✅ Database reset to SQLite default'))
        return
      }
      
      if (action === 'test') {
        console.log(chalk.yellow('🚧 Database connection testing coming soon!'))
        console.log(chalk.dim('Will test connection to: ' + currentConfig.database.url))
        return
      }
      
      console.log(chalk.blue('\n💡 Database Commands:'))
      console.log(chalk.dim('  stories config database set <url>     # Set connection string'))
      console.log(chalk.dim('  stories config database setup         # Interactive setup'))
      console.log(chalk.dim('  stories config database test          # Test connection'))
      console.log(chalk.dim('  stories config database reset         # Reset to SQLite'))
      return
    }
  })

program.parse(process.argv)

process.on('SIGINT', () => {
  console.log(chalk.yellow('\n🛑 Shutting down...'))
  runner.close()
  db.close()
  process.exit(0)
})

process.on('SIGTERM', () => {
  runner.close()
  db.close()
  process.exit(0)
})

process.on('exit', () => {
  runner.close()
  db.close()
})
