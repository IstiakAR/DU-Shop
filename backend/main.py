import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from dotenv import load_dotenv
from supabase import create_client, Client # type: ignore
from pydantic import BaseModel

from otpSend import sendOTP
from login import login
from login import sign_up

load_dotenv()

supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")
supabase = create_client(supabase_url, supabase_key)

app = FastAPI(
    title="DU-Shop API",
    description="Backend API for DU-Shop e-commerce platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to DU-Shop API"}


class UserSignUp(BaseModel):
    email: str
    password: str
    fullName: str = None

@app.post("/sign-up")
async def user_sign_up(user: UserSignUp):
    return await sign_up(user, supabase)


class UserLogin(BaseModel):
    email: str
    password: str

@app.post("/login")
async def user_login(user: UserLogin):
    return await login(user, supabase)


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)