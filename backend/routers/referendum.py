from fastapi import APIRouter, Query, Depends, Body, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List

from database.database import get_db, Referendum as ReferendumModel
from schemas.referendum import Referendum, CreateReferendum


router = APIRouter(prefix="/referendums", tags=["referendums"])


@router.post("/", response_model=Referendum, status_code=status.HTTP_201_CREATED)
async def create_referendum(
    referendum: CreateReferendum,
    db: Session = Depends(get_db),
    ):
    try:
        created_referendum = ReferendumModel(
            title=referendum.title,
            description=referendum.description,
            creator_id=referendum.creator_id,
        )
        db.add(created_referendum)
        db.commit()
        db.refresh(created_referendum) 
        return created_referendum
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
        
@router.get("/", response_model=List[Referendum])
async def get_referendums(
    referendum_id: Optional[int] = Query(None, description="ID of the referendum"),
    user_id: Optional[int] = Query(None, description="ID of the user requesting the referendum"),
    db: Session = Depends(get_db),
):
    try:
        if referendum_id:
            referendums = db.query(ReferendumModel).filter(ReferendumModel.id == referendum_id).first()
        elif user_id:
            referendums = db.query(ReferendumModel).filter(ReferendumModel.creator_id == user_id).all()
        else:
            referendums = db.query(ReferendumModel).all()
        return referendums
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
        
@router.delete("/", response_model=Referendum)
async def delete_referendum(
    referendum_id: int = Query(..., description="ID of the referendum"),
    db: Session = Depends(get_db),
    ):
    try:
        referendum  = db.query(ReferendumModel).filter(ReferendumModel.id == referendum_id).first()
        if not referendum:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Referendum with ID {referendum_id} not found"
            )
        db.delete(referendum )
        db.commit()
        return referendum 
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
        
@router.patch("/", response_model=Referendum)
async def update_referendum(
    referendum_id: int = Query(..., description="ID of the referendum to update"),
    update_data: Referendum = Body(..., description="Content to update the referendum with"),
    db: Session = Depends(get_db),
):
    try:
        referendum = db.query(ReferendumModel).filter(ReferendumModel.id == referendum_id).first()
        if not referendum:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Referendum with ID {referendum_id} not found"
            )
        update_dict = update_data.dict(exclude_unset=True)
        for field, value in update_dict.items():
            setattr(referendum, field, value)
        db.commit()
        return referendum
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )