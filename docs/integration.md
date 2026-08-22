# Frontend & Backend Integration Guide

This document outlines how to integrate the frontend (Flutter) with the FastAPI backend, including available endpoints, authentication flows, and data structures.

## 1. Base API URL

### Production Hosted URL
```text
https://odoo-nmit-hackathon.onrender.com
```

### Local Development URL
When running the backend locally (e.g. via Docker):
```text
http://localhost:8000
```
For Android Emulators connecting to localhost, use:
```text
http://10.0.2.2:8000
```

## 2. Authentication Flow

The application uses **JWT Bearer Tokens** managed via Supabase GoTrue, but the frontend should only communicate with the FastAPI backend.

1. **Sign Up (`POST /auth/signup`)**:
   - Creates a user in Supabase and provisions their `profiles`, `personal_info`, and `leave_balance` records.
   - If email confirmation is enabled, the user must verify their email before logging in.
2. **Sign In (`POST /auth/signin`)**:
   - The user provides their `login_identifier` (Employee ID or Email) and `password`.
   - Returns an `access_token` and user details (Role, Employee ID).
3. **Authorized Requests**:
   - For all other endpoints, include the token in the headers:
     ```http
     Authorization: Bearer <access_token>
     ```

## 3. Available Endpoints

### 🔐 Authentication (`/auth`)
| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/signup` | Register a new user | Public |
| `POST` | `/auth/signin` | Login and get JWT token | Public |
| `GET` | `/auth/me` | Get current user's profile info | Any |
| `POST` | `/auth/change-password`| Update user password | Any |

### 👥 Employees & Onboarding (`/employees`)
| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/employees` | List all employees | Admin/HR |
| `POST` | `/employees` | Admin registers a new employee | Admin/HR |
| `PUT` | `/employees/{user_id}/personal-info`| Update personal info | Admin/HR |
| `PUT` | `/employees/{user_id}/bank-details` | Update bank details | Admin/HR |

### ⏱️ Attendance (`/attendance`)
| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/attendance/check-in` | Record clock-in | Employee/Admin |
| `POST` | `/attendance/check-out`| Record clock-out | Employee/Admin |
| `GET` | `/attendance/status` | Check if currently checked in | Employee/Admin |
| `GET` | `/attendance/my-logs` | View own attendance history | Employee/Admin |
| `GET` | `/attendance/all` | View attendance for all users | Admin/HR |

### 🏖️ Leave Management (`/leaves`)
| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/leaves/my-balance` | View own leave balances | Employee/Admin |
| `POST` | `/leaves/apply` | Apply for a leave (half/full day)| Employee/Admin |
| `GET` | `/leaves/pending` | View pending leave requests | Admin/HR |
| `POST` | `/leaves/{leave_id}/approve`| Approve a leave request | Admin/HR |
| `POST` | `/leaves/{leave_id}/reject` | Reject a leave request | Admin/HR |

### 💰 Payroll (`/payroll`)
| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/payroll/my-salary` | View own salary structure | Employee/Admin |
| `GET` | `/payroll/all` | View all salary structures | Admin/HR |
| `GET` | `/payroll/employee/{user_id}`| View specific employee salary | Admin/HR |
| `PUT` | `/payroll/employee/{user_id}`| Update employee base pay | Admin/HR |
| `POST` | `/payroll/generate-payslips`| Generate monthly payslips | Admin/HR |

### 🔔 Notifications (FCM) (`/notifications`)
| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/notifications/register-token`| Save device FCM token | Any |
| `POST` | `/notifications/send` | Send a push notification | Admin/HR |

---

## 4. Error Handling
The backend uses standard HTTP status codes:
- **200/201**: Success
- **400**: Bad Request (Invalid data or business logic error, e.g., "Insufficient leave balance")
- **401**: Unauthorized (Invalid or expired token, wrong password)
- **403**: Forbidden (User lacks Admin role, or Email not verified)
- **500**: Internal Server Error

All errors return a JSON object with a `detail` key:
```json
{
  "detail": "Email not verified. Please check your inbox."
}
```

## 5. Flutter Integration Tips

1. **Dio / HTTP Client Interceptor**:
   Create an interceptor in your Flutter app that automatically attaches the `Bearer <token>` to every request header.
2. **Handling 401s**:
   If a request returns a `401`, your interceptor should automatically log the user out and redirect them to the Login screen.
3. **Date Formats**:
   Send all dates as `YYYY-MM-DD` strings.
4. **Enums**:
   Ensure your Flutter dropdowns/enums map exactly to the backend strings (e.g., `"SICK_LEAVE"`, `"PAID_LEAVE"`, `"UNPAID_LEAVE"`, `"FIRST_HALF"`, `"SECOND_HALF"`).
