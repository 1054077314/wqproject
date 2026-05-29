from django.conf import settings
from django.db import models


class Appointment(models.Model):
    buyer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="appointments")
    product = models.ForeignKey("products.Product", on_delete=models.CASCADE, related_name="appointments")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "appointments"
        unique_together = ["buyer", "product"]

    def __str__(self):
        return f"{self.buyer.username} → {self.product.title}"
