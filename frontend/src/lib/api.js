import { supabase } from './supabase'

const API_BASE = '/api'

function getHeaders() {
  // Read the Supabase session synchronously from localStorage to avoid
  // blocking on supabase.auth.getSession() when the project is paused.
  const headers = { 'Content-Type': 'application/json' }
  try {
    const raw = localStorage.getItem('sb-quxdrwovgeoajezveiok-auth-token')
    if (raw) {
      const session = JSON.parse(raw)
      const token = session?.access_token
      const exp   = session?.expires_at
      if (token && (!exp || exp * 1000 > Date.now())) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }
  } catch {
    // No valid session — public endpoints will still work
  }
  return headers
}

// ── Chat ──────────────────────────────────────────────────
export async function sendMessage(message, sessionId = null, language = 'en') {
  const headers = getHeaders()
  const res = await fetch(`${API_BASE}/chat/`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ message, session_id: sessionId, language }),
  })
  if (!res.ok) throw new Error('Failed to send message')
  return res.json()
}

export async function getSessions() {
  const headers = getHeaders()
  const res = await fetch(`${API_BASE}/chat/sessions/`, { headers })
  if (!res.ok) throw new Error('Failed to fetch sessions')
  return res.json()
}

// ── Knowledge Base ────────────────────────────────────────
export async function getKnowledgeBase(params = '') {
  const headers = getHeaders()
  // If no explicit page_size, request a large page to avoid pagination in admin
  const sep = params.includes('?') ? '&' : '?'
  const url = params ? `${API_BASE}/chat/knowledge-base/${params}${sep}page_size=500` : `${API_BASE}/chat/knowledge-base/?page_size=500`
  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error('Failed to fetch KB')
  return res.json()
}

export async function createKBItem(data) {
  const headers = getHeaders()
  const res = await fetch(`${API_BASE}/chat/knowledge-base/`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create KB item')
  return res.json()
}

export async function updateKBItem(id, data) {
  const headers = getHeaders()
  const res = await fetch(`${API_BASE}/chat/knowledge-base/${id}/`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update KB item')
  return res.json()
}

export async function deleteKBItem(id) {
  const headers = getHeaders()
  const res = await fetch(`${API_BASE}/chat/knowledge-base/${id}/`, {
    method: 'DELETE',
    headers,
  })
  if (!res.ok) throw new Error('Failed to delete KB item')
}

// ── Missing Questions ─────────────────────────────────────
export async function getMissingQuestions(params = '') {
  const headers = getHeaders()
  const sep = params.includes('?') ? '&' : '?'
  const url = `${API_BASE}/chat/missing-questions/${params}${sep}page_size=200`
  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error('Failed to fetch missing questions')
  return res.json()
}

export async function updateMissingQuestion(id, data) {
  const headers = getHeaders()
  const res = await fetch(`${API_BASE}/chat/missing-questions/${id}/`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update missing question')
  return res.json()
}

// ── Forms ─────────────────────────────────────────────────
export async function getForms(params = '') {
  const headers = getHeaders()
  const sep = params.includes('?') ? '&' : '?'
  const url = `${API_BASE}/chat/forms/${params}${sep}page_size=200`
  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error('Failed to fetch forms')
  return res.json()
}

export async function createForm(data) {
  const headers = getHeaders()
  const res = await fetch(`${API_BASE}/chat/forms/`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create form')
  return res.json()
}

export async function updateForm(id, data) {
  const headers = getHeaders()
  const res = await fetch(`${API_BASE}/chat/forms/${id}/`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update form')
  return res.json()
}

export async function deleteForm(id) {
  const headers = getHeaders()
  const res = await fetch(`${API_BASE}/chat/forms/${id}/`, {
    method: 'DELETE',
    headers,
  })
  if (!res.ok) throw new Error('Failed to delete form')
}

// ── Admin Dashboard ──────────────────────────────────────
export async function getAdminStats() {
  const headers = getHeaders()
  const res = await fetch(`${API_BASE}/admin/stats/`, { headers })
  if (!res.ok) throw new Error('Failed to fetch admin stats')
  return res.json()
}

export async function getChatActivity() {
  const headers = getHeaders()
  const res = await fetch(`${API_BASE}/admin/chat-activity/`, { headers })
  if (!res.ok) throw new Error('Failed to fetch chat activity')
  return res.json()
}

// ── Analytics ─────────────────────────────────────────────
export async function getAnalyticsOverview(days = 30) {
  const headers = getHeaders()
  const res = await fetch(`${API_BASE}/analytics/?days=${days}`, { headers })
  if (!res.ok) throw new Error('Failed to fetch analytics')
  return res.json()
}

// ── Announcements ─────────────────────────────────────────
export async function getAnnouncements(params = '') {
  const headers = getHeaders()
  const sep = params.includes('?') ? '&' : '?'
  const url = `${API_BASE}/chat/announcements/${params}${sep}page_size=200`
  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error('Failed to fetch announcements')
  return res.json()
}

export async function createAnnouncement(data) {
  const headers = getHeaders()
  const res = await fetch(`${API_BASE}/chat/announcements/`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create announcement')
  return res.json()
}

export async function updateAnnouncement(id, data) {
  const headers = getHeaders()
  const res = await fetch(`${API_BASE}/chat/announcements/${id}/`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update announcement')
  return res.json()
}

export async function deleteAnnouncement(id) {
  const headers = getHeaders()
  const res = await fetch(`${API_BASE}/chat/announcements/${id}/`, {
    method: 'DELETE',
    headers,
  })
  if (!res.ok) throw new Error('Failed to delete announcement')
}
