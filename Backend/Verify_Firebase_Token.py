from firebase_admin import auth
from fastapi import Request, HTTPException


async def verify_firebase_token(request: Request):
    auth_header = request.headers.get("Authorization")
    print("Authorization header:", request.headers.get("Authorization"))

    if not auth_header:
        raise HTTPException(status_code=401, detail="Missing token")

    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token format")

    token = auth_header.split("Bearer ")[1]

    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token["uid"]
    except Exception as e:
        print("Token verification error:", e)
        raise HTTPException(status_code=401, detail="Invalid token")