import React, { useEffect, useState } from 'react'

export default function InstructorDashboard({ user, onLogout }) {
  const [submissions, setSubmissions] = useState([])

  useEffect(() => {
    const subs = JSON.parse(localStorage.getItem('quiz_submissions') || '[]')
    setSubmissions(subs)
    function onStorage(e) {
      if (e.key === 'quiz_submissions') setSubmissions(JSON.parse(localStorage.getItem('quiz_submissions') || '[]'))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  function releaseAll() {
    const updated = submissions.map(s => ({ ...s, released: true }))
    localStorage.setItem('quiz_submissions', JSON.stringify(updated))
    setSubmissions(updated)
    alert('Results released')
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded shadow">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Instructor Dashboard</h2>
          <div>
            <button onClick={releaseAll} className="px-3 py-2 bg-green-600 text-white rounded">Release Results</button>
            <button onClick={onLogout} className="ml-3 px-3 py-2 bg-gray-200 rounded">Logout</button>
          </div>
        </div>

        <div className="mt-4">
          {submissions.length === 0 ? (
            <div className="text-gray-600">No submissions yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th>Name</th>
                  <th>Student ID</th>
                  <th>Score</th>
                  <th>Violations</th>
                  <th>Submitted At</th>
                  <th>Released</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s, i) => (
                  <tr key={i} className="border-t">
                    <td className="py-2">{s.name}</td>
                    <td>{s.studentId}</td>
                    <td>{s.score} / {s.total}</td>
                    <td>{s.violations}</td>
                    <td>{new Date(s.at).toLocaleString()}</td>
                    <td>{s.released ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
