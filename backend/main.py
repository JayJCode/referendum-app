from contextlib import asynccontextmanager
from datetime import datetime as dt
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import referendum
from routers import user
from routers import votes
from routers import tags
from logger import configure_logger
from database import database

logger = configure_logger()
startup_start = dt.now()
logger.info(f"Starting up the server... {startup_start}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    startup_time = (dt.now() - startup_start).total_seconds()*1000
    logger.info(f"Server started in {startup_time:.2f} ms")
    yield
    shutdown_start = dt.now()
    logger.info(f"Shutting down the server... {shutdown_start}")
    logger.info(f"Server uptime: {shutdown_start - startup_start}")
    
    
app = FastAPI(
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root_handler():
    return {"message": "Hello!"}

app.include_router(referendum.router)
app.include_router(user.router)
app.include_router(votes.router)
app.include_router(tags.router)


if __name__ == "__main__":
    import uvicorn
    database.create_tables()
    logger.info("Database tables created successfully!")
    logger.info("Local mode: Development server started")
    uvicorn.run("main:app", port=8000, reload=True)