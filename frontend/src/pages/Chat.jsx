import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { useAuth } from '../contexts/AuthContext'
import { sendMessage } from '../lib/api'
import {
  Send, Bot, FileText, Bell, LayoutGrid, Settings,
  LogIn, LogOut, Sparkles, BookOpen, Zap, MessageSquare, Globe
} from 'lucide-react'

const SUGGESTED = [
  'What are the tuition fees for engineering?',
  'How do I apply for graduation?',
  'What are the library hours?',
  'How do I register for courses?',
  'What financial aid is available?',
  'كيف أتواصل مع مكتب القبول؟',
]

const SOURCE_BADGE = {
  knowledge_base: { label: 'Knowledge Base', color: 'bg-violet-100 text-violet-700' },
  llm:            { label: 'AI Generated',   color: 'bg-cyan-100 text-cyan-700'    },
  fallback:       { label: 'Fallback',        color: 'bg-amber-100 text-amber-700'  },
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <span className="typing-dot w-2 h-2 rounded-full bg-violet-400 block" />
      <span className="typing-dot w-2 h-2 rounded-full bg-violet-400 block" />
      <span className="typing-dot w-2 h-2 rounded-full bg-violet-400 block" />
    </div>
  )
}

function ChatMessage({ msg }) {
  const badge = SOURCE_BADGE[msg.source]
  if (msg.isUser) {
    return (
      <div className="msg-appear flex justify-end mb-4">
        <div className="max-w-[75%] bg-violet-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
        </div>
      </div>
    )
  }
  return (
    <div className="msg-appear flex gap-3 mb-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
        <Bot size={16} className="text-violet-600" />
      </div>
      <div className="max-w-[80%]">
        <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
          <div className="prose prose-sm prose-violet max-w-none text-gray-800 text-sm leading-relaxed">
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        </div>
        {badge && (
          <span className={`mt-1.5 inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${badge.color}`}>
            <Sparkles size={10} />
            {badge.label}
            {msg.similarity != null && ` · ${(msg.similarity * 100).toFixed(0)}%`}
          </span>
        )}
      </div>
    </div>
  )
}

export default function Chat() {
  const { user, signOut } = useAuth()
  const [messages, setMessages]   = useState([])
  const [input, setInput]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [language, setLanguage]   = useState('en')
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function handleSend(text) {
    const query = (text || input).trim()
    if (!query || loading) return
    setInput('')
    setMessages(prev => [...prev, { isUser: true, content: query }])
    setLoading(true)
    try {
      const data = await sendMessage(query, sessionId, language)
      setSessionId(data.session_id)
      setMessages(prev => [...prev, {
        isUser: false,
        content: data.answer,
        source: data.source,
        similarity: data.similarity_score,
      }])
    } catch {
      setMessages(prev => [...prev, {
        isUser: false,
        content: 'Sorry, something went wrong. Please try again.',
        source: 'fallback',
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  function onKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <header className="flex-shrink-0 bg-white border-b border-violet-100 shadow-sm z-40">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Yamamer" className="h-8 w-8 object-contain" />
            <div>
              <span className="font-bold text-violet-900 text-base leading-none block">Yamamer</span>
              <span className="text-xs text-gray-400 leading-none">Al Yamamah University</span>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setLanguage(l => l === 'en' ? 'ar' : 'en')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer mr-1 ${
                language === 'ar'
                  ? 'bg-violet-600 text-white border-violet-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-violet-300 hover:text-violet-700'
              }`}
            >
              <Globe size={12} />
              {language === 'en' ? 'AR' : 'EN'}
            </button>
            <Link to="/forms" title="Forms" className="p-2 rounded-lg text-gray-400 hover:bg-violet-50 hover:text-violet-600 transition-colors cursor-pointer">
              <FileText size={17} />
            </Link>
            <Link to="/announcements" title="News" className="p-2 rounded-lg text-gray-400 hover:bg-violet-50 hover:text-violet-600 transition-colors cursor-pointer">
              <Bell size={17} />
            </Link>
            <Link to="/sitemap" title="Directory" className="p-2 rounded-lg text-gray-400 hover:bg-violet-50 hover:text-violet-600 transition-colors cursor-pointer">
              <LayoutGrid size={17} />
            </Link>
            {user ? (
              <>
                <Link to="/admin" title="Admin" className="p-2 rounded-lg text-gray-400 hover:bg-violet-50 hover:text-violet-600 transition-colors cursor-pointer">
                  <Settings size={17} />
                </Link>
                <button onClick={signOut} title="Sign Out" className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer">
                  <LogOut size={17} />
                </button>
              </>
            ) : (
              <Link to="/login" className="flex items-center gap-1.5 ml-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 transition-colors cursor-pointer">
                <LogIn size={13} />
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="w-16 h-16 rounded-2xl bg-violet-600 flex items-center justify-center mb-5 shadow-lg shadow-violet-200">
                <Bot size={30} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-violet-900 mb-2">How can I help you?</h1>
              <p className="text-gray-500 text-sm mb-8 max-w-xs">
                Ask me anything about Al Yamamah University — registration, grades, financial aid, policies, and more.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {[
                  { icon: BookOpen, label: '46+ KB Articles' },
                  { icon: Zap, label: 'Instant Answers' },
                  { icon: MessageSquare, label: 'EN & AR Support' },
                ].map(({ icon: Icon, label }) => (
                  <span key={label} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-violet-100 rounded-full text-xs font-medium text-violet-700 shadow-sm">
                    <Icon size={12} />
                    {label}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-xl">
                {SUGGESTED.map(q => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="text-left px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:border-violet-400 hover:bg-violet-50 hover:text-violet-800 transition-all duration-150 cursor-pointer shadow-sm"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg, i) => <ChatMessage key={i} msg={msg} />)}
          {loading && (
            <div className="msg-appear flex gap-3 mb-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                <Bot size={16} className="text-violet-600" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm shadow-sm">
                <TypingDots />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </main>

      <footer className="flex-shrink-0 bg-white border-t border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-end gap-2 bg-white border border-gray-300 rounded-2xl shadow-sm focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100 transition-all">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              rows={1}
              placeholder={language === 'ar' ? 'اكتب سؤالك هنا…' : 'Ask about Al Yamamah University…'}
              dir={language === 'ar' ? 'rtl' : 'ltr'}
              className="flex-1 px-4 py-3 bg-transparent text-sm text-gray-800 placeholder-gray-400 resize-none outline-none leading-relaxed"
              style={{ maxHeight: '120px', overflowY: 'auto' }}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="m-2 p-2.5 rounded-xl bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer flex-shrink-0"
            >
              <Send size={16} />
            </button>
          </div>
          <p className="text-center text-xs text-gray-400 mt-2">
            Yamamer may make mistakes. Verify important information with university offices.
          </p>
        </div>
      </footer>
    </div>
  )
}
