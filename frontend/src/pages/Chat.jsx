import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Bot, User, LogOut, Shield, FileText, Megaphone, Search } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { sendMessage } from '../lib/api'

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const messagesEndRef = useRef(null)
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setLoading(true)

    try {
      const data = await sendMessage(text, sessionId)
      setSessionId(data.session_id)
      setMessages(prev => [...prev, {
        role: 'bot',
        content: data.answer,
        source: data.source,
        score: data.similarity_score,
      }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'bot',
        content: 'Sorry, something went wrong. Please try again.',
        source: 'error',
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Yamamer" className="w-10 h-10" />
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">Yamamer</h1>
            <p className="text-xs text-gray-500">Al Yamamah University Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/sitemap')}
            className="p-2 text-gray-400 hover:text-orange-500 transition"
            title="University Directory"
          >
            <Search size={20} />
          </button>
          <button
            onClick={() => navigate('/forms')}
            className="p-2 text-gray-400 hover:text-orange-500 transition"
            title="University Forms"
          >
            <FileText size={20} />
          </button>
          <button
            onClick={() => navigate('/announcements')}
            className="p-2 text-gray-400 hover:text-orange-500 transition"
            title="Announcements"
          >
            <Megaphone size={20} />
          </button>
          {user && (
            <button
              onClick={() => navigate('/admin')}
              className="p-2 text-gray-400 hover:text-orange-500 transition"
              title="Admin Dashboard"
            >
              <Shield size={20} />
            </button>
          )}
          {user ? (
            <button
              onClick={() => signOut()}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 transition"
            >
              <LogOut size={16} /> Sign Out
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-1.5 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-20">
              <img src="/logo.png" alt="" className="w-16 h-16 mx-auto mb-4 opacity-60" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">How can I help you?</h2>
              <p className="text-gray-400 text-sm mb-6">Ask me anything about Al Yamamah University</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['Admission requirements?', 'How to register for courses?', 'Tuition fees?', 'Internship process?'].map(q => (
                  <button
                    key={q}
                    onClick={() => setInput(q)}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:border-orange-300 hover:text-orange-600 transition"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'bot' && (
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0 mt-1">
                  <Bot size={16} className="text-orange-600" />
                </div>
              )}
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-orange-500 text-white rounded-br-md'
                  : 'bg-white border border-gray-100 text-gray-700 rounded-bl-md shadow-sm'
              }`}>
                {msg.role === 'bot' ? (
                  <div className="prose prose-sm prose-gray max-w-none [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_h1]:text-base [&_h1]:font-semibold [&_h1]:mt-2 [&_h1]:mb-1 [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:mt-2 [&_h2]:mb-1 [&_h3]:text-sm [&_h3]:font-medium [&_h3]:mt-1 [&_h3]:mb-0.5 [&_strong]:text-gray-900">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : msg.content}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0 mt-1">
                  <User size={16} className="text-gray-600" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                <Bot size={16} className="text-orange-600" />
              </div>
              <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Loader2 size={14} className="animate-spin text-orange-500" />
                  Thinking...
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t px-4 py-3 shrink-0">
        <div className="max-w-2xl mx-auto flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask about Al Yamamah University..."
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition disabled:opacity-50 disabled:hover:bg-orange-500"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
