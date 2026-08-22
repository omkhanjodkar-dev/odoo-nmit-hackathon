from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field


class FCMTokenRegisterRequest(BaseModel):
    user_id: str = Field(..., description="User UUID associated with this device token")
    fcm_token: str = Field(..., description="FCM device registration token")


class FCMTokenResponse(BaseModel):
    success: bool
    message: str
    user_id: str
    fcm_token: str


class SendNotificationRequest(BaseModel):
    user_id: str = Field(..., description="Target user UUID to fetch tokens from database and send notification")
    title: str = Field(..., description="Notification title")
    body: str = Field(..., description="Notification body content")
    data: Optional[Dict[str, str]] = Field(default_factory=dict, description="Custom data payload")
    image_url: Optional[str] = Field(None, description="Optional image URL")


class SendNotificationResponse(BaseModel):
    success: bool
    message: str
    user_id: str
    tokens_count: int
    details: Optional[Dict[str, Any]] = None
