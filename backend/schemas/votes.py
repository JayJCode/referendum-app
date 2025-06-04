from datetime import datetime
from pydantic import BaseModel


class VoteCreate(BaseModel):
    referendum_id: int
    vote_value: bool 

class Vote(VoteCreate):
    id: int
    user_id: int
    voted_at: datetime
    
    class Config:
        from_attributes = True