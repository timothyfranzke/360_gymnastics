# 360 Gym Management API

A comprehensive RESTful API for gym management system built with PHP, featuring secure authentication, announcement management, staff administration, operating hours control, and special closure handling.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Announcement Management**: CRUD operations for gym announcements with different types and priorities
- **Staff Management**: Complete staff member lifecycle management with user accounts
- **Operating Hours**: Dynamic gym hours management with current status checking
- **Closure Management**: Special closures, holidays, and emergency closure handling
- **Security**: Input validation, SQL injection prevention, rate limiting, and comprehensive error handling
- **API Standards**: RESTful design with proper HTTP status codes and consistent response format

## 📋 Requirements

- PHP 7.4 or higher
- MySQL 5.7 or higher
- Apache/Nginx web server
- mod_rewrite enabled (for Apache)

## 🛠️ Installation

1. **Clone/Download the API files** to your web server directory
2. **Configure your web server** to point to the `api` directory
3. **Set up database configuration** in `config/config.php`
4. **Run database migrations** by accessing `/api/v1/migrate`
5. **Configure environment variables** (optional but recommended for production)

### Environment Configuration

Create a `.env` file in the API root directory (optional):

```bash
DB_HOST=localhost
DB_NAME=360gym_db
DB_USER=your_username
DB_PASS=your_password
JWT_SECRET=your-super-secret-jwt-key
```

### Database Setup

The API includes an automatic migration system. Access the migration endpoint to set up the database:

```
GET /api/v1/migrate
```

This will create all necessary tables and insert initial data including:
- Default admin user (username: `admin`, password: `admin123!`)
- Default gym hours
- Sample announcement

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

### User Roles

- **Member**: Basic access (currently limited functionality)
- **Staff**: Can manage announcements, view staff information, manage hours and closures
- **Admin**: Full access to all features including user management

## 📡 API Endpoints

### Base URL
```
https://yourdomain.com/api/v1
```

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/auth/login` | User login | Public |
| POST | `/auth/register` | User registration | Public/Admin |
| POST | `/auth/logout` | User logout | Authenticated |
| POST | `/auth/refresh` | Refresh JWT token | Authenticated |
| GET | `/auth/profile` | Get user profile | Authenticated |
| PUT | `/auth/profile` | Update user profile | Authenticated |
| PUT | `/auth/password` | Change password | Authenticated |
| GET | `/auth/verify` | Verify token validity | Authenticated |

### Announcement Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/announcements` | Get all announcements | Authenticated |
| GET | `/announcements/active` | Get active announcements | Public |
| GET | `/announcements/type/{type}` | Get announcements by type | Public |
| GET | `/announcements/{id}` | Get specific announcement | Authenticated |
| POST | `/announcements` | Create announcement | Staff+ |
| PUT | `/announcements/{id}` | Update announcement | Staff+ |
| PATCH | `/announcements/{id}/toggle` | Toggle announcement status | Staff+ |
| DELETE | `/announcements/{id}` | Delete announcement | Staff+ |
| GET | `/announcements/stats` | Get announcement statistics | Staff+ |

### Staff Management Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/staff` | Get all staff members | Staff+ |
| GET | `/staff/{id}` | Get specific staff member | Staff+ |
| GET | `/staff/{id}/schedule` | Get staff schedule | Staff+ |
| POST | `/staff` | Create staff member | Admin |
| PUT | `/staff/{id}` | Update staff member | Admin/Self |
| DELETE | `/staff/{id}` | Delete staff member | Admin |
| GET | `/staff/stats` | Get staff statistics | Admin |
| GET | `/staff/departments` | Get departments list | Staff+ |
| GET | `/staff/positions` | Get positions list | Staff+ |

### Gym Hours Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/gym-hours` | Get all gym hours | Public |
| GET | `/gym-hours/week` | Get current week hours | Public |
| GET | `/gym-hours/status` | Get current open/closed status | Public |
| GET | `/gym-hours/{day}` | Get hours for specific day | Public |
| GET | `/gym-hours/check` | Check if open at specific time | Public |
| GET | `/gym-hours/next-opening` | Get next opening time | Public |
| PUT | `/gym-hours/{day}` | Update hours for specific day | Admin |
| PUT | `/gym-hours/bulk` | Update multiple days | Admin |
| POST | `/gym-hours/reset` | Reset to default hours | Admin |
| GET | `/gym-hours/stats` | Get hours statistics | Staff+ |

### Gym Closure Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/gym-closures` | Get all closures | Authenticated |
| GET | `/gym-closures/upcoming` | Get upcoming closures | Public |
| GET | `/gym-closures/current-month` | Get current month closures | Public |
| GET | `/gym-closures/check` | Check if closed on specific date | Public |
| GET | `/gym-closures/{id}` | Get specific closure | Authenticated |
| POST | `/gym-closures` | Create closure | Staff+ |
| POST | `/gym-closures/close-today` | Mark gym closed for today | Staff+ |
| POST | `/gym-closures/emergency` | Create emergency closure | Staff+ |
| PUT | `/gym-closures/{id}` | Update closure | Staff+ |
| DELETE | `/gym-closures/{id}` | Delete closure | Staff+ |
| GET | `/gym-closures/stats` | Get closure statistics | Staff+ |

### Class Schedule Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/classes/schedule` | Get Jackrabbit class schedule | Public |

### Utility Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/migrate` | Run database migrations | Public |
| GET | `/migrate?action=status` | Get migration status | Public |

## 📝 Request/Response Examples

### Authentication

#### Login
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
    "username": "admin",
    "password": "admin123!"
}
```

#### Response
```json
{
    "success": true,
    "message": "Login successful",
    "data": {
        "user": {
            "id": 1,
            "username": "admin",
            "email": "admin@360gym.com",
            "role": "admin",
            "first_name": "System",
            "last_name": "Administrator"
        },
        "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
        "expires_at": "2024-01-20T15:30:00+00:00"
    },
    "timestamp": "2024-01-20T14:30:00+00:00"
}
```

### Create Announcement
```bash
POST /api/v1/announcements
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
    "title": "New Equipment Arrival",
    "content": "We've received new cardio equipment that will be available starting Monday.",
    "type": "general",
    "priority": "medium",
    "start_date": "2024-01-22",
    "end_date": "2024-01-29"
}
```

### Update Gym Hours
```bash
PUT /api/v1/gym-hours/monday
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
    "open_time": "06:00:00",
    "close_time": "22:00:00",
    "is_closed": false
}
```

### Create Emergency Closure
```bash
POST /api/v1/gym-closures/emergency
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
    "reason": "Water main break",
    "description": "Emergency repairs needed for water system",
    "end_date": "2024-01-25"
}
```

### Get Class Schedule
```bash
GET /api/v1/classes/schedule?cat1=Youth
```

#### Response
```json
{
    "success": true,
    "message": "Schedule retrieved successfully",
    "data": [
        {
            "id": "12345",
            "className": "Youth Basketball",
            "day": "Mon",
            "time": "4:00 PM",
            "gender": "Mixed",
            "ages": "8-12",
            "openings": 5,
            "tuition": 85.00,
            "registrationButton": {
                "text": "Register Now",
                "href": "https://app.jackrabbitclass.com/register?classId=12345"
            }
        }
    ],
    "timestamp": "2024-01-20T14:30:00+00:00"
}
```

## 🔧 Query Parameters

### Pagination
- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 20, max: 100)

### Filtering
- `search`: Search term
- `sort_by`: Field to sort by
- `sort_order`: ASC or DESC
- `filter`: Various filters depending on endpoint

### Class Schedule Parameters
- `cat1`: Required. Category filter for classes (e.g., "Youth", "Adult", "Special")

### Examples
```
GET /api/v1/announcements?page=2&page_size=10&search=equipment&type=general
GET /api/v1/staff?department=fitness&is_active=true&sort_by=hire_date&sort_order=DESC
GET /api/v1/classes/schedule?cat1=Youth
```

## 📊 Response Format

### Success Response
```json
{
    "success": true,
    "message": "Operation completed successfully",
    "data": { ... },
    "timestamp": "2024-01-20T14:30:00+00:00"
}
```

### Paginated Response
```json
{
    "success": true,
    "message": "Data retrieved successfully",
    "data": [ ... ],
    "pagination": {
        "current_page": 1,
        "per_page": 20,
        "total_items": 45,
        "total_pages": 3,
        "has_next_page": true,
        "has_prev_page": false
    },
    "timestamp": "2024-01-20T14:30:00+00:00"
}
```

### Error Response
```json
{
    "success": false,
    "error": true,
    "message": "Validation failed",
    "errors": {
        "email": ["Email format is invalid"],
        "password": ["Password must be at least 8 characters"]
    },
    "timestamp": "2024-01-20T14:30:00+00:00"
}
```

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Different permission levels
- **Input Validation**: Comprehensive validation for all inputs
- **SQL Injection Prevention**: Prepared statements and parameterized queries
- **XSS Protection**: Output sanitization
- **Rate Limiting**: Protection against abuse (configurable)
- **CORS Support**: Configurable cross-origin resource sharing
- **Security Headers**: X-Frame-Options, X-XSS-Protection, etc.

## 🚨 Error Codes

| HTTP Status | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 405 | Method Not Allowed |
| 422 | Validation Error |
| 500 | Internal Server Error |

## 🔍 Logging

The API logs all activities and errors:
- **Activity Log**: User actions and system events
- **Error Log**: Application errors and exceptions
- **Security Log**: Authentication attempts and security events

## 🚀 Production Deployment

1. **Environment Configuration**: Set `ENV` to `'production'` in config.php
2. **Security**: Change default JWT secret and admin password
3. **Database**: Use production database credentials
4. **SSL**: Enable HTTPS for all API communications
5. **Error Reporting**: Disable detailed error messages
6. **Logging**: Configure proper log rotation
7. **Monitoring**: Set up application monitoring

## 🧪 Testing

You can test the API using tools like:
- **Postman**: Import the collection for easy testing
- **cURL**: Command-line testing
- **Insomnia**: REST client for API testing

### Sample cURL Commands
```bash
# Login
curl -X POST https://yourdomain.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123!"}'

# Get announcements
curl -X GET https://yourdomain.com/api/v1/announcements \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Check gym status
curl -X GET https://yourdomain.com/api/v1/gym-hours/status

# Get class schedule
curl -X GET "https://yourdomain.com/api/v1/classes/schedule?cat1=Youth"
```

## 📞 Support

For technical support or questions about the API:
- Review the documentation thoroughly
- Check error logs for detailed error information
- Ensure proper authentication and permissions
- Validate request format and required fields

## 📄 License

This API is developed for 360 Gym Management System. All rights reserved.