from rest_framework import serializers

from .models import Appointment


class AppointmentCreateSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()


class AppointmentListSerializer(serializers.ModelSerializer):
    product_title = serializers.CharField(source="product.title", read_only=True)
    product_price = serializers.DecimalField(source="product.price", max_digits=10, decimal_places=2, read_only=True)
    buyer_username = serializers.CharField(source="buyer.username", read_only=True)

    class Meta:
        model = Appointment
        fields = ["id", "product_id", "product_title", "product_price", "buyer_username", "status", "created_at"]


class AppointmentUpdateSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=["confirm", "reject"])
