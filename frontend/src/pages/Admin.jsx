import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import {
  LayoutDashboard, BookOpen, MessageSquareWarning, FileText, Bell,
  Plus, Trash2, Pencil, X, Check, ChevronDown, Search, Filter,
  TrendingUp, Users, MessageSquare, Database, RefreshCw, Eye, EyeOff,
  AlertCircle, CheckCircle2, Clock, ArrowUpRight, LogOut, Settings, Menu
} from 'lucide-react'
import {
  getAdminStats, getChatActivity,
  getKnowledgeBase, createKBItem, updateKBItem, deleteKBItem,
  getMissingQuestions, updateMissingQuestion,
  getForms, createForm, updateForm, deleteForm,
  getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement,
} from '../lib/api'

// ── constants ───────────────────────────────────────────────
const TABS = [
  { id: 'overview',  icon: LayoutDashboard,       label: 'Overview'          },
  { id: 'kb',        icon: BookOpen,               label: 'Knowledge Base'    },
  { id: 'missing',   icon: MessageSquareWarning,   label: 'Missing Questions' },
  { id: 'forms',     icon: FileText,               label: 'Forms'             },
  { id: 'announcements', icon: Bell,               label: 'Announcements'     },
]

const KB_CATEGORIES   = ['general', 'registration', 'financial', 'graduation', 'internship', 'grades', 'faculty']
const FORM_CATEGORIES = ['general', 'registration', 'graduation', 'financial', 'internship', 'grades']
const ANN_CATEGORIES  = ['general', 'registrar', 'internship', 'exams']

const CAT_COLORS = {
  general: 'bg-slate-100 text-slate-600',
  registration: 'bg-blue-100 text-blue-700',
  financial: 'bg-green-100 text-green-700',
  graduation: 'bg-purple-100 text-purple-700',
  internship: 'bg-orange-100 text-orange-700',
  grades: 'bg-yellow-100 text-yellow-700',
  faculty: 'bg-pink-100 text-pink-700',
  academic: 'bg-indigo-100 text-indigo-700',
  events: 'bg-cyan-100 text-cyan-700',
  alerts: 'bg-red-100 text-red-700',
}

const PIE_COLORS = ['#7C3AED', '#06B6D4', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#EC4899']

// ── helpers ─────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color = 'violet', trend }) {
  const colors = {
    violet: 'bg-violet-50 text-violet-600 border-violet-100',
    cyan:   'bg-cyan-50   text-cyan-600   border-cyan-100',
    amber:  'bg-amber-50  text-amber-600  border-amber-100',
    green:  'bg-green-50  text-green-600  border-green-100',
    red:    'bg-red-50    text-red-600    border-red-100',
  }
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colors[color]}`}>
          <Icon size={18} />
        </div>
        {trend != null && (
          <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${trend >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            <ArrowUpRight size={11} className={trend < 0 ? 'rotate-180' : ''} />
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
      <p className="text-sm font-medium text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

function Badge({ text, cat }) {
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${CAT_COLORS[cat] || 'bg-gray-100 text-gray-600'}`}>
      {text}
    </span>
  )
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
            <AlertCircle size={18} className="text-red-500" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 mb-1">Confirm Delete</p>
            <p className="text-sm text-gray-500">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm font-medium bg-red-500 text-white hover:bg-red-600 rounded-xl transition-colors cursor-pointer">Delete</button>
        </div>
      </div>
    </div>
  )
}

function Input({ label, ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
      <input
        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
        {...props}
      />
    </div>
  )
}

function Textarea({ label, ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
      <textarea
        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all resize-none"
        rows={4}
        {...props}
      />
    </div>
  )
}

function Select({ label, options, ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
      <select
        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all bg-white cursor-pointer"
        {...props}
      >
        {options.map(o => (
          <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
        ))}
      </select>
    </div>
  )
}

function EmptyState({ icon: Icon, title, sub, action }) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">
        <Icon size={22} className="text-gray-300" />
      </div>
      <p className="font-medium text-gray-600 mb-1">{title}</p>
      <p className="text-sm text-gray-400 mb-4">{sub}</p>
      {action}
    </div>
  )
}

// ── Overview tab ─────────────────────────────────────────────
function Overview({ stats, activity }) {
  if (!stats) return <div className="p-8 text-center text-gray-400">Loading stats…</div>

  const { knowledge_base: kb, missing_questions: mq, chat, content } = stats

  // Build pie data from KB categories
  const pieData = (kb.by_category || []).map(c => ({ name: c.category, value: c.count }))

  // Build bar data from daily activity
  const barData = (() => {
    if (!activity?.daily_activity) return []
    const map = {}
    activity.daily_activity.forEach(({ date, is_bot, count }) => {
      if (!map[date]) map[date] = { date: date?.slice(5) || date, user: 0, bot: 0 }
      if (is_bot) map[date].bot += count
      else         map[date].user += count
    })
    return Object.values(map).slice(-14)
  })()

  // Source distribution pie
  const srcData = (chat.source_distribution || []).map(s => ({
    name: s.source === 'knowledge_base' ? 'KB' : s.source === 'llm' ? 'AI' : s.source,
    value: s.count,
  }))

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Database}      label="KB Articles"       value={kb.total}             sub={`${kb.active} active`}                color="violet" />
        <StatCard icon={MessageSquare} label="Total Messages"    value={chat.messages_total}  sub={`${chat.messages_week} this week`}    color="cyan"   />
        <StatCard icon={Users}         label="Chat Sessions"     value={chat.sessions_total}  sub={`${chat.sessions_week} this week`}    color="green"  />
        <StatCard icon={AlertCircle}   label="Pending Questions" value={mq.pending}           sub={`${mq.resolved} resolved`}            color="amber"  />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText}      label="Forms"             value={content.forms_total}     sub={`${content.forms_published} published`} color="violet" />
        <StatCard icon={Bell}          label="Announcements"     value={content.ann_total}        sub={`${content.ann_active} active`}         color="cyan"   />
        <StatCard icon={TrendingUp}    label="Avg Similarity"    value={chat.avg_similarity != null ? `${(chat.avg_similarity * 100).toFixed(0)}%` : '—'} sub="RAG match quality" color="green" />
        <StatCard icon={CheckCircle2}  label="Dismissed"         value={mq.dismissed}             sub="Closed questions"                        color="red"    />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Message Activity (last 14 days)</h3>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} barGap={2}>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #F3F4F6', fontSize: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                  cursor={{ fill: '#F5F3FF' }}
                />
                <Bar dataKey="user" name="User" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                <Bar dataKey="bot"  name="Bot"  fill="#06B6D4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-sm text-gray-400">No activity data yet</div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">KB by Category</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-sm text-gray-400">No data</div>
          )}
        </div>
      </div>

      {/* Source breakdown + top pending */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Response Source Distribution</h3>
          {srcData.length > 0 ? (
            <div className="space-y-3">
              {srcData.map((s, i) => {
                const total = srcData.reduce((a, x) => a + x.value, 0)
                const pct = total ? Math.round((s.value / total) * 100) : 0
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{s.name}</span>
                      <span className="text-gray-400">{s.value} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">No data yet</p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Top Unanswered Questions</h3>
          {(mq.top_pending || []).length > 0 ? (
            <div className="space-y-2">
              {(mq.top_pending || []).slice(0, 5).map(q => (
                <div key={q.id} className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
                  <span className="shrink-0 text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-lg">{q.frequency}×</span>
                  <p className="text-sm text-gray-700 leading-relaxed">{q.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">No pending questions</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Knowledge Base tab ────────────────────────────────────────
function KnowledgeBaseTab() {
  const [items, setItems]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [catFilter, setCat]     = useState('')
  const [modal, setModal]       = useState(null) // null | 'add' | 'edit'
  const [editItem, setEditItem] = useState(null)
  const [confirm, setConfirm]   = useState(null)
  const [form, setForm]         = useState({ question: '', answer: '', category: 'general' })
  const [saving, setSaving]     = useState(false)
  const [page, setPage]         = useState(1)
  const PER_PAGE = 10

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (catFilter) params.set('category', catFilter)
      const data = await getKnowledgeBase(params.toString() ? `?${params}` : '')
      setItems(data.results || data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [search, catFilter])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [search, catFilter])

  const openAdd = () => {
    setForm({ question: '', answer: '', category: 'general' })
    setEditItem(null)
    setModal('edit')
  }

  const openEdit = (item) => {
    setForm({ question: item.question, answer: item.answer, category: item.category })
    setEditItem(item)
    setModal('edit')
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editItem) await updateKBItem(editItem.id, form)
      else          await createKBItem(form)
      setModal(null)
      load()
    } catch (err) { alert(err.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    try { await deleteKBItem(id); load() }
    catch (err) { alert(err.message) }
    finally { setConfirm(null) }
  }

  const filtered = items
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const totalPages = Math.ceil(filtered.length / PER_PAGE)

  return (
    <div>
      {/* toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search questions…"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
          />
        </div>
        <select
          value={catFilter}
          onChange={e => setCat(e.target.value)}
          className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400 bg-white cursor-pointer"
        >
          <option value="">All categories</option>
          {KB_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition-colors cursor-pointer shadow-sm shadow-violet-200"
        >
          <Plus size={15} /> Add Item
        </button>
      </div>

      {/* count */}
      <p className="text-sm text-gray-500 mb-3">{filtered.length} items {catFilter ? `in "${catFilter}"` : ''}</p>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={BookOpen} title="No items found" sub="Try a different search or category" />
      ) : (
        <>
          <div className="space-y-2">
            {paged.map(item => (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-4 hover:border-violet-200 hover:shadow-sm transition-all">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <Badge text={item.category} cat={item.category} />
                      {!item.is_active && <span className="text-xs text-gray-400 italic">inactive</span>}
                    </div>
                    <p className="text-sm font-semibold text-gray-900 mb-1 leading-snug">{item.question}</p>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{item.answer}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openEdit(item)} className="p-2 rounded-lg text-gray-400 hover:bg-violet-50 hover:text-violet-600 transition-colors cursor-pointer">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setConfirm(item.id)} className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-5">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 cursor-pointer">←</button>
              <span className="text-sm text-gray-500">Page {page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 cursor-pointer">→</button>
            </div>
          )}
        </>
      )}

      {/* Add/Edit modal */}
      {modal === 'edit' && (
        <Modal title={editItem ? 'Edit KB Item' : 'Add KB Item'} onClose={() => setModal(null)}>
          <form onSubmit={handleSave} className="space-y-4">
            <Input label="Question" value={form.question} onChange={e => setForm({ ...form, question: e.target.value })} placeholder="What is…?" required />
            <Textarea label="Answer" value={form.answer} onChange={e => setForm({ ...form, answer: e.target.value })} placeholder="The answer…" required />
            <Select label="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
              options={KB_CATEGORIES.map(c => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))} />
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)}
                className="flex-1 py-2.5 border border-gray-200 text-sm font-medium text-gray-600 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">Cancel</button>
              <button type="submit" disabled={saving}
                className="flex-1 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 disabled:opacity-50 transition-colors cursor-pointer">
                {saving ? 'Saving…' : (editItem ? 'Update' : 'Add Item')}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {confirm && (
        <ConfirmModal
          message="This KB item will be permanently deleted."
          onConfirm={() => handleDelete(confirm)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}

// ── Missing Questions tab ─────────────────────────────────────
function MissingQuestionsTab() {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('pending')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getMissingQuestions(filter ? `?status=${filter}` : '')
      setItems(data.results || data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [filter])

  useEffect(() => { load() }, [load])

  const update = async (id, status) => {
    try { await updateMissingQuestion(id, { status }); load() }
    catch (err) { alert(err.message) }
  }

  return (
    <div>
      <div className="flex gap-2 mb-5">
        {['pending', 'resolved', 'dismissed', ''].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors cursor-pointer ${
              filter === s
                ? 'bg-violet-600 text-white shadow-sm shadow-violet-200'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-violet-300'
            }`}>
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : items.length === 0 ? (
        <EmptyState icon={MessageSquareWarning} title="No questions" sub="No missing questions in this category" />
      ) : (
        <div className="space-y-2">
          {items.map(q => (
            <div key={q.id} className={`bg-white rounded-2xl border p-4 ${
              q.status === 'pending' ? 'border-amber-100' : q.status === 'resolved' ? 'border-green-100' : 'border-gray-100'
            }`}>
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 leading-relaxed">{q.content}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={11} /> Asked {q.frequency}×
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      q.status === 'pending'  ? 'bg-amber-100 text-amber-700' :
                      q.status === 'resolved' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>{q.status}</span>
                  </div>
                </div>
                {q.status === 'pending' && (
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => update(q.id, 'resolved')}
                      className="p-2 rounded-lg text-gray-400 hover:bg-green-50 hover:text-green-600 transition-colors cursor-pointer" title="Mark resolved">
                      <Check size={14} />
                    </button>
                    <button onClick={() => update(q.id, 'dismissed')}
                      className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer" title="Dismiss">
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Forms tab ─────────────────────────────────────────────────
function FormsTab() {
  const [items, setItems]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [confirm, setConfirm]   = useState(null)
  const [form, setForm]         = useState({ title: '', description: '', file_url: '', category: 'general', status: 'published' })
  const [saving, setSaving]     = useState(false)

  const load = async () => {
    setLoading(true)
    try { const d = await getForms(''); setItems(d.results || d) }
    catch (e) { console.error(e) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const openAdd = () => { setForm({ title: '', description: '', file_url: '', category: 'general', status: 'published' }); setEditItem(null); setModal(true) }
  const openEdit = (item) => { setForm({ title: item.title, description: item.description || '', file_url: item.file_url || '', category: item.category, status: item.status }); setEditItem(item); setModal(true) }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editItem) await updateForm(editItem.id, form)
      else          await createForm(form)
      setModal(false); load()
    } catch (err) { alert(err.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    try { await deleteForm(id); load() } catch (err) { alert(err.message) }
    finally { setConfirm(null) }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <p className="text-sm text-gray-500">{items.length} forms</p>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition-colors cursor-pointer shadow-sm shadow-violet-200">
          <Plus size={15} /> Add Form
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : items.length === 0 ? (
        <EmptyState icon={FileText} title="No forms yet" sub="Add university forms for students to access" action={
          <button onClick={openAdd} className="px-4 py-2 bg-violet-600 text-white text-sm rounded-xl cursor-pointer hover:bg-violet-700">Add First Form</button>
        } />
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-4 hover:border-violet-200 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge text={item.category} cat={item.category} />
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {item.status}
                  </span>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg text-gray-400 hover:bg-violet-50 hover:text-violet-600 transition-colors cursor-pointer"><Pencil size={13} /></button>
                  <button onClick={() => setConfirm(item.id)} className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"><Trash2 size={13} /></button>
                </div>
              </div>
              <p className="font-semibold text-gray-900 text-sm mb-1">{item.title}</p>
              <p className="text-xs text-gray-500 line-clamp-2 mb-2">{item.description}</p>
              {(item.download_url || item.file_url) && (
                <a href={item.download_url || item.file_url} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-violet-600 hover:underline flex items-center gap-1 cursor-pointer">
                  <ArrowUpRight size={11} /> View / Download
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal title={editItem ? 'Edit Form' : 'Add Form'} onClose={() => setModal(false)}>
          <form onSubmit={handleSave} className="space-y-4">
            <Input label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Graduation Application Form" required />
            <Textarea label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief description…" />
            <Input label="Form URL (link to PDF/page)" value={form.file_url} onChange={e => setForm({ ...form, file_url: e.target.value })} placeholder="https://yu.edu.sa/…" type="url" />
            <div className="grid grid-cols-2 gap-3">
              <Select label="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                options={FORM_CATEGORIES.map(c => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))} />
              <Select label="Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                options={[{ value: 'published', label: 'Published' }, { value: 'draft', label: 'Draft' }]} />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModal(false)} className="flex-1 py-2.5 border border-gray-200 text-sm font-medium text-gray-600 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">Cancel</button>
              <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 disabled:opacity-50 transition-colors cursor-pointer">
                {saving ? 'Saving…' : (editItem ? 'Update' : 'Add Form')}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {confirm && <ConfirmModal message="This form will be permanently deleted." onConfirm={() => handleDelete(confirm)} onCancel={() => setConfirm(null)} />}
    </div>
  )
}

// ── Announcements tab ─────────────────────────────────────────
function AnnouncementsTab() {
  const [items, setItems]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [confirm, setConfirm]   = useState(null)
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm]         = useState({ title: '', content: '', category: 'general', is_active: true, start_date: today, end_date: '' })
  const [saving, setSaving]     = useState(false)

  const load = async () => {
    setLoading(true)
    try { const d = await getAnnouncements(''); setItems(d.results || d) }
    catch (e) { console.error(e) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const openAdd = () => { setForm({ title: '', content: '', category: 'general', is_active: true, start_date: today, end_date: '' }); setEditItem(null); setModal(true) }
  const openEdit = (item) => { setForm({ title: item.title, content: item.content, category: item.category, is_active: item.is_active, start_date: item.start_date || today, end_date: item.end_date || '' }); setEditItem(item); setModal(true) }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editItem) await updateAnnouncement(editItem.id, form)
      else          await createAnnouncement(form)
      setModal(false); load()
    } catch (err) { alert(err.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    try { await deleteAnnouncement(id); load() } catch (err) { alert(err.message) }
    finally { setConfirm(null) }
  }

  const toggleActive = async (item) => {
    try { await updateAnnouncement(item.id, { is_active: !item.is_active }); load() }
    catch (err) { alert(err.message) }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <p className="text-sm text-gray-500">{items.length} announcements</p>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition-colors cursor-pointer shadow-sm shadow-violet-200">
          <Plus size={15} /> Add Announcement
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : items.length === 0 ? (
        <EmptyState icon={Bell} title="No announcements" sub="Post announcements for students" action={
          <button onClick={openAdd} className="px-4 py-2 bg-violet-600 text-white text-sm rounded-xl cursor-pointer hover:bg-violet-700">Add First Announcement</button>
        } />
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className={`bg-white rounded-2xl border p-4 transition-all hover:shadow-sm ${item.is_active ? 'border-violet-100' : 'border-gray-100 opacity-60'}`}>
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <Badge text={item.category} cat={item.category} />
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900 text-sm mb-1">{item.title}</p>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{item.content}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => toggleActive(item)} title={item.is_active ? 'Deactivate' : 'Activate'}
                    className={`p-2 rounded-lg transition-colors cursor-pointer ${item.is_active ? 'text-green-500 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}>
                    {item.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button onClick={() => openEdit(item)} className="p-2 rounded-lg text-gray-400 hover:bg-violet-50 hover:text-violet-600 transition-colors cursor-pointer"><Pencil size={14} /></button>
                  <button onClick={() => setConfirm(item.id)} className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal title={editItem ? 'Edit Announcement' : 'New Announcement'} onClose={() => setModal(false)}>
          <form onSubmit={handleSave} className="space-y-4">
            <Input label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Registration deadline reminder" required />
            <Textarea label="Content" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Announcement details…" required />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Start Date" type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} required />
              <Input label="End Date (optional)" type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select label="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                options={ANN_CATEGORIES.map(c => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))} />
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500 cursor-pointer" />
                  Publish immediately
                </label>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModal(false)} className="flex-1 py-2.5 border border-gray-200 text-sm font-medium text-gray-600 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">Cancel</button>
              <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 disabled:opacity-50 transition-colors cursor-pointer">
                {saving ? 'Saving…' : (editItem ? 'Update' : 'Publish')}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {confirm && <ConfirmModal message="This announcement will be permanently deleted." onConfirm={() => handleDelete(confirm)} onCancel={() => setConfirm(null)} />}
    </div>
  )
}

// ── Main Admin component ──────────────────────────────────────
export default function Admin() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab]         = useState('overview')
  const [stats, setStats]     = useState(null)
  const [activity, setActivity] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    loadStats()
  }, [user])

  const loadStats = async () => {
    setRefreshing(true)
    try {
      const [s, a] = await Promise.all([getAdminStats(), getChatActivity()])
      setStats(s)
      setActivity(a)
    } catch (e) { console.error(e) }
    finally { setRefreshing(false) }
  }

  const activeTab = TABS.find(t => t.id === tab)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-60 bg-white border-r border-gray-100 flex flex-col transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        {/* Logo */}
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-gray-100">
          <img src="/logo.png" alt="Yamamer" className="h-7 w-7 object-contain" onError={e => e.target.style.display='none'} />
          <div>
            <p className="font-bold text-violet-900 text-sm leading-tight">Yamamer</p>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {TABS.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => { setTab(id); setSidebarOpen(false) }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer text-left ${
                tab === id
                  ? 'bg-violet-50 text-violet-700 shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>

        {/* User info */}
        <div className="border-t border-gray-100 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 text-xs font-bold">
              {user?.email?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">{user?.user_metadata?.full_name || 'Admin'}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('/')} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-gray-500 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
              <MessageSquare size={12} /> Chat
            </button>
            <button onClick={signOut} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-red-400 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
              <LogOut size={12} /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Sidebar overlay on mobile */}
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main content */}
      <div className="flex-1 lg:ml-60 min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 h-16 flex items-center gap-4 px-5">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 cursor-pointer">
            <Menu size={18} />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold text-gray-900">{activeTab?.label}</h1>
          </div>
          <button onClick={loadStats} disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50">
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </header>

        {/* Page content */}
        <main className="p-5 max-w-6xl">
          {tab === 'overview'       && <Overview stats={stats} activity={activity} />}
          {tab === 'kb'             && <KnowledgeBaseTab />}
          {tab === 'missing'        && <MissingQuestionsTab />}
          {tab === 'forms'          && <FormsTab />}
          {tab === 'announcements'  && <AnnouncementsTab />}
        </main>
      </div>
    </div>
  )
}
