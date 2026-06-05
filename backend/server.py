from fastapi import FastAPI, APIRouter, HTTPException, Request, Header, Cookie, Response
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import random
import uuid
import httpx
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# ============ DATABASE ============
mongo_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get("DB_NAME", "talkietool")]

# ============ CONFIG ============
STRIPE_API_KEY = os.environ.get("STRIPE_API_KEY", "sk_test_emergent")
BACKEND_URL = os.environ.get("BACKEND_URL", "http://localhost:8000")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")

app = FastAPI(title="TalkieTool API", version="1.0.0")
api_router = APIRouter(prefix="/api")

# ============ CORS ============
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:8081", "exp://localhost:8081"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============ LOGGING ============
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# ============ MODELS ============
class User(BaseModel):
    user_id: str
    nickname: str
    email: Optional[str] = None
    picture: Optional[str] = None
    is_premium: bool = False
    auth_type: str = "nickname"  # nickname | google
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class NicknameAuthRequest(BaseModel):
    nickname: str

class CreateRoomRequest(BaseModel):
    user_id: str
    name: Optional[str] = "Sala TalkieTool"

class JoinRoomRequest(BaseModel):
    user_id: str
    code: str

class VoiceMessageCreate(BaseModel):
    room_code: str
    user_id: str
    audio_base64: str
    duration_ms: int = 0

class CheckoutRequest(BaseModel):
    package_id: str
    origin_url: str
    user_id: str

# ============ PREMIUM PACKAGES ============
PREMIUM_PACKAGES = {
    "premium_monthly": {
        "amount": 299,  # cents
        "currency": "usd",
        "name": "TalkieTool Premium - Monthly",
        "interval": "month"
    },
    "premium_yearly": {
        "amount": 2999,
        "currency": "usd",
        "name": "TalkieTool Premium - Yearly",
        "interval": "year"
    }
}

# ============ HELPER FUNCTIONS ============
def generate_room_code():
    """Generate 4-digit room code"""
    return str(random.randint(1000, 9999))

def generate_user_id():
    """Generate unique user ID"""
    return str(uuid.uuid4())

# ============ AUTH ROUTES ============
@api_router.post("/auth/nickname")
async def auth_nickname(request: NicknameAuthRequest):
    """Authenticate with nickname (no registration needed)"""
    try:
        user_id = generate_user_id()
        user = User(
            user_id=user_id,
            nickname=request.nickname,
            auth_type="nickname"
        )
        
        # Store in DB
        await db.users.insert_one(user.model_dump())
        
        return {
            "success": True,
            "user_id": user_id,
            "nickname": request.nickname,
            "is_premium": False
        }
    except Exception as e:
        logger.error(f"Auth error: {e}")
        raise HTTPException(status_code=400, detail="Auth failed")

@api_router.post("/auth/google")
async def auth_google(token: str):
    """Authenticate with Google OAuth token"""
    try:
        # Verify token with Google (simplified)
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://www.googleapis.com/oauth2/v1/userinfo?access_token={token}"
            )
            google_user = response.json()
        
        # Check if user exists
        user = await db.users.find_one({"email": google_user["email"]})
        
        if not user:
            # Create new user
            user_id = generate_user_id()
            new_user = User(
                user_id=user_id,
                nickname=google_user.get("name", "User"),
                email=google_user["email"],
                picture=google_user.get("picture"),
                auth_type="google"
            )
            await db.users.insert_one(new_user.model_dump())
            return {
                "success": True,
                "user_id": user_id,
                "nickname": new_user.nickname,
                "email": google_user["email"],
                "picture": google_user.get("picture"),
                "is_premium": False,
                "is_new": True
            }
        else:
            return {
                "success": True,
                "user_id": user["user_id"],
                "nickname": user["nickname"],
                "email": user.get("email"),
                "picture": user.get("picture"),
                "is_premium": user.get("is_premium", False),
                "is_new": False
            }
    except Exception as e:
        logger.error(f"Google auth error: {e}")
        raise HTTPException(status_code=400, detail="Google auth failed")

@api_router.get("/user/{user_id}")
async def get_user(user_id: str):
    """Get user details"""
    try:
        user = await db.users.find_one({"user_id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user.pop("_id", None)
        return user
    except Exception as e:
        logger.error(f"Error getting user: {e}")
        raise HTTPException(status_code=500, detail="Error getting user")

# ============ ROOM ROUTES ============
@api_router.post("/room/create")
async def create_room(request: CreateRoomRequest):
    """Create a new voice room"""
    try:
        room_code = generate_room_code()
        
        # Ensure unique code
        while await db.rooms.find_one({"code": room_code}):
            room_code = generate_room_code()
        
        room = {
            "code": room_code,
            "name": request.name,
            "created_by": request.user_id,
            "members": [request.user_id],
            "created_at": datetime.now(timezone.utc),
            "is_active": True
        }
        
        await db.rooms.insert_one(room)
        
        logger.info(f"Room created: {room_code}")
        return {
            "success": True,
            "code": room_code,
            "name": request.name,
            "members": 1
        }
    except Exception as e:
        logger.error(f"Error creating room: {e}")
        raise HTTPException(status_code=500, detail="Error creating room")

@api_router.post("/room/join")
async def join_room(request: JoinRoomRequest):
    """Join an existing room by code"""
    try:
        room = await db.rooms.find_one({"code": request.code, "is_active": True})
        
        if not room:
            raise HTTPException(status_code=404, detail="Room not found")
        
        # Add user to members
        if request.user_id not in room["members"]:
            await db.rooms.update_one(
                {"code": request.code},
                {"$push": {"members": request.user_id}}
            )
        
        logger.info(f"User {request.user_id} joined room {request.code}")
        return {
            "success": True,
            "code": request.code,
            "name": room["name"],
            "members": len(room["members"]) + 1,
            "created_at": room["created_at"]
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error joining room: {e}")
        raise HTTPException(status_code=500, detail="Error joining room")

@api_router.get("/room/{code}")
async def get_room(code: str):
    """Get room details"""
    try:
        room = await db.rooms.find_one({"code": code})
        if not room:
            raise HTTPException(status_code=404, detail="Room not found")
        
        room.pop("_id", None)
        return room
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting room: {e}")
        raise HTTPException(status_code=500, detail="Error getting room")

@api_router.post("/room/leave")
async def leave_room(code: str, user_id: str):
    """Leave a room"""
    try:
        await db.rooms.update_one(
            {"code": code},
            {"$pull": {"members": user_id}}
        )
        
        # Check if room is empty
        room = await db.rooms.find_one({"code": code})
        if len(room["members"]) == 0:
            await db.rooms.update_one({"code": code}, {"$set": {"is_active": False}})
        
        logger.info(f"User {user_id} left room {code}")
        return {"success": True}
    except Exception as e:
        logger.error(f"Error leaving room: {e}")
        raise HTTPException(status_code=500, detail="Error leaving room")

# ============ VOICE MESSAGE ROUTES ============
@api_router.post("/voice/send")
async def send_voice_message(message: VoiceMessageCreate):
    """Store voice message (for recording feature in premium)"""
    try:
        voice_msg = {
            "room_code": message.room_code,
            "user_id": message.user_id,
            "audio_base64": message.audio_base64,
            "duration_ms": message.duration_ms,
            "created_at": datetime.now(timezone.utc)
        }
        
        result = await db.voice_messages.insert_one(voice_msg)
        
        return {
            "success": True,
            "message_id": str(result.inserted_id),
            "duration_ms": message.duration_ms
        }
    except Exception as e:
        logger.error(f"Error saving voice message: {e}")
        raise HTTPException(status_code=500, detail="Error saving message")

@api_router.get("/voice/messages/{room_code}")
async def get_voice_messages(room_code: str, limit: int = 50):
    """Get recent voice messages from a room (premium feature)"""
    try:
        messages = await db.voice_messages.find(
            {"room_code": room_code}
        ).sort("created_at", -1).limit(limit).to_list(length=limit)
        
        for msg in messages:
            msg["_id"] = str(msg["_id"])
        
        return {"success": True, "messages": messages}
    except Exception as e:
        logger.error(f"Error getting messages: {e}")
        raise HTTPException(status_code=500, detail="Error getting messages")

# ============ PREMIUM/PAYMENT ROUTES ============
@api_router.post("/checkout/create")
async def create_checkout(request: CheckoutRequest):
    """Create Stripe checkout session"""
    try:
        package = PREMIUM_PACKAGES.get(request.package_id)
        if not package:
            raise HTTPException(status_code=400, detail="Invalid package")
        
        # Create checkout session (simplified)
        checkout_data = {
            "user_id": request.user_id,
            "package_id": request.package_id,
            "amount": package["amount"],
            "currency": package["currency"],
            "status": "pending",
            "created_at": datetime.now(timezone.utc),
            "origin_url": request.origin_url
        }
        
        result = await db.checkout_sessions.insert_one(checkout_data)
        
        # In production, use Stripe SDK
        return {
            "success": True,
            "session_id": str(result.inserted_id),
            "package_name": package["name"],
            "amount": package["amount"] / 100  # Convert to dollars
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating checkout: {e}")
        raise HTTPException(status_code=500, detail="Error creating checkout")

@api_router.post("/checkout/confirm")
async def confirm_checkout(session_id: str, user_id: str):
    """Confirm payment and upgrade user to premium"""
    try:
        session = await db.checkout_sessions.find_one({"_id": session_id})
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Update user to premium
        await db.users.update_one(
            {"user_id": user_id},
            {
                "$set": {
                    "is_premium": True,
                    "premium_since": datetime.now(timezone.utc),
                    "package_id": session["package_id"]
                }
            }
        )
        
        # Mark checkout as completed
        await db.checkout_sessions.update_one(
            {"_id": session_id},
            {"$set": {"status": "completed", "completed_at": datetime.now(timezone.utc)}}
        )
        
        logger.info(f"User {user_id} upgraded to premium")
        return {"success": True, "is_premium": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error confirming checkout: {e}")
        raise HTTPException(status_code=500, detail="Error confirming payment")

# ============ HEALTH CHECK ============
@api_router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc),
        "version": "1.0.0"
    }

# ============ INCLUDE ROUTER ============
app.include_router(api_router)

# ============ ROOT ROUTE ============
@app.get("/")
async def root():
    """API root"""
    return {
        "name": "TalkieTool API",
        "version": "1.0.0",
        "description": "Voice communication interface for gaming",
        "docs": f"{BACKEND_URL}/docs"
    }

# ============ RUN ============
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
