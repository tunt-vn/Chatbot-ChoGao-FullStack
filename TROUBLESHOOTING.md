# 🔧 Troubleshooting Guide

## ❌ Common Errors & Solutions

---

## 🌐 CORS Errors

### Error Message:
```
Access to XMLHttpRequest at 'http://localhost:8080/api/chat' from origin 
'http://localhost:5173' has been blocked by CORS policy
```

### Causes & Solutions:

#### 1. Backend not running
```bash
# Check if backend is running
curl http://localhost:8080/api/chat/history

# If no response, start backend
cd Chatbot-ChoGao-BE
mvn spring-boot:run
```

#### 2. CORS configuration not applied
```bash
# Backend might have old CORS config
# Make sure CorsConfig.java exists in:
src/main/java/com/tuatua/config/CorsConfig.java

# Restart backend
mvn spring-boot:run
```

#### 3. Wrong frontend origin
```bash
# Make sure frontend runs on exact origin in CorsConfig
# Check allowed origins in CorsConfig.java:
configuration.setAllowedOrigins(Arrays.asList(
    "http://localhost:5173",      # This must match frontend URL
    "http://127.0.0.1:5173",
    ...
));
```

#### 4. Test CORS with curl
```bash
curl -X OPTIONS http://localhost:8080/api/chat \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -v

# Should see response headers:
# Access-Control-Allow-Origin: http://localhost:5173
# Access-Control-Allow-Methods: GET, POST, PUT, DELETE...
```

---

## 🔐 Authentication Errors

### Error: 401 Unauthorized
```
Response status: 401
message: "Unauthorized"
```

### Causes & Solutions:

#### 1. No token provided
```typescript
// Wrong - missing token
fetch('http://localhost:8080/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'Hello' })
})

// Correct - with token
const token = localStorage.getItem('authToken')
fetch('http://localhost:8080/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`  // ← Add this
  },
  body: JSON.stringify({ message: 'Hello' })
})
```

#### 2. Token expired or invalid
```javascript
// Check token in localStorage
console.log(localStorage.getItem('authToken'))

// If expired, need to login again
// Clear old token:
localStorage.removeItem('authToken')

// Login again to get new token:
const response = await fetch('http://localhost:8080/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password'
  })
})
const data = await response.json()
localStorage.setItem('authToken', data.token)
```

#### 3. JWT_SECRET mismatch
```bash
# Backend creates token with JWT_SECRET from .env
# Make sure secret is consistent:

# In .env:
JWT_SECRET=my-secret-key-min-32-characters

# Don't change it after creating tokens
# If changed, all old tokens become invalid
```

#### 4. Token format wrong
```javascript
// Check token format - should be:
// Authorization: Bearer <token>
// NOT: Authorization: <token>
// NOT: Authorization: Token <token>

const token = localStorage.getItem('authToken')
console.log('Token:', token)  // Should start with "eyJ..."

// Should have 3 parts separated by dots:
// header.payload.signature
```

---

## 🔗 Connection Errors

### Error: Cannot connect to server
```
Error: Failed to fetch
TypeError: Failed to fetch
```

### Causes & Solutions:

#### 1. Backend not running
```bash
# Check if port 8080 is open
# Windows:
netstat -ano | findstr :8080

# Mac/Linux:
lsof -i :8080

# Start backend
cd Chatbot-ChoGao-BE
mvn spring-boot:run

# Should see:
# Tomcat started on port(s): 8080
```

#### 2. Wrong backend URL
```javascript
// Check VITE_API_BASE_URL in .env.local
console.log(import.meta.env.VITE_API_BASE_URL)

// Should output: http://localhost:8080/api

// If wrong, update .env.local:
VITE_API_BASE_URL=http://localhost:8080/api
```

#### 3. Firewall blocking
```bash
# Windows Defender might block port 8080
# Allow Java through firewall:
# Windows Settings → Firewall → Allow app through firewall
# Add: Java/Maven

# Or use different port in application.properties:
# server.port=8081
```

#### 4. Port already in use
```bash
# Check what's using port 8080
# Windows:
netstat -ano | findstr :8080

# Kill the process:
taskkill /PID <PID> /F

# Or use different port:
# application.properties: server.port=8081
```

---

## 🗄️ Database Errors

### Error: Cannot connect to database
```
Connection to localhost:5432 refused
```

### Causes & Solutions:

#### 1. Database server not running
```bash
# Check if PostgreSQL is running
# Windows:
# Services → Look for "PostgreSQL"

# Mac:
brew services list | grep postgres

# Linux:
sudo systemctl status postgresql

# Start if not running:
# Windows: Use Services app
# Mac: brew services start postgresql
# Linux: sudo systemctl start postgresql
```

#### 2. Wrong database credentials
```bash
# Check .env file:
DB_URL=jdbc:postgresql://localhost:5432/chatbot_db
DB_USERNAME=postgres
DB_PASSWORD=your_password

# Verify credentials work:
# Windows Command Prompt:
psql -U postgres -h localhost

# Enter password when prompted
```

#### 3. Database doesn't exist
```bash
# Create database:
psql -U postgres -c "CREATE DATABASE chatbot_db;"

# Or use pgAdmin GUI:
# 1. Open pgAdmin
# 2. Right-click Databases
# 3. Create → Database
# 4. Name: chatbot_db
```

#### 4. Wrong URL format
```
# Correct format:
DB_URL=jdbc:postgresql://localhost:5432/chatbot_db

# Common mistakes:
# Wrong: jdbc:postgresql:localhost:5432/chatbot_db (missing //)
# Wrong: postgresql://localhost:5432/chatbot_db (missing jdbc:)
# Wrong: jdbc:postgresql://localhost:5432\chatbot_db (backslash)
```

---

## 📦 Dependency & Build Errors

### Error: Module not found
```
Cannot find module 'react'
Cannot find module '@mui/material'
```

### Solution:
```bash
# Frontend
cd chatbot-ChoGao
rm -rf node_modules package-lock.json
npm install

# Backend
cd Chatbot-ChoGao-BE
mvn clean install -DskipTests
```

### Error: TypeScript compilation error
```
Type 'x' is not assignable to type 'y'
```

### Solution:
```bash
# Check TypeScript version
npm ls typescript

# Update if needed
npm install --save-dev typescript@latest

# Clear cache
rm -rf node_modules/.cache

# Rebuild
npm run build
```

### Error: Java version mismatch
```
ERROR: COMPILATION ERROR
java.lang.UnsupportedClassVersionError
```

### Solution:
```bash
# Check Java version
java -version

# Should be Java 21
# If not, install:
# Download from: https://adoptium.net/

# Set JAVA_HOME
# Windows: Set-Item -Path env:JAVA_HOME -Value "C:\Program Files\Java\jdk-21"
# Mac: export JAVA_HOME=$(/usr/libexec/java_home -v 21)
# Linux: export JAVA_HOME=/usr/lib/jvm/java-21-openjdk

# Rebuild
mvn clean install
```

---

## 🌍 Frontend Issues

### Error: Page not loading
```
Page shows blank or 404
```

### Solution:
```bash
# 1. Make sure dev server is running
npm run dev

# 2. Check console for errors (F12)

# 3. Check if port 5173 is in use
# Windows: netstat -ano | findstr :5173
# Mac/Linux: lsof -i :5173

# 4. Try different port
npm run dev -- --port 3000
```

### Error: API calls in components fail
```typescript
// Check if AuthProvider is wrapping the app
// In main.tsx or App.tsx:
import { AuthProvider } from './contexts/AuthContext'

export default function App() {
  return (
    <AuthProvider>
      {/* Your app components */}
    </AuthProvider>
  )
}
```

### Error: ChatWindow shows no response
```
Send message → Nothing happens → No error in console
```

### Solution:
```javascript
// 1. Check browser Network tab (F12)
// Look for request to /api/chat

// 2. If request not sent, check:
// - Is chatApi.sendMessage() being called?
// - Is JWT token in localStorage?

// 3. Check backend logs for errors

// 4. Test with Postman first
// Then test exact same payload from frontend
```

---

## 🖥️ Backend Issues

### Error: Application won't start
```
Failed to create ApplicationContext
No qualifying bean of type 'X'
```

### Solution:
```bash
# 1. Check .env file exists
ls -la Chatbot-ChoGao-BE/.env

# 2. Verify all required variables
# Required:
DB_URL
DB_USERNAME  
DB_PASSWORD
JWT_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
N8N_WEBHOOK_URL
MAIL_HOST
MAIL_PORT
MAIL_USERNAME
MAIL_PASSWORD

# 3. Check for typos in .env

# 4. Rebuild
mvn clean install
mvn spring-boot:run
```

### Error: Request works in Postman but not in Frontend
```
Same request in Postman works
Same request from browser fails
```

### Solution:
```javascript
// 1. Check token is being sent
// DevTools → Network tab → Request Headers

// 2. Check CORS headers in response
// DevTools → Network tab → Response Headers
// Should have: Access-Control-Allow-*

// 3. Compare requests:
// Copy curl from Postman
// Run in terminal
// If works in curl but not browser → CORS issue

// 4. Check if request is OPTIONS (preflight)
// If yes, backend must respond to OPTIONS requests
// (CorsConfig should handle this automatically)
```

---

## 🧪 Testing Errors

### Error: Jest tests fail
```
Cannot find module 'react'
```

### Solution:
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom
npm test
```

### Error: Maven tests fail
```
Tests run: 5, Failures: 2
```

### Solution:
```bash
# Run tests with verbose output
mvn test -X

# Or skip tests and fix later
mvn install -DskipTests

# Then fix tests
mvn test
```

---

## 📊 Performance Issues

### Problem: API calls very slow
```
Request takes 5+ seconds
```

### Solution:
```bash
# 1. Check backend performance
# Look at backend logs for slow queries

# 2. Check database
# Maybe query is slow?
# Add indexes to frequently queried columns

# 3. Check network
# Open DevTools → Network tab
# Look for slow requests

# 4. Use caching
# Implement Redis for chat history caching
```

### Problem: Frontend slow to load
```
Page takes 10+ seconds to load
```

### Solution:
```bash
# 1. Build and analyze
npm run build
npm run preview

# 2. Check bundle size
# Use: webpack-bundle-analyzer

# 3. Code splitting
# Lazy load routes in React

# 4. Network throttling
# DevTools → Network → throttle speed
# See if frontend is responsive
```

---

## 🆘 When all else fails

### Debug checklist:
- [ ] Backend running on 8080?
- [ ] Frontend running on 5173?
- [ ] .env file exists and has correct values?
- [ ] Database running?
- [ ] No typos in URLs?
- [ ] Token present in localStorage?
- [ ] CORS headers in response?
- [ ] No JavaScript errors in console?
- [ ] Request shows in Network tab?
- [ ] Response code is correct (200, 201, 401, etc)?

### Get help:
```bash
# 1. Check backend logs
tail -f logs/spring.log

# 2. Check frontend console
F12 → Console tab

# 3. Test API directly
curl -v http://localhost:8080/api/auth/login

# 4. Read error messages carefully
# Most errors tell you what's wrong

# 5. Google the error message
# Usually someone has solved it
```

---

## 📞 Useful Commands

```bash
# Frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Check code
npm run preview      # Preview production build

# Backend
mvn clean            # Clean build
mvn install          # Install dependencies
mvn compile          # Compile code
mvn test             # Run tests
mvn spring-boot:run  # Run application

# Database
psql -U postgres     # Connect to PostgreSQL
\l                   # List databases
\dt                  # List tables
\q                   # Quit

# Network
curl -X GET http://localhost:8080/api/chat
netstat -ano | findstr :8080
lsof -i :8080
```

---

## 🎯 Quick Fix Summary

| Issue | Quick Fix |
|-------|-----------|
| CORS error | Restart backend with `mvn spring-boot:run` |
| 401 error | Login again or check JWT_SECRET |
| Connection refused | Check backend is running on 8080 |
| Database error | Check PostgreSQL is running |
| Page blank | Check browser console for errors |
| Build error | Run `mvn clean install` or `npm install` |
| TypeScript error | Check types and imports are correct |
| Test failure | Run with `-DskipTests` first, fix later |

---

Good luck! If you're still stuck, take a break and come back with fresh eyes! 🎯
