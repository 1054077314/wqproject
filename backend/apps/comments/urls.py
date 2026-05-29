from django.urls import path

from . import views

urlpatterns = [
    path("comments/", views.create_comment),
    path("products/<int:product_id>/comments/", views.product_comments),
]
