from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

from .models import Token


class TokenAuthentication(BaseAuthentication):
    keyword = "Bearer"

    def authenticate(self, request):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return None

        parts = auth_header.split()
        if len(parts) != 2 or parts[0] != self.keyword:
            return None

        try:
            token = Token.objects.select_related("user").get(key=parts[1])
        except Token.DoesNotExist:
            raise AuthenticationFailed("token 无效")

        if token.is_expired:
            token.delete()
            raise AuthenticationFailed("token 已过期")

        return (token.user, token)
