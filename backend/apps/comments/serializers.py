from rest_framework import serializers

from .models import Comment


class CommentCreateSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    content = serializers.CharField(max_length=500)

    def validate_content(self, value):
        if not value.strip():
            raise serializers.ValidationError("留言内容不能为空")
        return value


class CommentListSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Comment
        fields = ["id", "content", "username", "created_at"]
