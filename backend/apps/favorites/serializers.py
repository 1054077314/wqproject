from rest_framework import serializers

from .models import Favorite


class FavoriteCreateSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()


class FavoriteListSerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField(source="product.id", read_only=True)
    product_title = serializers.CharField(source="product.title", read_only=True)
    product_price = serializers.DecimalField(source="product.price", max_digits=10, decimal_places=2, read_only=True)
    product_image = serializers.SerializerMethodField()

    class Meta:
        model = Favorite
        fields = ["id", "product_id", "product_title", "product_price", "product_image", "created_at"]

    def get_product_image(self, obj):
        first = obj.product.images.first()
        if first:
            return first.image.url
        return None
