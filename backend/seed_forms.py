"""Seed university forms and announcements with real YU data."""
import os
import sys
import django

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yamamer_project.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from datetime import date
from apps.chatbot.models import UniversityForm, Announcement

# ── Clear existing ────────────────────────────────────────────
UniversityForm.objects.all().delete()
Announcement.objects.all().delete()
print("Cleared existing forms and announcements.")

# ── Forms ─────────────────────────────────────────────────────
FORMS = [
    {
        "title": "Course Registration Form",
        "description": "Used by students to register for courses each semester through the registrar's office.",
        "category": "registration",
        "file_url": "https://yu.edu.sa/wp-content/uploads/2020/07/1-نموذج-تسجيل-المقررات.pdf",
    },
    {
        "title": "Add/Drop Course Form",
        "description": "Allows students to add or drop courses during the designated add/drop period.",
        "category": "registration",
        "file_url": "https://yu.edu.sa/wp-content/uploads/2020/07/2-نموذج-حذف-و-إضافة-المقررات.pdf",
    },
    {
        "title": "Course Withdrawal Form",
        "description": "Submitted by students who wish to withdraw from a course after the penalty-free period.",
        "category": "registration",
        "file_url": "https://yu.edu.sa/wp-content/uploads/2020/07/3-نموذج-الإعتذار-عن-مقرر.pdf",
    },
    {
        "title": "Semester Drop Form",
        "description": "Allows a student to withdraw from an entire semester for academic or personal reasons.",
        "category": "registration",
        "file_url": "https://yu.edu.sa/wp-content/uploads/2020/07/6-نموذج-الإعتذار-عن-فصل-دراسي.pdf",
    },
    {
        "title": "Official Transcript Request Form",
        "description": "Used by students to request an official copy of their academic transcript.",
        "category": "graduation",
        "file_url": "https://yu.edu.sa/wp-content/uploads/2020/07/7-نموذج-طلب-سجل-أكاديمي-رسمي.pdf",
    },
    {
        "title": "Final Withdrawal Form",
        "description": "Submitted by students who wish to permanently withdraw from Al Yamamah University.",
        "category": "registration",
        "file_url": "https://yu.edu.sa/wp-content/uploads/2020/07/8-نموذج-الإنسحاب-النهائي-من-الجامعة.pdf",
    },
    {
        "title": "Grade Appeal Request Form",
        "description": "Enables students to formally contest a grade received in a course.",
        "category": "grades",
        "file_url": "https://yu.edu.sa/wp-content/uploads/2020/07/9-نموذج-الإعتراض-على-درجة.pdf",
    },
    {
        "title": "Postponement / Deferral Form",
        "description": "Allows students to defer their enrollment to a future semester.",
        "category": "registration",
        "file_url": "https://yu.edu.sa/wp-content/uploads/2022/06/Postponement-Form-20202.pdf",
    },
    {
        "title": "Change Major Form",
        "description": "Used by students requesting a transfer from one academic major to another.",
        "category": "registration",
        "file_url": "https://yu.edu.sa/wp-content/uploads/2025/08/Change-Major-Form.pdf",
    },
    {
        "title": "Online Registration Manual",
        "description": "Step-by-step guide for students on how to complete online course registration via EduGate.",
        "category": "registration",
        "file_url": "https://yu.edu.sa/wp-content/uploads/2020/07/How-to-Register-Online.pdf",
    },
    {
        "title": "SADAD Payment Guide",
        "description": "Explains the steps and features of paying tuition fees through the SADAD online payment system.",
        "category": "financial",
        "file_url": "https://yu.edu.sa/wp-content/uploads/2020/07/خطوات-ومميزات-نظام-سداد.pdf",
    },
    {
        "title": "Reach the President Form",
        "description": "Online form allowing students and staff to submit messages or concerns directly to the university president.",
        "category": "general",
        "file_url": "https://forms.yu.edu.sa/reach-the-president/",
    },
    {
        "title": "Graduation Document Verification Portal",
        "description": "Online portal to verify and request official graduation documents and degree certificates.",
        "category": "graduation",
        "file_url": "https://edugate.yu.edu.sa/yu/init?service=graduationDocEn",
    },
    {
        "title": "Co-op Registration Portal",
        "description": "Online portal for students to register and manage their cooperative education (internship) placements.",
        "category": "internship",
        "file_url": "https://csc.yu.edu.sa/login",
    },
    {
        "title": "Withdrawal and Refund of Tuition Fees Policy",
        "description": "Official policy outlining conditions and procedures for tuition fee refunds upon withdrawal.",
        "category": "financial",
        "file_url": "https://yu.edu.sa/wp-content/uploads/2024/12/Withdrawal-and-Refund-of-Tuition-Fees-Policy-v.2.2-12252024.pdf",
    },
    {
        "title": "Refund of Tuition and Fees Policy",
        "description": "Official policy specifying the conditions under which students are eligible for a tuition fee refund.",
        "category": "financial",
        "file_url": "https://yu.edu.sa/wp-content/uploads/2023/02/Refund-of-Tuition-and-Fees-Policy.pdf",
    },
    {
        "title": "Cooperative Education (COOP) Policy",
        "description": "Detailed policy governing the requirements, process, and evaluation of student co-op/internship placements.",
        "category": "internship",
        "file_url": "https://yu.edu.sa/wp-content/uploads/2024/04/Cooperative-Education-Program-COOP-%E2%80%93-V-5.0.pdf",
    },
    {
        "title": "Grievances and Complaints Policy",
        "description": "Outlines the formal process for students and staff to submit grievances or complaints to the university.",
        "category": "general",
        "file_url": "https://yu.edu.sa/wp-content/uploads/2025/05/Grievances-and-Complaints-Policy-V2.1.pdf",
    },
    {
        "title": "Examinations Policy and Procedures",
        "description": "Defines the rules, procedures, and student responsibilities for all examinations at the university.",
        "category": "grades",
        "file_url": "https://yu.edu.sa/wp-content/uploads/2023/06/Updated-Examinations-Policy-and-Procedures-V-3.0.pdf",
    },
    {
        "title": "Student Disciplinary Policy",
        "description": "Sets out the code of conduct and disciplinary procedures applicable to all enrolled students.",
        "category": "general",
        "file_url": "https://yu.edu.sa/wp-content/uploads/2023/01/Students-Disciplinary-Policy-V-2.0.pdf",
    },
    {
        "title": "Graduate Studies Policy",
        "description": "Comprehensive policy document covering regulations for all postgraduate programs at the university.",
        "category": "graduation",
        "file_url": "https://yu.edu.sa/wp-content/uploads/2024/04/%D9%84%D8%A7%D8%A6%D8%AD%D8%A9-%D8%A7%D9%84%D8%AF%D8%B1%D8%A7%D8%B3%D8%A7%D8%AA-%D8%A7%D9%84%D8%B9%D9%84%D9%8A%D8%A7-Last-Version-2024.pdf",
    },
    {
        "title": "Academic Appeals Committee Policy",
        "description": "Defines the composition, scope, and procedures of the committee that handles academic appeals from students.",
        "category": "grades",
        "file_url": "https://yu.edu.sa/wp-content/uploads/2025/05/Policy-for-the-Academic-Appeal-Committee-V3.2.pdf",
    },
]

for f in FORMS:
    form = UniversityForm.objects.create(
        title=f['title'],
        description=f['description'],
        category=f['category'],
        file_url=f['file_url'],
        status='published',
    )
    print(f"  [FORM] {form.title}")

print(f"\nAdded {len(FORMS)} forms.")

# ── Announcements ─────────────────────────────────────────────
today = date.today()

ANNOUNCEMENTS = [
    {
        "title": "Spring 2025 Semester Registration Now Open",
        "content": (
            "Registration for Spring 2025 courses is now open through the EduGate portal. "
            "Students must complete registration before the deadline to avoid late fees. "
            "Visit the Registrar's office or EduGate at edugate.yu.edu.sa to register."
        ),
        "category": "registrar",
        "start_date": date(2025, 1, 5),
        "end_date": date(2025, 1, 20),
        "is_active": True,
    },
    {
        "title": "Final Exam Schedule – Spring 2025",
        "content": (
            "The final exam schedule for Spring 2025 has been published. "
            "Students are advised to review their exam timetable on EduGate. "
            "Any conflicts must be reported to the Registrar's office within 48 hours of publication."
        ),
        "category": "exams",
        "start_date": date(2025, 4, 1),
        "end_date": date(2025, 5, 15),
        "is_active": True,
    },
    {
        "title": "Co-op Program Applications Now Open",
        "content": (
            "Students eligible for the Cooperative Education (Co-op) Program can now submit applications "
            "through the CSC portal at csc.yu.edu.sa. Ensure you have completed the required credit hours "
            "and met GPA requirements before applying. Deadline: end of Week 4 of the semester."
        ),
        "category": "internship",
        "start_date": date(2025, 2, 1),
        "end_date": date(2025, 2, 28),
        "is_active": True,
    },
    {
        "title": "Tuition Fee Payment Deadline – Spring 2025",
        "content": (
            "All students must pay their Spring 2025 tuition fees before the payment deadline "
            "to avoid late payment penalties. Payments can be made via SADAD, online banking, or at the Finance office. "
            "Students with outstanding balances may have their registration cancelled."
        ),
        "category": "general",
        "start_date": date(2025, 1, 10),
        "end_date": date(2025, 1, 25),
        "is_active": True,
    },
    {
        "title": "Grade Appeal Period – Spring 2025",
        "content": (
            "Students who wish to appeal their final grades must submit the Grade Appeal Request Form "
            "to the Registrar's office within 10 working days of grade publication. "
            "Download the form from the university website or collect it from the Registrar."
        ),
        "category": "registrar",
        "start_date": date(2025, 5, 20),
        "end_date": date(2025, 6, 5),
        "is_active": True,
    },
    {
        "title": "Academic Calendar 2024–2025",
        "content": (
            "The official academic calendar for 2024–2025 has been published. "
            "It includes important dates for registration, add/drop periods, mid-term and final exams, "
            "holidays, and graduation. View it on the university website under the Registrar section."
        ),
        "category": "general",
        "start_date": date(2024, 9, 1),
        "end_date": None,
        "is_active": True,
    },
    {
        "title": "Graduation Ceremony – Class of 2025",
        "content": (
            "Al Yamamah University is pleased to announce the Graduation Ceremony for the Class of 2025. "
            "Graduates must complete their graduation application through EduGate and settle all financial obligations "
            "at least two weeks before the ceremony. More details will be communicated via student email."
        ),
        "category": "general",
        "start_date": date(2025, 5, 1),
        "end_date": date(2025, 6, 30),
        "is_active": True,
    },
    {
        "title": "Campus Wi-Fi Upgrade – Temporary Service Interruption",
        "content": (
            "The IT Department will be performing a campus-wide Wi-Fi network upgrade. "
            "There may be temporary service interruptions in select buildings. "
            "Students are advised to plan accordingly. We apologize for any inconvenience."
        ),
        "category": "general",
        "start_date": today,
        "end_date": None,
        "is_active": True,
    },
]

for a in ANNOUNCEMENTS:
    ann = Announcement.objects.create(
        title=a['title'],
        content=a['content'],
        category=a['category'],
        start_date=a['start_date'],
        end_date=a.get('end_date'),
        is_active=a['is_active'],
    )
    print(f"  [ANN]  {ann.title}")

print(f"\nAdded {len(ANNOUNCEMENTS)} announcements.")
print(f"\n{'='*50}")
print(f"Total forms: {UniversityForm.objects.count()}")
print(f"Total announcements: {Announcement.objects.count()}")
