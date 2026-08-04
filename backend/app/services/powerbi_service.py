from __future__ import annotations

from .state_service import JsonStateService


class PowerBiService:
    def __init__(self, state_service: JsonStateService) -> None:
        self.state_service = state_service

    def get_embed_url(self) -> str:
        return self.state_service.get_powerbi().get('embedUrl', '')

    def save_embed_url(self, embed_url: str) -> None:
        self.state_service.save_powerbi(embed_url)

