export const INITIAL_EMPLOYEES = [
  {
    id: "emp-001",
    employee_id: "EMP1001",
    first_name: "Alex",
    last_name: "Morgan",
    email: "alex.morgan@dayflow.internal",
    phone: "+1 (555) 234-5678",
    role: "ADMIN_HR",
    is_verified: true,
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    department: "Engineering",
    designation: "Lead Software Architect",
    manager: "Sarah Connor",
    joining_date: "2023-01-15",
    location: "San Francisco, USA",
    company: "Dayflow Technologies Inc.",
    attendance_status: "PRESENT", // "PRESENT" | "LEAVE" | "ABSENT"
    about: "Passionate about scalable cloud architectures, reactive frontends, and human-centric software systems with 8+ years of engineering experience.",
    job_love: "Solving complex distributed systems challenges and mentoring cross-functional product teams.",
    interests: "Open-source robotics, high-altitude trail running, mechanical keyboards, and speed chess.",
    skills: ["React", "JavaScript", "System Design", "Node.js", "Python", "Vite", "GraphQL", "Docker"],
    certifications: [
      "AWS Certified Solutions Architect - Professional",
      "Odoo Certified Senior Consultant",
      "Certified Scrum Master (CSM)"
    ],
    private_info: {
      dob: "1992-05-14",
      address: "742 Evergreen Terrace, Suite 4B, San Francisco, CA 94107",
      personal_email: "alex.morgan.personal@gmail.com",
      gender: "Male",
      nationality: "American",
      marital_status: "Single",
      bank_details: {
        bank_name: "Chase Bank",
        account_number: "987654321012",
        ifsc_code: "CHAS0001234"
      }
    },
    salary_structure: {
      month_wage: 60000,
      yearly_wage: 720000,
      basic_salary: 30000, // 50%
      hra: 15000,          // 50% of basic
      standard_allowance: 4167,
      performance_bonus_percent: 12,
      lta_percent: 5,
      pf_percent: 12,      // 12% of basic = 3600
      professional_tax: 200,
      net_salary: 56200
    },
    documents: [
      { id: "doc-1", name: "Employment_Contract_2023.pdf", size: "2.4 MB", type: "pdf", uploadDate: "2023-01-15" },
      { id: "doc-2", name: "Passport_Scan_Copy.jpg", size: "1.1 MB", type: "image", uploadDate: "2023-01-16" },
      { id: "doc-3", name: "AWS_Solutions_Architect_Certificate.pdf", size: "850 KB", type: "pdf", uploadDate: "2023-06-20" }
    ]
  },
  {
    id: "emp-002",
    employee_id: "EMP1002",
    first_name: "Sarah",
    last_name: "Connor",
    email: "sarah.connor@dayflow.internal",
    phone: "+1 (555) 345-6789",
    role: "ADMIN_HR",
    is_verified: true,
    avatar_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    department: "Human Resources",
    designation: "VP of People & Culture",
    manager: "Board of Directors",
    joining_date: "2021-03-01",
    location: "New York, USA",
    company: "Dayflow Technologies Inc.",
    attendance_status: "PRESENT",
    about: "Dedicated HR leader committed to cultivating transparent, inclusive, and high-trust workplace environments.",
    job_love: "Empowering talent, streamlining operations, and building collaborative cultures.",
    interests: "Marathon running, contemporary psychology, and pottery.",
    skills: ["Talent Acquisition", "Compensation & Benefits", "Employee Relations", "Conflict Resolution", "HR Compliance"],
    certifications: ["SHRM-SCP Senior Certified Professional", "SPHR Certification"],
    private_info: {
      dob: "1988-11-20",
      address: "120 Park Avenue, Apt 14D, New York, NY 10017",
      personal_email: "sarah.connor.ny@gmail.com",
      gender: "Female",
      nationality: "American",
      marital_status: "Married",
      bank_details: {
        bank_name: "Citibank N.A.",
        account_number: "443210987654",
        ifsc_code: "CITI0009876"
      }
    },
    salary_structure: {
      month_wage: 75000,
      yearly_wage: 900000,
      basic_salary: 37500,
      hra: 18750,
      standard_allowance: 5000,
      performance_bonus_percent: 15,
      lta_percent: 6,
      pf_percent: 12,
      professional_tax: 200,
      net_salary: 70500
    },
    documents: [
      { id: "doc-4", name: "Executive_Appointment_Letter.pdf", size: "3.1 MB", type: "pdf", uploadDate: "2021-03-01" },
      { id: "doc-5", name: "SHRM_Senior_Credential.pdf", size: "1.2 MB", type: "pdf", uploadDate: "2022-04-10" }
    ]
  },
  {
    id: "emp-003",
    employee_id: "EMP1003",
    first_name: "Marcus",
    last_name: "Vance",
    email: "marcus.vance@dayflow.internal",
    phone: "+1 (555) 456-7890",
    role: "EMPLOYEE",
    is_verified: true,
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    department: "Engineering",
    designation: "Frontend Engineer",
    manager: "Alex Morgan",
    joining_date: "2023-06-15",
    location: "San Francisco, USA",
    company: "Dayflow Technologies Inc.",
    attendance_status: "LEAVE", // On Leave -> ✈️ Airplane icon
    about: "Creative UI/UX focused frontend engineer with an obsession for pixel perfection and micro-interactions.",
    job_love: "Turning design concepts into lightning-fast and accessible web applications.",
    interests: "UI Design, Digital Illustration, Cycling, and Espresso brewing.",
    skills: ["React", "JavaScript", "TypeScript", "CSS3", "Vite", "TailwindCSS", "Figma"],
    certifications: ["Meta Certified Frontend Developer"],
    private_info: {
      dob: "1996-08-12",
      address: "350 Mission St, Apt 9A, San Francisco, CA 94105",
      personal_email: "marcus.vance.dev@gmail.com",
      gender: "Male",
      nationality: "American",
      marital_status: "Single",
      bank_details: {
        bank_name: "Wells Fargo",
        account_number: "112233445566",
        ifsc_code: "WFBI0004321"
      }
    },
    salary_structure: {
      month_wage: 45000,
      yearly_wage: 540000,
      basic_salary: 22500,
      hra: 11250,
      standard_allowance: 3500,
      performance_bonus_percent: 10,
      lta_percent: 5,
      pf_percent: 12,
      professional_tax: 200,
      net_salary: 42300
    },
    documents: [
      { id: "doc-6", name: "Marcus_Vance_Offer_Letter.pdf", size: "1.8 MB", type: "pdf", uploadDate: "2023-06-15" }
    ]
  },
  {
    id: "emp-004",
    employee_id: "EMP1004",
    first_name: "Elena",
    last_name: "Rostova",
    email: "elena.rostova@dayflow.internal",
    phone: "+1 (555) 567-8901",
    role: "EMPLOYEE",
    is_verified: true,
    avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    department: "Design",
    designation: "Principal Product Designer",
    manager: "Sarah Connor",
    joining_date: "2022-09-01",
    location: "Austin, USA",
    company: "Dayflow Technologies Inc.",
    attendance_status: "ABSENT", // Absent -> 🟡 Yellow Dot
    about: "Human-centered designer focusing on clean enterprise workflows, design systems, and delightful UX.",
    job_love: "Simplifying complex data grids and administrative tools into intuitive experiences.",
    interests: "Architecture photography, watercolor painting, and hiking.",
    skills: ["Design Systems", "Figma", "Interaction Design", "User Research", "Prototyping"],
    certifications: ["Nielsen Norman Group UX Master Certified"],
    private_info: {
      dob: "1991-03-25",
      address: "800 Congress Ave, Austin, TX 78701",
      personal_email: "elena.rostova.design@gmail.com",
      gender: "Female",
      nationality: "American",
      marital_status: "Single",
      bank_details: {
        bank_name: "Bank of America",
        account_number: "667788990011",
        ifsc_code: "BOFA0005678"
      }
    },
    salary_structure: {
      month_wage: 52000,
      yearly_wage: 624000,
      basic_salary: 26000,
      hra: 13000,
      standard_allowance: 4000,
      performance_bonus_percent: 10,
      lta_percent: 5,
      pf_percent: 12,
      professional_tax: 200,
      net_salary: 48900
    },
    documents: [
      { id: "doc-7", name: "Design_Consultant_Agreement.pdf", size: "2.1 MB", type: "pdf", uploadDate: "2022-09-01" }
    ]
  },
  {
    id: "emp-005",
    employee_id: "EMP1005",
    first_name: "David",
    last_name: "Kim",
    email: "david.kim@dayflow.internal",
    phone: "+1 (555) 678-9012",
    role: "EMPLOYEE",
    is_verified: true,
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    department: "Finance",
    designation: "Senior Financial Analyst",
    manager: "Sarah Connor",
    joining_date: "2022-02-10",
    location: "Chicago, USA",
    company: "Dayflow Technologies Inc.",
    attendance_status: "PRESENT",
    about: "Analytical finance specialist handling financial modeling, payroll audit, and corporate forecasting.",
    job_love: "Numbers, spreadsheets, automated reporting engines, and fiscal optimization.",
    interests: "Stock market trading, sailing, and golf.",
    skills: ["Financial Modeling", "Payroll Audit", "Budgeting", "QuickBooks", "ERP Systems"],
    certifications: ["Chartered Financial Analyst (CFA)"],
    private_info: {
      dob: "1989-12-05",
      address: "200 E Randolph St, Chicago, IL 60601",
      personal_email: "david.kim.cfa@gmail.com",
      gender: "Male",
      nationality: "American",
      marital_status: "Married",
      bank_details: {
        bank_name: "PNC Bank",
        account_number: "998877665544",
        ifsc_code: "PNCC0001122"
      }
    },
    salary_structure: {
      month_wage: 50000,
      yearly_wage: 600000,
      basic_salary: 25000,
      hra: 12500,
      standard_allowance: 4000,
      performance_bonus_percent: 10,
      lta_percent: 5,
      pf_percent: 12,
      professional_tax: 200,
      net_salary: 47000
    },
    documents: [
      { id: "doc-8", name: "David_Kim_Employment_Doc.pdf", size: "1.9 MB", type: "pdf", uploadDate: "2022-02-10" }
    ]
  }
];

export const INITIAL_ATTENDANCE = [
  { id: "att-1", user_id: "emp-001", employee_name: "Alex Morgan", work_date: "2026-08-22", check_in: "09:00 AM", check_out: "06:00 PM", total_hours: 9.0, break_hours: 1.0, status: "PRESENT" },
  { id: "att-2", user_id: "emp-002", employee_name: "Sarah Connor", work_date: "2026-08-22", check_in: "08:45 AM", check_out: "05:45 PM", total_hours: 9.0, break_hours: 1.0, status: "PRESENT" },
  { id: "att-3", user_id: "emp-003", employee_name: "Marcus Vance", work_date: "2026-08-22", check_in: "--", check_out: "--", total_hours: 0, break_hours: 0, status: "LEAVE" },
  { id: "att-4", user_id: "emp-004", employee_name: "Elena Rostova", work_date: "2026-08-22", check_in: "--", check_out: "--", total_hours: 0, break_hours: 0, status: "ABSENT" },
  { id: "att-5", user_id: "emp-005", employee_name: "David Kim", work_date: "2026-08-22", check_in: "09:15 AM", check_out: "06:15 PM", total_hours: 9.0, break_hours: 1.0, status: "PRESENT" }
];

export const INITIAL_LEAVES = [
  {
    id: "leave-1",
    user_id: "emp-003",
    employee_name: "Marcus Vance",
    department: "Engineering",
    leave_type: "PAID",
    start_date: "2026-08-20",
    end_date: "2026-08-24",
    total_days: 5,
    reason: "Annual vacation trip",
    attachment_name: "flight_itinerary.pdf",
    status: "APPROVED",
    reviewed_by: "Sarah Connor",
    admin_comments: "Approved. Enjoy your vacation!",
    created_at: "2026-08-15T10:00:00Z"
  },
  {
    id: "leave-2",
    user_id: "emp-004",
    employee_name: "Elena Rostova",
    department: "Design",
    leave_type: "SICK",
    start_date: "2026-08-23",
    end_date: "2026-08-24",
    total_days: 2,
    reason: "High fever and medical rest",
    attachment_name: "medical_prescription.pdf",
    status: "PENDING",
    reviewed_by: null,
    admin_comments: null,
    created_at: "2026-08-22T08:30:00Z"
  }
];
