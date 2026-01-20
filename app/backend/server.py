from fastapi import FastAPI, APIRouter, HTTPException, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Any
import uuid
from datetime import datetime, timezone
import hashlib

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix=\"/api\")

# Admin password - stored as hash
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'mapmaker2024')

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

# Models
class CanvasElement(BaseModel):
    model_config = ConfigDict(extra=\"ignore\")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str  # freehand, rectangle, circle, line, text
    points: Optional[List[float]] = None  # For freehand and line
    x: Optional[float] = None
    y: Optional[float] = None
    width: Optional[float] = None
    height: Optional[float] = None
    radius: Optional[float] = None
    text: Optional[str] = None
    color: str = \"#ffffff\"
    strokeWidth: float = 2
    fontSize: Optional[int] = 16
    zoomLevel: Optional[float] = 1  # At what zoom level this was created

class CanvasElementCreate(BaseModel):
    type: str
    points: Optional[List[float]] = None
    x: Optional[float] = None
    y: Optional[float] = None
    width: Optional[float] = None
    height: Optional[float] = None
    radius: Optional[float] = None
    text: Optional[str] = None
    color: str = \"#ffffff\"
    strokeWidth: float = 2
    fontSize: Optional[int] = 16
    zoomLevel: Optional[float] = 1

class CanvasState(BaseModel):
    model_config = ConfigDict(extra=\"ignore\")
    
    elements: List[dict]
    viewport: dict  # {x, y, scale}
    updated_at: str

class AdminAuth(BaseModel):
    password: str

class AdminAuthResponse(BaseModel):
    success: bool
    token: Optional[str] = None

# Routes
@api_router.get(\"/\")
async def root():
    return {\"message\": \"Map Canvas API\"}

@api_router.post(\"/auth/verify\", response_model=AdminAuthResponse)
async def verify_admin(auth: AdminAuth):
    \"\"\"Verify admin password and return a simple token\"\"\"
    if auth.password == ADMIN_PASSWORD:
        # Simple token - just a hash of password + timestamp
        token = hash_password(auth.password + str(datetime.now(timezone.utc).timestamp()))
        return AdminAuthResponse(success=True, token=token)
    return AdminAuthResponse(success=False, token=None)

@api_router.get(\"/canvas/elements\")
async def get_canvas_elements():
    \"\"\"Get all canvas elements\"\"\"
    elements = await db.canvas_elements.find({}, {\"_id\": 0}).to_list(10000)
    return {\"elements\": elements}

@api_router.post(\"/canvas/elements\")
async def create_element(element: CanvasElementCreate):
    \"\"\"Create a new canvas element\"\"\"
    element_obj = CanvasElement(**element.model_dump())
    doc = element_obj.model_dump()
    await db.canvas_elements.insert_one(doc)
    return {\"success\": True, \"element\": doc}

@api_router.post(\"/canvas/elements/batch\")
async def create_elements_batch(elements: List[CanvasElementCreate]):
    \"\"\"Create multiple canvas elements at once\"\"\"
    docs = []
    for element in elements:
        element_obj = CanvasElement(**element.model_dump())
        docs.append(element_obj.model_dump())
    
    if docs:
        await db.canvas_elements.insert_many(docs)
    return {\"success\": True, \"count\": len(docs)}

@api_router.put(\"/canvas/elements/{element_id}\")
async def update_element(element_id: str, element: CanvasElementCreate):
    \"\"\"Update a canvas element\"\"\"
    update_data = element.model_dump()
    result = await db.canvas_elements.update_one(
        {\"id\": element_id},
        {\"$set\": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail=\"Element not found\")
    return {\"success\": True}

@api_router.delete(\"/canvas/elements/{element_id}\")
async def delete_element(element_id: str):
    \"\"\"Delete a canvas element\"\"\"
    result = await db.canvas_elements.delete_one({\"id\": element_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail=\"Element not found\")
    return {\"success\": True}

@api_router.delete(\"/canvas/elements\")
async def clear_canvas():
    \"\"\"Clear all canvas elements\"\"\"
    await db.canvas_elements.delete_many({})
    return {\"success\": True}

@api_router.get(\"/canvas/state\")
async def get_canvas_state():
    \"\"\"Get saved canvas state (viewport position)\"\"\"
    state = await db.canvas_state.find_one({\"id\": \"main\"}, {\"_id\": 0})
    if not state:
        return {\"viewport\": {\"x\": 0, \"y\": 0, \"scale\": 1}}
    return state

@api_router.post(\"/canvas/state\")
async def save_canvas_state(viewport: dict):
    \"\"\"Save canvas viewport state\"\"\"
    await db.canvas_state.update_one(
        {\"id\": \"main\"},
        {\"$set\": {
            \"id\": \"main\",
            \"viewport\": viewport,
            \"updated_at\": datetime.now(timezone.utc).isoformat()
        }},
        upsert=True
    )
    return {\"success\": True}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=[\"*\"],
    allow_headers=[\"*\"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event(\"shutdown\")
async def shutdown_db_client():
    client.close()
