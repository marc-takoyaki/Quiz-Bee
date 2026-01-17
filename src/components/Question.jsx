export default function Question({ q, selected, onChoose }) {
    return (
        <div>
            <div className="mb-6 text-lg font-medium">{q.q}</div>
            <div className="space-y-3">
                {q.choices.map((c, i) => {
                const isSelected = selected === i
                return (
                    <button key={i} onClick={() => onChoose(i)} className={`w-full text-left px-4 py-3 rounded border ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'} hover:border-blue-400`}>
                    {c}
                    </button>
                )
                })}
            </div>
        </div>
    )
}