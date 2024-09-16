
from typing import Optional
from uuid import UUID


class AuthService:
    @staticmethod
    def get_token_from_request_headers(headers: dict) -> Optional[str]:
        return headers.get('Authorization')

    @staticmethod
    def get_user_id_by_token(token: str) -> Optional[UUID]:
        # TODO: Implement this method
        pass
