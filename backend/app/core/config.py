from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import os
from dotenv import load_dotenv


def _project_root() -> Path:
    return Path(__file__).resolve().parents[3]


# Load environment variables from workspace root .env
_env_path = _project_root() / '.env'
if _env_path.exists():
    load_dotenv(dotenv_path=_env_path)
else:
    load_dotenv()


def _state_dir() -> Path:
    env_path = os.getenv('STATE_DIR')
    if env_path:
        return Path(env_path).expanduser().resolve()
    return _project_root() / 'backend' / 'data'


@dataclass(frozen=True)
class Settings:
    app_name: str = os.getenv('APP_NAME', 'RAG Based Analytics Platform')
    admin_email: str = os.getenv('ADMIN_EMAIL', 'admin@ai.com')
    admin_password: str = os.getenv('ADMIN_PASSWORD', 'Admin@123')
    gemini_api_key: str = os.getenv('GEMINI_API_KEY', '')
    gemini_model: str = os.getenv('GEMINI_MODEL', 'gemini-1.5-flash')
    dataset_csv_path: Path = Path(os.getenv('DATASET_CSV_PATH', str(_project_root() / 'Data_Cleaning' / 'CleanedDataset.csv')))
    neon_database_url: str = os.getenv('NEON_DATABASE_URL', os.getenv('DATABASE_URL', ''))
    project_root: Path = _project_root()
    state_dir: Path = _state_dir()


settings = Settings()
