from __future__ import annotations

from pathlib import Path
import json


class JsonFileStore:
    def __init__(self, base_path: Path) -> None:
        self.base_path = base_path
        self.base_path.mkdir(parents=True, exist_ok=True)

    def read(self, filename: str, default: object) -> object:
        path = self.base_path / filename
        if not path.exists():
            return default
        return json.loads(path.read_text(encoding='utf-8'))

    def write(self, filename: str, data: object) -> None:
        path = self.base_path / filename
        path.write_text(json.dumps(data, indent=2), encoding='utf-8')

