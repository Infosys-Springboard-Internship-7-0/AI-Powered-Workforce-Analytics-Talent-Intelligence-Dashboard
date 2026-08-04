from __future__ import annotations

from typing import Any
import datetime
from sqlalchemy import Column, DateTime, Integer, MetaData, String, Table, create_engine, select
from sqlalchemy.exc import SQLAlchemyError

from ..core.config import settings
from .state_service import JsonStateService


class DbStateService:
    def __init__(self, fallback_state: JsonStateService) -> None:
        self.fallback = fallback_state
        self.db_url = settings.neon_database_url
        self.engine = None
        self.metadata = MetaData()
        self.admins_table = None

        if self.db_url:
            try:
                url = self.db_url
                if url.startswith('postgresql://'):
                    url = url.replace('postgresql://', 'postgresql+psycopg2://', 1)
                # Strip channel_binding query param if present for Windows psycopg2 compatibility
                url = url.split('&channel_binding')[0].split('?channel_binding')[0]

                self.engine = create_engine(url, pool_pre_ping=True, pool_size=5)
                self._init_tables()
                self._seed_default_admin()
                print("Successfully connected to Neon PostgreSQL Database.")
            except Exception as e:
                print(f"Warning: Neon DB connection error ({e}). Falling back to JSON state service.")
                self.engine = None

    def _init_tables(self) -> None:
        if not self.engine:
            return
        self.admins_table = Table(
            'admins',
            self.metadata,
            Column('id', Integer, primary_key=True, autoincrement=True),
            Column('name', String(255), nullable=False),
            Column('email', String(255), nullable=False, unique=True),
            Column('password', String(255), nullable=False),
            Column('role', String(100), nullable=False, default='admin'),
            Column('created_at', DateTime, default=datetime.datetime.utcnow),
        )
        self.metadata.create_all(self.engine)

    def _seed_default_admin(self) -> None:
        if not self.engine or self.admins_table is None:
            return
        try:
            with self.engine.connect() as conn:
                stmt = select(self.admins_table)
                result = conn.execute(stmt).fetchall()
                if not result:
                    default_email = settings.admin_email or 'admin@ai.com'
                    default_pass = settings.admin_password or 'Admin@123'
                    ins_stmt = self.admins_table.insert().values(
                        name='Platform Admin',
                        email=default_email,
                        password=default_pass,
                        role='admin',
                    )
                    conn.execute(ins_stmt)
                    conn.commit()
                    print(f"Seeded initial admin account in Neon DB: {default_email}")
        except Exception as e:
            print(f"Error seeding admin data in Neon DB: {e}")

    def authenticate_admin(self, email: str, password: str) -> bool:
        if not self.engine or self.admins_table is None:
            return email == settings.admin_email and password == settings.admin_password

        try:
            with self.engine.connect() as conn:
                stmt = select(self.admins_table).where(self.admins_table.c.email == email)
                row = conn.execute(stmt).first()
                if row and row.password == password:
                    return True
                return False
        except Exception as e:
            print(f"DB Auth Error: {e}")
            return email == settings.admin_email and password == settings.admin_password

    def list_admins(self) -> list[dict[str, str]]:
        if not self.engine or self.admins_table is None:
            return self.fallback.load_admins()

        try:
            with self.engine.connect() as conn:
                stmt = select(self.admins_table)
                rows = conn.execute(stmt).fetchall()
                if not rows:
                    self._seed_default_admin()
                    rows = conn.execute(stmt).fetchall()
                return [
                    {'name': row.name, 'email': row.email, 'role': row.role}
                    for row in rows
                ]
        except Exception as e:
            print(f"DB List Admins Error: {e}")
            return self.fallback.load_admins()

    def add_admin(self, name: str, email: str, password: str, role: str = 'admin') -> list[dict[str, str]]:
        if not self.engine or self.admins_table is None:
            admins = self.fallback.load_admins()
            admins = [a for a in admins if a['email'] != email]
            admins.append({'name': name, 'email': email, 'role': 'admin'})
            self.fallback.save_admins(admins)
            return admins

        try:
            with self.engine.connect() as conn:
                stmt = select(self.admins_table).where(self.admins_table.c.email == email)
                existing = conn.execute(stmt).first()
                if existing:
                    upd = (
                        self.admins_table.update()
                        .where(self.admins_table.c.email == email)
                        .values(name=name, password=password, role='admin')
                    )
                    conn.execute(upd)
                else:
                    ins = self.admins_table.insert().values(
                        name=name, email=email, password=password, role='admin'
                    )
                    conn.execute(ins)
                conn.commit()
            
            # Also sync fallback
            admins_list = self.list_admins()
            self.fallback.save_admins(admins_list)
            return admins_list
        except Exception as e:
            print(f"DB Add Admin Error: {e}")
            admins = self.fallback.load_admins()
            admins = [a for a in admins if a['email'] != email]
            admins.append({'name': name, 'email': email, 'role': 'admin'})
            self.fallback.save_admins(admins)
            return admins

    def delete_admin(self, email: str) -> list[dict[str, str]]:
        if not self.engine or self.admins_table is None:
            admins = [a for a in self.fallback.load_admins() if a['email'] != email]
            self.fallback.save_admins(admins)
            return admins

        try:
            with self.engine.connect() as conn:
                stmt = self.admins_table.delete().where(self.admins_table.c.email == email)
                conn.execute(stmt)
                conn.commit()
            
            admins_list = self.list_admins()
            self.fallback.save_admins(admins_list)
            return admins_list
        except Exception as e:
            print(f"DB Delete Admin Error: {e}")
            admins = [a for a in self.fallback.load_admins() if a['email'] != email]
            self.fallback.save_admins(admins)
            return admins

    def get_profile(self, email: str | None = None) -> dict[str, str]:
        target_email = email or settings.admin_email
        if not self.engine or self.admins_table is None:
            return self.fallback.get_profile()

        try:
            with self.engine.connect() as conn:
                stmt = select(self.admins_table).where(self.admins_table.c.email == target_email)
                row = conn.execute(stmt).first()
                if not row:
                    # Try getting first admin record
                    stmt_first = select(self.admins_table)
                    row = conn.execute(stmt_first).first()
                
                if row:
                    return {'name': row.name, 'email': row.email, 'role': row.role, 'password': ''}
                return self.fallback.get_profile()
        except Exception as e:
            print(f"DB Get Profile Error: {e}")
            return self.fallback.get_profile()

    def save_profile(self, current_email: str, name: str, new_email: str, password: str, role: str = 'admin') -> dict[str, str]:
        if not self.engine or self.admins_table is None:
            prof = {'name': name, 'email': new_email, 'password': password, 'role': 'admin'}
            self.fallback.save_profile(prof)
            return prof

        try:
            with self.engine.connect() as conn:
                # Find admin by current_email or new_email
                stmt = select(self.admins_table).where(
                    (self.admins_table.c.email == current_email) | (self.admins_table.c.email == new_email)
                )
                existing = conn.execute(stmt).first()

                values: dict[str, Any] = {'name': name, 'email': new_email, 'role': 'admin'}
                if password and password.strip():
                    values['password'] = password

                if existing:
                    upd = (
                        self.admins_table.update()
                        .where(self.admins_table.c.id == existing.id)
                        .values(**values)
                    )
                    conn.execute(upd)
                else:
                    ins = self.admins_table.insert().values(
                        name=name,
                        email=new_email,
                        password=password or settings.admin_password,
                        role='admin',
                    )
                    conn.execute(ins)
                conn.commit()

            prof_result = {'name': name, 'email': new_email, 'role': 'admin', 'password': ''}
            self.fallback.save_profile(prof_result)
            return prof_result
        except Exception as e:
            print(f"DB Save Profile Error: {e}")
            prof = {'name': name, 'email': new_email, 'password': password, 'role': 'admin'}
            self.fallback.save_profile(prof)
            return prof
