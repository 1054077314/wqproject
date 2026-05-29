from django.db import IntegrityError, models
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status

from .models import Token, User
from .serializers import RegisterSerializer, LoginSerializer, UserListSerializer, UserToggleSerializer


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    ser = RegisterSerializer(data=request.data)
    ser.is_valid(raise_exception=True)
    try:
        user = ser.save()
    except IntegrityError:
        return Response(
            {"code": 409, "message": "用户名已存在", "data": None},
            status=status.HTTP_409_CONFLICT,
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

    try:
        from .models import User
        user = User.objects.get(username=ser.validated_data["username"])
    except Exception:
        return Response(
            {"code": 401, "message": "用户名或密码错误", "data": None},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    if not user.check_password(ser.validated_data["password"]):
        return Response(
            {"code": 401, "message": "用户名或密码错误", "data": None},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    if not user.is_active:
        return Response(
            {"code": 403, "message": "账号已被禁用", "data": None},
            status=status.HTTP_403_FORBIDDEN,
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


@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_user_list(request):
    users = User.objects.all().order_by("-created_at")
    paginator = PageNumberPagination()
    page = paginator.paginate_queryset(users, request)
    ser = UserListSerializer(page, many=True)
    return paginator.get_paginated_response(ser.data)


@api_view(["PUT"])
@permission_classes([IsAdminUser])
def admin_user_toggle(request, pk):
    ser = UserToggleSerializer(data=request.data)
    ser.is_valid(raise_exception=True)

    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response(
            {"code": 404, "message": "用户不存在", "data": None},
            status=status.HTTP_404_NOT_FOUND,
        )

    if user == request.user:
        return Response(
            {"code": 400, "message": "不可禁用自己", "data": None},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user.is_active = ser.validated_data["is_active"]
    user.save(update_fields=["is_active"])
    return Response(
        {"code": 200, "message": "操作成功", "data": UserListSerializer(user).data},
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_statistics(request):
    from apps.products.models import Product

    total_users = User.objects.count()
    total_products = Product.objects.count()
    products_by_status = {}
    for row in Product.objects.values("status").annotate(count=models.Count("id")):
        products_by_status[row["status"]] = row["count"]

    today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
    today_new_products = Product.objects.filter(created_at__gte=today_start).count()
    pending_count = Product.objects.filter(status="pending").count()

    return Response(
        {
            "code": 200,
            "message": "success",
            "data": {
                "total_users": total_users,
                "total_products": total_products,
                "products_by_status": products_by_status,
                "today_new_products": today_new_products,
                "pending_products": pending_count,
            },
        },
        status=status.HTTP_200_OK,
    )
