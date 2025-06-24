import os
import random
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
from email.message import EmailMessage
from aiosmtplib import send

GMAIL_USER = os.getenv("GMAIL_USER")
GMAIL_PASS = os.getenv("GMAIL_PASS")

class OTPRequest(BaseModel):
    email: EmailStr

def sendOTP(app: FastAPI):
    @app.post("/send-otp")
    async def send_otp(request: OTPRequest):
        otp = str(random.randint(100000, 999999))
        message = EmailMessage()
        message["From"] = GMAIL_USER
        message["To"] = request.email
        message["Subject"] = "Your OTP Code"
        message.set_content(f"Your OTP code is: {otp}")

        try:
            await send(
                message,
                hostname="smtp.gmail.com",
                port=587,
                start_tls=True,
                username=GMAIL_USER,
                password=GMAIL_PASS,
            )
            return {"message": "OTP sent!"}
        except Exception as e:
            raise HTTPException(status_code=500, detail="Failed to send OTP.")
