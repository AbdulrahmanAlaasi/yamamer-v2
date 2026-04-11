import { useState, useEffect } from 'react'
import { getAnnouncements } from '../lib/api'
import { Bell, Calendar, Tag, Search, Megaphone, BookOpen, Star, ClipboardList } from 'lucide-react'

const CAT_META = {
  general:    { label: 'General',    color: 'bg-gray-100 text-gray-700 border-gray-200',      dot: 'bg-gray-400'   },
  registrar:  { label: 'Registrar',  color: 'bg-blue-100 text-blue-700 border-blue-200',      dot: 'bg-blue-500'   },
  internship: { label: 'Internship', color: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
  exams:      { label: 'Exams',      color: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-500' },
}

const ALL_CATS = ['all', ...Object.keys(CAT_META)]

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function AnnouncementCard({ ann }) {
  const meta = CAT_META[ann.category] || CAT_META.general
  const [expanded, setExpanded] = useState(false)
  const isLong = ann.content?.length > 200

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-violet-200 hover:shadow-sm transition-all duration-200">
      <div className="flex items-start gap-3">
        <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${meta.dot}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${meta.color}`}>
              {meta.label}
            </span>
            {ann.start_date && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Calendar size={11} />
                {formatDate(ann.start_date)}
                {ann.end_date && ` – ${formatDate(ann.end_date)}`}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-gray-900 mb-2 leading-snug">{ann.title}</h3>
          <p className={`text-sm text-gray-600 leading-relaxed ${!expanded && isLong ? 'line-clamp-3' : ''}`}>
            {ann.content}
          </p>
          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-2 text-xs font-medium text-violet-600 hover:text-violet-800 cursor-pointer transition-colors"
            >
              {expanded ? 'Show less ↑' : 'Read more ↓'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Announcements() {
  const [items, setItems]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [category, setCategory] = useState('all')

  useEffect(() => {
    getAnnouncements('')
      .then(data => setItems(data.results || data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = items.filter(a => {
    const matchCat  = category === 'all' || a.category === category
    const matchText = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.content?.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchText
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50/60 to-white pt-20 pb-12">
      <div className="max-w-3xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-600 shadow-lg shadow-violet-200 mb-4">
            <Bell size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-violet-900 mb-2">University News & Announcements</h1>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            Stay updated with the latest news, deadlines, and important notices from Al Yamamah University.
          </p>
        </div>

        {/* Search */}
        <div className="mb-5">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search announcements…"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
            />
          </div>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap mb-6">
          {ALL_CATS.map(cat => {
            const meta  = CAT_META[cat]
            const label = cat === 'all' ? 'All' : (meta?.label || cat)
            const count = cat === 'all' ? items.length : items.filter(a => a.category === cat).length
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  category === cat
                    ? 'bg-violet-600 text-white shadow-sm shadow-violet-200'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-violet-300'
                }`}
              >
                {label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${category === cat ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Items */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Bell size={32} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No announcements found</p>
            <p className="text-sm text-gray-400 mt-1">Check back later for updates</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(ann => <AnnouncementCard key={ann.id} ann={ann} />)}
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-10">
          For the latest news, also visit{' '}
          <a href="https://yu.edu.sa/en/" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline cursor-pointer">yu.edu.sa</a>.
        </p>
      </div>
    </div>
  )
}
