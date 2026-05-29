from rest_framework import serializers

from .models import User


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(min_length=3, max_length=50)
    password = serializers.CharField(min_length=6, write_only=True)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("用户名已存在")
        return value


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()
