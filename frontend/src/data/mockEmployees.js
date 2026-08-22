/**
 * Unified Mock Employees Data for Dayflow HRMS
 * Fully compliant with Excalidraw Wireframes, PRD, and Backend schemas.
 */

export const INITIAL_EMPLOYEES = [
  {
    id: "emp-1",
    employeeId: "OIJADM20200000",
    name: "Alex Morgan",
    firstName: "Alex",
    lastName: "Morgan",
    email: "alex.morgan@odooindia.com",
    personalEmail: "alex.morgan.dev@gmail.com",
    phone: "+91 98765 00001",
    role: "ADMIN_HR", // 'ADMIN_HR' | 'EMPLOYEE'
    department: "Human Resources",
    designation: "VP of People & HR Officer",
    company: "Odoo India",
    location: "Gandhinagar, Gujarat",
    manager: "Board of Directors",
    managerId: "board-1",
    dateOfBirth: "1988-11-20",
    joiningDate: "2020-01-15",
    gender: "Female",
    nationality: "Indian",
    maritalStatus: "Married",
    residingAddress: "120 Park Avenue, Apt 14D, Gandhinagar, Gujarat - 382010",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    status: "present", // 'present' | 'on_leave' | 'absent'
    attendance_status: "PRESENT",
    bankDetails: {
      accountNumber: "987654321012",
      bankName: "HDFC Bank",
      ifscCode: "HDFC0001234",
      branch: "Infocity Gandhinagar",
    },
    statutory: {
      panNo: "ABCDE1234F",
      uanNo: "100908070605",
      empCode: "EMP-2020-001",
    },
    about: "Strategic HR leader committed to cultivating high-trust workplace environments, transparent compensation, and agile people operations.",
    whatILoveAboutJob: "Empowering talent, streamlining operations, and building collaborative cultures across engineering and product teams.",
    interestsAndHobbies: "Marathon running, contemporary psychology, mechanical keyboards, and speed chess.",
    skills: ["Talent Acquisition", "Compensation & Benefits", "Employee Relations", "HR Compliance", "Performance Management"],
    certifications: [
      { id: "c1", name: "SHRM-SCP Senior Certified Professional", issuer: "SHRM", year: "2021" },
      { id: "c2", name: "Odoo Certified Senior Consultant", issuer: "Odoo SA", year: "2022" }
    ],
    documents: [
      { id: "doc-1", name: "Employment_Agreement_Alex.pdf", size: "2.4 MB", type: "pdf", uploadDate: "2020-01-15" },
      { id: "doc-2", name: "Passport_Scan_Copy.jpg", size: "1.1 MB", type: "image", uploadDate: "2020-01-16" }
    ],
    salary_structure: {
      month_wage: 75000,
      yearly_wage: 900000,
      basic_salary: 37500, // 50%
      hra: 18750,          // 50% of basic
      standard_allowance: 4167,
      performance_bonus: 3123.75, // 8.33% of basic
      lta: 3123.75,              // 8.33% of basic
      fixed_allowance: 8335.5,
      pf: 4500,                  // 12% of basic
      professional_tax: 200,
      net_salary: 70300
    }
  },
  {
    id: "emp-2",
    employeeId: "OIJODO20220001",
    name: "John Doe",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@odooindia.com",
    personalEmail: "johndoe.personal@gmail.com",
    phone: "+91 98765 43210",
    role: "EMPLOYEE",
    department: "Engineering",
    designation: "Senior Software Engineer",
    company: "Odoo India",
    location: "Gandhinagar, Gujarat",
    manager: "Alex Morgan",
    managerId: "emp-1",
    dateOfBirth: "1994-06-15",
    joiningDate: "2022-07-01",
    gender: "Male",
    nationality: "Indian",
    maritalStatus: "Single",
    residingAddress: "Flat 402, Greenwoods Heights, Gandhinagar, Gujarat - 382010",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    status: "present",
    attendance_status: "PRESENT",
    bankDetails: {
      accountNumber: "918273645012",
      bankName: "ICICI Bank",
      ifscCode: "ICIC0000456",
      branch: "Bodakdev Ahmedabad",
    },
    statutory: {
      panNo: "FGHIJ5678K",
      uanNo: "100908070606",
      empCode: "EMP-2022-001",
    },
    about: "Passionate full-stack software engineer with 5+ years of experience in enterprise systems, React, Python, FastAPI, and cloud infrastructure.",
    whatILoveAboutJob: "Collaborating with high-performing engineering teams, building scalable architecture, and solving challenging business workflows.",
    interestsAndHobbies: "Open-source contribution, tech blogging, mountain biking, and chess.",
    skills: ["React", "JavaScript", "TypeScript", "Python", "FastAPI", "PostgreSQL", "Tailwind CSS", "Docker"],
    certifications: [
      { id: "c3", name: "AWS Certified Solutions Architect", issuer: "Amazon Web Services", year: "2023" },
      { id: "c4", name: "Certified Kubernetes Application Developer", issuer: "CNCF", year: "2024" }
    ],
    documents: [
      { id: "doc-3", name: "Offer_Letter_JohnDoe.pdf", size: "1.8 MB", type: "pdf", uploadDate: "2022-07-01" },
      { id: "doc-4", name: "AWS_Cert_Badge.pdf", size: "850 KB", type: "pdf", uploadDate: "2023-06-20" }
    ],
    salary_structure: {
      month_wage: 50000,
      yearly_wage: 600000,
      basic_salary: 25000,
      hra: 12500,
      standard_allowance: 4167,
      performance_bonus: 2082.5,
      lta: 2082.5,
      fixed_allowance: 4168,
      pf: 3000,
      professional_tax: 200,
      net_salary: 46800
    }
  },
  {
    id: "emp-3",
    employeeId: "OIJASM20230002",
    name: "Jane Smith",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@odooindia.com",
    personalEmail: "janesmith.dev@gmail.com",
    phone: "+91 98765 11223",
    role: "EMPLOYEE",
    department: "Product Design",
    designation: "Lead UI/UX Designer",
    company: "Odoo India",
    location: "Gandhinagar, Gujarat",
    manager: "Alex Morgan",
    managerId: "emp-1",
    dateOfBirth: "1996-03-22",
    joiningDate: "2023-01-15",
    gender: "Female",
    nationality: "Indian",
    maritalStatus: "Married",
    residingAddress: "12, Shivalik Avenue, Bodakdev, Ahmedabad - 380054",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    status: "present",
    attendance_status: "PRESENT",
    bankDetails: {
      accountNumber: "882371940123",
      bankName: "State Bank of India",
      ifscCode: "SBIN0007890",
      branch: "Vastrapur Ahmedabad",
    },
    statutory: {
      panNo: "KLMNO9012P",
      uanNo: "100908070607",
      empCode: "EMP-2023-002",
    },
    about: "Human-centric designer committed to creating intuitive, accessible, and delightful enterprise UI/UX design systems that reduce cognitive friction.",
    whatILoveAboutJob: "Translating complex functional specs into sleek, seamless interactive interfaces that users love interacting with daily.",
    interestsAndHobbies: "Typography, UI motion design, digital illustration, and specialty coffee brewing.",
    skills: ["Figma", "Design Systems", "Prototyping", "User Research", "Tailwind CSS", "Micro-interactions"],
    certifications: [
      { id: "c5", name: "NN/g UX Master Certified", issuer: "Nielsen Norman Group", year: "2023" }
    ],
    documents: [
      { id: "doc-5", name: "Design_Portfolio_Verification.pdf", size: "4.2 MB", type: "pdf", uploadDate: "2023-01-15" }
    ],
    salary_structure: {
      month_wage: 55000,
      yearly_wage: 660000,
      basic_salary: 27500,
      hra: 13750,
      standard_allowance: 4167,
      performance_bonus: 2290.75,
      lta: 2290.75,
      fixed_allowance: 5001.5,
      pf: 3300,
      professional_tax: 200,
      net_salary: 51500
    }
  },
  {
    id: "emp-4",
    employeeId: "OIRAKU20210003",
    name: "Rahul Kumar",
    firstName: "Rahul",
    lastName: "Kumar",
    email: "rahul.kumar@odooindia.com",
    personalEmail: "rahulkumar.tech@gmail.com",
    phone: "+91 98765 22334",
    role: "EMPLOYEE",
    department: "Sales & Marketing",
    designation: "Enterprise Growth Lead",
    company: "Odoo India",
    location: "Mumbai, Maharashtra",
    manager: "Alex Morgan",
    managerId: "emp-1",
    dateOfBirth: "1991-09-10",
    joiningDate: "2021-06-01",
    gender: "Male",
    nationality: "Indian",
    maritalStatus: "Single",
    residingAddress: "402, High Street Towers, Lower Parel, Mumbai - 400013",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    status: "on_leave",
    attendance_status: "LEAVE",
    bankDetails: {
      accountNumber: "771234908123",
      bankName: "Axis Bank",
      ifscCode: "UTIB0000123",
      branch: "Lower Parel Mumbai",
    },
    statutory: {
      panNo: "QRSTU3456V",
      uanNo: "100908070608",
      empCode: "EMP-2021-003",
    },
    about: "Growth-focused enterprise sales consultant helping mid-market enterprises digitize ERP, HR, and supply chain operations with Odoo.",
    whatILoveAboutJob: "Solving business challenges for clients and driving transformative software adoption at scale.",
    interestsAndHobbies: "Cricket, angel investing, economic podcasts, and travel photography.",
    skills: ["Enterprise Sales", "CRM", "Solution Architecture", "Negotiation", "Key Account Management"],
    certifications: [
      { id: "c6", name: "Certified Enterprise Sales Professional", issuer: "HubSpot Academy", year: "2022" }
    ],
    documents: [],
    salary_structure: {
      month_wage: 65000,
      yearly_wage: 780000,
      basic_salary: 32500,
      hra: 16250,
      standard_allowance: 4167,
      performance_bonus: 2707.25,
      lta: 2707.25,
      fixed_allowance: 6668.5,
      pf: 3900,
      professional_tax: 200,
      net_salary: 60900
    }
  },
  {
    id: "emp-5",
    employeeId: "OIPRPA20230004",
    name: "Priya Patel",
    firstName: "Priya",
    lastName: "Patel",
    email: "priya.patel@odooindia.com",
    personalEmail: "priyapatel.dev@gmail.com",
    phone: "+91 98765 33445",
    role: "EMPLOYEE",
    department: "Quality Assurance",
    designation: "SDET / QA Automation Engineer",
    company: "Odoo India",
    location: "Gandhinagar, Gujarat",
    manager: "John Doe",
    managerId: "emp-2",
    dateOfBirth: "1997-12-05",
    joiningDate: "2023-04-10",
    gender: "Female",
    nationality: "Indian",
    maritalStatus: "Single",
    residingAddress: "B-303, Sun City, Chandkheda, Ahmedabad - 382424",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    status: "absent",
    attendance_status: "ABSENT",
    bankDetails: {
      accountNumber: "662341908234",
      bankName: "Kotak Mahindra Bank",
      ifscCode: "KKBK0000456",
      branch: "Chandkheda Ahmedabad",
    },
    statutory: {
      panNo: "WXYZ12345A",
      uanNo: "100908070609",
      empCode: "EMP-2023-004",
    },
    about: "Detail-oriented QA Automation engineer specializing in Playwright, Cypress, Jest, and CI/CD automated test pipelines.",
    whatILoveAboutJob: "Ensuring zero-defect releases and architecting resilient test suites for complex multi-tenant ERP platforms.",
    interestsAndHobbies: "Badminton, mystery novels, baking, and open-source test runners.",
    skills: ["Playwright", "Cypress", "Python", "Selenium", "Jest", "CI/CD Actions", "API Testing"],
    certifications: [
      { id: "c7", name: "ISTQB Certified Tester Foundation Level", issuer: "ISTQB", year: "2023" }
    ],
    documents: [],
    salary_structure: {
      month_wage: 45000,
      yearly_wage: 540000,
      basic_salary: 22500,
      hra: 11250,
      standard_allowance: 4167,
      performance_bonus: 1874.25,
      lta: 1874.25,
      fixed_allowance: 3334.5,
      pf: 2700,
      professional_tax: 200,
      net_salary: 42100
    }
  }
];
