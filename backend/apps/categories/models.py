from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=50, unique=True)
    sort_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "categories"
        ordering = ["sort_order", "id"]

    def __str__(self):
        return self.name
