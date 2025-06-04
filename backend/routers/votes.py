from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List

from schemas.votes import VoteCreate, Vote
from database.database import get_db, Vote as VoteModel
from routers.user import get_current_user_id


router = APIRouter(prefix="/votes", tags=["votes"])


@router.post("/", response_model=Vote, status_code=status.HTTP_201_CREATED)
async def create_vote(
    vote: VoteCreate,
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    existing_vote = db.query(VoteModel).filter(
        VoteModel.user_id == current_user_id,
        VoteModel.referendum_id == vote.referendum_id
    ).first()
    
    if existing_vote:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already voted on this referendum"
        )

    try:
        new_vote = VoteModel(
            user_id=current_user_id,
            referendum_id=vote.referendum_id,
            vote_value=vote.vote_value,
        )
        
        db.add(new_vote)
        db.commit()
        db.refresh(new_vote)
        return new_vote
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating vote: {str(e)}"
        )
        
@router.get("/", response_model=List[Vote])
async def get_votes(
    vote_id: Optional[int] = Query(None, description="ID of the vote"),
    referendum_id: Optional[int] = Query(None, description="ID of the referendum"),
    user_id: Optional[int] = Query(None, description="ID of the user"),
    db: Session = Depends(get_db)
):
    try:
        query = db.query(VoteModel)
        if vote_id:
            vote = query.filter(VoteModel.id == vote_id).first()
            if not vote:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Vote not found"
                )
            return [vote]
        if referendum_id:
            vote = query.filter(VoteModel.referendum_id == referendum_id).all()
            if not vote:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Vote not found"
                )
            return vote
        if user_id:
            vote = query.filter(VoteModel.user_id == user_id).all()
            return vote   
        return query.all()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )