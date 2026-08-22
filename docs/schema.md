# Supabase Database Schema

*Project:* **Odoo** (`eqcknsmwlmohumvmzomb`)  
*Schema:* `public`  
*Fetched & Updated at:* 2026-08-22

---

## 1. Entity Relationship Overview

```mermaid
erDiagram
    auth_users ||--o| profiles : "user_id"
    auth_users ||--o| personal_info : "user_id"
    auth_users ||--o| bank_details : "user_id"
    auth_users ||--o| leave_balance : "user_id"
    auth_users ||--o{ leave_log : "user_id"
    auth_users ||--o{ fcm_tokens : "user_id"
    auth_users ||--o| attendance_status : "user_id"
    auth_users ||--o{ attendance_sessions : "user_id"
    profiles ||--o| salary_structures : "user_id"

    profiles {
        uuid user_id PK, FK
        text employee_id UK
        text role
        timestamptz created_at
        timestamptz updated_at
    }

    personal_info {
        uuid id PK
        uuid user_id FK
        text first_name
        text last_name
        text address
        bigint phone_number
        bigint emergency_contact
        text blood_group
        date dob
        boolean married
        text profile_image
        timestamptz created_at
    }

    bank_details {
        uuid user_id PK, FK
        text account_number
        text ifsc_code
        timestamptz created_at
    }

    salary_structures {
        uuid id PK
        uuid user_id UK, FK
        numeric base_pay
        timestamptz created_at
        timestamptz updated_at
    }

    leave_balance {
        uuid user_id PK, FK
        real sick_leave
        bigint paid_leave
        bigint unpaid_leave
        timestamptz created_at
    }

    leave_log {
        uuid id PK
        uuid user_id FK
        text leave_type
        text reason
        text approved
        timestamptz created_at
    }

    attendance_status {
        uuid user_id PK, FK
        boolean logged_in_status
        timestamptz updated_at
    }

    attendance_sessions {
        bigint id PK
        uuid user_id FK
        text logged_in
        text logged_out
        real duration
        timestamptz created_at
    }

    fcm_tokens {
        uuid token_id PK
        uuid user_id FK
        text fcm_token
        timestamptz created_at
    }
```

---

## 2. Table Definitions

### 2.1 `public.profiles`
Stores core identity and role mapping for authentication users.

| Column | Data Type | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- |
| `user_id` | `uuid` | `PRIMARY KEY`, `REFERENCES auth.users(id)` | User ID from Supabase Auth |
| `employee_id` | `text` | `UNIQUE`, `DEFAULT '""'` | Human-readable employee code |
| `role` | `text` | `DEFAULT '"employee"'` | System role (`employee`, `admin`, etc.) |
| `created_at` | `timestamptz` | `DEFAULT now()` | Record creation timestamp |
| `updated_at` | `timestamptz` | `DEFAULT now()` | Last update timestamp |

---

### 2.2 `public.personal_info`
Stores employee profile details and personal information.

| Column | Data Type | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unique record ID |
| `user_id` | `uuid` | `NULLABLE`, `REFERENCES auth.users(id)` | Linked user account |
| `first_name` | `text` | `NOT NULL` | Employee first name |
| `last_name` | `text` | `NOT NULL` | Employee last name |
| `address` | `text` | `NULLABLE`, `DEFAULT ''` | Residential address |
| `phone_number` | `bigint` | `NULLABLE` | Primary contact number |
| `emergency_contact` | `bigint` | `NULLABLE` | Emergency phone number |
| `blood_group` | `text` | `NULLABLE` | Blood group (e.g. `O+`, `A+`) |
| `dob` | `date` | `NULLABLE` | Date of birth |
| `married` | `boolean` | `NULLABLE` | Marital status flag |
| `profile_image` | `text` | `NULLABLE` | Avatar image URL / storage path |
| `created_at` | `timestamptz` | `DEFAULT now()` | Record creation timestamp |

---

### 2.3 `public.bank_details`
Stores banking and direct deposit information.

| Column | Data Type | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- |
| `user_id` | `uuid` | `PRIMARY KEY`, `REFERENCES auth.users(id)` | Linked user account |
| `account_number` | `text` | `NULLABLE` | Bank account number |
| `ifsc_code` | `text` | `NULLABLE` | Bank IFSC / routing code |
| `created_at` | `timestamptz` | `DEFAULT now()` | Record creation timestamp |

---

### 2.4 `public.salary_structures`
Stores employee wage configuration.

| Column | Data Type | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unique record ID |
| `user_id` | `uuid` | `UNIQUE`, `REFERENCES public.profiles(user_id)` | Linked employee profile |
| `base_pay` | `numeric` | `NOT NULL` | Monthly base wage / gross salary |
| `created_at` | `timestamptz` | `DEFAULT now()` | Record creation timestamp |
| `updated_at` | `timestamptz` | `DEFAULT now()` | Last update timestamp |

---

### 2.5 `public.leave_balance`
Tracks remaining leave balances per employee.

| Column | Data Type | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- |
| `user_id` | `uuid` | `PRIMARY KEY`, `REFERENCES auth.users(id)` | Linked user account |
| `sick_leave` | `real` | `NULLABLE`, `DEFAULT 12` | Sick leave quota |
| `paid_leave` | `bigint` | `NULLABLE` | Paid / vacation leave quota |
| `unpaid_leave` | `bigint` | `NULLABLE`, `DEFAULT 0` | Unpaid leave quota / count |
| `created_at` | `timestamptz` | `DEFAULT now()` | Record creation timestamp |

---

### 2.6 `public.leave_log`
Tracks time-off applications, reasons, and approval workflow status.

| Column | Data Type | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unique record ID |
| `user_id` | `uuid` | `NULLABLE`, `REFERENCES auth.users(id)` | Requesting employee |
| `leave_type` | `text` | `NULLABLE` | Leave type (`sick`, `paid`, `unpaid`) |
| `reason` | `text` | `NOT NULL` | Description / reason for leave |
| `approved` | `text` | `NULLABLE`, `DEFAULT 'Waiting for approval'` | Approval status string |
| `created_at` | `timestamptz` | `DEFAULT now()` | Request timestamp |

---

### 2.7 `public.attendance_status`
Tracks live clock-in / clock-out status per employee.

| Column | Data Type | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- |
| `user_id` | `uuid` | `PRIMARY KEY`, `REFERENCES auth.users(id)` | Linked employee |
| `logged_in_status` | `boolean` | `NOT NULL` | Active clock-in status boolean |
| `updated_at` | `timestamptz` | `DEFAULT now()` | Last status change timestamp |

---

### 2.8 `public.attendance_sessions`
Logs individual check-in and check-out attendance intervals.

| Column | Data Type | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | `bigint` | `PRIMARY KEY`, `GENERATED ALWAYS AS IDENTITY` | Session record ID |
| `user_id` | `uuid` | `NULLABLE`, `REFERENCES auth.users(id)` | Linked employee |
| `logged_in` | `text` | `NOT NULL` | Check-in timestamp string |
| `logged_out` | `text` | `NULLABLE` | Check-out timestamp string |
| `duration` | `real` | `NULLABLE` | Session duration in hours |
| `created_at` | `timestamptz` | `DEFAULT now()` | Record creation timestamp |

---

### 2.9 `public.fcm_tokens`
Stores device tokens for push notifications.

| Column | Data Type | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- |
| `token_id` | `uuid` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unique token ID |
| `user_id` | `uuid` | `NULLABLE`, `REFERENCES auth.users(id)` | Target user |
| `fcm_token` | `text` | `NOT NULL` | Firebase Cloud Messaging token |
| `created_at` | `timestamptz` | `DEFAULT now()` | Token registration timestamp |

---

## 3. Database Functions

### 3.1 `approve_leave_request(p_leave_id UUID, p_duration REAL)`
Atomically approves a pending leave request and updates the employee's leave balance in a single transaction.

**Parameters:**
- `p_leave_id` (`UUID`): The ID of the leave request in `leave_log`.
- `p_duration` (`REAL`): The duration of the leave (e.g., `1`, `0.5`) to deduct from the balance.

**Behavior:**
1. Locks the corresponding `leave_log` row.
2. Fails if the request is already 'Approved' or not found.
3. Updates `leave_log.approved` to `'Approved'`.
4. Deducts the `p_duration` from the corresponding `leave_balance` column (`sick_leave`, `paid_leave`, or `unpaid_leave`) based on the `leave_type`.
