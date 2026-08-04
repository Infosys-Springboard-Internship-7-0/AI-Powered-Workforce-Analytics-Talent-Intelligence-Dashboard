from __future__ import annotations

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from .core.config import settings
from .schemas import (
    AdminCreate,
    ChatRequest,
    ContributorCreate,
    DocumentSaveRequest,
    EmbedConfig,
    LoginRequest,
    ProfileUpdate,
)
from .services.contributor_service import ContributorService
from .services.dataset_service import DatasetService
from .services.powerbi_service import PowerBiService
from .services.rag_service import RagService
from .services.state_service import JsonStateService
from .services.db_service import DbStateService

app = FastAPI(title='RAG Based Analytics Platform', version='1.0.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

state_service = JsonStateService()
db_state_service = DbStateService(state_service)
contributor_service = ContributorService()
dataset_service = DatasetService()
powerbi_service = PowerBiService(state_service)
rag_service = RagService(state_service)


@app.get('/api/health')
def health_check() -> dict[str, str]:
    return {'status': 'ok', 'service': settings.app_name}


@app.post('/api/auth/login')
def login(payload: LoginRequest) -> dict[str, str]:
    success = db_state_service.authenticate_admin(payload.email, payload.password)
    if success:
        return {'message': 'Admin login successful'}
    return {'message': 'Invalid email or password'}


@app.get('/api/profile')
def get_profile(email: str | None = None) -> dict[str, str]:
    return db_state_service.get_profile(email)


@app.put('/api/profile')
def update_profile(payload: ProfileUpdate, current_email: str | None = None) -> dict[str, str]:
    search_email = current_email or payload.email or settings.admin_email
    return db_state_service.save_profile(
        current_email=search_email,
        name=payload.name or 'Admin',
        new_email=payload.email or search_email,
        password=payload.password or '',
        role='admin',
    )


@app.get('/api/admins')
def list_admins() -> dict[str, list[dict[str, str]]]:
    return {'admins': db_state_service.list_admins()}


@app.post('/api/admins')
def add_admin(payload: AdminCreate) -> dict[str, list[dict[str, str]]]:
    admins = db_state_service.add_admin(
        name=payload.name,
        email=payload.email,
        password=payload.password or 'Admin@123',
        role='admin',
    )
    return {'admins': admins}


@app.delete('/api/admins/{email}')
def delete_admin(email: str) -> dict[str, list[dict[str, str]]]:
    return {'admins': db_state_service.delete_admin(email)}


@app.get('/api/contributors')
def list_contributors() -> dict[str, list[dict[str, str]]]:
    return {'contributors': contributor_service.load_contributors()}


@app.post('/api/contributors')
def add_contributor(payload: ContributorCreate) -> dict[str, list[dict[str, str]]]:
    contributors = contributor_service.upsert_contributor(payload.model_dump())
    return {'contributors': contributors}


@app.delete('/api/contributors/{github_username}')
def remove_contributor(github_username: str) -> dict[str, list[dict[str, str]]]:
    return {'contributors': contributor_service.remove_contributor(github_username)}


@app.get('/api/powerbi')
def get_powerbi() -> dict[str, str]:
    return {'embedUrl': powerbi_service.get_embed_url()}


@app.put('/api/powerbi')
def update_powerbi(payload: EmbedConfig) -> dict[str, str]:
    powerbi_service.save_embed_url(payload.embedUrl)
    return {'embedUrl': payload.embedUrl}


@app.get('/api/datasets/preview')
def preview_dataset(limit: int = 100) -> dict[str, list[dict[str, object]]]:
    return {'rows': dataset_service.preview(limit)}


@app.get('/api/datasets/all')
def all_dataset() -> dict[str, list[dict[str, object]]]:
    return {'rows': dataset_service.get_all()}


@app.post('/api/datasets/upload')
async def upload_dataset(file: UploadFile = File(...)) -> dict[str, object]:
    content = await file.read()
    return dataset_service.save_dataset_bytes(content)


@app.get('/api/datasets/download')
def download_dataset() -> FileResponse:
    target_path = dataset_service._resolve_path()
    return FileResponse(target_path, filename=target_path.name)


@app.post('/api/rag/chat')
def chat(payload: ChatRequest) -> dict[str, object]:
    return rag_service.answer(payload.question)


@app.get('/api/rag/documents')
def list_documents() -> dict[str, list[dict[str, object]]]:
    return {'documents': rag_service.get_documents()}


@app.get('/api/rag/documents/{filename}')
def get_document_detail(filename: str) -> dict[str, object]:
    doc = rag_service.get_document_detail(filename)
    if doc:
        return {'document': doc}
    return {'error': 'Document not found'}


@app.delete('/api/rag/documents/{filename}')
def delete_document(filename: str) -> dict[str, list[dict[str, object]]]:
    return {'documents': rag_service.delete_document(filename)}


@app.post('/api/rag/extract')
async def extract_document(file: UploadFile = File(...)) -> dict[str, object]:
    return await rag_service.extract_text_from_file(file)


@app.post('/api/rag/save')
def save_document(payload: DocumentSaveRequest) -> dict[str, object]:
    docs = rag_service.save_document_text(payload.name, payload.content_type, payload.text)
    return {'documents': docs}


@app.post('/api/rag/upload')
async def upload_document(file: UploadFile = File(...)) -> dict[str, object]:
    res = await rag_service.ingest(file)
    docs = rag_service.get_documents()
    return {'message': res['message'], 'documents': docs}


