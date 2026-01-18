import React, { useState } from 'react'

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem('users') || '[]')
  } catch (e) { return [] }
}

function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users))
}

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [role, setRole] = useState('student')
  const [name, setName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [password, setPassword] = useState('')

  function handleRegister(e) {
    e.preventDefault()
    const trimmedName = (name || '').trim()
    const trimmedId = (studentId || '').trim()
    const trimmedPassword = (password || '').trim()
    if (!trimmedName || (role === 'student' && !trimmedId) || (role === 'instructor' && !trimmedPassword)) {
      alert('Please fill required fields')
      return
    }
    const users = getUsers()
    if (role === 'student') {
      if (users.find(u => u.role === 'student' && u.studentId === trimmedId)) {
        alert('Student ID already registered. Please login.')
        return
      }
      const u = { role: 'student', name: trimmedName, studentId: trimmedId }
      users.push(u)
      saveUsers(users)
      localStorage.setItem('current_user', JSON.stringify(u))
      onLogin(u)
    } else {
      if (users.find(u => u.role === 'instructor' && u.name === trimmedName)) {
        alert('Instructor already registered. Please login.')
        return
      }
      const u = { role: 'instructor', name: trimmedName, password: trimmedPassword }
      users.push(u)
      saveUsers(users)
      localStorage.setItem('current_user', JSON.stringify({ role: 'instructor', name: trimmedName }))
      onLogin({ role: 'instructor', name: trimmedName })
    }
  }

  function handleLogin(e) {
    e.preventDefault()
    const users = getUsers()
    if (role === 'student') {
      const trimmedId = (studentId || '').trim()
      const trimmedName = (name || '').trim()
      const u = users.find(x => x.role === 'student' && x.studentId === trimmedId && x.name === trimmedName)
      if (!u) {
        const byId = users.find(x => x.role === 'student' && x.studentId === trimmedId)
        if (byId) {
          alert('Student ID found but name does not match. Please enter the correct name.')
          return
        }
        if (confirm('No account found. Register instead?')) setMode('register')
        return
      }
      localStorage.setItem('current_user', JSON.stringify(u))
      onLogin(u)
    } else {
      // instructor: check registered users first, fallback to default password
      const u = users.find(x => x.role === 'instructor' && x.name === name && x.password === password)
      if (u || password === 'instructor123') {
        const user = { role: 'instructor', name }
        localStorage.setItem('current_user', JSON.stringify(user))
        onLogin(user)
      } else {
        if (confirm('No registered instructor found — register instead?')) setMode('register')
      }
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">{mode === 'login' ? 'Login' : 'Register'}</h2>

      <div className="mb-4">
        <label className="mr-3">Mode:</label>
        <select value={mode} onChange={e => setMode(e.target.value)} className="p-2 border mr-4">
          <option value="login">Login</option>
          <option value="register">Register</option>
        </select>

        <label className="mr-3">Role:</label>
        <select value={role} onChange={e => setRole(e.target.value)} className="p-2 border">
          <option value="student">Student</option>
          <option value="instructor">Instructor</option>
        </select>
      </div>

      {mode === 'login' ? (
        <form onSubmit={handleLogin} className="space-y-3">
          <div>
            <label className="block text-sm">Name</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border" />
          </div>

          {role === 'student' && (
            <div>
              <label className="block text-sm">Student ID</label>
              <input value={studentId} onChange={e => setStudentId(e.target.value)} className="w-full p-2 border" />
            </div>
          )}

          {role === 'instructor' && (
            <div>
              <label className="block text-sm">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 border" />
            </div>
          )}

          <div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded">Login</button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="space-y-3">
          <div>
            <label className="block text-sm">Name</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border" />
          </div>

          {role === 'student' && (
            <div>
              <label className="block text-sm">Student ID</label>
              <input value={studentId} onChange={e => setStudentId(e.target.value)} className="w-full p-2 border" />
            </div>
          )}

          {role === 'instructor' && (
            <div>
              <label className="block text-sm">Choose a password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 border" />
            </div>
          )}

          <div>
            <button className="px-4 py-2 bg-green-600 text-white rounded">Register</button>
          </div>
        </form>
      )}
    </div>
  )
}
