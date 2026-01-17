export default function Result({ score, total, hideScore }) {
  if (hideScore) {
    return (
      <div className="text-center">
        <div className="text-lg mb-3">Your answers have been submitted.</div>
        <div className="mb-6 text-gray-600">Please wait for the instructor to release the results.</div>
      </div>
    )
  }

  return (
    <div className="text-center">
      <div className="text-lg mb-3">You scored</div>
      <div className="text-4xl font-bold mb-4">{score} / {total}</div>
      <div className="mb-6 text-gray-600">{Math.round((score / total) * 100)}% correct</div>
    </div>
  )
}
