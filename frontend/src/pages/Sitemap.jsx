import { useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, Users, Info, FileText, GraduationCap, Building2, Globe, Heart, Search, HelpCircle, Megaphone } from 'lucide-react'

const SECTIONS = [
  {
    title: 'Academics',
    icon: <BookOpen className="text-blue-500" />,
    links: [
      { name: 'College of Business Administration', url: 'https://yu.edu.sa/academics/cob/' },
      { name: 'College of Engineering & Architecture', url: 'https://yu.edu.sa/academics/coea/' },
      { name: 'College of Law', url: 'https://yu.edu.sa/academics/law/' },
      { name: 'Graduate Programs', url: 'https://yu.edu.sa/academics/graduate-studies/' },
      { name: 'English Language Program', url: 'https://yu.edu.sa/academics/interlink/' },
    ]
  },
  {
    title: 'Admissions',
    icon: <GraduationCap className="text-orange-500" />,
    links: [
      { name: 'How to Apply', url: 'https://yu.edu.sa/admission/how-to-apply/' },
      { name: 'Undergraduate Admission', url: 'https://yu.edu.sa/admission/undergraduate/' },
      { name: 'Postgraduate Admission', url: 'https://yu.edu.sa/admission/postgraduate/' },
      { name: 'Tuition & Fees', url: 'https://yu.edu.sa/admission/tuition-fees/' },
      { name: 'Online Application Portal', url: 'https://edugate.yu.edu.sa/yu/init?service=applicationOnlineEn' },
    ]
  },
  {
    title: 'Student Life',
    icon: <Users className="text-purple-500" />,
    links: [
      { name: 'Student Clubs', url: 'https://yu.edu.sa/student-life/student-clubs/' },
      { name: 'Counseling & Advising', url: 'https://yu.edu.sa/student-life/counseling-advising/' },
      { name: 'Career Services', url: 'https://yu.edu.sa/student-life/career-services/' },
      { name: 'Sports & Recreation', url: 'https://yu.edu.sa/student-life/sports-recreation/' },
    ]
  },
  {
    title: 'Resources',
    icon: <FileText className="text-emerald-500" />,
    links: [
      { name: 'University Forms', path: '/forms' },
      { name: 'Announcements', path: '/announcements' },
      { name: 'The Library', url: 'https://library.yu.edu.sa/' },
      { name: 'Co-op Hub', url: 'https://coophub.yu.edu.sa/' },
    ]
  },
  {
    title: 'About YU',
    icon: <Building2 className="text-gray-500" />,
    links: [
      { name: 'Mission & Vision', url: 'https://yu.edu.sa/about/mission-vision/' },
      { name: 'Rector\'s Message', url: 'https://yu.edu.sa/about/rectors-message/' },
      { name: 'Campus Map', url: 'https://yu.edu.sa/about/campus-map/' },
      { name: 'Accreditation', url: 'https://yu.edu.sa/about/accreditation/' },
    ]
  },
  {
    title: 'Global Engagement',
    icon: <Globe className="text-cyan-500" />,
    links: [
      { name: 'Global Engagement Office', url: 'https://yu.edu.sa/global-engagement-office/' },
      { name: 'International Partners', url: 'https://yu.edu.sa/about/international-partners/' },
    ]
  }
]

export default function Sitemap() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate('/')} className="p-1 text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <Search size={20} className="text-orange-500" />
        <h1 className="text-lg font-bold text-gray-900">University Directory</h1>
      </header>

      <div className="max-w-5xl mx-auto p-6">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Explore Al Yamamah University</h2>
          <p className="text-gray-500">Quick access to all university resources and services</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SECTIONS.map((section, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition group">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gray-50 rounded-xl group-hover:scale-110 transition">
                  {section.icon}
                </div>
                <h3 className="font-bold text-gray-900">{section.title}</h3>
              </div>
              <ul className="space-y-2">
                {section.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    {link.path ? (
                      <button
                        onClick={() => navigate(link.path)}
                        className="text-sm text-gray-600 hover:text-orange-600 flex items-center gap-2 w-full text-left transition"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-200 group-hover/link:bg-orange-400" />
                        {link.name}
                      </button>
                    ) : (
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-600 hover:text-orange-600 flex items-center gap-2 transition group/link"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-200 group-hover/link:bg-orange-400" />
                        {link.name}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-orange-50 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-6 border border-orange-100">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
            <HelpCircle size={32} className="text-orange-500" />
          </div>
          <div className="text-center md:text-left">
            <h4 className="text-lg font-bold text-gray-900 mb-1">Need help finding something?</h4>
            <p className="text-sm text-gray-600">You can always ask Yamamer AI on the home screen for specific information or procedures.</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition ml-auto"
          >
            Go to Chat
          </button>
        </div>
      </div>
    </div>
  )
}
