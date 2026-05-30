from django.urls import path

from . import views

urlpatterns = [
    path("appointments/", views.create_appointment),
    path("appointments/<int:pk>/", views.update_appointment_status),
    path("my-appointments/as-buyer/", views.my_appointments_as_buyer),
    path("my-appointments/as-seller/", views.my_appointments_as_seller),
]
