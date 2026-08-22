# Backend Architecture & PRD Alignment Review

This is a comprehensive code quality and architecture review based on the `code-review-and-quality` skill, mapped directly against the Product Requirements Document (PRD) for Dayflow HRMS.

## 1. Overview and Quality Audit

The backend correctly implements the core foundations required by the PRD. The application structure uses FastAPI and Supabase, isolating business logic into static service classes (e.g., `LeaveService`, `AttendanceService`, `PayrollService`). 

### Correctness
- **Leave Constraints:** The recent updates to `leave_service.py` correctly validate dates and enforce the 4.5-hour maximum for half-day leaves.
- **Payroll Breakdown:** The `payroll_service.py` is perfectly aligned with the Excalidraw reference, calculating Basic (50%), HRA (50% of Basic), PF (12% of Basic), PT (200), and dynamic LOP deductions.
- **FCM Integration:** Notifications are properly encapsulated and trigger on approval/rejection of leaves.

### Architecture & Readability
- **Manual Table Joins:** In `leave_service.py` (`get_pending_requests`) and `attendance_service.py` (`get_all_attendance`), the backend performs manual Python-side joins (fetching from `profiles` and `personal_info` separately, then matching them by `user_id` in a loop). 
  > [!TIP]
  > Supabase supports relational queries directly (e.g., `.select("*, profiles(*), personal_info(*)")`). Leveraging this would reduce backend latency, eliminate Python-side matching logic, and improve readability.
- **Security / RLS Bypassing:** The services heavily rely on `get_supabase_admin()` (service-role key), meaning Row Level Security (RLS) is bypassed. The FastAPI route controllers must absolutely ensure they are validating user permissions (e.g. checking `current_user` matches the requested data) since the database will not reject unauthorized queries.

---

## 2. PRD Alignment Checklist

Below is the checklist of features and requirements specified in the PRD, evaluating what is completed vs. what is pending or logically misaligned.

### ✅ Completed (Done)
- [x] **Authentication/Roles:** Role-based logic (`employee` vs `admin`) is present in schemas and profiles.
- [x] **Employee Profiles:** ERD mapped perfectly across `profiles`, `personal_info`, and `bank_details`.
- [x] **Leave Management Logic:** `apply_leave`, `approve_leave`, and `reject_leave` are implemented.
- [x] **Leave Constraints:** Half-days cannot span multiple days, and timing bounds are enforced.
- [x] **Leave Balances:** Database trigger/RPC correctly deducts balance upon approval.
- [x] **Attendance Check-in/out:** Allows tracking work hours and calculating regular/extra hours.
- [x] **Payroll Salary Engine:** Accurately computes components (HRA, Basic, PF, PT) based on `base_pay`.

### ⏳ Pending or Misaligned
> [!WARNING]
> **Attendance Status Types**
> The PRD defines a strict enum for daily attendance status: `PRESENT | ABSENT | HALF_DAY | LEAVE`.
> Currently, `attendance_service.py` only tracks `logged_in` and `logged_out` timestamps and calculates `work_hours`. It does not explicitly classify or return the daily status as an enum. Frontends will have to guess the status based on duration (e.g. `< 4 hours = HALF_DAY`), which shifts business logic to the client.

> [!NOTE]
> **Leave Status Terminology**
> The PRD requests the following exact status states: `PENDING | APPROVED | REJECTED`.
> The implementation in the database and API currently uses `"Waiting for approval"`, `"Approved"`, and `"Rejected"`. While functionally equivalent, it drifts slightly from the specific string ENUMs requested in the spec.

- [ ] **Email Notifications:** The PRD requests automated email alerts on leave submission, approvals, and payslip generation. Currently, only Firebase Cloud Messaging (push notifications) are implemented.
- [ ] **Context Switcher (Admin):** The PRD asks for an employee context switcher for Admins. While admins can fetch data for specific users, there is no explicit backend session impersonation built-in.
- [ ] **Advanced Analytics:** Visual charts for absenteeism and attendance sheets export (PDF/Excel) are documented as future enhancements but are not yet present.

## 3. Recommended Next Steps

1. **Refactor Attendance Classification:** Update `AttendanceService` (specifically the daily logs response) to explicitly tag each day with the PRD's status ENUM (`PRESENT`, `ABSENT`, `HALF_DAY`, `LEAVE`) rather than relying purely on floats for `work_hours`.
2. **Normalize Leave Statuses:** Update `LeaveService` defaults to use `"PENDING"` instead of `"Waiting for approval"` to strictly adhere to the PRD database model.
3. **Database Joins:** Refactor Python-level profile mapping loops into Supabase relational fetches.
