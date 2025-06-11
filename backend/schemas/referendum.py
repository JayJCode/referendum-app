from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel

from schemas.user import UserResponse


class CreateReferendum(BaseModel):
    title:str
    description: str

class Referendum(CreateReferendum):
    id: int
    status: str = "pending" # e.g., "active", "closed", "cancelled" 
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    creator: Optional[UserResponse] = None
    
    class Config:
        from_attributes = True
        
class ReferendumUpdate(BaseModel):
    status: Optional[Literal["pending", "active", "closed", "cancelled"]] = None
    title: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    
    class Config:
        from_attributes = True