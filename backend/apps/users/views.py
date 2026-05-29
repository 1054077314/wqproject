from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Token, User
from .serializers import RegisterSerializer, LoginSerializer


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    ser = RegisterSerializer(data=request.data)
    ser.is_valid(raise_exception=True)
    user = User.objects.create_user(
        username=ser.validated_data["username"],
        password=ser.validated_data["password"],
    )
    return Response(
        {"code": 201, "message": "注册成功", "data": {"user_id": user.id}},
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    ser = LoginSerializer(data=request.data)
    ser.is_valid(raise_exception=True)

    # 先检查用户是否存在且活跃，再验证密码
    try:
        user = User.objects.get(username=ser.validated_data["username"])
    except User.DoesNotExist:
        return Response(
            {"code": 401, "message": "用户名或密码错误", "data": None},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    if not user.is_active:
        return Response(
            {"code": 403, "message": "账号已禁用", "data": None},
            status=status.HTTP_403_FORBIDDEN,
        )

    if not user.check_password(ser.validated_data["password"]):
        return Response(
            {"code": 401, "message": "用户名或密码错误", "data": None},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    token = Token.objects.create(user=user)
    return Response(
        {
            "code": 200,
            "message": "登录成功",
            "data": {"token": token.key, "user": {"id": user.id, "username": user.username}},
        },
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def profile(request):
    user = request.user
    return Response(
        {"code": 200, "message": "success", "data": {"id": user.id, "username": user.username}},
        status=status.HTTP_200_OK,
    )
