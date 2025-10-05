# 360 Gym API - Usage Examples

This document provides practical examples of how to use the 360 Gym Management API endpoints.

## Table of Contents
- [Authentication Examples](#authentication-examples)
- [Announcement Management](#announcement-management)
- [Staff Management](#staff-management)
- [Gym Hours Management](#gym-hours-management)
- [Closure Management](#closure-management)
- [Common Use Cases](#common-use-cases)

## Authentication Examples

### 1. Admin Login
```bash
curl -X POST http://localhost/360gym/360-ng/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123!"
  }'
```

**Response:**
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
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIzNjBneW0tYXBpIiwiYXVkIjoiMzYwZ3ltLWNsaWVudCIsImlhdCI6MTcwNTc1ODAwMCwiZXhwIjoxNzA1NzYxNjAwLCJqdGkiOiJhYmNkZWZnaCIsImRhdGEiOnsidXNlcl9pZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiJ9fQ.signature",
    "expires_at": "2024-01-20T15:30:00+00:00"
  },
  "timestamp": "2024-01-20T14:30:00+00:00"
}
```

### 2. Register New Staff Member
```bash
curl -X POST http://localhost/360gym/360-ng/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "username": "trainer1",
    "email": "trainer1@360gym.com",
    "password": "SecurePass123!",
    "first_name": "John",
    "last_name": "Smith",
    "role": "staff"
  }'
```

### 3. Get Current User Profile
```bash
curl -X GET http://localhost/360gym/360-ng/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Announcement Management

### 1. Create General Announcement
```bash
curl -X POST http://localhost/360gym/360-ng/api/v1/announcements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "New Group Fitness Classes",
    "content": "We are excited to announce new yoga and pilates classes starting next week. Classes will be held Monday, Wednesday, and Friday at 6 PM.",
    "type": "class",
    "priority": "high",
    "start_date": "2024-01-22",
    "end_date": "2024-02-22"
  }'
```

### 2. Create Urgent Maintenance Announcement
```bash
curl -X POST http://localhost/360gym/360-ng/api/v1/announcements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Pool Maintenance Tomorrow",
    "content": "The swimming pool will be closed tomorrow from 9 AM to 2 PM for routine maintenance. We apologize for any inconvenience.",
    "type": "maintenance",
    "priority": "critical",
    "start_date": "2024-01-21",
    "end_date": "2024-01-21"
  }'
```

### 3. Get Active Announcements (Public)
```bash
curl -X GET http://localhost/360gym/360-ng/api/v1/announcements/active?limit=5
```

### 4. Search Announcements
```bash
curl -X GET "http://localhost/360gym/360-ng/api/v1/announcements?search=equipment&type=general&priority=high" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Update Announcement
```bash
curl -X PUT http://localhost/360gym/360-ng/api/v1/announcements/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Updated: New Equipment Installation",
    "content": "The new cardio equipment installation has been rescheduled to next week.",
    "priority": "medium"
  }'
```

## Staff Management

### 1. Create New Staff Member
```bash
curl -X POST http://localhost/360gym/360-ng/api/v1/staff \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "username": "fitness_trainer",
    "email": "trainer@360gym.com",
    "password": "SecurePass123!",
    "first_name": "Sarah",
    "last_name": "Johnson",
    "role": "staff",
    "position": "Fitness Trainer",
    "department": "Fitness",
    "hire_date": "2024-01-15",
    "phone": "+1-555-0123",
    "salary": 45000,
    "emergency_contact_name": "Mike Johnson",
    "emergency_contact_phone": "+1-555-0124"
  }'
```

### 2. Get All Staff Members with Filters
```bash
curl -X GET "http://localhost/360gym/360-ng/api/v1/staff?department=Fitness&is_active=true&sort_by=hire_date&sort_order=DESC" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Update Staff Member Information
```bash
curl -X PUT http://localhost/360gym/360-ng/api/v1/staff/2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "position": "Senior Fitness Trainer",
    "salary": 50000,
    "phone": "+1-555-0125"
  }'
```

### 4. Get Staff Statistics
```bash
curl -X GET http://localhost/360gym/360-ng/api/v1/staff/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Gym Hours Management

### 1. Get Current Week Hours
```bash
curl -X GET http://localhost/360gym/360-ng/api/v1/gym-hours/week
```

### 2. Check Current Gym Status
```bash
curl -X GET http://localhost/360gym/360-ng/api/v1/gym-hours/status
```

**Response:**
```json
{
  "success": true,
  "message": "Gym status retrieved successfully",
  "data": {
    "current_status": {
      "day": "monday",
      "is_open": true,
      "status": "open",
      "current_time": "14:30:00",
      "hours": {
        "id": 1,
        "day_of_week": "monday",
        "open_time": "05:00:00",
        "close_time": "23:00:00",
        "is_closed": false
      },
      "message": "Gym is currently open"
    }
  },
  "timestamp": "2024-01-20T14:30:00+00:00"
}
```

### 3. Update Monday Hours
```bash
curl -X PUT http://localhost/360gym/360-ng/api/v1/gym-hours/monday \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "open_time": "06:00:00",
    "close_time": "22:00:00",
    "is_closed": false
  }'
```

### 4. Bulk Update All Hours
```bash
curl -X PUT http://localhost/360gym/360-ng/api/v1/gym-hours/bulk \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "hours": [
      {
        "day_of_week": "monday",
        "open_time": "06:00:00",
        "close_time": "22:00:00",
        "is_closed": false
      },
      {
        "day_of_week": "tuesday",
        "open_time": "06:00:00",
        "close_time": "22:00:00",
        "is_closed": false
      },
      {
        "day_of_week": "wednesday",
        "open_time": "06:00:00",
        "close_time": "22:00:00",
        "is_closed": false
      },
      {
        "day_of_week": "thursday",
        "open_time": "06:00:00",
        "close_time": "22:00:00",
        "is_closed": false
      },
      {
        "day_of_week": "friday",
        "open_time": "06:00:00",
        "close_time": "22:00:00",
        "is_closed": false
      },
      {
        "day_of_week": "saturday",
        "open_time": "08:00:00",
        "close_time": "20:00:00",
        "is_closed": false
      },
      {
        "day_of_week": "sunday",
        "open_time": "08:00:00",
        "close_time": "20:00:00",
        "is_closed": false
      }
    ]
  }'
```

### 5. Check if Gym is Open at Specific Time
```bash
curl -X GET "http://localhost/360gym/360-ng/api/v1/gym-hours/check?day=saturday&time=19:30:00"
```

## Closure Management

### 1. Create Holiday Closure
```bash
curl -X POST http://localhost/360gym/360-ng/api/v1/gym-closures \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "closure_date": "2024-12-25",
    "reason": "Christmas Day",
    "description": "The gym will be closed all day for Christmas Day. We will resume normal hours on December 26th.",
    "is_all_day": true
  }'
```

### 2. Create Partial Day Closure
```bash
curl -X POST http://localhost/360gym/360-ng/api/v1/gym-closures \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "closure_date": "2024-01-25",
    "reason": "Equipment Maintenance",
    "description": "Weight room will be closed for equipment maintenance.",
    "is_all_day": false,
    "start_time": "10:00:00",
    "end_time": "14:00:00"
  }'
```

### 3. Mark Gym Closed for Today (Emergency)
```bash
curl -X POST http://localhost/360gym/360-ng/api/v1/gym-closures/close-today \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "reason": "Power Outage",
    "description": "Unexpected power outage affecting the entire facility. We apologize for the inconvenience."
  }'
```

### 4. Create Emergency Multi-Day Closure
```bash
curl -X POST http://localhost/360gym/360-ng/api/v1/gym-closures/emergency \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "reason": "Facility Repairs",
    "description": "Emergency repairs needed due to HVAC system failure.",
    "end_date": "2024-01-27"
  }'
```

### 5. Check if Gym is Closed on Specific Date
```bash
curl -X GET "http://localhost/360gym/360-ng/api/v1/gym-closures/check?date=2024-12-25"
```

### 6. Get Upcoming Closures
```bash
curl -X GET http://localhost/360gym/360-ng/api/v1/gym-closures/upcoming?limit=10
```

## Common Use Cases

### 1. Complete Gym Status Check (Open/Closed with Reasons)
```bash
# Check current status
curl -X GET http://localhost/360gym/360-ng/api/v1/gym-hours/status

# Check for any closures today
curl -X GET "http://localhost/360gym/360-ng/api/v1/gym-closures/check?date=$(date +%Y-%m-%d)"
```

### 2. Mobile App Dashboard Data
```bash
# Get active announcements
curl -X GET http://localhost/360gym/360-ng/api/v1/announcements/active?limit=5

# Get current status
curl -X GET http://localhost/360gym/360-ng/api/v1/gym-hours/status

# Get upcoming closures
curl -X GET http://localhost/360gym/360-ng/api/v1/gym-closures/upcoming?limit=3
```

### 3. Admin Dashboard Statistics
```bash
# Get announcement stats
curl -X GET http://localhost/360gym/360-ng/api/v1/announcements/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get staff stats
curl -X GET http://localhost/360gym/360-ng/api/v1/staff/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get closure stats
curl -X GET http://localhost/360gym/360-ng/api/v1/gym-closures/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Weekly Schedule Planning
```bash
# Get current week hours
curl -X GET http://localhost/360gym/360-ng/api/v1/gym-hours/week

# Get current month closures
curl -X GET http://localhost/360gym/360-ng/api/v1/gym-closures/current-month

# Get staff schedule (if implemented)
curl -X GET http://localhost/360gym/360-ng/api/v1/staff/1/schedule \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Error Handling Examples

#### Invalid Authentication
```bash
curl -X GET http://localhost/360gym/360-ng/api/v1/announcements \
  -H "Authorization: Bearer INVALID_TOKEN"
```

**Response:**
```json
{
  "success": false,
  "error": true,
  "message": "Invalid token: Token has expired",
  "timestamp": "2024-01-20T14:30:00+00:00"
}
```

#### Validation Error
```bash
curl -X POST http://localhost/360gym/360-ng/api/v1/announcements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "",
    "content": "Test content",
    "start_date": "invalid-date"
  }'
```

**Response:**
```json
{
  "success": false,
  "error": true,
  "message": "Validation failed",
  "errors": {
    "title": ["title is required"],
    "start_date": ["start_date must be a valid date in format Y-m-d"]
  },
  "timestamp": "2024-01-20T14:30:00+00:00"
}
```

### 6. Database Migration
```bash
# Check migration status
curl -X GET http://localhost/360gym/360-ng/api/v1/migrate?action=status

# Run migrations
curl -X GET http://localhost/360gym/360-ng/api/v1/migrate
```

## JavaScript/Frontend Integration Examples

### 1. Login Function
```javascript
async function login(username, password) {
  try {
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('gym_token', data.data.token);
      localStorage.setItem('gym_user', JSON.stringify(data.data.user));
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}
```

### 2. Authenticated API Request Function
```javascript
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('gym_token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    },
    ...options
  };
  
  try {
    const response = await fetch(`/api/v1${endpoint}`, config);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message);
    }
    
    return data;
  } catch (error) {
    if (error.message.includes('token')) {
      // Token expired, redirect to login
      localStorage.removeItem('gym_token');
      localStorage.removeItem('gym_user');
      window.location.href = '/login';
    }
    throw error;
  }
}
```

### 3. Get Gym Status
```javascript
async function getGymStatus() {
  try {
    const response = await fetch('/api/v1/gym-hours/status');
    const data = await response.json();
    
    if (data.success) {
      return data.data.current_status;
    }
  } catch (error) {
    console.error('Failed to get gym status:', error);
    return null;
  }
}
```

This completes the comprehensive examples for using the 360 Gym API. Each example includes the request format and expected responses to help developers integrate with the API effectively.