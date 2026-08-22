import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.auth import get_optional_user, AuthenticatedUser
from app.core.supabase import get_supabase_admin
from app.schemas.notification import (
    FCMTokenRegisterRequest,
    FCMTokenResponse,
    SendNotificationRequest,
    SendNotificationResponse,
)
from app.services.fcm_service import send_fcm_notification, send_multicast_fcm_notification

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.post("/register-token", response_model=FCMTokenResponse)
async def register_fcm_token(
    payload: FCMTokenRegisterRequest,
):
    """
    Registers an FCM token associated with a user_id into the Supabase database.
    Only takes user_id and fcm_token.
    """
    try:
        supabase = get_supabase_admin()

        data_payload = {
            "user_id": payload.user_id,
            "fcm_token": payload.fcm_token,
        }

        res = supabase.table("fcm_tokens").upsert(
            data_payload,
            on_conflict="fcm_token",
        ).execute()

        return FCMTokenResponse(
            success=True,
            message="FCM token successfully registered",
            user_id=payload.user_id,
            fcm_token=payload.fcm_token,
        )
    except Exception as e:
        logger.error(f"Failed to save FCM token to Supabase for user {payload.user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error registering FCM token: {str(e)}"
        )


@router.post("/send", response_model=SendNotificationResponse)
async def send_notification(
    payload: SendNotificationRequest,
):
    """
    Fetches all fcm_tokens from Supabase using user_id and sends push notification.
    """
    # 1. Fetch tokens for this user_id from the database
    tokens = []
    try:
        supabase = get_supabase_admin()
        response = (
            supabase.table("fcm_tokens")
            .select("fcm_token")
            .eq("user_id", payload.user_id)
            .execute()
        )
        if response.data:
            tokens = [
                row["fcm_token"]
                for row in response.data
                if row.get("fcm_token")
            ]
    except Exception as e:
        logger.error(f"Database error fetching tokens for user {payload.user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to query user tokens: {str(e)}"
        )

    if not tokens:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No registered FCM tokens found for user_id: {payload.user_id}"
        )

    # 2. Dispatch push notification via FCM
    if len(tokens) == 1:
        res = send_fcm_notification(
            token=tokens[0],
            title=payload.title,
            body=payload.body,
            data=payload.data,
            image_url=payload.image_url,
        )
    else:
        res = send_multicast_fcm_notification(
            tokens=tokens,
            title=payload.title,
            body=payload.body,
            data=payload.data,
            image_url=payload.image_url,
        )

    return SendNotificationResponse(
        success=res.get("success", False),
        message="Notification dispatch completed",
        user_id=payload.user_id,
        tokens_count=len(tokens),
        details=res,
    )
