# 📮 Postman Collection Guide

## 📥 Import to Postman

You can use the following examples to test the API in Postman. Create a new collection with these requests.

---

## 🔐 Authentication Endpoints

### 1. Login
```http
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "email": "user@example.com",
  "userId": "123"
}
```

### 2. Register
```http
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "New User"
}
```

### 3. Forgot Password
```http
POST http://localhost:8080/api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### 4. Reset Password
```http
POST http://localhost:8080/api/auth/reset-password
Content-Type: application/json

{
  "resetCode": "reset_code_from_email",
  "newPassword": "newpassword123"
}
```

### 5. Resend Verification Email
```http
POST http://localhost:8080/api/auth/resend-verify-mail
Content-Type: application/json

{
  "email": "user@example.com"
}
```

---

## 💬 Chat Endpoints (Require JWT Token)

### Setup: Add Bearer Token
1. After login, copy the `token` from response
2. In Postman, go to the request
3. Headers tab → Add new header:
   ```
   Authorization: Bearer your_token_here
   ```

### 1. Send Message
```http
POST http://localhost:8080/api/chat
Content-Type: application/json
Authorization: Bearer {{jwt_token}}

{
  "message": "Hello, what is the schedule for tomorrow?"
}
```
**Response:**
```json
{
  "data": "The schedule for tomorrow is...",
  "message": "Message processed successfully"
}
```

### 2. Get Chat History
```http
GET http://localhost:8080/api/chat/history
Authorization: Bearer {{jwt_token}}
```
**Response:**
```json
[
  {
    "id": "1",
    "from": "user",
    "text": "Hello",
    "timestamp": "2025-11-14T10:30:00"
  },
  {
    "id": "2",
    "from": "assistant",
    "text": "Hi there!",
    "timestamp": "2025-11-14T10:30:05"
  }
]
```

---

## 👤 User Endpoints (Require JWT Token)

### 1. Get User Profile
```http
GET http://localhost:8080/api/user/profile
Authorization: Bearer {{jwt_token}}
```
**Response:**
```json
{
  "id": "123",
  "email": "user@example.com",
  "name": "User Name",
  "role": "USER"
}
```

### 2. Update User Profile
```http
PUT http://localhost:8080/api/user/profile
Content-Type: application/json
Authorization: Bearer {{jwt_token}}

{
  "name": "Updated Name",
  "email": "newemail@example.com"
}
```

---

## 🔄 Using Variables in Postman

### Setup Environment Variables

1. **Create Environment:**
   - Click: Environments → Create New
   - Name: "ChatBot-Dev"

2. **Add Variables:**
   ```
   baseUrl: http://localhost:8080
   token: (leave empty)
   email: user@example.com
   password: password123
   ```

3. **Use in Requests:**
   ```http
   POST {{baseUrl}}/api/auth/login
   POST {{baseUrl}}/api/chat
   Authorization: Bearer {{token}}
   ```

4. **Set Token Automatically:**
   - Login request → Tests tab:
   ```javascript
   var jsonData = pm.response.json();
   pm.environment.set("token", jsonData.token);
   ```

---

## 🧪 Common Test Scenarios

### Scenario 1: Complete Flow
1. **Register** → Get email
2. **Login** → Get token
3. **Send Message** → Using token
4. **Get History** → View chat

### Scenario 2: Error Handling
1. **Wrong Password** → Should get 401
2. **Invalid Token** → Should get 401
3. **Missing Token** → Should get 401
4. **Invalid Email** → Should get 400

### Scenario 3: CORS Testing
1. In Postman, add header:
   ```
   Origin: http://localhost:5173
   ```
2. Check response headers for CORS headers:
   ```
   Access-Control-Allow-Origin: http://localhost:5173
   Access-Control-Allow-Methods: GET, POST, PUT, DELETE
   ```

---

## 🐛 Debugging Tips

### 1. Check Response Headers
- Look for CORS headers
- Check Authorization headers
- Verify Content-Type

### 2. View Request Details
- Click "Code" button to see curl command
- Copy curl and run in terminal
- Compare with browser requests

### 3. Check Status Codes
```
200: Success
201: Created
400: Bad Request (invalid data)
401: Unauthorized (need token)
403: Forbidden (token invalid)
404: Not Found (endpoint doesn't exist)
500: Server Error
```

### 4. Enable Request/Response Logging
- Settings → General
- Enable "Request/Response Logging"
- View logs at bottom

---

## 📊 Collection JSON (Import to Postman)

Save as `ChatBot-API.postman_collection.json`:

```json
{
  "info": {
    "name": "ChatBot API",
    "version": "1.0"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:8080"
    },
    {
      "key": "token",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "url": {
              "raw": "{{baseUrl}}/api/auth/login",
              "host": ["{{baseUrl}}"],
              "path": ["api", "auth", "login"]
            },
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"email\": \"user@example.com\", \"password\": \"password123\"}"
            }
          }
        }
      ]
    },
    {
      "name": "Chat",
      "item": [
        {
          "name": "Send Message",
          "request": {
            "method": "POST",
            "url": {
              "raw": "{{baseUrl}}/api/chat",
              "host": ["{{baseUrl}}"],
              "path": ["api", "chat"]
            },
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"message\": \"Hello!\"}"
            }
          }
        }
      ]
    }
  ]
}
```

---

## 🎯 Quick Testing Checklist

- [ ] Backend running on http://localhost:8080?
- [ ] Can login without token?
- [ ] Get valid JWT token?
- [ ] Can send chat message with token?
- [ ] Get error without token?
- [ ] CORS headers present?
- [ ] Chat history loads?
- [ ] Can logout?

---

## 💡 Pro Tips

1. **Pre-request Script** (set before each request):
   ```javascript
   // Check if token exists
   if (!pm.environment.get("token")) {
     console.log("No token found!");
   }
   ```

2. **Post-request Script** (process response):
   ```javascript
   // Save response time
   pm.environment.set("responseTime", pm.response.responseTime);
   console.log("Response took: " + pm.response.responseTime + "ms");
   ```

3. **Automated Testing**:
   - Use Postman's Newman CLI
   - Run collection via CI/CD pipeline
   - Generate HTML reports

4. **Mock Responses**:
   - Use Postman mock servers
   - Test frontend without backend
   - Useful for parallel development

---

## 📞 Support

If you encounter issues:
1. Check the backend logs
2. Verify .env configuration
3. Check CORS settings
4. Look at browser DevTools Network tab
5. Run curl commands to test API directly

Happy testing! 🚀
