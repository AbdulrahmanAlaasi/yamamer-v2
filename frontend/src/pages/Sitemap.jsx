import { Link } from 'react-router-dom'
import {
  LayoutGrid, BookOpen, Users, GraduationCap, DollarSign, FileText, Bell,
  MessageSquare, Building2, Globe, Phone, Mail, MapPin, ExternalLink,
  ClipboardList, Star, Award, HelpCircle, Shield
} from 'lucide-react'

const DIRECTORY = [
  {
    title: 'Quick Links',
    icon: LayoutGrid,
    color: 'violet',
    links: [
      { label: 'Chat with Yamamer', to: '/', internal: true, icon: MessageSquare },
      { label: 'University Forms', to: '/forms', internal: true, icon: FileText },
      { label: 'Announcements & News', to: '/announcements', internal: true, icon: Bell },
      { label: 'EduGate Student Portal', href: 'https://edugate.yu.edu.sa', icon: Globe },
    ],
  },
  {
    title: 'Academics',
    icon: BookOpen,
    color: 'blue',
    links: [
      { label: 'Colleges & Programs', href: 'https://yu.edu.sa/en/academics/', icon: Building2 },
      { label: 'Course Catalog', href: 'https://yu.edu.sa/en/academics/course-catalog/', icon: BookOpen },
      { label: 'Academic Calendar', href: 'https://yu.edu.sa/en/academics/academic-calendar/', icon: ClipboardList },
      { label: 'Library', href: 'https://yu.edu.sa/en/library/', icon: BookOpen },
    ],
  },
  {
    title: 'Registration & Records',
    icon: ClipboardList,
    color: 'green',
    links: [
      { label: 'Registrar\'s Office', href: 'https://yu.edu.sa/en/registrar/', icon: Building2 },
      { label: 'Online Registration (EduGate)', href: 'https://edugate.yu.edu.sa', icon: Globe },
      { label: 'Transcript Request', href: 'https://yu.edu.sa/wp-content/uploads/2020/07/7-نموذج-طلب-سجل-أكاديمي-رسمي.pdf', icon: FileText },
      { label: 'Grade Appeal Form', href: 'https://yu.edu.sa/wp-content/uploads/2020/07/9-نموذج-الإعتراض-على-درجة.pdf', icon: Award },
    ],
  },
  {
    title: 'Financial Affairs',
    icon: DollarSign,
    color: 'emerald',
    links: [
      { label: 'Tuition & Fees', href: 'https://yu.edu.sa/en/financial-affairs/', icon: DollarSign },
      { label: 'SADAD Payment Guide', href: 'https://yu.edu.sa/wp-content/uploads/2020/07/خطوات-ومميزات-نظام-سداد.pdf', icon: FileText },
      { label: 'Refund Policy', href: 'https://yu.edu.sa/wp-content/uploads/2023/02/Refund-of-Tuition-and-Fees-Policy.pdf', icon: Shield },
      { label: 'Scholarships & Aid', href: 'https://yu.edu.sa/en/student-affairs/scholarships/', icon: Star },
    ],
  },
  {
    title: 'Student Affairs',
    icon: Users,
    color: 'purple',
    links: [
      { label: 'Student Affairs Office', href: 'https://yu.edu.sa/en/student-affairs/', icon: Building2 },
      { label: 'Co-op / Internship Portal', href: 'https://csc.yu.edu.sa/login', icon: Star },
      { label: 'Student Activities', href: 'https://yu.edu.sa/en/student-affairs/student-activities/', icon: Users },
      { label: 'Counseling Services', href: 'https://yu.edu.sa/en/student-affairs/', icon: HelpCircle },
    ],
  },
  {
    title: 'Graduation',
    icon: GraduationCap,
    color: 'amber',
    links: [
      { label: 'Graduation Requirements', href: 'https://yu.edu.sa/en/academics/', icon: GraduationCap },
      { label: 'Graduation Document Portal', href: 'https://edugate.yu.edu.sa/yu/init?service=graduationDocEn', icon: Globe },
      { label: 'Graduate Studies Policy', href: 'https://yu.edu.sa/wp-content/uploads/2024/04/%D9%84%D8%A7%D8%A6%D8%AD%D8%A9-%D8%A7%D9%84%D8%AF%D8%B1%D8%A7%D8%B3%D8%A7%D8%AA-%D8%A7%D9%84%D8%B9%D9%84%D9%8A%D8%A7-Last-Version-2024.pdf', icon: FileText },
      { label: 'Alumni Portal', href: 'https://yu.edu.sa/en/alumni/', icon: Users },
    ],
  },
  {
    title: 'Policies & Documents',
    icon: Shield,
    color: 'red',
    links: [
      { label: 'Examinations Policy', href: 'https://yu.edu.sa/wp-content/uploads/2023/06/Updated-Examinations-Policy-and-Procedures-V-3.0.pdf', icon: FileText },
      { label: 'Student Disciplinary Policy', href: 'https://yu.edu.sa/wp-content/uploads/2023/01/Students-Disciplinary-Policy-V-2.0.pdf', icon: Shield },
      { label: 'Grievances Policy', href: 'https://yu.edu.sa/wp-content/uploads/2025/05/Grievances-and-Complaints-Policy-V2.1.pdf', icon: FileText },
      { label: 'Academic Appeals Policy', href: 'https://yu.edu.sa/wp-content/uploads/2025/05/Policy-for-the-Academic-Appeal-Committee-V3.2.pdf', icon: Award },
    ],
  },
  {
    title: 'Contact & Location',
    icon: Phone,
    color: 'cyan',
    links: [
      { label: 'Contact Us Page', href: 'https://yu.edu.sa/en/contact/', icon: Phone },
      { label: 'Campus Map', href: 'https://goo.gl/maps/yamamah', icon: MapPin },
      { label: 'Reach the President', href: 'https://forms.yu.edu.sa/reach-the-president/', icon: Mail },
      { label: 'Main Website', href: 'https://yu.edu.sa/en/', icon: Globe },
    ],
  },
]

const COLOR_MAP = {
  violet:  'bg-violet-50 text-violet-700 border-violet-100',
  blue:    'bg-blue-50 text-blue-700 border-blue-100',
  green:   'bg-green-50 text-green-700 border-green-100',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  purple:  'bg-purple-50 text-purple-700 border-purple-100',
  amber:   'bg-amber-50 text-amber-700 border-amber-100',
  red:     'bg-red-50 text-red-700 border-red-100',
  cyan:    'bg-cyan-50 text-cyan-700 border-cyan-100',
}

function SectionCard({ section }) {
  const Icon    = section.icon
  const bgColor = COLOR_MAP[section.color] || COLOR_MAP.violet

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center gap-2.5 mb-4">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${bgColor}`}>
          <Icon size={16} />
        </div>
        <h2 className="font-bold text-gray-900 text-sm">{section.title}</h2>
      </div>
      <ul className="space-y-2">
        {section.links.map((link, i) => {
          const LinkIcon = link.icon || ExternalLink
          const content = (
            <span className="flex items-center gap-2.5 group">
              <LinkIcon size={13} className="text-gray-400 group-hover:text-violet-500 transition-colors shrink-0" />
              <span className="text-sm text-gray-700 group-hover:text-violet-700 transition-colors">{link.label}</span>
              {!link.internal && <ExternalLink size={10} className="text-gray-300 group-hover:text-violet-400 transition-colors ml-auto" />}
            </span>
          )
          if (link.internal) {
            return (
              <li key={i}>
                <Link to={link.to} className="block py-1.5 px-2 rounded-lg hover:bg-violet-50 transition-colors cursor-pointer">
                  {content}
                </Link>
              </li>
            )
          }
          return (
            <li key={i}>
              <a href={link.href} target="_blank" rel="noopener noreferrer"
                className="block py-1.5 px-2 rounded-lg hover:bg-violet-50 transition-colors cursor-pointer">
                {content}
              </a>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default function Sitemap() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50/60 to-white pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-600 shadow-lg shadow-violet-200 mb-4">
            <LayoutGrid size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-violet-900 mb-2">University Directory</h1>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            Quick access to all Al Yamamah University services, offices, portals, and resources.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DIRECTORY.map((section, i) => (
            <SectionCard key={i} section={section} />
          ))}
        </div>

        {/* Contact Info */}
        <div className="mt-8 bg-white rounded-2xl border border-violet-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Phone size={16} className="text-violet-600" />
            Contact Information
          </h3>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-2.5">
              <MapPin size={15} className="text-violet-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-gray-800">Address</p>
                <p className="text-gray-500">Yarmouk Dist., Riyadh 13541, Saudi Arabia</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Phone size={15} className="text-violet-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-gray-800">Phone</p>
                <p className="text-gray-500">+966 11 200 8500</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Mail size={15} className="text-violet-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-gray-800">Email</p>
                <p className="text-gray-500">info@yu.edu.sa</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Can't find what you need? Ask{' '}
          <Link to="/" className="text-violet-600 hover:underline cursor-pointer">Yamamer chatbot</Link>{' '}
          or visit{' '}
          <a href="https://yu.edu.sa/en/" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline cursor-pointer">yu.edu.sa</a>.
        </p>
      </div>
    </div>
  )
}
