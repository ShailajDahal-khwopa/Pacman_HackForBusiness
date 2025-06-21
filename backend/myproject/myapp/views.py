from django.shortcuts import render
from django.http import HttpResponse
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import BusinessUsers, Stock
import json


@csrf_exempt
def edit(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            uuid = data.get('uuid')
            lat = data.get('lat', None)
            long = data.get('long', None)
            product_name = data.get('product_name')
            price = data.get('price')
            quantity = data.get('quantity')
        except (json.JSONDecodeError, UnicodeDecodeError):
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)

        # Get or create the business user
        business_user, created = BusinessUsers.objects.get_or_create(uuid=uuid)
        # Only update lat/long if provided
        updated = False
        if lat is not None:
            business_user.lat = lat
            updated = True
        if long is not None:
            business_user.long = long
            updated = True
        if updated:
            business_user.save()

        # Update or create the stock item
        stock, created = Stock.objects.update_or_create(
            uuid=uuid,
            defaults={
                'product_name': product_name,
                'price': price,
                'quantity': quantity,
                'business_user': business_user
            }
        )

        return JsonResponse({'status': 'success', 'message': 'Data updated successfully'})
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})
