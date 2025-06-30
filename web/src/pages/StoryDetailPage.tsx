import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Play, Plus, Settings } from 'lucide-react'
import { api } from '../services/api'
import { Story, Activity } from '../types'
import { ActionPromptDialog } from '../components/ActionPromptDialog'

export function StoryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [story, setStory] = useState<Story | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogTitle, setDialogTitle] = useState('')
  const [dialogNatural, setDialogNatural] = useState('')
  const [dialogCLI, setDialogCLI] = useState('')

  useEffect(() => {
    if (id) {
      loadStoryData(id)
    }
  }, [id])

  const loadStoryData = async (storyId: string) => {
    try {
      setLoading(true)
      const [storyData, activitiesData] = await Promise.all([
        api.getStory(storyId),
        api.getActivitiesForStory(storyId)
      ])
      setStory(storyData)
      setActivities(activitiesData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load story')
    } finally {
      setLoading(false)
    }
  }

  function openDialog(type: string, activity?: Activity) {
    if (!story) return
    if (type === 'add-activity') {
      setDialogTitle('Add Activity')
      setDialogNatural(`Please add a new activity to the story with ID "${story.id}". The activity should have a title and description.`)
      setDialogCLI(`npm run agent activity <activity-id>`)
    } else if (type === 'run-story') {
      setDialogTitle('Run Story')
      setDialogNatural(`Please run the story with ID "${story.id}".`)
      setDialogCLI(`npm run agent run ${story.id}`)
    } else if (type === 'edit-story') {
      setDialogTitle('Edit Story')
      setDialogNatural(`Please edit the story with ID "${story.id}".`)
      setDialogCLI(`# Edit the story in the database or via CLI`)
    } else if (type === 'run-activity' && activity) {
      setDialogTitle('Run Activity')
      setDialogNatural(`Please run the activity with ID "${activity.id}".`)
      setDialogCLI(`npm run agent activity ${activity.id}`)
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

  if (error || !story) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 dark:text-red-400 mb-4">⚠️ Error loading story</div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <Link
          to="/stories"
          className="px-4 py-2 bg-stories-pink text-white rounded-lg hover:bg-stories-purple transition-colors"
        >
          Back to Stories
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Link
          to="/stories"
          className="mr-4 p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{story.title}</h1>
          <p className="text-gray-600 dark:text-gray-400">{story.description}</p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={() => openDialog('edit-story')} className="inline-flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <Settings className="w-4 h-4 mr-2" />
            Edit
          </button>
          <button onClick={() => openDialog('run-story')} className="inline-flex items-center px-4 py-2 border border-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-100 hover:border-gray-600 dark:hover:border-gray-600 transition-colors">
            <Play className="w-4 h-4 mr-2" />
            Run Story
          </button>
        </div>
      </div>

      {/* Story Details */}
      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <div className="border border-gray-200 dark:border-gray-800 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Completion Criteria</h2>
            <p className="text-gray-700 dark:text-gray-300">{story.completion_criteria}</p>
          </div>

          <div className="border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Expected Outcomes</h2>
            <div className="space-y-2">
              {Object.entries(story.expected_outcomes || {}).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="text-gray-700 dark:text-gray-300">{key.replace(/_/g, ' ')}</span>
                  <span className={`px-2 py-1 text-xs ${value ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400'
                    }`}>
                    {value ? 'Required' : 'Optional'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Initial State</h2>
            <pre className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-black p-3 rounded overflow-x-auto">
              {JSON.stringify(story.initial_state, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      {/* Activities */}
      <div className="border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Activities ({activities.length})</h2>
          <button onClick={() => openDialog('add-activity')} className="inline-flex items-center px-3 py-2 border border-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-100 hover:border-gray-600 dark:hover:border-gray-600 transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Add Activity
          </button>
        </div>

        {activities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400 mb-4">No activities defined yet</p>
            <button onClick={() => openDialog('add-activity')} className="inline-flex items-center px-4 py-2 border border-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-100 hover:border-gray-600 dark:hover:border-gray-600 transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              Create First Activity
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={activity.id} className="p-4 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="bg-gray-800 dark:bg-gray-700 text-gray-100 text-xs px-2 py-1 mr-3">
                        #{index + 1}
                      </span>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{activity.title}</h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{activity.description}</p>
                    {activity.instructions && (
                      <p className="text-gray-700 dark:text-gray-300 text-sm">
                        <span className="font-medium">Instructions:</span> {activity.instructions}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Link
                      to={`/activities/${activity.id}`}
                      className="text-gray-700 dark:text-gray-300 text-sm font-medium"
                    >
                      Details
                    </Link>
                    <button onClick={() => openDialog('run-activity', activity)} className="inline-flex items-center px-2 py-1 border border-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-100 text-xs hover:border-gray-600 dark:hover:border-gray-600 transition-colors">
                      <Play className="w-3 h-3 mr-1" />
                      Run
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ActionPromptDialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={dialogTitle} naturalText={dialogNatural} cliCommand={dialogCLI} />
    </div>
  )
}
