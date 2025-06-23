from django.urls import path
from . import views

# URL patterns for the myapp application
urlpatterns  = [
    path('edit/', views.edit, name='edit'),
    path('view/', views.view, name='view'),
    path('signup/', views.signup, name='signup'),
    path('signin/', views.signin, name='signin'),
    path('search_businesses/', views.search_businesses, name='search_businesses'),
    path('credit_business/', views.credit_business, name='credit_business'),
    path('credit_edit/', views.credit_edit, name='credit_edit'),
    path('notification/', views.notification, name='notification'),
    path('view_notifications/', views.view_notifications, name='view_notifications'),
    path('credit_customer/', views.credit_customer, name='credit_customer'),
    path('credit_add/', views.credit_add, name='credit_add'),
]