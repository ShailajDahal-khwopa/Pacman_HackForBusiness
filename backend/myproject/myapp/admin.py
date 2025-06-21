from django.contrib import admin
from .models import BusinessUsers, Stock, CutomerUser, Credit



# Register your models here.
admin.site.register(BusinessUsers)
admin.site.register(Stock)
admin.site.register(CutomerUser)
admin.site.register(Credit)
