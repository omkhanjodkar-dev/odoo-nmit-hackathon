import logging
from datetime import date, datetime, timezone
from typing import List, Optional
from fastapi import HTTPException, status
from app.core.supabase import get_supabase_admin
from app.schemas.attendance import (
    AttendanceCheckInResponse,
    AttendanceCheckOutResponse,
    AttendanceStatusResponse,
    AttendanceMyLogsResponse,
    AttendanceDailyLog,
    AttendanceAdminRow,
)

logger = logging.getLogger(__name__)

REGULAR_HOURS_CAP = 8.0


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _format_display_time(dt: datetime) -> str:
    return dt.strftime("%I:%M %p").lstrip("0")


def _parse_ts(value: Optional[str]) -> Optional[datetime]:
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None


def _session_date(logged_in: Optional[str], fallback: Optional[str] = None) -> str:
    dt = _parse_ts(logged_in)
    if dt:
        return dt.date().isoformat()
    if fallback:
        return fallback[:10]
    return date.today().isoformat()


def _hours_between(start: datetime, end: datetime) -> float:
    return round(max((end - start).total_seconds() / 3600.0, 0.0), 2)


def _split_hours(total_hours: float) -> tuple[float, float]:
    regular = round(min(total_hours, REGULAR_HOURS_CAP), 2)
    extra = round(max(total_hours - REGULAR_HOURS_CAP, 0.0), 2)
    return regular, extra


class AttendanceService:

    @staticmethod
    def _today() -> str:
        return date.today().isoformat()

    @staticmethod
    def _set_logged_in_status(supabase, user_id: str, logged_in: bool) -> None:
        supabase.table("attendance_status").upsert(
            {
                "user_id": user_id,
                "logged_in_status": logged_in,
                "updated_at": "now()",
            },
            on_conflict="user_id",
        ).execute()

    @staticmethod
    def _get_status_row(supabase, user_id: str) -> dict:
        res = (
            supabase.table("attendance_status")
            .select("*")
            .eq("user_id", user_id)
            .execute()
        )
        return (res.data or [{}])[0] if res.data else {}

    @staticmethod
    def _get_open_session(supabase, user_id: str) -> Optional[dict]:
        res = (
            supabase.table("attendance_sessions")
            .select("*")
            .eq("user_id", user_id)
            .is_("logged_out", "null")
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        rows = res.data or []
        return rows[0] if rows else None

    @staticmethod
    def check_in(user_id: str) -> AttendanceCheckInResponse:
        supabase = get_supabase_admin()
        now = _now_iso()

        status_row = AttendanceService._get_status_row(supabase, user_id)
        if status_row.get("logged_in_status"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Already checked in",
            )

        supabase.table("attendance_sessions").insert(
            {
                "user_id": user_id,
                "logged_in": now,
                "logged_out": None,
                "duration": None,
            }
        ).execute()

        AttendanceService._set_logged_in_status(supabase, user_id, True)

        return AttendanceCheckInResponse(
            success=True,
            message="Checked in successfully",
            check_in_time=now,
            status_color="GREEN",
        )

    @staticmethod
    def check_out(user_id: str) -> AttendanceCheckOutResponse:
        supabase = get_supabase_admin()
        now_dt = datetime.now(timezone.utc)
        now = now_dt.isoformat()

        status_row = AttendanceService._get_status_row(supabase, user_id)
        if not status_row.get("logged_in_status"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No active check-in found",
            )

        session = AttendanceService._get_open_session(supabase, user_id)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No open attendance session found",
            )

        check_in_dt = _parse_ts(session.get("logged_in"))
        if not check_in_dt:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Invalid check-in timestamp on attendance session",
            )

        work_hours = _hours_between(check_in_dt, now_dt)
        regular_hours, extra_hours = _split_hours(work_hours)

        supabase.table("attendance_sessions").update(
            {
                "logged_out": now,
                "duration": work_hours,
            }
        ).eq("id", session["id"]).execute()

        AttendanceService._set_logged_in_status(supabase, user_id, False)

        return AttendanceCheckOutResponse(
            success=True,
            message="Checked out successfully",
            check_out_time=now,
            work_hours=work_hours,
            regular_hours=regular_hours,
            extra_hours=extra_hours,
            status_color="RED",
        )

    @staticmethod
    def get_status(user_id: str) -> AttendanceStatusResponse:
        supabase = get_supabase_admin()
        status_row = AttendanceService._get_status_row(supabase, user_id)
        is_checked_in = bool(status_row.get("logged_in_status"))

        if not is_checked_in:
            return AttendanceStatusResponse(
                is_checked_in=False,
                elapsed_seconds=0,
                display_text="Not checked in",
                status_color="RED",
            )

        session = AttendanceService._get_open_session(supabase, user_id)
        if not session or not session.get("logged_in"):
            return AttendanceStatusResponse(
                is_checked_in=False,
                elapsed_seconds=0,
                display_text="Not checked in",
                status_color="RED",
            )

        check_in_dt = _parse_ts(session["logged_in"])
        if not check_in_dt:
            return AttendanceStatusResponse(
                is_checked_in=False,
                elapsed_seconds=0,
                display_text="Not checked in",
                status_color="RED",
            )

        elapsed_seconds = max(int((datetime.now(timezone.utc) - check_in_dt).total_seconds()), 0)

        return AttendanceStatusResponse(
            is_checked_in=True,
            check_in_time=session["logged_in"],
            elapsed_seconds=elapsed_seconds,
            display_text=f"Since {_format_display_time(check_in_dt)}",
            status_color="GREEN",
        )

    @staticmethod
    def get_my_logs(user_id: str) -> AttendanceMyLogsResponse:
        supabase = get_supabase_admin()

        logs_res = (
            supabase.table("attendance_sessions")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .limit(60)
            .execute()
        )
        sessions = logs_res.data or []

        present_dates = set()
        daily_logs: List[AttendanceDailyLog] = []

        for row in sessions:
            logged_in = row.get("logged_in")
            logged_out = row.get("logged_out")
            session_date = _session_date(logged_in, row.get("created_at"))
            if logged_in:
                present_dates.add(session_date)

            stored_duration = row.get("duration")
            if stored_duration is not None:
                work_hours = float(stored_duration)
            elif logged_in and logged_out:
                start = _parse_ts(logged_in)
                end = _parse_ts(logged_out)
                work_hours = _hours_between(start, end) if start and end else 0.0
            else:
                work_hours = 0.0

            regular_hours, extra_hours = _split_hours(work_hours)
            daily_logs.append(
                AttendanceDailyLog(
                    date=session_date,
                    check_in=logged_in,
                    check_out=logged_out,
                    work_hours=work_hours,
                    regular_hours=regular_hours,
                    extra_hours=extra_hours,
                )
            )

        leaves_count = 0
        try:
            leave_res = (
                supabase.table("leave_log")
                .select("id")
                .eq("user_id", user_id)
                .eq("approved", "Approved")
                .execute()
            )
            leaves_count = len(leave_res.data or [])
        except Exception:
            pass

        return AttendanceMyLogsResponse(
            days_present=len(present_dates),
            leaves_count=leaves_count,
            total_working_days=len(daily_logs),
            logs=daily_logs,
        )

    @staticmethod
    def get_all_attendance(target_date: Optional[str] = None, search: str = "") -> List[AttendanceAdminRow]:
        supabase = get_supabase_admin()
        query_date = target_date or AttendanceService._today()

        profiles = supabase.table("profiles").select("user_id, employee_id").execute()
        personal = supabase.table("personal_info").select("user_id, first_name, last_name").execute()
        personal_map = {p["user_id"]: p for p in (personal.data or [])}

        sessions_res = (
            supabase.table("attendance_sessions")
            .select("*")
            .gte("created_at", f"{query_date}T00:00:00")
            .lte("created_at", f"{query_date}T23:59:59")
            .execute()
        )

        att_map: dict = {}
        for session in sessions_res.data or []:
            session_date = _session_date(session.get("logged_in"), session.get("created_at"))
            if session_date != query_date:
                continue
            uid = session["user_id"]
            existing = att_map.get(uid)
            if not existing or (session.get("created_at") or "") > (existing.get("created_at") or ""):
                att_map[uid] = session

        rows: List[AttendanceAdminRow] = []
        search_lower = search.lower().strip()

        for prof in profiles.data or []:
            user_id = prof["user_id"]
            pinfo = personal_map.get(user_id, {})
            first_name = pinfo.get("first_name") or ""
            last_name = pinfo.get("last_name") or ""
            employee_name = f"{first_name} {last_name}".strip()
            employee_id = prof.get("employee_id") or ""

            if search_lower and search_lower not in employee_name.lower() and search_lower not in employee_id.lower():
                continue

            att = att_map.get(user_id, {})
            work_hours = float(att.get("duration") or 0)
            _, extra_hours = _split_hours(work_hours)

            rows.append(
                AttendanceAdminRow(
                    user_id=str(user_id),
                    employee_name=employee_name or "Unknown",
                    employee_id=employee_id,
                    check_in=att.get("logged_in"),
                    check_out=att.get("logged_out"),
                    work_hours=work_hours,
                    extra_hours=extra_hours,
                )
            )
        return rows

    @staticmethod
    def get_users_present_today() -> set:
        """Returns user_ids with at least one attendance session logged in today."""
        supabase = get_supabase_admin()
        today = AttendanceService._today()
        present_ids: set = set()

        try:
            res = (
                supabase.table("attendance_sessions")
                .select("user_id, logged_in, created_at")
                .gte("created_at", f"{today}T00:00:00")
                .lte("created_at", f"{today}T23:59:59")
                .execute()
            )
            for row in res.data or []:
                if _session_date(row.get("logged_in"), row.get("created_at")) == today:
                    present_ids.add(row["user_id"])
        except Exception as e:
            logger.warning(f"Attendance session lookup warning: {e}")

        return present_ids
