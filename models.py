from sqlalchemy import Column, ForeignKey, Integer, String, Float, Boolean, Table
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
	__tablename__ = "users"

	username = Column(String, unique=True, primary_key=True)
	passhash = Column(String, primary_key=True)

	texts = relationship("Text", back_populates="user")



class Text(Base):
	__tablename__ = "texts"

	id = Column(Integer, primary_key=True)
	title = Column(String)
	text = Column(String)
	
	username = Column(String, ForeignKey("users.username"), nullable=False)

	user = relationship("User", back_populates="texts")