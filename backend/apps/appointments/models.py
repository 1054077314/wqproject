from django.conf import settings
from django.db import models


class Appointment(models.Model):
    STATUS_CHOICES = [
        ("pending", "待确认"),
        ("confirmed", "已确认"),
        ("rejected", "已拒绝"),
    ]

    buyer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="appointments")
    product = models.ForeignKey("products.Product", on_delete=models.CASCADE, related_name="appointments")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "appointments"
        unique_together = ["buyer", "product"]

    def __str__(self):
        return f"{self.buyer.username} → {self.product.title}"
