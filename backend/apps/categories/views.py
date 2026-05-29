from django.db import IntegrityError
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework import status

from .models import Category
from .serializers import CategorySerializer


@api_view(["GET"])
@permission_classes([AllowAny])
def category_list(request):
    categories = Category.objects.all()
    ser = CategorySerializer(categories, many=True)
    data = [{"id": c["id"], "name": c["name"]} for c in ser.data]
    return Response(
        {"code": 200, "message": "success", "data": data},
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([IsAdminUser])
def category_create(request):
    ser = CategorySerializer(data=request.data)
    ser.is_valid(raise_exception=True)
    try:
        category = ser.save()
    except IntegrityError:
        return Response(
            {"code": 409, "message": "分类名称已存在", "data": None},
            status=status.HTTP_409_CONFLICT,
        )
    return Response(
        {"code": 201, "message": "创建成功", "data": CategorySerializer(category).data},
        status=status.HTTP_201_CREATED,
    )


@api_view(["PUT", "DELETE"])
@permission_classes([IsAdminUser])
def category_detail(request, pk):
    try:
        category = Category.objects.get(pk=pk)
    except Category.DoesNotExist:
        return Response(
            {"code": 404, "message": "分类不存在", "data": None},
            status=status.HTTP_404_NOT_FOUND,
        )

    if request.method == "PUT":
        ser = CategorySerializer(category, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        try:
            ser.save()
        except IntegrityError:
            return Response(
                {"code": 409, "message": "分类名称已存在", "data": None},
                status=status.HTTP_409_CONFLICT,
            )
        return Response(
            {"code": 200, "message": "更新成功", "data": ser.data},
            status=status.HTTP_200_OK,
        )

    try:
        from apps.products.models import Product
    except ImportError:
        Product = None

    if Product is not None and Product.objects.filter(category=category).exists():
        return Response(
            {"code": 400, "message": "该分类下有商品，不可删除", "data": None},
            status=status.HTTP_400_BAD_REQUEST,
        )
    category.delete()
    return Response(
        {"code": 200, "message": "删除成功", "data": None},
        status=status.HTTP_200_OK,
    )
