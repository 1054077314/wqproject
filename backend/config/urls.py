from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include

urlpatterns = [
    path("api/", include("apps.users.urls")),
    path("api/", include("apps.categories.urls")),
    path("api/", include("apps.products.urls")),
    path("api/", include("apps.appointments.urls")),
    path("api/", include("apps.favorites.urls")),
    path("api/", include("apps.comments.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
