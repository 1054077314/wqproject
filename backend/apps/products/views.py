from rest_framework.decorators import api_view, permission_classes
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework import status

from .models import Product
from .serializers import ProductSerializer, ProductListSerializer, ProductDetailSerializer, MyProductSerializer, ProductUpdateSerializer, ProductReviewSerializer


@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def product_list_create(request):
    if request.method == "GET":
        products = Product.objects.filter(status="active")
        category_id = request.query_params.get("category_id")
        if category_id:
            products = products.filter(category_id=category_id)
        products = products.order_by("-created_at")

        paginator = PageNumberPagination()
        page = paginator.paginate_queryset(products, request)
        ser = ProductListSerializer(page, many=True)
        return paginator.get_paginated_response(ser.data)

    # POST - create product (requires auth)
    if not request.user or not request.user.is_authenticated:
        return Response(
            {"code": 401, "message": "未认证", "data": None},
            status=status.HTTP_401_UNAUTHORIZED,
        )
    ser = ProductSerializer(data=request.data)
    ser.is_valid(raise_exception=True)
    product = ser.save(seller=request.user)
    return Response(
        {"code": 201, "message": "发布成功", "data": ProductSerializer(product).data},
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET", "PUT", "DELETE"])
@permission_classes([AllowAny])
def product_detail(request, pk):
    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return Response(
            {"code": 404, "message": "商品不存在", "data": None},
            status=status.HTTP_404_NOT_FOUND,
        )

    if request.method == "GET":
        ser = ProductDetailSerializer(product, context={"request": request})
        return Response(
            {"code": 200, "message": "success", "data": ser.data},
            status=status.HTTP_200_OK,
        )

    # PUT/DELETE require auth
    if not request.user or not request.user.is_authenticated:
        return Response(
            {"code": 401, "message": "未认证", "data": None},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    if product.seller != request.user:
        return Response(
            {"code": 403, "message": "无权操作此商品", "data": None},
            status=status.HTTP_403_FORBIDDEN,
        )

    if request.method == "PUT":
        if product.status == "active":
            return Response(
                {"code": 400, "message": "已上架商品需先下架再编辑", "data": None},
                status=status.HTTP_400_BAD_REQUEST,
            )
        ser = ProductUpdateSerializer(product, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        product = ser.save()
        return Response(
            {"code": 200, "message": "更新成功", "data": ProductSerializer(product).data},
            status=status.HTTP_200_OK,
        )

    # DELETE - soft delete
    try:
        from apps.appointments.models import Appointment
    except ImportError:
        Appointment = None

    if Appointment is not None and Appointment.objects.filter(product=product).exists():
        return Response(
            {"code": 400, "message": "需先取消所有预约", "data": None},
            status=status.HTTP_400_BAD_REQUEST,
        )

    product.status = "offline"
    product.save()
    return Response(
        {"code": 200, "message": "删除成功", "data": None},
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_product_list(request):
    products = Product.objects.filter(seller=request.user)
    status_filter = request.query_params.get("status")
    if status_filter:
        products = products.filter(status=status_filter)
    products = products.order_by("-created_at")

    paginator = PageNumberPagination()
    page = paginator.paginate_queryset(products, request)
    ser = MyProductSerializer(page, many=True)
    return paginator.get_paginated_response(ser.data)


@api_view(["POST"])
@permission_classes([IsAdminUser])
def product_review(request, pk):
    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return Response(
            {"code": 404, "message": "商品不存在", "data": None},
            status=status.HTTP_404_NOT_FOUND,
        )

    if product.status != "pending":
        return Response(
            {"code": 400, "message": "只能审核待审核商品", "data": None},
            status=status.HTTP_400_BAD_REQUEST,
        )

    ser = ProductReviewSerializer(data=request.data)
    ser.is_valid(raise_exception=True)
    action = ser.validated_data["action"]

    if action == "approve":
        product.status = "active"
        product.reject_reason = ""
        product.save()
        return Response(
            {"code": 200, "message": "审核通过", "data": None},
            status=status.HTTP_200_OK,
        )

    product.status = "rejected"
    product.reject_reason = ser.validated_data["reject_reason"].strip()
    product.save()
    return Response(
        {"code": 200, "message": "已驳回", "data": None},
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
@permission_classes([IsAdminUser])
def pending_product_list(request):
    products = Product.objects.filter(status="pending").order_by("created_at")
    paginator = PageNumberPagination()
    page = paginator.paginate_queryset(products, request)
    ser = ProductListSerializer(page, many=True)
    return paginator.get_paginated_response(ser.data)
