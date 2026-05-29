from rest_framework.decorators import api_view, permission_classes
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from apps.products.models import Product
from .models import Favorite
from .serializers import FavoriteCreateSerializer, FavoriteListSerializer


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def toggle_favorite(request):
    ser = FavoriteCreateSerializer(data=request.data)
    ser.is_valid(raise_exception=True)
    product_id = ser.validated_data["product_id"]

    try:
        product = Product.objects.get(pk=product_id)
    except Product.DoesNotExist:
        return Response(
            {"code": 404, "message": "商品不存在", "data": None},
            status=status.HTTP_404_NOT_FOUND,
        )

    if product.seller == request.user:
        return Response(
            {"code": 400, "message": "不能收藏自己的商品", "data": None},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if product.status != "active":
        return Response(
            {"code": 400, "message": "只能收藏已上架商品", "data": None},
            status=status.HTTP_400_BAD_REQUEST,
        )

    existing = Favorite.objects.filter(user=request.user, product=product).first()
    if existing:
        existing.delete()
        return Response(
            {"code": 200, "message": "取消收藏", "data": None},
            status=status.HTTP_200_OK,
        )

    favorite = Favorite.objects.create(user=request.user, product=product)
    return Response(
        {"code": 201, "message": "收藏成功", "data": FavoriteListSerializer(favorite).data},
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_favorites(request):
    favorites = Favorite.objects.filter(user=request.user).order_by("-created_at")
    paginator = PageNumberPagination()
    page = paginator.paginate_queryset(favorites, request)
    ser = FavoriteListSerializer(page, many=True)
    return paginator.get_paginated_response(ser.data)
