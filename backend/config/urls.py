from django.urls import path, include

urlpatterns = [
    path("api/", include("apps.users.urls")),
    path("api/", include("apps.categories.urls")),
]
