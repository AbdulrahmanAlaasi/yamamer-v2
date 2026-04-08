import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText, Download, Search } from 'lucide-react'

const CATEGORIES = ['all', 'registration', 'grades', 'graduation', 'financial', 'general', 'internship']

export default function Forms() {
  const navigate = useNavigate()
  const [forms, setForms] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/chat/forms/')
      .then(r => r.json())
      .then(data => setForms(data.results || data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = forms.filter(f => {
    const matchCat = filter === 'all' || f.category === filter
    const matchSearch = !search || f.title.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="p-1 text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <FileText size={20} className="text-orange-500" />
        <h1 className="text-lg font-bold text-gray-900">University Forms</h1>
      </header>

      <div className="max-w-3xl mx-auto p-4">
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search forms..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="flex gap-1 flex-wrap">
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
        </div>

        {loading ? (
          <p className="text-center py-12 text-gray-400">Loading forms...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400 text-sm">No forms found.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filtered.map(form => (
              <div key={form.id} className="bg-white rounded-xl border p-4 flex items-center gap-4 hover:shadow-sm transition">
                <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                  <FileText size={20} className="text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{form.title}</p>
                  {form.description && <p className="text-xs text-gray-500 mt-0.5 truncate">{form.description}</p>}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 mt-1 inline-block capitalize">{form.category}</span>
                </div>
                {(form.file || form.file_url) && (
                  <a
                    href={form.file || form.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition"
                  >
                    <Download size={18} />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
