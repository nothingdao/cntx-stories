import { Story, Activity, Step } from '../types'

const API_BASE = '/api'

class ApiClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE}${endpoint}`
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      })
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(error.error || `HTTP ${response.status}`)
      }
      
      return response.json()
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error)
      throw error
    }
  }

  // Story endpoints
  async getStories(): Promise<Story[]> {
    return this.request<Story[]>('/stories')
  }

  async getStory(id: string): Promise<Story> {
    return this.request<Story>(`/stories/${id}`)
  }

  async createStory(story: Omit<Story, 'id'>): Promise<Story> {
    return this.request<Story>('/stories', {
      method: 'POST',
      body: JSON.stringify({
        ...story,
        id: story.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      }),
    })
  }

  async runStory(id: string): Promise<{ message: string, storyId: string }> {
    return this.request(`/stories/${id}/run`, {
      method: 'POST',
    })
  }

  // Activity endpoints
  async getActivitiesForStory(storyId: string): Promise<Activity[]> {
    return this.request<Activity[]>(`/stories/${storyId}/activities`)
  }

  async getActivity(id: string): Promise<Activity> {
    return this.request<Activity>(`/activities/${id}`)
  }

  async createActivity(activity: Omit<Activity, 'id'>): Promise<Activity> {
    return this.request<Activity>('/activities', {
      method: 'POST',
      body: JSON.stringify({
        ...activity,
        id: activity.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      }),
    })
  }

  async runActivity(id: string): Promise<{ message: string, activityId: string }> {
    return this.request(`/activities/${id}/run`, {
      method: 'POST',
    })
  }

  // Step endpoints
  async getStepsForActivity(activityId: string): Promise<Step[]> {
    return this.request<Step[]>(`/activities/${activityId}/steps`)
  }

  async createStep(step: Omit<Step, 'id'>): Promise<Step> {
    return this.request<Step>('/steps', {
      method: 'POST',
      body: JSON.stringify({
        ...step,
        id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }),
    })
  }
}

export const api = new ApiClient()