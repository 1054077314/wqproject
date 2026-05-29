from django.urls import path

from . import views

urlpatterns = [
    path("products/", views.product_list_create),
    path("products/<int:pk>/", views.product_detail),
    path("my-products/", views.my_product_list),
    path("admin/products/<int:pk>/review/", views.product_review),
    path("admin/pending-products/", views.pending_product_list),
]
