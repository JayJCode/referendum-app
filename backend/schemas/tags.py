from pydantic import BaseModel
from typing import List, Optional

class TagBase(BaseModel):
    name: str

class TagCreate(TagBase):
    pass

class TagResponse(TagBase):
    id: int

    class Config:
        from_attributes = True

class ReferendumTagBase(BaseModel):
    referendum_id: int
    tag_id: int

class ReferendumTagCreate(ReferendumTagBase):
    pass

class ReferendumTagResponse(ReferendumTagBase):
    class Config:
        from_attributes = True

class ReferendumTagsResponse(BaseModel):
    referendum_id: int
    tags: List[TagResponse]