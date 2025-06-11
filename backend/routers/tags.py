from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List

from database.database import get_db
from database.database import Tag, Referendum, ReferendumTag
from schemas.tags import (
    TagCreate,
    TagResponse,
    ReferendumTagCreate,
    ReferendumTagsResponse
)

router = APIRouter(
    prefix="/tags",
    tags=["tags"]
)

# Endpoint do pobierania wszystkich tagów
@router.get("/", response_model=List[TagResponse])
async def get_all_tags(
    db: Session = Depends(get_db)
):
    try:
        tags = db.query(Tag).all()
        return tags
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching tags: {str(e)}"
        )

# Endpoint do tworzenia nowego tagu
@router.post("/", response_model=TagResponse, status_code=status.HTTP_201_CREATED)
async def create_tag(
    tag_data: TagCreate,
    db: Session = Depends(get_db)
):
    # Sprawdź czy tag już istnieje
    existing_tag = db.query(Tag).filter(Tag.name == tag_data.name).first()
    if existing_tag:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tag with this name already exists"
        )

    try:
        new_tag = Tag(name=tag_data.name)
        db.add(new_tag)
        db.commit()
        db.refresh(new_tag)
        return new_tag
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating tag: {str(e)}"
        )

# Endpoint do usuwania tagu
@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tag(
    tag_id: int,
    db: Session = Depends(get_db)
):
    # Sprawdź czy tag istnieje
    tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag not found"
        )

    # Sprawdź czy tag jest używany w jakichś referendum
    tag_in_use = db.query(ReferendumTag).filter(ReferendumTag.tag_id == tag_id).first()
    if tag_in_use:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete tag - it's being used by one or more referendums"
        )

    try:
        db.delete(tag)
        db.commit()
        return
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting tag: {str(e)}"
        )

# Endpoint do pobierania tagów dla konkretnego referendum
@router.get("/referendum/{referendum_id}", response_model=ReferendumTagsResponse)
async def get_referendum_tags(
    referendum_id: int,
    db: Session = Depends(get_db)
):
    referendum = db.query(Referendum).filter(Referendum.id == referendum_id).first()
    if not referendum:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Referendum not found"
        )

    tags = db.query(Tag).join(ReferendumTag).filter(
        ReferendumTag.referendum_id == referendum_id
    ).all()

    return {
        "referendum_id": referendum_id,
        "tags": tags
    }

# Endpoint do dodawania tagu do referendum
@router.post("/referendum/", response_model=TagResponse, status_code=status.HTTP_201_CREATED)
async def add_tag_to_referendum(
    tag_data: ReferendumTagCreate,
    db: Session = Depends(get_db)
):
    referendum = db.query(Referendum).filter(Referendum.id == tag_data.referendum_id).first()
    if not referendum:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Referendum not found"
        )

    tag = db.query(Tag).filter(Tag.id == tag_data.tag_id).first()
    if not tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag not found"
        )

    existing_link = db.query(ReferendumTag).filter(
        ReferendumTag.referendum_id == tag_data.referendum_id,
        ReferendumTag.tag_id == tag_data.tag_id
    ).first()

    if existing_link:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tag already assigned to this referendum"
        )

    try:
        new_link = ReferendumTag(
            referendum_id=tag_data.referendum_id,
            tag_id=tag_data.tag_id
        )
        
        db.add(new_link)
        db.commit()
        return tag
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error adding tag to referendum: {str(e)}"
        )
        
@router.delete("/referendum/", status_code=status.HTTP_204_NO_CONTENT)
async def remove_tag_from_referendum(
    referendum_id: int = Query(..., description="ID of the referendum"),
    tag_id: int = Query(..., description="ID of the tag to remove"),
    db: Session = Depends(get_db),
):
    link = db.query(ReferendumTag).filter(
        ReferendumTag.referendum_id == referendum_id,
        ReferendumTag.tag_id == tag_id
    ).first()
    if not link:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag is not assigned to this referendum"
        )
    try:
        db.delete(link)
        db.commit()
        return
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error removing tag from referendum: {str(e)}"
        )