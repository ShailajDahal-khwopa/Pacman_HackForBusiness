from django.db import models

class BusinessUsers(models.Model):
    uuid=models.CharField(max_length=100, primary_key=True)
    lat=models.FloatField()
    long=models.FloatField()


class Stock(models.Model):
    uuid=models.CharField(max_length=100, primary_key=True)
    product_name=models.CharField(max_length=100)
    price=models.FloatField()
    quantity=models.IntegerField()
    business_user=models.ForeignKey(BusinessUsers, on_delete=models.CASCADE, related_name='stocks')


