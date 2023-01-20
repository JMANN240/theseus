import os
from fastapi import FastAPI, Request, Body
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import json
import requests
from dotenv import load_dotenv
from typing import Union, List
import sqlite3
import starlette.status as status
from fastapi import FastAPI, Request, Form, Response, Cookie, Depends, Header, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from util import *
from hashlib import sha512
from sqlalchemy.orm import Session
import crud, schemas
from database import SessionLocal
from pydantic import BaseModel

load_dotenv()
DICTIONARY_API_KEY = os.environ['DICTIONARY_API_KEY']
PASSWORD_HASH_KEY = os.environ['PASSWORD_HASH_KEY']

thesaurus_filename = 'thesaurus.json'

app = FastAPI()
api = FastAPI()

app.mount('/static', StaticFiles(directory='static'), name='static')
app.mount('/api', api)

templates = Jinja2Templates(directory='templates')

thesaurus = {}
with open(thesaurus_filename) as thesaurus_file:
	thesaurus = json.load(thesaurus_file)

def addMerriamWebsterWord(word):
	global thesaurus

	res = requests.get(f'https://dictionaryapi.com/api/v3/references/thesaurus/json/{word}?key={DICTIONARY_API_KEY}')
	res_json = res.json()

	print(res_json)

	try:
		res_words = [word_data for word_data in res_json if word_data['meta']['id'] == word]
	except TypeError as e:
		print(e)
		thesaurus[word] = {}
		with open(thesaurus_filename, 'w') as thesaurus_file:
			json.dump(thesaurus, thesaurus_file, indent=4)
		return thesaurus[word]


	with open(thesaurus_filename) as thesaurus_file:
		thesaurus = json.load(thesaurus_file)

	thesaurus[word] = {res_word['fl']: {definition[0][1]['dt'][0][1]: synonyms for definition, synonyms in zip(res_word['def'][0]['sseq'], res_word['meta']['syns'])} for res_word in res_words}

	with open(thesaurus_filename, 'w') as thesaurus_file:
		json.dump(thesaurus, thesaurus_file, indent=4)
	
	return thesaurus[word]

def get_db():
	db = SessionLocal()
	try:
		yield db
	finally:
		db.close()

class Payload(BaseModel):
	username: str

def authorization(request: Request, token: Union[str, None] = Cookie(default=None)):
	if token is None:
		raise HTTPException(
			status_code=status.HTTP_307_TEMPORARY_REDIRECT,
			headers={'Location': f'/login?redirect={request.url.path}'}
		)
	payload = jwt.decode(token, bytes(PASSWORD_HASH_KEY, 'utf-8'), algorithms="HS256")
	return payload

@app.get('/')
@app.get('/block')
async def block(request: Request):
	return templates.TemplateResponse('block.html', {'request': request})

@app.get('/single')
async def single(request: Request):
	return templates.TemplateResponse('single.html', {'request': request})

@app.get('/texts')
async def texts(request: Request, payload: Payload = Depends(authorization)):
	return templates.TemplateResponse('texts.html', {'request': request})

@app.get('/text/{text_id}')
async def texts(text_id: int, request: Request, payload: Payload = Depends(authorization)):
	return templates.TemplateResponse('text.html', {'request': request, 'text_id': text_id})

@app.get('/login')
async def login(request: Request):
	return templates.TemplateResponse('login.html', {'request': request})

@app.get('/logout')
async def logout(request: Request):
	response = RedirectResponse('/')
	response.set_cookie(key='token', value='', max_age=0)
	return response

@app.get('/register')
async def register(request: Request):
	return templates.TemplateResponse('register.html', {'request': request})

@api.post('/login', response_model=schemas.JWT)
async def login_post(login: schemas.Login, db: Session = Depends(get_db)):
	try:
		user = crud.get_user(db, login)
	except ValueError as e:
		raise HTTPException(
			status_code=status.HTTP_400_BAD_REQUEST,
			detail=e.args[0]
		)
	accessToken = generate_jwt(user.username)
	return {
		'accessToken': accessToken
	}

@api.post('/register', response_model=schemas.JWT)
async def register_post(register: schemas.Register, db: Session = Depends(get_db)):
	try:
		user = crud.create_user(db, register)
	except ValueError as e:
		raise HTTPException(
			status_code=status.HTTP_400_BAD_REQUEST,
			detail=e.args[0]
		)
	accessToken = generate_jwt(user.username)
	return {
		'accessToken': accessToken
	}

@api.get('/thesaurus/{word}')
async def get_synonym(word: str):
	synonyms = thesaurus.get(word.lower(), None)
	if synonyms is None:
		print("We don't have that word yet, asking Merriam-Webster!")
		synonyms = addMerriamWebsterWord(word.lower())
	else:
		print("We have that word, getting it from our local thesaurus")
	return synonyms

@api.get('/text')
async def get_text(id: int, db: Session = Depends(get_db)):
	return crud.get_text_by_id(db, id)

@api.post('/text')
async def post_text(text: schemas.Text, db: Session = Depends(get_db)):
	crud.update_text(db, text)

@api.delete('/text')
async def delete_text(text: schemas.TextBase, db: Session = Depends(get_db)):
	crud.delete_text(db, text)

@api.get('/texts', response_model=List[schemas.TextRead])
async def texts_get(db: Session = Depends(get_db), payload: Payload = Depends(authorization)):
	user = crud.get_user_by_username(db, payload.get('username'))
	return user.texts

@api.post('/text/create')
async def create_text(db: Session = Depends(get_db), payload: Payload = Depends(authorization)):
	return crud.create_text(db, schemas.TextCreate(username=payload.get('username')))