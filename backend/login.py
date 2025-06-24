from fastapi import FastAPI, HTTPException


async def sign_up(user, supabase):
    try:
        response = supabase.auth.sign_up({
            "email": user.email,
            "password": user.password,
            "options": {
                "data": {"full_name": user.fullName}
            }
        })
        supabase.table("customer").insert({
            "name": user.fullName, "email": user.email, "user_id": response.user.id
        }).execute()
        return {"success": True, "user": response.user.id}
    except Exception as e:
        print(f"Error during sign-up: {e}")
        raise HTTPException(status_code=400, detail=str(e))


async def login(user, supabase):
    try:
        response = supabase.auth.sign_in_with_password({
            "email": user.email,
            "password": user.password
        })
        return {"success": True, "user": response.user.id}
    except Exception as e:
        return {"success": False, "error": str(e)}