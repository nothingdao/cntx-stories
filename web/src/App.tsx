import { Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { HomePage } from './pages/HomePage'
import { StoriesPage } from './pages/StoriesPage'
import { StoryDetailPage } from './pages/StoryDetailPage'
import { ActivityDetailPage } from './pages/ActivityDetailPage'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/stories" element={<StoriesPage />} />
          <Route path="/stories/:id" element={<StoryDetailPage />} />
          <Route path="/activities/:id" element={<ActivityDetailPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
