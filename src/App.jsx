import { useEffect, useState } from 'react'
import Login from './pages/Login'
import StudentDashboard from './pages/StudentDashboard'
import InstructorDashboard from './pages/InstructorDashboard'
function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('current_user') || 'null')
    } catch (e) { return null }
  })

  useEffect(() => {
    function onStorage(e) {
      if (e.key === 'current_user') {
        setUser(JSON.parse(localStorage.getItem('current_user') || 'null'))
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  function handleLogin(u) {
    setUser(u)
  }

  function handleLogout() {
    localStorage.removeItem('current_user')
    setUser(null)
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-4xl mx-auto p-4 flex justify-between items-center">
            <div className="font-bold">Quiz Bee</div>
            {user && (
              <div className="text-sm text-gray-600">{user.role === 'student' ? user.name : 'Instructor'} <button onClick={handleLogout} className="ml-3 text-blue-600">Logout</button></div>
            )}
          </div>
        </header>

        
      </div>
    </>
  )
}

export default App
