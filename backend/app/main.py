from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.auth import router as auth_router
from app.api.employees import router as employees_router
from app.api.attendance import router as attendance_router
from app.api.leaves import router as leaves_router
from app.api.payroll import router as payroll_router
from app.api.notifications import router as notifications_router
from app.services.fcm_service import init_firebase


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_firebase()
    yield


app = FastAPI(
    title="Dayflow HRMS Backend API",
    description="Full Backend API for Dayflow HRMS built with FastAPI, Supabase Auth & DB, and Firebase Cloud Messaging",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1")
app.include_router(employees_router, prefix="/api/v1")
app.include_router(attendance_router, prefix="/api/v1")
app.include_router(leaves_router, prefix="/api/v1")
app.include_router(payroll_router, prefix="/api/v1")
app.include_router(notifications_router, prefix="/api/v1")


@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "dayflow-hrms-backend",
        "version": "1.0.0",
    }
