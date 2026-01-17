import React, { useEffect, useState } from 'react'
import Quiz from '../components/Quiz'

export default function StudentDashboard({ user, onLogout }) {
    const [started, setStarted] = useState(false)
    const [submission, setSubmission] = useState(null)

    useEffect(() => {
        if (!user) return
        const subs = JSON.parse(localStorage.getItem('quiz_submissions') || '[]')
        const s = subs.find(x => x.studentId === user.studentId)
        setSubmission(s || null)

        function onStorage(e) {
        if (e.key === 'quiz_submissions') {
            const subs2 = JSON.parse(localStorage.getItem('quiz_submissions') || '[]')
            const s2 = subs2.find(x => x.studentId === user.studentId)
            setSubmission(s2 || null)
        }
        }
        window.addEventListener('storage', onStorage)
        return () => window.removeEventListener('storage', onStorage)
    }, [user])

    if (!user) return null

    // If student already submitted, prevent retake
    if (submission) {
        return (
            <div className="p-6 max-w-2xl mx-auto">
                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-xl font-semibold">Welcome, {user.name}</h2>
                    <div className="mt-4 text-gray-700">You have already taken this quiz. Please wait for the instructor to release your score.</div>
                    <div className="mt-4">
                        <div><strong>Submission time:</strong> {new Date(submission.at).toLocaleString()}</div>
                        <div><strong>Violations:</strong> {submission.violations}</div>
                        <div className="mt-2 text-blue-700">{submission.released ? `Score: ${submission.score} / ${submission.total}` : 'Your answers have been submitted. Please wait for the instructor to release the results.'}</div>
                    </div>
                    <div className="mt-4">
                        <button onClick={onLogout} className="px-3 py-2 bg-gray-200 rounded">Logout</button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <div className="bg-white p-6 rounded shadow">
                <h2 className="text-xl font-semibold">Welcome, {user.name}</h2>
                <p className="mt-2 text-gray-700">Student ID: {user.studentId}</p>

                {!started ? (
                <div className="mt-6">
                    <p className="text-sm text-gray-600">Click start to begin the quiz. Timer and violation rules are enforced.</p>
                    <div className="mt-4">
                        <button onClick={() => setStarted(true)} className="px-4 py-2 bg-blue-600 text-white rounded">Start Quiz</button>
                        <button onClick={onLogout} className="ml-3 px-3 py-2 bg-gray-200 rounded">Logout</button>
                    </div>
                </div>
                ) : (
                <Quiz student={user} />
                )}
            </div>
        </div>
    )
}