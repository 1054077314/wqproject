from django.urls import path

from . import views

urlpatterns = [
    path("register", views.register),
    path("login", views.login),
    path("profile", views.profile),
    path("admin/users/", views.admin_user_list),
    path("admin/users/<int:pk>/", views.admin_user_toggle),
    path("admin/statistics/", views.admin_statistics),
]
