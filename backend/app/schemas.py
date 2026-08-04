from __future__ import annotations

from pydantic import BaseModel


class LoginRequest(BaseModel):
    email: str
    password: str


class ProfileUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    password: str | None = None
    role: str | None = 'admin'


class AdminCreate(BaseModel):
    name: str
    email: str
    password: str | None = 'Admin@123'
    role: str | None = 'admin'


class ContributorCreate(BaseModel):
    name: str
    contact: str
    course: str
    college: str
    address: str
    github_username: str


class EmbedConfig(BaseModel):
    embedUrl: str


class ChatRequest(BaseModel):
    question: str


class DocumentSaveRequest(BaseModel):
    name: str
    content_type: str = 'text/markdown'
    text: str
