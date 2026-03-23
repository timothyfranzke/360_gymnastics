# Camps API Documentation

## Overview
This document describes the Camps API endpoints that have been created for the 360 Gym Management System. The API provides comprehensive camp management functionality with proper authentication, validation, and error handling.

## Database Setup

First, run the migration to create the camps table:

```bash
# Run the migration (replace with your actual API URL)
curl -X GET "http://your-api-url/api/v1/migrate?action=run"
```

This will create the `camps` table with sample data including:
- Spring Break Gymnastics Camp
- Summer Intensive Training Camp
- Holiday Fun Camp
- Advanced Skills Workshop
- Winter Break Mini Camp
- Tumbling Fundamentals Camp

## API Endpoints

### Base URL
- Development: `http://localhost:8080/api/v1`
- Production: `/api/v1`

### Authentication
Most endpoints require admin authentication. Public endpoints are marked as such.

## Endpoints

### 1. Get All Camps (Paginated)
**GET** `/camps`

**Auth Required:** Yes (Admin)

**Query Parameters:**
- `page` (int): Page number (default: 1)
- `page_size` (int): Items per page (default: 20, max: 100)
- `search` (string): Search in title and description
- `is_active` (boolean): Filter by active status
- `date_from` (string): Filter camps from date (YYYY-MM-DD)
- `date_to` (string): Filter camps to date (YYYY-MM-DD)
- `sort_by` (string): Sort field (date, title, cost, created_at)
- `sort_order` (string): ASC or DESC

**Example:**
```bash
curl -X GET "http://localhost:8080/api/v1/camps?page=1&page_size=10&search=summer&sort_by=date&sort_order=ASC" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Get Active Camps (Public)
**GET** `/camps/active`

**Auth Required:** No

**Query Parameters:**
- `limit` (int): Maximum number of camps to return

**Example:**
```bash
curl -X GET "http://localhost:8080/api/v1/camps/active?limit=5"
```

### 3. Get Upcoming Camps (Public)
**GET** `/camps/upcoming`

**Auth Required:** No

**Query Parameters:**
- `limit` (int): Maximum number of camps to return

**Example:**
```bash
curl -X GET "http://localhost:8080/api/v1/camps/upcoming?limit=3"
```

### 4. Get Camp by ID
**GET** `/camps/{id}`

**Auth Required:** No

**Example:**
```bash
curl -X GET "http://localhost:8080/api/v1/camps/1"
```

### 5. Create New Camp
**POST** `/camps`

**Auth Required:** Yes (Admin)

**Request Body:**
```json
{
  "title": "New Gymnastics Camp",
  "date": "2024-08-15",
  "cost": 175.00,
  "description": "An exciting new camp for gymnasts of all levels.",
  "time": "9:00 AM - 4:00 PM",
  "registration_link": "https://360gymnastics.com/register/new-camp"
}
```

**Example:**
```bash
curl -X POST "http://localhost:8080/api/v1/camps" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "New Gymnastics Camp",
    "date": "2024-08-15",
    "cost": 175.00,
    "description": "An exciting new camp for gymnasts of all levels.",
    "time": "9:00 AM - 4:00 PM",
    "registration_link": "https://360gymnastics.com/register/new-camp"
  }'
```

### 6. Update Camp
**PUT** `/camps/{id}`

**Auth Required:** Yes (Admin)

**Request Body:** (All fields optional)
```json
{
  "title": "Updated Camp Title",
  "date": "2024-08-20",
  "cost": 180.00,
  "description": "Updated description",
  "time": "10:00 AM - 3:00 PM",
  "registration_link": "https://360gymnastics.com/register/updated-camp",
  "is_active": true
}
```

**Example:**
```bash
curl -X PUT "http://localhost:8080/api/v1/camps/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Updated Spring Break Camp",
    "cost": 130.00
  }'
```

### 7. Delete Camp
**DELETE** `/camps/{id}`

**Auth Required:** Yes (Admin)

**Example:**
```bash
curl -X DELETE "http://localhost:8080/api/v1/camps/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 8. Toggle Camp Status
**PATCH** `/camps/{id}/toggle`

**Auth Required:** Yes (Admin)

Toggles the `is_active` status of the camp.

**Example:**
```bash
curl -X PATCH "http://localhost:8080/api/v1/camps/1/toggle" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 9. Get Camp Statistics
**GET** `/camps/stats`

**Auth Required:** Yes (Admin)

Returns statistics about camps:
- `total`: Total number of camps
- `active`: Number of active camps
- `upcoming`: Number of upcoming camps (active and future date)
- `this_month`: Number of camps this month

**Example:**
```bash
curl -X GET "http://localhost:8080/api/v1/camps/stats" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Success message",
  "data": {
    // Response data
  },
  "timestamp": "2024-10-15T12:00:00Z"
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Camps retrieved successfully",
  "data": [
    // Array of camps
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 20,
    "total_items": 50,
    "total_pages": 3,
    "has_next_page": true,
    "has_prev_page": false
  },
  "timestamp": "2024-10-15T12:00:00Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": true,
  "message": "Error message",
  "errors": {
    // Validation errors if applicable
  },
  "timestamp": "2024-10-15T12:00:00Z"
}
```

## Camp Data Structure

```json
{
  "id": 1,
  "title": "Spring Break Gymnastics Camp",
  "date": "2024-03-25",
  "cost": 125.00,
  "description": "A fun-filled week of gymnastics training...",
  "time": "9:00 AM - 3:00 PM",
  "registration_link": "https://360gymnastics.com/register/spring-camp",
  "is_active": true,
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

## Validation Rules

### Create/Update Camp
- **title**: Required, 3-255 characters
- **date**: Required, valid date format (YYYY-MM-DD), cannot be in the past
- **cost**: Required, numeric, minimum 0
- **description**: Required, minimum 10 characters
- **time**: Required, minimum 5 characters
- **registration_link**: Required, valid URL format
- **is_active**: Optional, boolean (default: true)

## Error Codes

- **400**: Bad Request (validation errors, invalid data)
- **401**: Unauthorized (authentication required)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found (camp not found)
- **422**: Unprocessable Entity (validation failed)
- **500**: Internal Server Error

## CORS Support

The API includes CORS headers for frontend integration:
- **Allowed Origins**: `http://localhost:4200`, `https://yourdomain.com`
- **Allowed Methods**: GET, POST, PUT, DELETE, OPTIONS, PATCH
- **Allowed Headers**: Content-Type, Authorization, X-Requested-With, Accept

## Integration with Angular Service

The API is designed to work seamlessly with the existing `CampsService` in the Angular application. The service handles:
- API response mapping
- Error handling with fallback to mock data
- Proper typing with TypeScript interfaces
- HTTP parameter handling

## Security Features

- JWT authentication for admin operations
- Input validation and sanitization
- SQL injection prevention with prepared statements
- XSS protection with output encoding
- Rate limiting (configurable)
- Security headers (X-Content-Type-Options, X-Frame-Options, etc.)

## Testing

Use the provided curl examples above to test each endpoint. Make sure to:

1. Run the migration first to create the database table
2. Obtain a JWT token for admin operations (use `/api/v1/auth/login`)
3. Test public endpoints without authentication
4. Test admin endpoints with proper JWT token
5. Verify error handling with invalid data

## Notes

- The API follows the same patterns as existing controllers in the project
- All database operations use prepared statements for security
- Comprehensive logging is included for debugging and monitoring
- The API supports both development and production environments
- Sample data is automatically inserted when running the migration