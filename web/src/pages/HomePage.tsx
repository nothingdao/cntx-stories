import { Link } from 'react-router-dom'
import { BookOpen, Play, Plus, Terminal } from 'lucide-react'
import { useState } from 'react'
import { ActionPromptDialog } from '../components/ActionPromptDialog'

export function HomePage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogNatural, setDialogNatural] = useState('');
  const [dialogCLI, setDialogCLI] = useState('');

  function openDialog(type: string) {
    if (type === 'run-example') {
      setDialogTitle('Run Example');
      setDialogNatural('Please run the example story.');
      setDialogCLI('npm run agent run website-builder');
    } else if (type === 'manage-stories') {
      setDialogTitle('Manage Stories');
      setDialogNatural('Please list all stories.');
      setDialogCLI('npm run agent list');
    } else if (type === 'create-story') {
      setDialogTitle('Create Story');
      setDialogNatural('Please create a new story. The story should have a title and description.');
      setDialogCLI('npm run agent init');
    }
    setDialogOpen(true);
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="mb-4">
          <h1 className="text-6xl font-bold mb-2 text-gray-900 dark:text-gray-100">STORIES</h1>
        </div>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
          Structured AI Agent Workflow Framework
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          built for <a className="link underline" href="https://www.npmjs.com/package/cntx-ui" target="_blank">cntx-ui</a> - by <a className="link underline" href="https://x.com/nothingdao" target="_blank">@nothingdao</a>
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center mb-4">
            <BookOpen className="w-8 h-8 text-gray-800 dark:text-gray-100 mr-3" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Visual Story Management</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Create, edit, and organize your AI agent workflows with an intuitive visual interface.
          </p>
          <Link
            to="#"
            onClick={e => { e.preventDefault(); openDialog('manage-stories'); }}
            className="inline-flex items-center px-4 py-2 border border-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-100 hover:border-gray-600 dark:hover:border-gray-600 transition-colors"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Manage Stories
          </Link>
        </div>

        <div className="border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center mb-4">
            <Terminal className="w-8 h-8 text-gray-800 dark:text-gray-100 mr-3" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">CLI Integration</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Run stories from the command line or use the web interface - both share the same database.
          </p>
          <div className="bg-gray-900 dark:bg-black text-green-400 dark:text-green-300 p-3 rounded font-mono text-sm">
            <div>$ npm run agent list</div>
            <div>$ npm run agent run website-builder</div>
          </div>
        </div>

        <div className="border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center mb-4">
            <Play className="w-8 h-8 text-gray-800 dark:text-gray-100 mr-3" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Live Execution</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Watch your stories execute in real-time with state tracking and progress monitoring.
          </p>
          <button onClick={() => openDialog('run-example')} className="inline-flex items-center px-4 py-2 border border-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-100 hover:border-gray-600 dark:hover:border-gray-600 transition-colors">
            <Play className="w-4 h-4 mr-2" />
            Run Example
          </button>
        </div>

        <div className="border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center mb-4">
            <Plus className="w-8 h-8  dark:text-gray-100 mr-3" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Easy Creation</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Build complex workflows by composing Stories from Activities and Steps with structured logic.
          </p>
          <Link
            to="#"
            onClick={e => { e.preventDefault(); openDialog('create-story'); }}
            className="inline-flex items-center px-4 py-2 border border-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-100 hover:border-gray-600 dark:hover:border-gray-600 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Story
          </Link>
        </div>
      </div>

      {/* Architecture Overview */}
      <div className="border border-gray-200 dark:border-gray-800 p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">How It Works</h2>
        <div className="flex items-center justify-center space-x-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-900 dark:text-gray-100 font-bold text-xl mx-auto mb-2">
              S
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">Stories</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">High-level workflows</p>
          </div>
          <div className="text-2xl text-gray-400 dark:text-gray-500">→</div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-900 dark:text-gray-100 font-bold text-xl mx-auto mb-2">
              A
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">Activities</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Units of work</p>
          </div>
          <div className="text-2xl text-gray-400 dark:text-gray-500">→</div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-900 dark:text-gray-100 font-bold text-xl mx-auto mb-2">
              S
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">Steps</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Individual prompts</p>
          </div>
        </div>
      </div>

      <ActionPromptDialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={dialogTitle} naturalText={dialogNatural} cliCommand={dialogCLI} />
    </div>
  )
}
