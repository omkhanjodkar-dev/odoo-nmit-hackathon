# Dayflow HRMS — Backend Engineering Specification & Implementation Guide

This guide is designed for the Backend Engineering Team based on the design mockups, wireframe logic in `refrences/`, and live database constraints in `docs/schema.md`.

---

## 1. Core Architectural Requirements & Refinements

Based on the latest visual design mockups, the backend services must adhere to the following 3 core features and business logic rules:

---

### 1.1 Dual-Identifier Sign In (`Login ID` OR `Email`)
- **UI Requirement** *(Screenshot 1)*: Users can log in using either their work **Email Address** OR their system-generated **Login ID / Employee ID** (e.g. `OIJODO20220001`).
- **Implementation Logic**:
  1. Receive `login_identifier` (which may be an email or an employee ID) + `password`.
  2. If `login_identifier` contains `@` $\rightarrow$ proceed with Supabase Auth using email.
  3. If `login_identifier` is an `employee_id` $\rightarrow$ query `public.profiles` for `user_id`, resolve email from `auth.users`, and authenticate against Supabase Auth.
  4. Ensure email verification is confirmed before returning JWT session tokens.

---

### 1.2 Automated Login ID / Employee ID Generation Algorithm
- **UI Requirement** *(Screenshot 1)*: Login ID must be automatically generated upon user registration or employee onboarding by HR in the following standard format:
  $$\text{Login ID} = [\text{Company Initials}] + [\text{First 2 letters of First and Last Name}] + [\text{Year of Joining}] + [\text{4-digit Serial}]$$
- **Algorithm Example**:
  - **Company**: *Odoo India* $\rightarrow$ `OI`
  - **Employee**: *John Doe* $\rightarrow$ `JODO` (JO from John + DO from Doe)
  - **Year**: *2022*
  - **Serial**: *0001* (Next available sequence for that year in the company)
  - **Result**: **`OIJODO20220001`**
- **Note on HR Onboarding**:
  - Regular employees cannot self-register as full employees; HR Admin creates employee records with auto-generated initial passwords.
  - Newly created employees sign in using this Login ID and initial password, then update their password in the Security tab.

---

### 1.3 Systray Attendance Tracking & Live Status
- **UI Requirement** *(Screenshot 2 & Screenshot 5)*:
  - Top-right systray widget allows one-click **Check IN $\rightarrow$** and **Check Out $\rightarrow$** with live elapsed time (`Since 00:00 PM`).
  - Real-time indicator dot color:
    - 🔴 **Red dot**: Not checked in / Day not started.
    - 🟢 **Green dot**: Currently checked in and working.
- **API Endpoints**:
  - `POST /api/v1/attendance/check-in`: Logs check-in timestamp for today.
  - `POST /api/v1/attendance/check-out`: Logs check-out timestamp, calculates total hours worked and overtime/extra hours.
  - `GET /api/v1/attendance/status`: Returns current active state (`is_checked_in`, `check_in_time`, `duration_minutes`, `status_color`).

---

## 2. Salary Calculation Engine & Accuracy Rules

- **Database Table**: `public.salary_structures` stores `base_pay` (Monthly Wage).
- **Auto-Computation Formula** *(Screenshot 3 & Screenshot 4)*:
  - **Basic Salary**: $50.00\%$ of `base_pay`
  - **House Rent Allowance (HRA)**: $50.00\%$ of Basic Salary
  - **Standard Allowance**: Fixed ₹4,167.00 / month ($16.67\%$ of Basic)
  - **Performance Bonus**: $8.33\%$ of Basic Salary
  - **Leave Travel Allowance (LTA)**: $8.33\%$ of Basic Salary
  - **Fixed Allowance**: Automatically computed remainder:
    $$\text{Fixed Allowance} = \text{base\_pay} - (\text{Basic} + \text{HRA} + \text{Standard Allowance} + \text{Bonus} + \text{LTA})$$
  - **Deductions**:
    - **Provident Fund (PF)**: $12.00\%$ of Basic Salary
    - **Professional Tax**: Fixed ₹200.00 / month
  - **Net Salary**:
    $$\text{Net Salary} = \text{base\_pay} - (\text{PF} + \text{Professional Tax})$$
- **Payslip Loss of Pay (LOP) Deduction** *(Screenshot 5)*:
  $$\text{LOP Deduction} = \left(\frac{\text{base\_pay}}{\text{Total Working Days in Month}}\right) \times \text{Unpaid Leave Days}$$

---

## 3. Database Schema Compliance (`docs/schema.md`)

| Table | Primary Columns | Associated Backend Features |
| :--- | :--- | :--- |
| `public.profiles` | `user_id PK/FK`, `employee_id UK`, `role` | User identity, role-based access guard (`employee`, `admin`) |
| `public.personal_info` | `id PK`, `user_id FK`, `address`, `phone_number`, `emergency_contact`, `blood_group`, `dob`, `married`, `profile_image` | Employee profile details & avatar |
| `public.bank_details` | `user_id PK/FK`, `account_number`, `ifsc_code` | Banking info for payroll |
| `public.salary_structures` | `id PK`, `user_id UK/FK`, `base_pay` | Wage configuration and automated salary breakdown |
| `public.leave_balance` | `user_id PK/FK`, `sick_leave`, `paid_leave`, `unpaid_leave` | Time-off quota balances |
| `public.leave_log` | `id PK`, `user_id FK`, `leave_type`, `reason`, `approved` | Leave applications, HR approval status, LOP deduction sync |
| `public.fcm_tokens` | `token_id PK`, `user_id FK`, `fcm_token` | Device push notifications via Firebase Admin SDK |

---

## 4. API Endpoints Summary

### Authentication & Profiles (`/api/v1/auth`)
- `POST /api/v1/auth/signup`: Accepts company name, full name, email, password; auto-generates Login ID; registers Supabase user and profile.
- `POST /api/v1/auth/signin`: Supports login by `employee_id` or `email` + `password`.
- `GET /api/v1/auth/me`: Retrieves current authenticated user profile and permissions.

### Payroll & Compensation (`/api/v1/payroll`)
- `GET /api/v1/payroll/my-salary`: Read-only salary breakdown for logged-in employee.
- `GET /api/v1/payroll/all`: Admin view of all employee salaries across organization.
- `GET /api/v1/payroll/employee/:user_id`: Admin view of specific employee salary structure.
- `PUT /api/v1/payroll/employee/:user_id`: Admin updates employee `base_pay`.
- `POST /api/v1/payroll/generate-payslips`: Admin batch generates monthly payslips factoring in unpaid leave deductions.

### Notifications (`/api/v1/notifications`)
- `POST /api/v1/notifications/register-token`: Upserts device token (`user_id`, `fcm_token`).
- `POST /api/v1/notifications/send`: Sends single or multicast push notifications to targeted user IDs.
