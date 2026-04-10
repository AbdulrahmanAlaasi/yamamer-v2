import jwt
import base64
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from apps.users.models import User


def _get_jwt_secret():
    """
    Supabase JWT secrets are base64-encoded in the dashboard.
    PyJWT needs the raw bytes for HS256 verification.
    Falls back to using the string as-is if base64 decoding fails.
    """
    secret = settings.SUPABASE_JWT_SECRET
    try:
        # Add padding if needed and decode
        padding = 4 - len(secret) % 4
        if padding != 4:
            secret += '=' * padding
        return base64.b64decode(secret)
    except Exception:
        return secret.encode('utf-8') if isinstance(secret, str) else secret


class SupabaseAuthentication(BaseAuthentication):
    """
    Verifies Supabase JWT tokens from the Authorization header.
    Looks up (or creates) a Django User linked by supabase_uid.
    """

    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None

        token = auth_header.split(' ', 1)[1]

        secret = _get_jwt_secret()

        try:
            payload = jwt.decode(
                token,
                secret,
                algorithms=['HS256'],
                audience='authenticated',
            )
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token has expired.')
        except jwt.InvalidTokenError as e:
            raise AuthenticationFailed(f'Invalid token: {e}')

        supabase_uid = payload.get('sub')
        if not supabase_uid:
            raise AuthenticationFailed('Token missing user ID.')

        email = payload.get('email', '')
        user_metadata = payload.get('user_metadata', {})

        user, created = User.objects.get_or_create(
            supabase_uid=supabase_uid,
            defaults={
                'email': email,
                'full_name': user_metadata.get('full_name', ''),
            },
        )

        if not created and user.email != email and email:
            user.email = email
            user.save(update_fields=['email'])

        return (user, payload)

    def authenticate_header(self, request):
        return 'Bearer'
