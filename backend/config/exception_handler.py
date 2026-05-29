from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework.exceptions import NotAuthenticated, PermissionDenied


def custom_exception_handler(exc, context):
    resp = exception_handler(exc, context)
    if resp is None:
        return None

    code = resp.status_code
    message = _extract_message(resp.data)

    # DRF 默认对未认证用户返回 403，改为 401
    if code == 403 and not _is_authenticated(context):
        code = 401

    return Response(
        {"code": code, "message": message, "data": None},
        status=code,
    )


def _extract_message(data):
    if isinstance(data, dict):
        parts = []
        for key, val in data.items():
            if isinstance(val, list):
                parts.extend(val)
            else:
                parts.append(str(val))
        return "; ".join(parts) if parts else "请求错误"
    if isinstance(data, list):
        return "; ".join(str(v) for v in data)
    return str(data)


def _is_authenticated(context):
    request = context.get("request")
    if request is None:
        return False
    return bool(getattr(request, "user", None) and request.user.is_authenticated)
