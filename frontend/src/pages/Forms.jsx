import { useState, useEffect } from 'react'
import { getForms } from '../lib/api'
import {
  FileText, Download, ExternalLink, Search,
  BookOpen, GraduationCap, DollarSign, ClipboardList, Award, Star
} from 'lucide-react'

const CATEGORY_META = {
  registration: { label: 'Registration',   icon: ClipboardList, color: 'bg-blue-50 text-blue-700 border-blue-100'    },
  graduation:   { label: 'Graduation',      icon: GraduationCap, color: 'bg-purple-50 text-purple-700 border-purple-100' },
  financial:    { label: 'Financial',       icon: DollarSign,    color: 'bg-green-50 text-green-700 border-green-100'  },
  internship:   { label: 'Internship/COOP', icon: Star,          color: 'bg-orange-50 text-orange-700 border-orange-100' },
  grades:       { label: 'Grades & Exams',  icon: Award,         color: 'bg-yellow-50 text-yellow-700 border-yellow-100' },
  general:      { label: 'General',         icon: BookOpen,      color: 'bg-gray-50 text-gray-700 border-gray-100'     },
}

const ALL_CATS = ['all', ...Object.keys(CATEGORY_META)]

function FormCard({ form }) {
  const meta  = CATEGORY_META[form.category] || CATEGORY_META.general
  const Icon  = meta.icon
  const link  = form.download_url || form.file_url || null
  const isPdf = link?.toLowerCase().endsWith('.pdf')

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 p-5 hover:border-violet-200 hover:shadow-md transition-all duration-200 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${meta.color} shrink-0`}>
          <Icon size={17} />
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${meta.color}`}>
          {meta.label}
        </span>
      </div>

      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1.5">{form.title}</h3>
        {form.description && (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{form.description}</p>
        )}
      </div>

      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-2.5 px-4 bg-violet-600 text-white text-xs font-semibold rounded-xl hover:bg-violet-700 transition-colors cursor-pointer group-hover:shadow-sm group-hover:shadow-violet-200"
        >
          {isPdf ? <Download size={13} /> : <ExternalLink size={13} />}
          {isPdf ? 'Download PDF' : 'Open Form'}
        </a>
      ) : (
        <div className="py-2.5 px-4 bg-gray-50 text-gray-400 text-xs rounded-xl text-center">
          Contact Registrar's Office
        </div>
      )}
    </div>
  )
}

export default function Forms() {
  const [forms, setForms]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [category, setCategory] = useState('all')

  useEffect(() => {
    getForms('')
      .then(data => setForms(data.results || data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = forms.filter(f => {
    const matchCat  = category === 'all' || f.category === category
    const matchText = !search || f.title.toLowerCase().includes(search.toLowerCase()) || f.description?.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchText
  })

  // Group by category for display when showing all
  const grouped = Object.keys(CATEGORY_META).reduce((acc, cat) => {
    const items = filtered.filter(f => f.category === cat)
    if (items.length) acc[cat] = items
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50/60 to-white pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-600 shadow-lg shadow-violet-200 mb-4">
            <FileText size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-violet-900 mb-2">University Forms & Documents</h1>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Download or access official forms, policy documents, and portals for all university services.
          </p>
        </div>

        {/* Search */}
        <div className="mb-5">
          <div className="relative max-w-lg mx-auto">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search forms and policies…"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
            />
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap mb-6 justify-center">
          {ALL_CATS.map(cat => {
            const meta  = CATEGORY_META[cat]
            const label = cat === 'all' ? 'All Forms' : (meta?.label || cat)
            const count = cat === 'all' ? forms.length : forms.filter(f => f.category === cat).length
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  category === cat
                    ? 'bg-violet-600 text-white shadow-sm shadow-violet-200'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-violet-300 hover:text-violet-700'
                }`}
              >
                {label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${category === cat ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-44 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <FileText size={32} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No forms found</p>
            <p className="text-sm text-gray-400">Try a different search term or category</p>
          </div>
        ) : category !== 'all' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(form => <FormCard key={form.id} form={form} />)}
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([cat, items]) => {
              const meta = CATEGORY_META[cat]
              const Icon = meta?.icon || BookOpen
              return (
                <div key={cat}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${meta?.color}`}>
                      <Icon size={14} />
                    </div>
                    <h2 className="font-bold text-gray-800 text-sm">{meta?.label || cat}</h2>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{items.length}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map(form => <FormCard key={form.id} form={form} />)}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-10">
          For forms not listed here, visit{' '}
          <a href="https://yu.edu.sa/resources/forms/" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline cursor-pointer">yu.edu.sa/resources/forms</a>{' '}
          or contact the Registrar's Office.
        </p>
      </div>
    </div>
  )
}
