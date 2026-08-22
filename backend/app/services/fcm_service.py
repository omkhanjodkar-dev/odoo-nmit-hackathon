import json
import logging
import os
from typing import List, Optional, Dict, Any
import firebase_admin
from firebase_admin import credentials, messaging
from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

_firebase_initialized = False


def init_firebase():
    global _firebase_initialized
    if _firebase_initialized:
        return

    try:
        if settings.FIREBASE_CREDENTIALS_JSON:
            cred_dict = json.loads(settings.FIREBASE_CREDENTIALS_JSON)
            cred = credentials.Certificate(cred_dict)
            firebase_admin.initialize_app(cred)
            _firebase_initialized = True
            logger.info("Firebase Admin initialized via FIREBASE_CREDENTIALS_JSON")
        elif settings.FIREBASE_CREDENTIALS_PATH and os.path.exists(settings.FIREBASE_CREDENTIALS_PATH):
            cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
            firebase_admin.initialize_app(cred)
            _firebase_initialized = True
            logger.info(f"Firebase Admin initialized via {settings.FIREBASE_CREDENTIALS_PATH}")
        else:
            logger.warning("Firebase credentials not found or configured. Notification sending will log mock output.")
    except Exception as e:
        logger.error(f"Failed to initialize Firebase Admin SDK: {e}")


def send_fcm_notification(
    token: str,
    title: str,
    body: str,
    data: Optional[Dict[str, str]] = None,
    image_url: Optional[str] = None
) -> Dict[str, Any]:
    """
    Sends a push notification to a single FCM device token.
    """
    init_firebase()
    if not _firebase_initialized:
        logger.warning(f"[MOCK NOTIFICATION] Token: {token} | Title: {title} | Body: {body} | Data: {data}")
        return {"success": True, "mock": True, "message_id": "mock_msg_id"}

    notification = messaging.Notification(
        title=title,
        body=body,
        image=image_url
    )

    message = messaging.Message(
        notification=notification,
        data=data or {},
        token=token
    )

    try:
        response = messaging.send(message)
        logger.info(f"Successfully sent FCM message: {response}")
        return {"success": True, "message_id": response}
    except Exception as e:
        logger.error(f"Error sending FCM message to {token}: {e}")
        return {"success": False, "error": str(e)}


def send_multicast_fcm_notification(
    tokens: List[str],
    title: str,
    body: str,
    data: Optional[Dict[str, str]] = None,
    image_url: Optional[str] = None
) -> Dict[str, Any]:
    """
    Sends a push notification to multiple FCM device tokens.
    """
    if not tokens:
        return {"success": True, "success_count": 0, "failure_count": 0}

    init_firebase()
    if not _firebase_initialized:
        logger.warning(f"[MOCK MULTICAST NOTIFICATION] Count: {len(tokens)} | Title: {title} | Body: {body}")
        return {"success": True, "mock": True, "success_count": len(tokens), "failure_count": 0}

    notification = messaging.Notification(
        title=title,
        body=body,
        image=image_url
    )

    multicast_message = messaging.MulticastMessage(
        notification=notification,
        data=data or {},
        tokens=tokens
    )

    try:
        batch_response = messaging.send_each_for_multicast(multicast_message)
        logger.info(f"Multicast sent: {batch_response.success_count} success, {batch_response.failure_count} failures")
        return {
            "success": True,
            "success_count": batch_response.success_count,
            "failure_count": batch_response.failure_count,
        }
    except Exception as e:
        logger.error(f"Error sending multicast FCM message: {e}")
        return {"success": False, "error": str(e)}
