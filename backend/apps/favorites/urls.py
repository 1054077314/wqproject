from django.urls import path

from . import views

urlpatterns = [
    path("favorites/", views.toggle_favorite),
    path("my-favorites/", views.my_favorites),
]
