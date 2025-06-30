import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Play, Plus, Settings } from 'lucide-react'
import { api } from '../services/api'
import { Activity, Step } from '../types'
import { ActionPromptDialog } from '../components/ActionPromptDialog'

export function ActivityDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [activity, setActivity] = useState<Activity | null>(null)
  const [steps, setSteps] = useState<Step[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogTitle, setDialogTitle] = useState('')
  const [dialogNatural, setDialogNatural] = useState('')
  const [dialogCLI, setDialogCLI] = useState('')

  useEffect(() => {
    if (id) {
      loadActivityData(id)
    }
  }, [id])

  const loadActivityData = async (activityId: string) => {
    try {
      setLoading(true)
      const [activityData, stepsData] = await Promise.all([
        api.getActivity(activityId),
        api.getStepsForActivity(activityId)
      ])
      setActivity(activityData)
      setSteps(stepsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activity')
    } finally {
      setLoading(false)
    }
  }

  function openDialog(type: string) {
    if (!activity) return
    if (type === 'add-step') {
      setDialogTitle('Add Step')
      setDialogNatural(`Please add a new step to the activity with ID "${activity.id}". The step should have a prompt and logic.`)
      setDialogCLI(`# Add a step to activity in the database or via CLI`)
    } else if (type === 'run-activity') {
      setDialogTitle('Run Activity')
      setDialogNatural(`Please run the activity with ID "${activity.id}".`)
      setDialogCLI(`npm run agent activity ${activity.id}`)
    } else if (type === 'edit-activity') {
      setDialogTitle('Edit Activity')
      setDialogNatural(`Please edit the activity with ID "${activity.id}".`)
      setDialogCLI(`# Edit the activity in the database or via CLI`)
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

  if (error || !activity) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 dark:text-red-400 mb-4">⚠️ Error loading activity</div>
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
          to={`/stories/${activity.story_id}`}
          className="mr-4 p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{activity.title}</h1>
          <p className="text-gray-600 dark:text-gray-400">{activity.description}</p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={() => openDialog('edit-activity')} className="inline-flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <Settings className="w-4 h-4 mr-2" />
            Edit
          </button>
          <button onClick={() => openDialog('run-activity')} className="inline-flex items-center px-4 py-2 border border-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-100 hover:border-gray-600 dark:hover:border-gray-600 transition-colors">
            <Play className="w-4 h-4 mr-2" />
            Run Activity
          </button>
        </div>
      </div>

      {/* Activity Details */}
      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <div className="border border-gray-200 dark:border-gray-800 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Instructions</h2>
            <p className="text-gray-700 dark:text-gray-300">{activity.instructions}</p>
          </div>

          <div className="border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Expected Outcome</h2>
            <p className="text-gray-700 dark:text-gray-300">{activity.expected_outcome}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Current State</h2>
            <pre className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-black p-3 rounded overflow-x-auto">
              {JSON.stringify(activity.state, null, 2)}
            </pre>
          </div>

          <div className="border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Prompt Template</h2>
            <div className="bg-gray-50 dark:bg-black p-3 rounded">
              <code className="text-sm text-stories-purple">{activity.prompt_template}</code>
            </div>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Steps ({steps.length})</h2>
          <button onClick={() => openDialog('add-step')} className="inline-flex items-center px-3 py-2 border border-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-100 hover:border-gray-600 dark:hover:border-gray-600 transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Add Step
          </button>
        </div>

        {steps.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400 mb-4">No steps defined yet</p>
            <button onClick={() => openDialog('add-step')} className="inline-flex items-center px-4 py-2 border border-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-100 hover:border-gray-600 dark:hover:border-gray-600 transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              Create First Step
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {steps.map((step) => (
              <div key={step.id} className="p-4 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <span className="bg-gray-800 dark:bg-gray-700 text-gray-100 text-xs px-2 py-1 mr-3">
                      Step {step.order_index}
                    </span>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{step.prompt || 'Untitled Step'}</h3>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>

                {step.input_request && (
                  <div className="mb-3">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Input Request:</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900 p-2 rounded">
                      {step.input_request}
                    </div>
                  </div>
                )}

                {step.state_update_logic && (
                  <div className="mb-3">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State Update Logic:</div>
                    <pre className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-black p-2 rounded overflow-x-auto">
                      {step.state_update_logic}
                    </pre>
                  </div>
                )}

                {step.outcome_check && (
                  <div className="mb-3">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Outcome Check:</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 bg-green-50 dark:bg-green-900 p-2 rounded">
                      {step.outcome_check}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <ActionPromptDialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={dialogTitle} naturalText={dialogNatural} cliCommand={dialogCLI} />
    </div>
  )
}
