from __future__ import annotations

from pathlib import Path
import json

from ..core.config import settings


class ContributorService:
    def __init__(self) -> None:
        self.path = settings.project_root / 'contributors.json'

    def load_contributors(self) -> list[dict[str, str]]:
        if not self.path.exists():
            return []
        return json.loads(self.path.read_text(encoding='utf-8')).get('contributors', [])

    def _save(self, contributors: list[dict[str, str]]) -> None:
        self.path.write_text(json.dumps({'contributors': contributors}, indent=2), encoding='utf-8')

    def upsert_contributor(self, contributor: dict[str, str]) -> list[dict[str, str]]:
        contributors = [item for item in self.load_contributors() if item.get('github_username') != contributor['github_username']]
        contributors.append(contributor)
        self._save(contributors)
        return contributors

    def remove_contributor(self, github_username: str) -> list[dict[str, str]]:
        contributors = [item for item in self.load_contributors() if item.get('github_username') != github_username]
        self._save(contributors)
        return contributors

