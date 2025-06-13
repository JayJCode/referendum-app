import os
from requests import Session
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship, sessionmaker, declarative_base
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_FILE = "referendum.db"
DATABASE_PATH = os.path.join(BASE_DIR, DATABASE_FILE)
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DATABASE_PATH}"

# Create the SQLAlchemy engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False}
)

# Each model will inherit from this
Base = declarative_base()

# Create a configured "Session" class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Database Models ---

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String(255))
    role = Column(String, default="user")  # user/moderator/admin
    
    referendums = relationship("Referendum", back_populates="creator")
    votes = relationship("Vote", back_populates="user")

class Referendum(Base):
    __tablename__ = "referendums"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    start_date = Column(DateTime, nullable=True)  # Set by moderator
    end_date = Column(DateTime, nullable=True)   # Set by moderator
    status = Column(String, default="pending")   # pending/approved/rejected/closed
    
    
    creator_id = Column(Integer, ForeignKey("users.id"))
    
    creator = relationship("User", back_populates="referendums")
    votes = relationship("Vote", back_populates="referendum")
    
    # Calculated properties could be added here (like vote counts)

class Vote(Base):
    __tablename__ = "votes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    referendum_id = Column(Integer, ForeignKey("referendums.id"))
    vote_value = Column(Boolean)  # True=Yes, False=No
    voted_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="votes")
    referendum = relationship("Referendum", back_populates="votes")
    
class Tag(Base):
    __tablename__ = "tags"
    
    id = Column(Integer, primary_key=True)
    name = Column(String)
    
    tag_referendum = relationship("Referendum", secondary="referendum_tags")

class ReferendumTag(Base):
    __tablename__ = "referendum_tags"
    
    referendum_id = Column(Integer, ForeignKey('referendums.id'), primary_key=True)
    tag_id = Column(Integer, ForeignKey('tags.id'), primary_key=True)


def create_tables():
    Base.metadata.create_all(bind=engine)
    
def delete_votes_with_no_user(db: Session):
    """Usuwa wszystkie głosy, które nie mają przypisanego użytkownika (user_id IS NULL)."""
    deleted = db.query(Vote).filter(Vote.user_id == None).delete(synchronize_session=False)
    db.commit()
    print(f"Usunięto {deleted} głosów bez użytkownika.")


if __name__ == "__main__":
    create_tables()
    delete_votes_with_no_user(SessionLocal())
    print("Database tables created successfully!")