from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import BusinessUsers, Stock, CutomerUser, Credit
import json
import uuid as uuid_lib
def options_response():
    response = HttpResponse()
    response["Access-Control-Allow-Origin"] = "*"
    response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    response["Access-Control-Allow-Headers"] = "Content-Type"
    response["Allow"] = "POST, OPTIONS"
    return response

@csrf_exempt
def edit(request):
    if request.method == "OPTIONS":
        # Handle preflight request for CORS
        response = options_response()
        response["Allow"] = "POST, OPTIONS"
        return response
        return options_response()
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            uuid = data.get('uuid')
            lat = data.get('lat', None)
            long = data.get('long', None)
            product_name = data.get('product_name')
            price = data.get('price')
            quantity = data.get('quantity')
        except (json.JSONDecodeError, UnicodeDecodeError):
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)

        business_user, created = BusinessUsers.objects.get_or_create(uuid=uuid)
        updated = False
        if lat is not None:
            business_user.lat = lat
            updated = True
        if long is not None:
            business_user.long = long
            updated = True
        if updated:
            business_user.save()

        stock, created = Stock.objects.update_or_create(
            business_user=business_user,
            product_name=product_name,
            defaults={
                'price': price,
                'quantity': quantity,
            }
        )

        return JsonResponse({'status': 'success', 'message': 'Data updated successfully'})
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

@csrf_exempt
def view(request):
    if request.method == "OPTIONS":
        # Handle preflight request for CORS
        response = options_response()
        response["Allow"] = "POST, OPTIONS"
        return response
        return options_response()
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            uuid = data.get('uuid')
        except (json.JSONDecodeError, UnicodeDecodeError):
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)

        try:
            business_user = BusinessUsers.objects.get(uuid=uuid)
            stocks = Stock.objects.filter(business_user=business_user)
            stock_data = [
                {
                    'product_name': stock.product_name,
                    'price': stock.price,
                    'quantity': stock.quantity
                } for stock in stocks
            ]
            return JsonResponse({'status': 'success', 'stocks': stock_data})
        except BusinessUsers.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Business user not found'}, status=404)

@csrf_exempt
def signin(request):
    if request.method == "OPTIONS":
        return options_response()
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
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
    if request.method == "OPTIONS":
        return options_response()
    if request.method == 'POST':
        try:
            data = json.loads(request.body8)
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

@csrf_exempt
def customer_signup(request):
    if request.method == "OPTIONS":
        return options_response()
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
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
    if request.method == "OPTIONS":
        return options_response()
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
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
def credit_business(request): # Returns all credits for a business user.
    if request.method == "OPTIONS":
        return options_response()
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            business_uuid = data.get('business_uuid')
        except (json.JSONDecodeError, UnicodeDecodeError):
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)

        try:
            business_user = BusinessUsers.objects.get(uuid=business_uuid)
        except BusinessUsers.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Business user not found'}, status=404)

        credits = Credit.objects.filter(business_user=business_user)
        credit_data = [
            {
                'customer_uuid': credit.customer_user.uuid,
                'amount': credit.amount,
                'due_date': credit.due_date.isoformat()
            } for credit in credits
        ]
        return JsonResponse({'status': 'success', 'credits': credit_data})

@csrf_exempt
def credit(request):  # Creates a new credit entry for a customer user.
    if request.method == "OPTIONS":
        return options_response()
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
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

@csrf_exempt
def search_businesses(request):
    if request.method == "OPTIONS":
        return options_response()
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
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


@csrf_exempt
def credit_edit(request):  # Edits an existing credit entry.
    if request.method == "OPTIONS":
        response = options_response()
        response["Allow"] = "POST, OPTIONS"
        return response

    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            credit_id = data.get('credit_id')
            amount = data.get('amount', None)
            due_date = data.get('due_date', None)
            paid_status = data.get('paid_status', None)
        except (json.JSONDecodeError, UnicodeDecodeError):
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)

        try:
            credit_entry = Credit.objects.get(id=credit_id)
        except Credit.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Credit entry not found'}, status=404)

        updated = False
        if amount is not None:
            credit_entry.amount = amount
            updated = True
        if due_date is not None:
            from django.utils.dateparse import parse_datetime
            parsed_due_date = parse_datetime(due_date)
            if parsed_due_date:
                credit_entry.due_date = parsed_due_date
                updated = True
        if paid_status is not None:
            credit_entry.paid_status = paid_status
            updated = True

        if updated:
            credit_entry.save()
            return JsonResponse({'status': 'success', 'message': 'Credit entry updated successfully'})
        else:
            return JsonResponse({'status': 'error', 'message': 'No fields to update'}, status=400)

    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)
