from django.db import models

class BusinessUsers(models.Model):
    uuid=models.CharField(max_length=100, primary_key=True)
    name=models.CharField(max_length=100,default='John Doe')
    email=models.EmailField(max_length=100, unique=True)
    password=models.CharField(max_length=100)
    lat=models.FloatField()
    long=models.FloatField()


class Stock(models.Model):
    product_name=models.CharField(max_length=100)
    price=models.FloatField()
    quantity=models.IntegerField()
    business_user=models.ForeignKey(BusinessUsers, on_delete=models.CASCADE, related_name='stocks')

class CutomerUser(models.Model):
    uuid=models.CharField(max_length=100, primary_key=True)
    email=models.EmailField(max_length=100, unique=True)
    password=models.CharField(max_length=100)

class Credit(models.Model):
    credit_id = models.AutoField(primary_key=True) # Unique identifier for each credit record whch is auto-incremented
    customer_user = models.ForeignKey(CutomerUser, on_delete=models.CASCADE, related_name='credits')
    business_user = models.ForeignKey(BusinessUsers, on_delete=models.CASCADE, related_name='credits')
    amount = models.FloatField()
    due_date = models.DateTimeField(auto_now_add=True)
    paid_status = models.BooleanField(default=False)


class Notification(models.Model):
    notification_id = models.AutoField(primary_key=True)  # Unique identifier for each notification
    business_user = models.ForeignKey(BusinessUsers, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()  # Content of the notification

