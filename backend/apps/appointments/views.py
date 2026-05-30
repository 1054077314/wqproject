from rest_framework.decorators import api_view, permission_classes
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from apps.products.models import Product
from .models import Appointment
from .serializers import AppointmentCreateSerializer, AppointmentListSerializer, AppointmentUpdateSerializer


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_appointment(request):
    ser = AppointmentCreateSerializer(data=request.data)
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
            {"code": 400, "message": "不能预约自己的商品", "data": None},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if product.status != "active":
        return Response(
            {"code": 400, "message": "只能预约已上架商品", "data": None},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if Appointment.objects.filter(buyer=request.user, product=product).exists():
        return Response(
            {"code": 409, "message": "已预约", "data": None},
            status=status.HTTP_409_CONFLICT,
        )

    appointment = Appointment.objects.create(buyer=request.user, product=product)
    return Response(
        {"code": 201, "message": "预约成功", "data": AppointmentListSerializer(appointment).data},
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_appointments_as_buyer(request):
    appointments = Appointment.objects.filter(buyer=request.user).order_by("-created_at")
    paginator = PageNumberPagination()
    page = paginator.paginate_queryset(appointments, request)
    ser = AppointmentListSerializer(page, many=True)
    return paginator.get_paginated_response(ser.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_appointments_as_seller(request):
    appointments = Appointment.objects.filter(product__seller=request.user).order_by("-created_at")
    paginator = PageNumberPagination()
    page = paginator.paginate_queryset(appointments, request)
    ser = AppointmentListSerializer(page, many=True)
    return paginator.get_paginated_response(ser.data)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_appointment_status(request, pk):
    try:
        appointment = Appointment.objects.get(pk=pk)
    except Appointment.DoesNotExist:
        return Response(
            {"code": 404, "message": "预约不存在", "data": None},
            status=status.HTTP_404_NOT_FOUND,
        )

    if appointment.product.seller != request.user:
        return Response(
            {"code": 403, "message": "无权操作", "data": None},
            status=status.HTTP_403_FORBIDDEN,
        )

    if appointment.status != "pending":
        return Response(
            {"code": 400, "message": "该预约已被处理", "data": None},
            status=status.HTTP_400_BAD_REQUEST,
        )

    ser = AppointmentUpdateSerializer(data=request.data)
    ser.is_valid(raise_exception=True)
    action = ser.validated_data["action"]

    appointment.status = "confirmed" if action == "confirm" else "rejected"
    appointment.save()

    return Response(
        {"code": 200, "message": "操作成功", "data": AppointmentListSerializer(appointment).data},
        status=status.HTTP_200_OK,
    )
