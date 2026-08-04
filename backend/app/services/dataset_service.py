from __future__ import annotations

from pathlib import Path
import pandas as pd

from ..core.config import settings


class DatasetService:
    def __init__(self) -> None:
        self.dataset_path = settings.dataset_csv_path

    def _resolve_path(self) -> Path:
        candidates = [
            self.dataset_path,
            settings.project_root / 'raw-DATASET.csv',
            settings.project_root / 'DATASET.csv',
            settings.project_root / 'backend' / 'data' / 'dataset.csv',
        ]
        for candidate in candidates:
            if candidate and candidate.exists():
                return candidate
        return settings.project_root / 'raw-DATASET.csv'

    def preview(self, limit: int = 100) -> list[dict[str, object]]:
        target_path = self._resolve_path()
        if not target_path.exists():
            return []
        try:
            frame = pd.read_csv(target_path)
            # Fill NaN values with empty string or None for JSON serialization
            frame = frame.where(pd.notnull(frame), None)
            return frame.head(limit).to_dict(orient='records')
        except Exception:
            return []

    def get_all(self) -> list[dict[str, object]]:
        target_path = self._resolve_path()
        if not target_path.exists():
            return []
        try:
            frame = pd.read_csv(target_path)
            frame = frame.where(pd.notnull(frame), None)
            return frame.to_dict(orient='records')
        except Exception:
            return []

    def save_dataset_bytes(self, content: bytes) -> dict[str, object]:
        dest = settings.project_root / 'backend' / 'data' / 'dataset.csv'
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(content)
        try:
            frame = pd.read_csv(dest)
            return {'status': 'success', 'rows_count': len(frame), 'columns': list(frame.columns)}
        except Exception as e:
            return {'status': 'error', 'message': str(e)}


