from datetime import datetime
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from supabase import Client


def get_company_initials(company_name: str) -> str:
    words = company_name.strip().split()
    return "".join(word[0].upper() for word in words if word)


def build_login_id_prefix(company_name: str, first_name: str, last_name: str, year: int | None = None) -> str:
    year = year or datetime.utcnow().year
    initials = get_company_initials(company_name)
    first_part = (first_name or "")[:2].upper()
    last_part = (last_name or "")[:2].upper()
    return f"{initials}{first_part}{last_part}{year}"


def generate_login_id(
    supabase: "Client",
    company_name: str,
    first_name: str,
    last_name: str,
    year: int | None = None,
) -> str:
    prefix = build_login_id_prefix(company_name, first_name, last_name, year)
    max_serial = 0

    try:
        res = supabase.table("profiles").select("employee_id").like("employee_id", f"{prefix}%").execute()
        for row in res.data or []:
            employee_id = row.get("employee_id") or ""
            if not employee_id.startswith(prefix) or len(employee_id) < len(prefix) + 4:
                continue
            try:
                serial = int(employee_id[len(prefix) : len(prefix) + 4])
                max_serial = max(max_serial, serial)
            except ValueError:
                continue
    except Exception:
        pass

    return f"{prefix}{max_serial + 1:04d}"
