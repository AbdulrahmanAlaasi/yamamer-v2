import { supabase } from './supabase'

const API_BASE = '/api'

async function getHeaders() {
  const { data: { session } } = await supabase.auth.getSession()
  const headers = { 'Content-Type': 'application/json' }
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
  }
  return headers
}

export async function sendMessage(message, sessionId = null, language = 'en') {
  const headers = await getHeaders()
  const res = await fetch(`${API_BASE}/chat/`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ message, session_id: sessionId, language }),
  })
  if (!res.ok) throw new Error('Failed to send message')
  return res.json()
}

export async function getKnowledgeBase() {
  const headers = await getHeaders()
  const res = await fetch(`${API_BASE}/chat/knowledge-base/`, { headers })
  if (!res.ok) throw new Error('Failed to fetch KB')
  return res.json()
}

export async function createKBItem(data) {
  const headers = await getHeaders()
  const res = await fetch(`${API_BASE}/chat/knowledge-base/`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create KB item')
  return res.json()
}

export async function deleteKBItem(id) {
  const headers = await getHeaders()
  const res = await fetch(`${API_BASE}/chat/knowledge-base/${id}/`, {
    method: 'DELETE',
    headers,
  })
  if (!res.ok) throw new Error('Failed to delete KB item')
}

export async function getMissingQuestions() {
  const headers = await getHeaders()
  const res = await fetch(`${API_BASE}/chat/missing-questions/`, { headers })
  if (!res.ok) throw new Error('Failed to fetch missing questions')
  return res.json()
}
