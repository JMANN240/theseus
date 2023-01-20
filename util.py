from hashlib import sha512
import jwt
import time
import os
from dotenv import load_dotenv

load_dotenv()
PASSWORD_HASH_KEY = os.environ['PASSWORD_HASH_KEY']

def hash(password):
	hash = sha512()
	hash.update(password.encode('utf-8') + bytes(PASSWORD_HASH_KEY, 'utf-8'))
	passhash = hash.hexdigest()
	return passhash

def generate_jwt(username):
	accessToken = jwt.encode({
		"username": username,
		"exp": time.time() + 60*60*24
	}, bytes(PASSWORD_HASH_KEY, 'utf-8'), algorithm="HS256")
	return accessToken