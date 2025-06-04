from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class CreateReferendum(BaseModel):
    title:str
    description: str
    creator_id: int

class Referendum(CreateReferendum):
    id: int
    status: str = "pending" # e.g., "active", "closed", "cancelled" 
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    
    class Config:
        from_attributes = True