import uuid
from datetime import timedelta

from django.conf import settings
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    def create_user(self, username, password=None, **extra_fields):
        if not username:
            raise ValueError("用户名不能为空")
        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(username, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    username = models.CharField("用户名", max_length=50, unique=True)
    is_active = models.BooleanField("是否活跃", default=True)
    is_staff = models.BooleanField("是否员工", default=False)
    created_at = models.DateTimeField("创建时间", auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD = "username"

    class Meta:
        db_table = "users"
        verbose_name = "用户"

    def __str__(self):
        return self.username


class Token(models.Model):
    key = models.CharField(max_length=64, primary_key=True, default="")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="auth_tokens")
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        db_table = "tokens"

    def save(self, *args, **kwargs):
        if not self.key:
            self.key = uuid.uuid4().hex
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(days=7)
        super().save(*args, **kwargs)

    @property
    def is_expired(self):
        return timezone.now() > self.expires_at
