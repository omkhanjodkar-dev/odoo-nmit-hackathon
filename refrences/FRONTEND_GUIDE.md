# Dayflow HRMS — Frontend UI/UX Specifications & Integration Guide

This guide is designed for the Frontend Development Team based on the official design mockups, wireframes, and business logic in `refrences/` and `docs/`.

---

## 1. Global Layout, Navigation & Design System

### 1.1 Navigation Bar (Top Header)
- **Company Logo**: Displayed on top-left.
- **Main Nav Links**:
  - `Employees` (Default landing page upon login)
  - `Attendance`
  - `Time Off`
- **Right Systray (User & Status Widget)**:
  - **Live Attendance Status Indicator**:
    - 🔴 **Red dot**: Not checked in / Day not started.
    - 🟢 **Green dot**: Currently checked in (active session).
  - **Profile Avatar Dropdown**:
    - Clicking avatar opens dropdown menu:
      - `My Profile` $\rightarrow$ Navigates to personal profile form view.
      - `Check IN ->` / `Check Out ->` $\rightarrow$ Systray toggle button for instant clock-in/out with elapsed timer (`Since 00:00 PM`).
      - `Log Out` $\rightarrow$ Clears Supabase JWT tokens and redirects to `/signin`.

---

## 2. Page-by-Page Specifications

---

### 2.1 Authentication Pages

#### A. Sign In Page (`/signin`)
- **Fields**:
  - `Login ID / Email` (Supports both email address and system-generated Employee ID, e.g., `OIJODO20220001`).
  - `Password` (with show/hide eye toggle).
- **Actions**:
  - `SIGN IN` button (triggers `POST /api/v1/auth/signin`).
  - `"Don't have an Account? Sign Up"` link.
- **Redirection**:
  - Role `admin` $\rightarrow$ Redirects to `/admin/dashboard` or `/employees`.
  - Role `employee` $\rightarrow$ Redirects to `/employees` (Employee view).

#### B. Sign Up Page (`/signup`)
- **Fields**:
  - `Company Name` + Logo Upload icon.
  - `Name` (Full name).
  - `Email` (Work email).
  - `Phone` (Contact number).
  - `Password` & `Confirm Password` (Password strength: $\ge 8$ chars, 1 uppercase, 1 digit, 1 special char).
- **Employee ID Generation Rule**:
  - Auto-generated in format: `[Company Initials][First 2 letters of First & Last name][Year of Joining][4-digit Serial]`
  - *Example*: `Odoo India` + `John Doe` + `2022` + `#1` $\rightarrow$ **`OIJODO20220001`**.
- **Important Note for User Creation**:
  - Standard employees are onboarded by HR Admin with auto-generated initial passwords. Employees log in and change their system-generated password under Security settings.

---

### 2.2 Employees Directory Page (`/employees`) — Main Landing View

- **Top Action Bar**:
  - `+ NEW` button (Admin only — opens create employee modal).
  - `Searchbar` (Filter by employee name, department, designation).
- **Employee Card Grid**:
  - Renders cards for each employee containing:
    - Profile picture / avatar.
    - Employee Full Name & Designation.
    - **Top-Right Status Badge Indicator**:
      - 🟢 **Green dot**: Present in office.
      - ✈️ **Airplane icon**: On approved leave.
      - 🟡 **Yellow dot**: Absent (no check-in and no approved leave).
  - **Interaction**: Clicking an employee card opens their Profile in view-only form view.

---

### 2.3 Profile View (`/profile` & `/profile/:id`)

#### Header Section:
- Avatar with edit pencil icon (Employees can update their own avatar).
- `Name`, `Login ID`, `Email`, `Mobile`, `Company`, `Department`, `Manager`, `Location`.

#### Profile Tabs:

1. **`About` / `Resume` Tab**:
   - Bio text (`"About"`, `"What I love about my job"`, `"My interests and hobbies"`).
   - `Skills` list with `+ Add Skills` button.
   - `Certifications` list with certificate upload capability.

2. **`Private Info` Tab**:
   - `Date of Birth`, `Residing Address`, `Personal Email`, `Gender`, `Marital Status`, `Date of Joining`.
   - `Bank Details`: `Account Number`, `Bank Name`, `IFSC Code`, `PAN No`, `UAN No`, `Emp Code`.

3. **`Salary Info` Tab** *(Strictly Admin Editable / Employee Read-Only)*:
   - **Wage Summary**:
     - `Month Wage`: e.g. `₹50,000 / Month`
     - `Yearly Wage`: e.g. `₹600,000 / Yearly`
     - `No of working days in a week` & `Break Time / hrs`.
   - **Salary Components (Auto-Calculated from Base Wage)**:
     - `Basic Salary`: `50.00%` of Month Wage $\rightarrow$ `₹25,000.00 / month`
     - `House Rent Allowance (HRA)`: `50.00%` of Basic $\rightarrow$ `₹12,500.00 / month`
     - `Standard Allowance`: Fixed $\rightarrow$ `₹4,167.00 / month` (16.67%)
     - `Performance Bonus`: `8.33%` of Basic $\rightarrow$ `₹2,082.50 / month`
     - `Leave Travel Allowance (LTA)`: `8.33%` of Basic $\rightarrow$ `₹2,082.50 / month`
     - `Fixed Allowance`: Remainder $\rightarrow$ `₹4,168.00 / month` (16.67%)
   - **Deductions**:
     - `Provident Fund (PF)`: `12.00%` of Basic $\rightarrow$ `₹3,000.00 / month`
     - `Professional Tax`: Fixed $\rightarrow$ `₹200.00 / month`

4. **`Security` Tab**:
   - Change Password form (`Current Password`, `New Password`, `Confirm Password`).

---

### 2.4 Attendance Module (`/attendance`)

#### A. Admin / HR Officer List View:
- Date navigation bar (`<-` / `->`, `Date v`, `Day`).
- Search bar across all employees.
- **Table Columns**:
  - `Emp` (Employee Name & Avatar)
  - `Check In` (e.g. `10:00`)
  - `Check Out` (e.g. `19:00`)
  - `Work Hours` (e.g. `09:00`)
  - `Extra Hours` (e.g. `01:00`)

#### B. Employee View:
- **Summary Stat Badges**:
  - `Count of days present`
  - `Leaves count`
  - `Total working days`
- **Personal Table**:
  - `Date`, `Check In`, `Check Out`, `Work Hours`, `Extra Hours`.

*Note: Attendance records serve as the basis for monthly payslip generation (unpaid leaves or missing days deduct payable days).*

---

### 2.5 Time Off & Leave Management (`/time-off`)

#### A. Employee View:
- **Balance Cards**:
  - `Paid time Off`: e.g. `24 Days Available`
  - `Sick time off`: e.g. `07 Days Available`
- `+ NEW` button $\rightarrow$ Opens **Time Off Type Request Modal**:
  - `Employee`: Current employee name.
  - `Time off Type`: Dropdown (`Paid Time Off`, `Sick Leave`, `Unpaid Leave`).
  - `Validity Period`: Date Range picker (`From Date` to `To Date`).
  - `Allocation`: Auto-computed duration in days (e.g. `01.00 Days`).
  - `Attachment`: File upload for sick leave medical certificates.
  - `Submit` / `Discard` buttons.
- **Calendar Matrix View**: Color-coded calendar showing holidays, pending requests, and approved time-offs.

#### B. Admin & HR Officer Approval View:
- **Table of Requests**:
  - `Name`, `Start Date`, `End Date`, `Time off Type`, `Status`.
  - **Quick Action Buttons**:
    - 🟢 **Approve button** (one-click approval).
    - 🔴 **Reject button** (prompts for rejection remarks).

---

## 3. Backend API Endpoints Reference for Frontend

| Feature | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/v1/auth/signup` | Register new user / company |
| **Auth** | `POST` | `/api/v1/auth/signin` | Login & receive JWT token + role redirect |
| **Auth** | `GET` | `/api/v1/auth/me` | Fetch logged-in user profile & role |
| **FCM** | `POST` | `/api/v1/notifications/register-token` | Register device push token (`user_id`, `fcm_token`) |
| **Payroll** | `GET` | `/api/v1/payroll/my-salary` | Employee view: Salary breakdown |
| **Payroll** | `GET` | `/api/v1/payroll/all` | Admin view: All employee salary structures |
| **Payroll** | `GET` | `/api/v1/payroll/employee/:user_id` | Admin view: Specific employee salary |
| **Payroll** | `PUT` | `/api/v1/payroll/employee/:user_id` | Admin update: Update base pay & auto-recompute |
| **Payroll** | `POST` | `/api/v1/payroll/generate-payslips` | Admin: Generate monthly payslips factoring in unpaid leaves |

---

## 4. Theme & Color Standards

- **Background**: Dark Mode (`#121212` / `#1e1e1e` / `#25262b`)
- **Card Background**: `#2c2d32` / `#1a1b1e`
- **Primary Accent / Buttons**: Purple / Magenta (`#9c36b5` / `#ae3ec9`)
- **Status Colors**:
  - Present: 🟢 `#2f9e44` / `#40c057`
  - Absent: 🟡 `#f59f00` / `#fab005`
  - Leave: ✈️ `#228be6` / `#339af0`
  - Rejected / Error: 🔴 `#e03131` / `#fa5252`
- **Typography**: Clean sans-serif (Inter, Roboto, or standard Odoo UI font).
