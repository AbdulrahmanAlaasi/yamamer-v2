"""Seed knowledge base with Al Yamamah University website content."""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yamamer_project.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from apps.chatbot.models import KnowledgeBase, UniversityForm, Announcement
from apps.chatbot.services.embedding import EmbeddingService
from django.utils import timezone
from datetime import timedelta

svc = EmbeddingService()

KB_DATA = [
    # === ABOUT THE UNIVERSITY ===
    ("What is Al Yamamah University?", "Al Yamamah University (YU) began as Al-Yamamah College and received official recognition from the Ministry of Higher Education in 2001. It admitted its first students in September 2004 and was elevated to university status in 2008 by royal decree. It represents the Alkhudair family's second venture into private education, following Altarbiya Alnamouthajiya Schools (TNS) established in 1957 in Riyadh.", "general"),
    ("Where is Al Yamamah University located?", "Al Yamamah University's primary campus is on King Fahd Road north of Riyadh, spanning over 160,000 square meters with facilities meeting global educational standards. The university also has a second campus in Al-Khobar in the eastern region, which welcomed its first cohort in the 2022-2023 academic year.", "general"),
    ("What is the mission of Al Yamamah University?", "Al Yamamah University aims to equip students with practical skills for the job market while developing leadership, self-learning, and critical thinking capabilities within a professional educational setting.", "general"),
    ("What is the vision of Al Yamamah University?", "The vision of Al Yamamah University is to be the first choice for public and private institutions to attract graduates in the Kingdom of Saudi Arabia.", "general"),
    ("What are the core values of Al Yamamah University?", "Al Yamamah University prioritizes six key principles: promoting national values, pursuing excellence in performance, ensuring institutional sustainability, fostering graduate competitiveness, maintaining credibility, and encouraging active participation.", "general"),
    ("What colleges does Al Yamamah University have?", "Al Yamamah University operates three main colleges: College of Business Administration, College of Engineering and Architecture, and College of Law, along with a Deanship of Arts & Sciences and graduate programs.", "general"),
    ("Why does Al Yamamah University teach in English?", "The university prioritizes English instruction to prepare graduates for the global business environment. It partners with INTERLINK International Institutes to provide project-based, learner-centered curricula.", "general"),

    # === ACCREDITATION ===
    ("What accreditations does Al Yamamah University hold?", "Al Yamamah University holds institutional accreditation from the National Center for Academic Accreditation and Evaluation (NCAAA), valid until April 2031. All engineering programs are accredited by ABET (USA). The Architecture Program is accredited by NAAB (USA). The MIS program is accredited by ABET's Computing Accreditation Commission. Management, Marketing, Finance, and Accounting programs are accredited by NCAAA. The undergraduate Law Program is also accredited by NCAAA.", "general"),

    # === TUITION & FEES ===
    ("What are the admission and placement test fees?", "Admission fees are SAR 3,000 (non-refundable) and English Placement Test fees are SAR 500 (non-refundable) for bachelor's degree programs.", "financial"),
    ("How much does the preparatory program cost?", "The preparatory program costs SAR 32,000 per semester for all undergraduate colleges at Al Yamamah University.", "financial"),
    ("What is the tuition per semester for undergraduate programs?", "The academic program tuition is SAR 37,000 per semester across the College of Business, Engineering, and Law at Al Yamamah University.", "financial"),
    ("What are the summer session fees?", "Summer session fees at Al Yamamah University are SAR 20,000 for 6 credit hours and above. Summer sessions are optional.", "financial"),
    ("How much does the MBA program cost?", "Tuition fees for the MBA are SR 153,000 for 4 semesters, or SR 171,000 with the WSU Graduate Certificate at Al Yamamah University.", "financial"),
    ("How much does the EMBA program cost?", "Tuition fees for the Executive MBA (EMBA) are SR 189,000 for 4 semesters, or SR 197,000 including the WSU Certificate at Al Yamamah University.", "financial"),
    ("What does the Master of Business Law program cost?", "The Master of Business Law (LLM) program costs SR 144,000 for 4 semesters at Al Yamamah University.", "financial"),
    ("What are the Master in Cyber Security fees?", "The Master in Cyber Security (MCS) total cost is SR 129,000 over four semesters including the graduation project.", "financial"),
    ("Does Al Yamamah University offer tuition discounts?", "Yes, Al Yamamah University grants siblings discounts, discounts for YU alumni, graduates of partner high schools, and tuition fee discounts for YU employees and their dependents. Contact the Finance Department for details.", "financial"),

    # === ADMISSIONS ===
    ("What are the admission requirements for freshmen?", "Applicants must have a high school certificate or equivalent (authenticated by Saudi MOE if from outside the Kingdom), submit Qiyas or SAT 1 test results, pass the admission test and personal interview, and demonstrate good conduct and behavior.", "registration"),
    ("What documents are required for admission?", "Required documents include: high school certificate or equivalent, national ID or Iqama, personal photos, and Qiyas or SAT 1 test results. Documents can be uploaded online or submitted in person at the Admission Office.", "registration"),
    ("How do I apply to Al Yamamah University?", "You can apply through the online application portal at https://edugate.yu.edu.sa/yu/init?service=applicationOnlineEn. Complete the electronic enrollment form, upload required documents, pay the admission fee, and await evaluation results. You can also visit the Admission Office in person.", "registration"),
    ("How can I contact the admissions office?", "Email admissions@yu.edu.sa, use WhatsApp, or call the unified number +966 11 2242222 for inquiries from admission representatives.", "registration"),

    # === COLLEGE OF BUSINESS ===
    ("What programs does the College of Business offer?", "The College of Business offers a Bachelor of Science in Business Administration with five majors: Accounting, Finance, Management, Marketing, and Management Information Systems. Graduate programs include MBA and Executive MBA (EMBA). Contact: COBA@yu.edu.sa, Phone: +966 11 2242222 (Ext. 3688 men's, 4203 women's).", "general"),
    ("Who is the Dean of the College of Business?", "Dr. Abdulaziz M. Alwathnani serves as Dean of the College of Business at Al Yamamah University.", "general"),

    # === COLLEGE OF ENGINEERING ===
    ("What programs does the College of Engineering offer?", "The College of Engineering and Architecture offers four bachelor's programs: Architecture (AIA), Computer Network Engineering (CNE), Software Engineering (SWE), and Industrial Engineering (IE). At the graduate level, it offers a Master in Cyber Security (MCS). Contact: coea@yu.edu.sa, Phone: +966 11 2242222 (Ext. 3322).", "general"),
    ("Who is the Dean of the College of Engineering?", "Prof. Mohammed Arafah serves as Dean of the College of Engineering and Architecture at Al Yamamah University (Extension: 3999).", "general"),

    # === COLLEGE OF LAW ===
    ("What programs does the College of Law offer?", "The College of Law offers a Bachelor of Law (LL.B) with specializations in Public Law and Private Law, and a Master of Business Law (LLM). The Law Department was founded in 2014 and upgraded to College of Law in 2018. Contact: Law@yu.edu.sa, Phone: +966 11 2242222 (Ext. 3666).", "general"),
    ("Who is the Dean of the College of Law?", "Dr. Abdulaziz Alhamoudi serves as Dean of the College of Law at Al Yamamah University (Extension: 3444).", "general"),

    # === LIBRARY ===
    ("What are the library hours at Al Yamamah University?", "The library is open Sunday through Thursday, 8:00 AM to 4:00 PM for both male and female sections. The library features separate male and female sections with computers, internet, and wireless networks.", "general"),
    ("What services does the YU library offer?", "Services include borrowing, reference desk assistance, current awareness, course reserves, photocopy and printing, group and individual study rooms, orientation sessions, computer workstations with internet, on and off-campus database access, and an online catalog at https://library.yu.edu.sa/.", "general"),

    # === FORMS ===
    ("What university forms are available for students?", "Available forms include: Course Registration Form, Add-Drop Course Form, Course Dropping Penalty Form, Semester Drop Form, Official Transcript Request Form, Final Withdrawal Form, Grade Appeal Request Form, Change Major Form, and Postponement Form. All forms are available on the university website under Resources > Forms.", "registration"),
    ("How do I register for co-op/internship?", "For co-op registration, use the online portal at https://coophub.yu.edu.sa/login. Students must have completed the required credit hours to be eligible for the Cooperative Education Program.", "internship"),

    # === STUDENT CLUBS ===
    ("What student clubs are available at Al Yamamah University?", "YU has many clubs including: Student Council, Industrial Engineering Club, Engineering & Architecture Club, Take One (Media) Club, Marketing Club, Finance Club, Management Club, Debates and Pleadings Club, Accounting Club, GDSC YU (Google Developer Student Club), Law Club, MIS Club, Nazaha (Integrity) Club, Social Responsibility Club, Summit Club, ToastMasters Club, Stage & Art Club, RUSH (Sports) Club, and Entrepreneurship & Investment Club.", "general"),

    # === KEY POLICIES ===
    ("What is the attendance policy at Al Yamamah University?", "The Attendance and DN (Denial) policy establishes attendance expectations and defines academic consequences for non-attendance in both on-campus and online formats. Students who exceed the allowed absences may receive a DN grade.", "general"),
    ("What is the withdrawal and refund policy?", "The Withdrawal and Refund of Tuition Fee policy specifies timelines and refund amounts for students withdrawing from courses or the institution during the academic term. Contact the Finance Department for specific refund schedules.", "financial"),
    ("What is the transfer credits policy?", "The Transfer Credits policy establishes procedures for evaluating and accepting academic credits from other institutions toward degree requirements at Al Yamamah University.", "registration"),
    ("What is the academic appeals process?", "The Academic Appeals Committee policy describes the committee's composition, jurisdiction, and procedures for reviewing student academic grievances. Students can submit a Grade Appeal Request Form.", "grades"),
    ("What is the non-discrimination policy?", "Al Yamamah University's Non-Discrimination policy prohibits discriminatory practices and ensures equitable treatment of all students, faculty, and staff members.", "general"),
    ("What is the student disciplinary policy?", "The Student Disciplinary Policy outlines behavioral expectations and establishes disciplinary procedures for addressing student conduct violations.", "general"),
    ("What is the examination policy?", "The Examinations Policy and Procedures regulate test administration, academic integrity, accommodations, and grading practices at Al Yamamah University.", "grades"),
    ("What is the academic advising policy?", "The Academic Advising policy establishes advising standards, advisor responsibilities, and student consultation requirements. Faculty are required to maintain scheduled office hours for student consultation.", "general"),
    ("What is the cooperative education program?", "The Cooperative Education Program establishes guidelines for work-integrated learning experiences connecting classroom study to industry practice. Students must meet credit hour requirements to be eligible.", "internship"),
    ("What is the grievances and complaints policy?", "The Grievances and Complaints Policy establishes formal procedures for addressing student, faculty, and staff grievances at Al Yamamah University.", "general"),
    ("What is the intellectual property policy?", "The Intellectual Property policy protects ownership rights for discoveries, inventions, and creative works produced by faculty and students at Al Yamamah University.", "general"),
    ("Does YU provide mental health accommodations?", "Yes, the Policy on Medically Indicated Academic Accommodations for Mental Disorders ensures students with diagnosed mental health conditions receive necessary academic support and adjustments.", "general"),
    ("What is the sibling discount policy?", "The Sibling Discount policy offers tuition reductions when multiple family members study at Al Yamamah University simultaneously.", "financial"),
    ("What is the postgraduate admission policy?", "The Admission Requirements for PGS policy specifies academic qualifications, test scores, and documentation required for postgraduate program entry at Al Yamamah University.", "registration"),
]

FORMS_DATA = [
    ("Course Registration Form", "Standard form for enrolling in semester courses.", "registration", "https://yu.edu.sa/wp-content/uploads/2020/03/Registration-Form.pdf"),
    ("Add-Drop Course Form", "Used to add or remove courses during the first week of the semester.", "registration", "https://yu.edu.sa/wp-content/uploads/2020/03/Add-Drop-Form.pdf"),
    ("Grade Appeal Request", "Formal request to review a final grade for a specific course.", "grades", "https://yu.edu.sa/wp-content/uploads/2020/03/Grade-Appeal.pdf"),
    ("Internship Application Form", "Required for students entering the Cooperative Education Program.", "internship", "https://yu.edu.sa/wp-content/uploads/2020/03/Internship-App.pdf"),
    ("Sibling Discount Request", "Application for tuition reduction for siblings studying at YU.", "financial", "https://yu.edu.sa/wp-content/uploads/2020/03/Sibling-Discount.pdf"),
    ("Official Transcript Request", "Request for a formal academic transcript from the Registrar.", "registration", "https://yu.edu.sa/wp-content/uploads/2020/03/Transcript-Request.pdf"),
]

ANNOUNCEMENTS_DATA = [
    ("Fall 2026 Registration Now Open", "Course registration for the Fall 2026 semester is now open for all undergraduate students. Please check your Edugate portal for your specific registration window.", "registrar", 0, 30),
    ("Midterm Exam Schedule Released", "The schedule for Midterm Exams is now available on the university website and notice boards. Exams start next Sunday.", "exams", -2, 7),
    ("YU Internship & Career Fair", "Join us for the annual Career Fair on May 15th in the Main Hall. Over 50 companies will be recruiting YU students.", "internship", -5, 10),
    ("Library Extended Hours", "To support students during the exam period, the YU Library will remain open until 10:00 PM starting this Sunday.", "general", -1, 14),
]

# Clear existing test data
print(f"Current items -> KB: {KnowledgeBase.objects.count()}, Forms: {UniversityForm.objects.count()}, Ann: {Announcement.objects.count()}")
KnowledgeBase.objects.all().delete()
UniversityForm.objects.all().delete()
Announcement.objects.all().delete()
print("Cleared old data.")

# Seed KB
created_kb = 0
for question, answer, category in KB_DATA:
    kb = KnowledgeBase(question=question, answer=answer, category=category)
    text = f"{question}\n{answer}"
    try:
        embedding = svc.embed(text)
        kb.embedding = embedding
    except Exception as e:
        print(f"  FAILED to embed: {question[:50]}... - {e}")
    kb.save()
    created_kb += 1
    if created_kb % 10 == 0:
        print(f"  Created {created_kb}/{len(KB_DATA)} KB items...")

# Seed Forms
created_forms = 0
for title, desc, cat, url in FORMS_DATA:
    UniversityForm.objects.create(
        title=title,
        description=desc,
        category=cat,
        file_url=url,
        status='published'
    )
    created_forms += 1

# Seed Announcements
created_ann = 0
now = timezone.now().date()
for title, content, cat, start_offset, duration in ANNOUNCEMENTS_DATA:
    Announcement.objects.create(
        title=title,
        content=content,
        category=cat,
        start_date=now + timedelta(days=start_offset),
        end_date=now + timedelta(days=start_offset + duration),
        is_active=True
    )
    created_ann += 1

print(f"\nDone!")
print(f"Created {created_kb} KB items.")
print(f"Created {created_forms} Forms.")
print(f"Created {created_ann} Announcements.")
