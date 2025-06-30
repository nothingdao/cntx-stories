import { Link, useLocation } from 'react-router-dom'
import { BookOpen, Home, Play, Moon, Sun } from 'lucide-react'
import { useState, useEffect } from 'react'

export function Navbar() {
  const location = useLocation()
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark') {
      setDark(true)
      document.documentElement.classList.add('dark')
    } else {
      setDark(false)
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleTheme = () => {
    if (dark) {
      setDark(false)
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    } else {
      setDark(true)
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    }
  }

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <nav className="bg-gray-50 text-gray-900 dark:bg-black dark:text-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 text-xl font-bold">
            <Play className="w-6 h-6" />
            <span>STORIES</span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className={`flex items-center space-x-1 px-3 py-2 transition-colors ${isActive('/') && location.pathname === '/'
                ? 'bg-white/20 dark:bg-white/10'
                : 'hover:bg-white/10 dark:hover:bg-white/5'
                }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>

            <Link
              to="/stories"
              className={`flex items-center space-x-1 px-3 py-2 transition-colors ${isActive('/stories')
                ? 'bg-white/20 dark:bg-white/10'
                : 'hover:bg-white/10 dark:hover:bg-white/5'
                }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Stories</span>
            </Link>
            <button onClick={toggleTheme} className="ml-4 p-2 rounded transition-colors hover:bg-gray-200 dark:hover:bg-gray-800">
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
