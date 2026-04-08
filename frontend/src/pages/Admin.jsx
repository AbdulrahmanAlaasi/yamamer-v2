import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, MessageSquareWarning, BookOpen } from 'lucide-react'
import { getKnowledgeBase, createKBItem, deleteKBItem, getMissingQuestions } from '../lib/api'

const CATEGORIES = ['registration', 'grades', 'graduation', 'financial', 'general', 'internship']

export default function Admin() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('kb')
  const [kbItems, setKbItems] = useState([])
  const [missingQs, setMissingQs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ question: '', answer: '', category: 'general' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    loadData()
  }, [user])

  const loadData = async () => {
    setLoading(true)
    try {
      const [kb, mq] = await Promise.all([getKnowledgeBase(), getMissingQuestions()])
      setKbItems(kb.results || kb)
      setMissingQs(mq.results || mq)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await createKBItem(form)
      setForm({ question: '', answer: '', category: 'general' })
      setShowForm(false)
      await loadData()
    } catch (err) {
      alert('Failed to create item: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this KB item?')) return
    try {
      await deleteKBItem(id)
      await loadData()
    } catch (err) {
      alert('Failed to delete: ' + err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="p-1 text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Admin Dashboard</h1>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b px-4 flex gap-1">
        <button
          onClick={() => setTab('kb')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${tab === 'kb' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <BookOpen size={16} /> Knowledge Base
        </button>
        <button
          onClick={() => setTab('missing')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${tab === 'missing' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <MessageSquareWarning size={16} /> Missing Questions
          {missingQs.length > 0 && (
            <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">{missingQs.length}</span>
          )}
        </button>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : tab === 'kb' ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-500">{kbItems.length} items in knowledge base</p>
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-1 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition"
              >
                <Plus size={16} /> Add Item
              </button>
            </div>

            {showForm && (
              <form onSubmit={handleCreate} className="bg-white rounded-xl border p-4 mb-4 space-y-3">
                <input
                  type="text"
                  placeholder="Question"
                  value={form.question}
                  onChange={e => setForm({ ...form, question: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
                <textarea
                  placeholder="Answer"
                  value={form.answer}
                  onChange={e => setForm({ ...form, answer: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 h-24 resize-none"
                  required
                />
                <div className="flex gap-3">
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {kbItems.map(item => (
                <div key={item.id} className="bg-white rounded-xl border p-4 flex gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium">{item.category}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 truncate">{item.question}</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.answer}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-gray-300 hover:text-red-500 transition shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {kbItems.length === 0 && <p className="text-center py-8 text-gray-400 text-sm">No items yet. Add your first knowledge base entry!</p>}
            </div>
          </>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-gray-500 mb-4">{missingQs.length} unanswered questions</p>
            {missingQs.map(q => (
              <div key={q.id} className="bg-white rounded-xl border p-4">
                <p className="text-sm text-gray-900">{q.content}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-gray-400">Asked {q.frequency}x</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${q.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                    {q.status}
                  </span>
                </div>
              </div>
            ))}
            {missingQs.length === 0 && <p className="text-center py-8 text-gray-400 text-sm">No missing questions yet!</p>}
          </div>
        )}
      </div>
    </div>
  )
}
