from django.urls import path
from . import views

# URL patterns for the myapp application
urlpatterns  = [
    path('edit/', views.edit, name='edit'),
    path('view/', views.view, name='view'),
    path('signup/', views.signup, name='signup'),
    path('signin/', views.signin, name='signin'),
]