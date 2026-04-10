import { Routes, Route, useLocation } from 'react-router-dom'
import Chat from './pages/Chat'
import Login from './pages/Login'
import Admin from './pages/Admin'
import Forms from './pages/Forms'
import Announcements from './pages/Announcements'
import Sitemap from './pages/Sitemap'
import Navbar from './components/Navbar'

export default function App() {
  const location = useLocation()
  // Chat page manages its own full-screen layout; other pages use the shared navbar
  const hideNavbar = location.pathname === '/'

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/"              element={<Chat />}          />
        <Route path="/login"         element={<Login />}         />
        <Route path="/admin"         element={<Admin />}         />
        <Route path="/forms"         element={<Forms />}         />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/sitemap"       element={<Sitemap />}       />
      </Routes>
    </>
  )
}
