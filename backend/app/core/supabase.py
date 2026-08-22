import logging
from supabase import create_client, Client
from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

supabase_admin: Client | None = None
supabase_client: Client | None = None

try:
    if settings.SUPABASE_URL and settings.SUPABASE_SECRET_KEY:
        supabase_admin = create_client(settings.SUPABASE_URL, settings.SUPABASE_SECRET_KEY)
        logger.info("Supabase admin client initialized with secret key")
    elif settings.SUPABASE_URL and settings.SUPABASE_PUBLISHABLE_KEY:
        supabase_admin = create_client(settings.SUPABASE_URL, settings.SUPABASE_PUBLISHABLE_KEY)
        logger.warning(
            "Supabase admin client initialized with publishable key; "
            "set SUPABASE_SECRET_KEY (sb_secret_...) for full backend access."
        )

    if settings.SUPABASE_URL and settings.SUPABASE_PUBLISHABLE_KEY:
        supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_PUBLISHABLE_KEY)
except Exception as e:
    logger.error(f"Failed to initialize Supabase client: {e}")


def get_supabase_admin() -> Client:
    if supabase_admin is None:
        raise RuntimeError(
            "Supabase client is not configured. Set SUPABASE_URL and "
            "SUPABASE_SECRET_KEY (sb_secret_...) in your environment."
        )
    return supabase_admin


def get_supabase_client() -> Client:
    if supabase_client is None:
        raise RuntimeError(
            "Supabase client is not configured. Set SUPABASE_URL and "
            "SUPABASE_PUBLISHABLE_KEY (sb_publishable_...) in your environment."
        )
    return supabase_client
