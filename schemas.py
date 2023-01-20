from pydantic import BaseModel
from typing import List

class User(BaseModel):
	username: str

	class Config:
		orm_mode = True

class TextCreate(BaseModel):
	username: str

class TextBase(BaseModel):
	id: int

class Text(TextBase):
	title: str
	text: str

	class Config:
		orm_mode = True

class UserRead(User):
	texts: List[Text]

	class Config:
		orm_mode = True

class TextRead(Text):
	user: User

	class Config:
		orm_mode = True

# Route-specific Schemas
class Login(BaseModel):
	username: str
	password: str

class Register(Login):
	confirm_password: str

class JWT(BaseModel):
	accessToken: str