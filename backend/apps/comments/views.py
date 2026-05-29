from rest_framework.decorators import api_view, permission_classes
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status

from apps.products.models import Product
from .models import Comment
from .serializers import CommentCreateSerializer, CommentListSerializer


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_comment(request):
    ser = CommentCreateSerializer(data=request.data)
    ser.is_valid(raise_exception=True)
    product_id = ser.validated_data["product_id"]

    try:
        product = Product.objects.get(pk=product_id)
    except Product.DoesNotExist:
        return Response(
            {"code": 404, "message": "商品不存在", "data": None},
            status=status.HTTP_404_NOT_FOUND,
        )

    comment = Comment.objects.create(
        user=request.user,
        product=product,
        content=ser.validated_data["content"],
    )
    return Response(
        {"code": 201, "message": "留言成功", "data": CommentListSerializer(comment).data},
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def product_comments(request, product_id):
    try:
        Product.objects.get(pk=product_id)
    except Product.DoesNotExist:
        return Response(
            {"code": 404, "message": "商品不存在", "data": None},
            status=status.HTTP_404_NOT_FOUND,
        )

    comments = Comment.objects.filter(product_id=product_id).order_by("created_at")
    paginator = PageNumberPagination()
    page = paginator.paginate_queryset(comments, request)
    ser = CommentListSerializer(page, many=True)
    return paginator.get_paginated_response(ser.data)
