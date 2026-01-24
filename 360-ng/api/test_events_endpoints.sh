#!/bin/bash

# Events API Test Script
# This script tests all the events API endpoints
# Usage: ./test_events_endpoints.sh [base_url] [jwt_token]

# Default values
BASE_URL=${1:-"http://localhost:8080/api/v1"}
JWT_TOKEN=${2:-""}

echo "=== Events API Endpoint Tests ==="
echo "Base URL: $BASE_URL"
echo "JWT Token: ${JWT_TOKEN:0:20}..."
echo ""

# Helper function to make API calls
api_call() {
    local method=$1
    local endpoint=$2
    local data=$3
    local auth_required=$4
    
    echo "Testing: $method $endpoint"
    
    if [ "$auth_required" = "true" ] && [ -n "$JWT_TOKEN" ]; then
        if [ -n "$data" ]; then
            curl -s -X $method "$BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $JWT_TOKEN" \
                -d "$data" | jq '.' 2>/dev/null || echo "Invalid JSON response"
        else
            curl -s -X $method "$BASE_URL$endpoint" \
                -H "Authorization: Bearer $JWT_TOKEN" | jq '.' 2>/dev/null || echo "Invalid JSON response"
        fi
    else
        if [ -n "$data" ]; then
            curl -s -X $method "$BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -d "$data" | jq '.' 2>/dev/null || echo "Invalid JSON response"
        else
            curl -s -X $method "$BASE_URL$endpoint" | jq '.' 2>/dev/null || echo "Invalid JSON response"
        fi
    fi
    echo ""
    echo "---"
    echo ""
}

# Test 1: Get active events (public)
echo "1. GET /events/active (Public)"
api_call "GET" "/events/active" "" "false"

# Test 2: Get upcoming events (public)
echo "2. GET /events/upcoming (Public)"
api_call "GET" "/events/upcoming?limit=3" "" "false"

# Test 3: Get specific event (public)
echo "3. GET /events/1 (Public)"
api_call "GET" "/events/1" "" "false"

# Test 4: Get all events with pagination (requires auth)
echo "4. GET /events (Admin - requires JWT)"
api_call "GET" "/events?page=1&page_size=5" "" "true"

# Test 5: Get event statistics (requires auth)
echo "5. GET /events/stats (Admin - requires JWT)"
api_call "GET" "/events/stats" "" "true"

# Test 6: Create new event (requires auth)
echo "6. POST /events (Admin - requires JWT)"
create_data='{
  "title": "Test API Event",
  "date": "2024-12-20",
  "cost": 25.00,
  "description": "This is a test event created via API to verify the endpoint is working correctly.",
  "time": "7:00 PM - 9:00 PM",
  "registration_link": "https://360gymnastics.com/register/test-api-event"
}'
api_call "POST" "/events" "$create_data" "true"

# Test 7: Update event (requires auth)
echo "7. PUT /events/1 (Admin - requires JWT)"
update_data='{
  "cost": 30.00,
  "description": "Updated description via API test"
}'
api_call "PUT" "/events/1" "$update_data" "true"

# Test 8: Toggle event status (requires auth)
echo "8. PATCH /events/1/toggle (Admin - requires JWT)"
api_call "PATCH" "/events/1/toggle" "" "true"

# Test error handling
echo "9. GET /events/999 (Should return 404)"
api_call "GET" "/events/999" "" "false"

echo "=== Test Summary ==="
echo "- Tests 1-3: Public endpoints (should work without authentication)"
echo "- Tests 4-8: Admin endpoints (require JWT token)"
echo "- Test 9: Error handling test"
echo ""
echo "If JWT token was provided, all tests should return valid responses."
echo "If no JWT token was provided, admin tests will return 401 Unauthorized."
echo ""
echo "To get a JWT token, first authenticate:"
echo "curl -X POST \"$BASE_URL/auth/login\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"email\":\"admin@example.com\",\"password\":\"your_password\"}'"