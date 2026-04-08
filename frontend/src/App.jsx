import { Routes, Route } from 'react-router-dom'
import Chat from './pages/Chat'
import Login from './pages/Login'
import Admin from './pages/Admin'
import Forms from './pages/Forms'
import Announcements from './pages/Announcements'
import Sitemap from './pages/Sitemap'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Chat />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/forms" element={<Forms />} />
      <Route path="/announcements" element={<Announcements />} />
      <Route path="/sitemap" element={<Sitemap />} />
    </Routes>
  )
}
