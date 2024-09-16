from fastapi import Request, logger
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.services import AuthService


class AuthenticatedUserMiddleware(BaseHTTPMiddleware):
    def dispatch(self, request: Request, call_next):
        token = AuthService.get_token_from_request_headers(request.headers)
        if token:
            user_id = AuthService.get_user_id_by_token(token)
            if not user_id:
                logger.logger.warning(f'Unauthorized request with token: {token}')
                return JSONResponse(
                    status_code=401,
                    content={'message': 'Unauthorized'}
                )
            request.state.user_id = AuthService.get_user_id_by_token(token)

        return call_next(request)
