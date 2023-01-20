from sqlalchemy.orm import Session
from sqlalchemy import update
import models, schemas
from util import hash

# User
def create_user(db: Session, register: schemas.Register):
	users = get_users(db)
	usernames = [user.username for user in users]
	if (register.username in usernames):
		raise ValueError("Username already exists")
	
	if (register.password != register.confirm_password):
		raise ValueError("Passwords do not match")

	db_user = models.User(
		username=register.username,
		passhash=hash(register.password)
	)

	db.add(db_user)
	db.commit()
	db.refresh(db_user)
	return db_user

def get_users(db: Session):
	return db.query(models.User).all()

def get_user(db: Session, login: schemas.Login):
	user = db.query(models.User).filter(models.User.username == login.username, models.User.passhash == hash(login.password)).one_or_none()
	
	if (user is not None):
		return user
	
	users = get_users(db)
	usernames = [user.username for user in users]

	if (login.username not in usernames):
		raise ValueError("Username not found")
	else:
		raise ValueError("Incorrect Password")

def get_user_by_username(db: Session, username: str):
	user = db.query(models.User).filter(models.User.username == username).one_or_none()
	
	if user is  None:
		raise ValueError("Username not found")

	return user


# Text
def create_text(db: Session, text: schemas.TextCreate):
	db_text = models.Text(username=text.username, title='Untitled Text', text='')
	db.add(db_text)
	db.commit()
	db.refresh(db_text)
	return db_text

def update_text(db: Session, text: schemas.Text):
	db.query(models.Text).filter(models.Text.id == text.id).update(text.dict())
	db.commit()

def delete_text(db: Session, text: schemas.TextBase):
	db.query(models.Text).filter(models.Text.id == text.id).delete()
	db.commit()

def get_text_by_id(db: Session, id: int):
	text = db.query(models.Text).filter(models.Text.id == id).one_or_none()
	
	if text is  None:
		raise ValueError("Text not found")

	return text