from __future__ import annotations

from pathlib import Path

from ..core.config import settings
from .file_store import JsonFileStore


class JsonStateService:
    def __init__(self) -> None:
        self.store = JsonFileStore(settings.state_dir)

    def load_admins(self) -> list[dict[str, str]]:
        return self.store.read('admins.json', [{'name': 'Platform Admin', 'email': settings.admin_email, 'role': 'admin'}])

    def save_admins(self, admins: list[dict[str, str]]) -> None:
        self.store.write('admins.json', admins)

    def get_profile(self) -> dict[str, str]:
        return self.store.read('profile.json', {'name': 'Platform Admin', 'email': settings.admin_email, 'password': ''})

    def save_profile(self, profile: dict[str, str]) -> None:
        self.store.write('profile.json', profile)

    def get_powerbi(self) -> dict[str, str]:
        return self.store.read('powerbi.json', {'embedUrl': ''})

    def save_powerbi(self, embed_url: str) -> None:
        self.store.write('powerbi.json', {'embedUrl': embed_url})

    def load_documents(self) -> list[dict[str, str]]:
        return self.store.read('documents.json', [])

    def save_documents(self, documents: list[dict[str, str]]) -> None:
        self.store.write('documents.json', documents)

