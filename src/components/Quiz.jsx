import { useEffect, useState, useRef } from 'react'
import Question from './Question'
import Result from './Result'

export default function Quiz({ student }) {
    const TOTAL_TIME = 180 // seconds
    const [questions, setQuestions] = useState(null)
    const [index, setIndex] = useState(0)
    const [selected, setSelected] = useState(null)
    const [score, setScore] = useState(0)
    const [completed, setCompleted] = useState(false)
    const [timeLeft, setTimeLeft] = useState(TOTAL_TIME)
    const [violations, setViolations] = useState([])
    const [warning, setWarning] = useState(null)
    const [lastViolationAt, setLastViolationAt] = useState(0)
    const [submissionRecord, setSubmissionRecord] = useState(null)

    useEffect(() => {
        // fetch questions from public/questions.json (mock backend)
        let cancelled = false
        fetch('/questions.json')
        .then((r) => r.json())
        .then((data) => {
            if (!cancelled) setQuestions(data)
        })
        .catch(() => {
            // fallback small set
            if (!cancelled)
            setQuestions([
                { id: 1, q: 'Fallback: What does HTML stand for?', choices: ['Hyper Text Markup Language', 'H', 'T', 'M'], answer: 0 },
            ])
        })
        return () => {
        cancelled = true
        }
    }, [])

    // track submission record for student (released flag)
    useEffect(() => {
        if (!student) return
        const subs = JSON.parse(localStorage.getItem('quiz_submissions') || '[]')
        setSubmissionRecord(subs.find(x => x.studentId === student.studentId) || null)
        function onStorage(e) {
        if (e.key === 'quiz_submissions') {
            const subs2 = JSON.parse(localStorage.getItem('quiz_submissions') || '[]')
            setSubmissionRecord(subs2.find(x => x.studentId === student.studentId) || null)
        }
        }
        window.addEventListener('storage', onStorage)
        return () => window.removeEventListener('storage', onStorage)
    }, [student])

    function finalizeQuiz(violationCount) {
        if (completed || !questions) return
        // count current selection if any
        const q = questions?.[index]
        let finalScore = score
        if (selected !== null && q) {
        if (selected === q.answer) finalScore = finalScore + 1
        }
        setScore(finalScore)
        setCompleted(true)

        // persist submission for student
        if (student) {
        const subs = JSON.parse(localStorage.getItem('quiz_submissions') || '[]')
        const existing = subs.find(x => x.studentId === student.studentId)
        if (!existing) {
            const submission = {
            name: student.name,
            studentId: student.studentId,
            score: finalScore,
            total: questions.length,
            violations: violationCount ?? 0,
            at: new Date().toISOString(),
            released: false
            }
            subs.push(submission)
            localStorage.setItem('quiz_submissions', JSON.stringify(subs))
        }
        }
    }

    function handleChoose(i) {
        setSelected(i)
    }

    function handleNext() {
        if (selected === null) return
        const q = questions?.[index]
        if (questions && index + 1 < questions.length) {
        if (q && selected === q.answer) setScore((s) => s + 1)
        setSelected(null)
        setIndex((n) => n + 1)
        } else {
        // Last question — finalize to compute final score and persist submission
        finalizeQuiz(violations.length)
        }
    }


    function registerViolation(type) {
        if (completed) return
        const now = Date.now()
        if (now - lastViolationAt < 2000) return
        setLastViolationAt(now)
        setViolations((v) => {
        const next = [...v, { type, at: new Date().toISOString() }]
        setWarning(`Violation: ${type}. You have ${Math.max(0, 3 - next.length)} chances left.`)
        setTimeout(() => setWarning(null), 4000)
        return next
        })
    }

    // auto-finalize when violations reach 3
    useEffect(() => {
        if (completed || violations.length < 3) return
        const timer = setTimeout(() => {
            finalizeQuiz(3)
            setWarning('Three violations — quiz auto-submitted')
        }, 300)
        return () => clearTimeout(timer)
    }, [violations.length, completed])

    // timer
    useEffect(() => {
        if (completed || !questions) return
        const t = setInterval(() => {
            setTimeLeft((tLeft) => {
                if (tLeft <= 1) {
                    clearInterval(t)
                    setCompleted(true)
                    return 0
                }
                return tLeft - 1
            })
        }, 1000)
        return () => clearInterval(t)
    }, [completed, questions])

    // auto-finalize when time runs out
    useEffect(() => {
        if (completed || timeLeft > 0 || !questions) return
        finalizeQuiz(violations.length)
    }, [timeLeft, completed, violations.length, questions])

    // visibility & blur
    useEffect(() => {
        if (completed) return
        function handleVisibility() {
            if (document.visibilityState !== 'visible') registerViolation('visibilitychange')
        }
        function handleBlur() {
            registerViolation('blur')
        }
        function handleBeforeUnload() {
            registerViolation('beforeunload')
        }
        document.addEventListener('visibilitychange', handleVisibility)
        window.addEventListener('blur', handleBlur)
        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => {
            document.removeEventListener('visibilitychange', handleVisibility)
            window.removeEventListener('blur', handleBlur)
            window.removeEventListener('beforeunload', handleBeforeUnload)
        }
    }, [completed, lastViolationAt, questions, index, selected])

    // detect window being made smaller than initial size
    const initialSizeRef = useRef({ w: 0, h: 0 })
    useEffect(() => {
        if (completed) return
        initialSizeRef.current = { w: window.innerWidth, h: window.innerHeight }
        function handleResize() {
            const { w, h } = initialSizeRef.current
            if (window.innerWidth < w || window.innerHeight < h) {
                registerViolation('resize-smaller')
            }
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [completed, lastViolationAt])

    if (!questions) {
        return (
            <div className="p-6 max-w-2xl mx-auto">
                <div className="bg-white p-6 rounded shadow text-center">Loading questions...</div>
            </div>
        )
    }

    const q = questions[index]


    return (
        <div className="p-6 max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow p-6">
                <h1 className="text-2xl font-semibold mb-4 text-center">Simple Quiz</h1>

                <div className="flex justify-between items-center mb-4">
                    <div className="text-sm text-gray-600">Time left: {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}</div>
                    <div className="text-sm text-gray-600">Violations: {violations.length} / 3</div>
                </div>

                {!completed ? (
                <div>
                    <div className="mb-4 text-sm text-gray-600">Question {index + 1} of {questions.length}</div>
                    <Question q={q} selected={selected} onChoose={handleChoose} />

                    <div className="mt-6 flex justify-between items-center">
                        <div className="text-sm text-gray-700">Score: {score}</div>
                        <button onClick={handleNext} disabled={selected === null} className={`px-4 py-2 rounded ${selected === null ? 'bg-gray-200 text-gray-500' : 'bg-blue-600 text-white'}`}>
                            {index + 1 < questions.length ? 'Next' : 'Finish'}
                        </button>
                    </div>
                </div>
                ) : (
                <Result score={score} total={questions.length} hideScore={!!student && !(submissionRecord?.released)} />
                )}

                {warning && (<div className="mt-4 text-center text-sm text-red-600">{warning}</div>)}

                {violations.length > 0 && (
                    <div className="mt-4 border-t pt-3 text-sm text-gray-700">
                        <div className="font-semibold mb-1">Violations</div>
                        <ul className="list-disc pl-5">
                            {violations.map((v, i) => (
                                <li key={i}>{v.type} at {new Date(v.at).toLocaleString()}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    )
}