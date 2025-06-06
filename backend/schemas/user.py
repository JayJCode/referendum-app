from pydantic import BaseModel, EmailStr
from typing import Optional

class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: Optional[str] = "user"

class UserCreate(UserBase):
    password: str  

class UserResponse(UserBase):
    id: int
    hashed_password: str
    
    class Config:
        from_attributes = True 