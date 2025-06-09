from fastapi import APIRouter, Query, Depends, Body, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import Optional, List

from database.database import get_db, Referendum as ReferendumModel
from schemas.referendum import Referendum, CreateReferendum, ReferendumUpdate
from routers.user import get_current_user_id


router = APIRouter(prefix="/referendums", tags=["referendums"])


@router.post("/", response_model=Referendum, status_code=status.HTTP_201_CREATED)
async def create_referendum(
    referendum: CreateReferendum,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
    ):
    try:
        created_referendum = ReferendumModel(
            title=referendum.title,
            description=referendum.description,
            creator_id=current_user_id,
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
    expand: str = Query(None, description="Expand relationships (e.g., creator)"),
    db: Session = Depends(get_db),
):
    try:
        query = db.query(ReferendumModel)
        if expand == "creator":
            query = query.options(joinedload(ReferendumModel.creator))
        if referendum_id:
            referendum = query.filter(ReferendumModel.id == referendum_id).first()
            referendums = [referendum] if referendum else []
        elif user_id:
            referendums = query.filter(ReferendumModel.creator_id == user_id).all()
        else:
            referendums = query.all()
        db.expire_all()
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
    referendum_id: int = Query(...),
    update_data: ReferendumUpdate = Body(...),
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
