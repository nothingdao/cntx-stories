import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Play, Settings, BookOpen } from 'lucide-react'
import { api } from '../services/api'
import { Story } from '../types'
import { ActionPromptDialog } from '../components/ActionPromptDialog'

export function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogTitle, setDialogTitle] = useState('')
  const [dialogNatural, setDialogNatural] = useState('')
  const [dialogCLI, setDialogCLI] = useState('')

  useEffect(() => {
    loadStories()
  }, [])

  const loadStories = async () => {
    try {
      setLoading(true)
      const data = await api.getStories()
      setStories(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stories')
    } finally {
      setLoading(false)
    }
  }

  // const handleRunStory = async (storyId: string) => {
  //   try {
  //     await api.runStory(storyId)
  //     // TODO: Show success message or redirect to execution view
  //   } catch (err) {
  //     console.error('Failed to run story:', err)
  //     // TODO: Show error message
  //   }
  // }

  function openDialog(type: string, story?: Story) {
    if (type === 'new-story') {
      setDialogTitle('Create Story')
      setDialogNatural('Please create a new story. The story should have a title and description.')
      setDialogCLI('npm run agent init')
    } else if (type === 'run-story' && story) {
      setDialogTitle('Run Story')
      setDialogNatural(`Please run the story with ID "${story.id}".`)
      setDialogCLI(`npm run agent run ${story.id}`)
    } else if (type === 'edit-story' && story) {
      setDialogTitle('Edit Story')
      setDialogNatural(`Please edit the story with ID "${story.id}".`)
      setDialogCLI(`# Edit the story in the database or via CLI`)
    }
    setDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin h-12 w-12 border-b-2 border-stories-pink"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 dark:text-red-400 mb-4">⚠️ Error loading stories</div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <button
          onClick={loadStories}
          className="px-4 py-2 border border-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-100 hover:border-gray-600 dark:hover:border-gray-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Stories</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your AI agent workflows</p>
        </div>
        <button onClick={() => openDialog('new-story')} className="inline-flex items-center px-4 py-2 border border-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-100 hover:border-gray-600 dark:hover:border-gray-600 transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          New Story
        </button>
      </div>

      {/* Stories Grid */}
      {stories.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No stories yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Create your first story to get started</p>
          <button onClick={() => openDialog('new-story')} className="inline-flex items-center px-6 py-3 border border-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-100 hover:border-gray-600 dark:hover:border-gray-600 transition-colors">
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Story
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <div key={story.id} className="border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
                    {story.title}
                  </h3>
                  <button onClick={() => openDialog('edit-story', story)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <Settings className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                  {story.description}
                </p>

                <div className="mb-4">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Completion Criteria</div>
                  <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                    {story.completion_criteria}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <Link
                  to={`/stories/${story.id}`}
                  className="text-gray-700 dark:text-gray-300 font-medium text-sm"
                >
                  View Details
                </Link>
                <div onClick={() => openDialog('run-story', story)} className="inline-flex items-center px-3 py-1.5 border border-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-100 text-sm hover:border-gray-600 dark:hover:border-gray-600 transition-colors cursor-pointer">
                  <Play className="w-3 h-3 mr-1" />
                  Run
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ActionPromptDialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={dialogTitle} naturalText={dialogNatural} cliCommand={dialogCLI} />
    </div>
  )
}
