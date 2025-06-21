from django.shortcuts import render
from django.http import HttpResponse
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import BusinessUsers, Stock, CutomerUser, Credit
import json
import uuid as uuid_lib


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

#this is a function to view the table of stocks where /view port will listen for the uuid and send get the respective data from the database
@csrf_exempt
def view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            uuid = data.get('uuid')
        except (json.JSONDecodeError, UnicodeDecodeError):
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)

        try:
            business_user = BusinessUsers.objects.get(uuid=uuid)
            stocks = Stock.objects.filter(business_user=business_user)
            stock_data = [
                {
                    'uuid': stock.uuid,
                    'product_name': stock.product_name,
                    'price': stock.price,
                    'quantity': stock.quantity
                } for stock in stocks
            ]
            return JsonResponse({'status': 'success', 'stocks': stock_data})
        except BusinessUsers.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Business user not found'}, status=404)

# simple authentication that stores a new business user in the database if email and passowrd match
# if the authentication is correct it sends a uuid
#sends uuid of the new account as well

@csrf_exempt
def signin(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            email = data.get('email')
            password = data.get('password')
        except (json.JSONDecodeError, UnicodeDecodeError):
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)

        try:
            user = BusinessUsers.objects.get(email=email, password=password)
            return JsonResponse({'status': 'success', 'uuid': user.uuid})
        except BusinessUsers.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Invalid email or password'}, status=401)

    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)


@csrf_exempt
def signup(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            email = data.get('email')
            password = data.get('password')
            name = data.get('name')
            lat = data.get('lat')
            long = data.get('long')
        except (json.JSONDecodeError, UnicodeDecodeError):
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)

        if not all([email, password, lat, long]):
            return JsonResponse({'status': 'error', 'message': 'Missing fields for new user'}, status=400)

        if BusinessUsers.objects.filter(email=email).exists():
            return JsonResponse({'status': 'error', 'message': 'Email already exists'}, status=409)

        new_uuid = str(uuid_lib.uuid4())
        user = BusinessUsers.objects.create(
            uuid=new_uuid,
            email=email,
            name = name,
            password=password,
            lat=lat,
            long=long
        )
        return JsonResponse({'status': 'success', 'uuid': user.uuid, 'message': 'New user created'})

    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)

# This code defines customer user signup and signin functions.
@csrf_exempt
def customer_signup(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            email = data.get('email')
            password = data.get('password')
        except (json.JSONDecodeError, UnicodeDecodeError):
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)

        if not all([email, password]):
            return JsonResponse({'status': 'error', 'message': 'Missing fields for new user'}, status=400)

        if CutomerUser.objects.filter(email=email).exists():
            return JsonResponse({'status': 'error', 'message': 'Email already exists'}, status=409)

        new_uuid = str(uuid_lib.uuid4())
        user = CutomerUser.objects.create(
            uuid=new_uuid,
            email=email,
            password=password
        )
        return JsonResponse({'status': 'success', 'uuid': user.uuid, 'message': 'New user created'})

    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)

@csrf_exempt
def customer_signin(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            email = data.get('email')
            password = data.get('password')
        except (json.JSONDecodeError, UnicodeDecodeError):
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)

        try:
            user = CutomerUser.objects.get(email=email, password=password)
            return JsonResponse({'status': 'success', 'uuid': user.uuid})
        except CutomerUser.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Invalid email or password'}, status=401)

    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)

@csrf_exempt
def credit(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            customer_uuid = data.get('customer_uuid')
            business_uuid = data.get('business_uuid')
            amount = data.get('amount')
        except (json.JSONDecodeError, UnicodeDecodeError):
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)

        try:
            customer_user = CutomerUser.objects.get(uuid=customer_uuid)
            business_user = BusinessUsers.objects.get(uuid=business_uuid)
        except (CutomerUser.DoesNotExist, BusinessUsers.DoesNotExist):
            return JsonResponse({'status': 'error', 'message': 'User not found'}, status=404)

        credit_entry = Credit.objects.create(
            customer_user=customer_user,
            business_user=business_user,
            amount=amount
        )
        return JsonResponse({'status': 'success', 'credit_id': credit_entry.id})

    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)


# search for businesses providing an item within certain raduus of provided lat long and return business name 
@csrf_exempt
def search_businesses(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            product_name = data.get('product_name')
            lat = data.get('lat')
            long = data.get('long')
            radius = data.get('radius', 5)  # Default radius is 5 km
        except (json.JSONDecodeError, UnicodeDecodeError):
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)

        businesses = BusinessUsers.objects.filter(
            stocks__product_name=product_name,
            lat__range=(lat - radius, lat + radius),
            long__range=(long - radius, long + radius)
        ).distinct()

        business_data = [{'uuid': business.uuid, 'name': business.name} for business in businesses]
        return JsonResponse({'status': 'success', 'businesses': business_data})

    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)
