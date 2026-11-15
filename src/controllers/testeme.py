"""Controller for TestMe API - all routes defined in main.py."""

from fastapi import APIRouter, HTTPException

router = APIRouter(tags=["activities"])