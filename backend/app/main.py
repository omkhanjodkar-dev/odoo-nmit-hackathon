from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.notifications import router as notifications_router
from app.services.fcm_service import init_firebase


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize services on startup
    init_firebase()
    yield


app = FastAPI(
    title="Dayflow HRMS Backend API",
    description="Backend API for Dayflow HRMS built with FastAPI, Supabase & Firebase Cloud Messaging (FCM)",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(notifications_router, prefix="/api/v1")


@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "dayflow-hrms-backend",
        "version": "1.0.0"
    }
