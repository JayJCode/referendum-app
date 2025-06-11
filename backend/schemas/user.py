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
        
class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    password: Optional[str] = None  # For updating password

class UserUpdateResponse(UserResponse):
    id: int
    hashed_password: str
    
    class Config:
        from_attributes = True