import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Megaphone, Calendar } from 'lucide-react'

const CATEGORIES = ['all', 'registrar', 'internship', 'exams', 'general']

export default function Announcements() {
  const navigate = useNavigate()
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetch('/api/chat/announcements/')
      .then(r => r.json())
      .then(data => setAnnouncements(data.results || data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = announcements.filter(a => filter === 'all' || a.category === filter)

  const catColors = {
    registrar: 'bg-blue-100 text-blue-700',
    internship: 'bg-purple-100 text-purple-700',
    exams: 'bg-red-100 text-red-700',
    general: 'bg-gray-100 text-gray-700',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="p-1 text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <Megaphone size={20} className="text-orange-500" />
        <h1 className="text-lg font-bold text-gray-900">Announcements</h1>
      </header>

      <div className="max-w-3xl mx-auto p-4">
        <div className="flex gap-1 flex-wrap mb-6">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition capitalize ${
                filter === c ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-orange-300'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center py-12 text-gray-400">Loading announcements...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Megaphone size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400 text-sm">No announcements yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(ann => (
              <div key={ann.id} className="bg-white rounded-xl border p-5 hover:shadow-sm transition">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-sm font-semibold text-gray-900">{ann.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 capitalize ${catColors[ann.category] || catColors.general}`}>
                    {ann.category}
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{ann.content}</p>
                <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-400">
                  <Calendar size={12} />
                  <span>{new Date(ann.start_date).toLocaleDateString()}</span>
                  {ann.end_date && <span>— {new Date(ann.end_date).toLocaleDateString()}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
