from django.urls import path

from . import views

urlpatterns = [
    path("categories/", views.category_list),
    path("admin/categories/", views.category_create),
    path("admin/categories/<int:pk>/", views.category_detail),
]
