from django.db import transaction
from rest_framework import serializers

from .models import Product, ProductImage


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ["id", "image", "created_at"]
        read_only_fields = ["id", "created_at"]


class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False,
        max_length=3,
    )

    class Meta:
        model = Product
        fields = [
            "id",
            "title",
            "description",
            "price",
            "category",
            "seller",
            "contact_info",
            "status",
            "created_at",
            "images",
            "uploaded_images",
        ]
        read_only_fields = ["id", "seller", "status", "created_at"]
        extra_kwargs = {
            "title": {"allow_blank": True},
            "description": {"allow_blank": True},
        }

    def validate_title(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("标题不能为空")
        return value

    def validate_description(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("描述不能为空")
        return value

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("价格必须为正数")
        return value

    def create(self, validated_data):
        uploaded_images = validated_data.pop("uploaded_images", [])
        with transaction.atomic():
            product = Product.objects.create(**validated_data)
            for image in uploaded_images:
                ProductImage.objects.create(product=product, image=image)
        return product


class ProductListSerializer(serializers.ModelSerializer):
    first_image = serializers.SerializerMethodField()
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Product
        fields = ["id", "title", "price", "first_image", "category_name"]

    def get_first_image(self, obj):
        first = obj.images.first()
        if first:
            return first.image.url
        return None


class ProductDetailSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)
    seller_username = serializers.CharField(source="seller.username", read_only=True)
    comments = serializers.SerializerMethodField()
    appointment_count = serializers.SerializerMethodField()
    is_favorited = serializers.SerializerMethodField()
    is_appointed = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id", "title", "description", "price", "images",
            "category_name", "contact_info", "status", "created_at",
            "seller_username", "comments", "appointment_count", "is_favorited",
            "is_appointed",
        ]

    def get_comments(self, obj):
        try:
            from apps.comments.models import Comment
        except ImportError:
            return []
        comments = Comment.objects.filter(product=obj).order_by("created_at")
        return [
            {"id": c.id, "content": c.content, "username": c.user.username, "created_at": c.created_at}
            for c in comments
        ]

    def get_appointment_count(self, obj):
        try:
            from apps.appointments.models import Appointment
        except ImportError:
            return 0
        return Appointment.objects.filter(product=obj).count()

    def get_is_favorited(self, obj):
        request = self.context.get("request")
        if not request or not request.user or not request.user.is_authenticated:
            return False
        try:
            from apps.favorites.models import Favorite
        except ImportError:
            return False
        return Favorite.objects.filter(user=request.user, product=obj).exists()

    def get_is_appointed(self, obj):
        request = self.context.get("request")
        if not request or not request.user or not request.user.is_authenticated:
            return False
        try:
            from apps.appointments.models import Appointment
        except ImportError:
            return False
        return Appointment.objects.filter(buyer=request.user, product=obj).exists()


class MyProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)
    appointment_count = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id", "title", "price", "status", "images",
            "category_name", "appointment_count", "created_at",
        ]

    def get_appointment_count(self, obj):
        try:
            from apps.appointments.models import Appointment
        except ImportError:
            return 0
        return Appointment.objects.filter(product=obj).count()


class ProductUpdateSerializer(serializers.ModelSerializer):
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False,
        max_length=3,
    )
    keep_image_ids = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
    )

    class Meta:
        model = Product
        fields = [
            "title",
            "description",
            "price",
            "category",
            "contact_info",
            "uploaded_images",
            "keep_image_ids",
        ]
        extra_kwargs = {
            "title": {"allow_blank": True, "required": False},
            "description": {"allow_blank": True, "required": False},
            "price": {"required": False},
            "category": {"required": False},
            "contact_info": {"required": False},
        }

    def validate_title(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("标题不能为空")
        return value

    def validate_description(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("描述不能为空")
        return value

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("价格必须为正数")
        return value

    def update(self, instance, validated_data):
        uploaded_images = validated_data.pop("uploaded_images", [])
        keep_image_ids_str = validated_data.pop("keep_image_ids", "")

        with transaction.atomic():
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.status = "pending"
            instance.save()

            # Handle image management
            keep_ids = set()
            if keep_image_ids_str.strip():
                keep_ids = {
                    int(i) for i in keep_image_ids_str.split(",") if i.strip()
                }

            # Delete images not in keep list
            for img in instance.images.all():
                if img.id not in keep_ids:
                    img.delete()

            # Add new images
            for image in uploaded_images:
                ProductImage.objects.create(product=instance, image=image)

        return instance


class ProductReviewSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=["approve", "reject"])
    reject_reason = serializers.CharField(required=False, allow_blank=True, max_length=200)

    def validate(self, attrs):
        if attrs["action"] == "reject" and not attrs.get("reject_reason", "").strip():
            raise serializers.ValidationError({"reject_reason": "驳回原因不能为空"})
        return attrs
