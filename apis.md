# MedicExpress API Documentation

## Base Configuration
- **Base URL**: `http://localhost:8080`
- **Auth Type**: Bearer Token (JWT)
- **Content-Type**: `application/json`

## Authentication Flow
1. POST `/api/auth/signup` or `/api/auth/login` 
2. Store returned JWT token
3. Include in headers: `Authorization: Bearer {token}`

## ✅ WORKING ENDPOINTS

### Auth (Public)
- `POST /api/auth/signup` - Register user
- `POST /api/auth/login` - Login, returns JWT

### User Management (Auth Required)
- `GET /api/user/welcome` - Test endpoint
- `GET /api/user/{id}` - Get user by ID
- `GET /api/user/getAll` - Get all users
- `POST /api/user/updateUser` - Update user info
- `POST /api/user/addUsers` - Bulk add users

### Admin Only (Role: ADMIN)
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/{id}` - Get user by ID
- `DELETE /api/admin/users/{id}` - Delete user
- `GET /api/admin/pharmacies` - Get pharmacies
- `POST /api/admin/pharmacies` - Add pharmacy
- `DELETE /api/admin/pharmacies/{id}` - Delete pharmacy
- `GET /api/admin/deliveryDrivers` - Get drivers
- `POST /api/admin/deliveryDrivers` - Add driver
- `DELETE /api/admin/deliveryDrivers/{id}` - Delete driver

### Doctor Only (Role: DOCTOR)
- `GET /api/doctor/allDoctor` - Get all doctors
- `GET /api/doctor/{id}` - Get doctor by ID

### Patient Only (Role: PATIENT)
- `GET /api/patient/prescriptions?patientId={id}` - Get prescriptions
- `GET /api/patient/orders?patientId={id}` - Get orders
- `GET /api/patient/all` - Get all patients (working but undocumented)

## ❌ NON-WORKING ENDPOINTS
- All `/api/order/*` endpoints (403 Forbidden)
- All `/api/medicament/*` endpoints (Not implemented)
- All `/api/pharmacy/*` endpoints (Not implemented) 
- All `/api/deliveryDriver/*` endpoints (Not implemented)
- `POST /api/prescription/addPrescription` (Data structure issues - TESTING)
- `POST /api/patient/orders` (403 Forbidden)
- `POST /api/patient` (Does not exist - use signup instead)

## Request/Response Examples

### Login
```javascript
POST /api/auth/login
Body: {
  "email": "user@example.com",
  "password": "password123"
}
Response: "eyJhbGciOiJIUzM4NCJ9..." // JWT token
```

### Signup
```javascript
POST /api/auth/signup
Body: {
  "email": "user@example.com",
  "password": "password123",
  "role": "PATIENT", // PATIENT|ADMIN|DOCTOR|PHARMACIST|DELIVERY_DRIVER
  "name": "LastName",
  "firstName": "FirstName"
}
Response: "User registered successfully with email: user@example.com"
```

### Get User Data
```javascript
GET /api/user/{id}
Headers: { Authorization: "Bearer {token}" }
Response: {
  "id": 1,
  "name": "LastName",
  "firstName": "FirstName", 
  "email": "user@example.com",
  "role": "PATIENT"
}
```

### Add Pharmacy (Admin)
```javascript
POST /api/admin/pharmacies
Headers: { Authorization: "Bearer {adminToken}" }
Body: {
  "name": "Central Pharmacy",
  "address": "123 Main St"
}
Response: {
  "id": 2,
  "name": "Central Pharmacy", 
  "address": "123 Main St"
}
```

## Test Accounts

patient: aoufar.f@gmail.com / #Faresmeriem2003



## Error Handling
- 200: Success
- 400: Bad Request
- 401: Unauthorized (no/invalid token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 500: Server Error

## Known Frontend Issues to Handle
1. Some endpoints expect numeric IDs but may receive "undefined" strings
2. Order creation is blocked by security config
3. JWT token has expiration (handle refresh/re-login)
4. Role-based UI rendering needed for different user types

## Implementation Priority
1. ✅ Auth system (login/signup/logout)
2. ✅ User profile management
3. ✅ Admin dashboard (user/pharmacy/driver management)
4. ✅ Doctor dashboard (view doctor info)
5. ✅ Patient dashboard (view prescriptions/orders)
6. ❌ Order management (blocked - backend fixes needed)
7. 🔧 Prescription creation (testing structure fixes)
8. ✅ Patient creation (workaround via signup endpoint)

## 🔧 RECENT FIXES & WORKAROUNDS

### Patient Creation Workaround
**Problem**: `POST /api/patient` endpoint does not exist
**Solution**: Use `POST /api/auth/signup` with role "PATIENT"
```javascript
POST /api/auth/signup
Body: {
  "email": "patient@email.com", // Auto-generated if not provided
  "password": "TempPassword123!", // Temporary password
  "role": "PATIENT",
  "name": "LastName",
  "firstName": "FirstName"
}
```

### Prescription Creation Testing
**Problem**: `POST /api/prescription/addPrescription` has data structure issues
**Testing Structure**:
```javascript
POST /api/prescription/addPrescription
Headers: { Authorization: "Bearer {doctorToken}" }
Body: {
  "patientId": "123",
  "doctorId": "456", 
  "date": "2025-01-15",
  "medications": "Medicine list",
  "instructions": "Instructions text",
  "status": "ACTIVE"
}
```