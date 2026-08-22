import logging
from supabase import create_client, Client
from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

supabase_admin: Client | None = None
supabase_client: Client | None = None

try:
    if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY:
        supabase_admin = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
    elif settings.SUPABASE_URL and settings.SUPABASE_ANON_KEY:
        supabase_admin = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
    
    if settings.SUPABASE_URL and settings.SUPABASE_ANON_KEY:
        supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
except Exception as e:
    logger.error(f"Failed to initialize Supabase client: {e}")


def get_supabase_admin() -> Client:
    if supabase_admin is None:
        raise RuntimeError("Supabase client is not configured. Please check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.")
    return supabase_admin
