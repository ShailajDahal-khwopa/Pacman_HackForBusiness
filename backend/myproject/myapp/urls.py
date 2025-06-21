from django.urls import path
from . import views

# URL patterns for the myapp application
urlpatterns  = [
    path('edit/', views.edit, name='edit'),
]