from rest_framework import serializers

from .models import Category


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "sort_order", "created_at"]
        read_only_fields = ["id", "created_at"]
        extra_kwargs = {"name": {"validators": []}}

    def validate_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("分类名称不能为空")
        return value
