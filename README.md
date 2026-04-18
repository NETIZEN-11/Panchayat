# Smart Panchayat App

A full-stack mobile application for village governance and citizen engagement.

## Tech Stack

- **Mobile App**: React Native (Expo)
- **Backend**: Node.js + Express
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT
- **Image Upload**: Multer
- **State Management**: React Context

## Project Structure

```
root/
├── backend/
│   ├── src/
│   │   ├── config/database.js
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.js
│   ├── uploads/
│   └── package.json
│
└── mobile/
    ├── src/
    │   ├── config/api.js
    │   ├── context/
    │   ├── navigation/
    │   ├── screens/
    │   └── components/
    ├── App.js
    └── package.json
```

## Setup Instructions

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Copy `.env.example` to `.env`
   - Update `MONGODB_URI` with your MongoDB connection string
   - Update `JWT_SECRET` with a strong secret key (min 32 characters)
   - (Optional) Add your OpenAI API key for chatbot functionality

   Example `.env`:
   ```
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/smart-panchayat
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Create uploads directory** (if not exists)
   ```bash
   mkdir uploads
   ```

5. **Start the server**
   ```bash
   # Development mode (with auto-reload)
   npm run dev

   # OR Production mode
   npm start
   ```

6. **Verify server is running**
   - Visit: http://localhost:5000/
   - Health check: http://localhost:5000/api/health

### Mobile App Setup

1. **Navigate to mobile directory**
   ```bash
   cd mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API URL**
   - Open `src/config/api.js`
   - Change `DEFAULT_IP` to your computer's IP address (not localhost)

   ```javascript
   const DEFAULT_IP = '192.168.1.100'; // Your actual IP
   ```

   **To find your IP:**
   - Windows: `ipconfig` then look for IPv4 Address
   - Mac/Linux: `ifconfig` then look for inet

4. **Start Expo**
   ```bash
   npx expo start
   ```

5. **Run on device/emulator**
   - **Android Emulator**: Press `a` in terminal
   - **Physical Device**: Scan QR code with Expo Go app

   **Important**: Make sure your phone is on the same WiFi network as your computer.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Complaints
- `POST /api/complaints` - Create complaint (protected)
- `GET /api/complaints/my-complaints` - Get user's complaints (protected)
- `GET /api/complaints/all` - Get all complaints (admin only)
- `GET /api/complaints/:id` - Get complaint by ID (protected)
- `PUT /api/complaints/:id` - Update complaint status (admin only)
- `DELETE /api/complaints/:id` - Delete complaint (protected)

### Schemes
- `GET /api/schemes` - Get all schemes (public)
- `GET /api/schemes/:id` - Get scheme by ID (public)
- `POST /api/schemes` - Create scheme (admin only)
- `PUT /api/schemes/:id` - Update scheme (admin only)
- `DELETE /api/schemes/:id` - Delete scheme (admin only)

### Additional Routes
- `/api/chatbot` - AI chatbot (protected)
- `/api/announcements` - Announcements
- `/api/polls` - Polls and voting
- `/api/directory` - Village directory
- `/api/notifications` - Notifications
- `/api/feedback` - Feedback

## Creating an Admin User

By default, new users are created with `role: 'user'`. To create an admin user:

1. Register through the app or API
2. Manually update the user's role in MongoDB:

```javascript
// In MongoDB shell or using mongoose
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

## Testing the App

### Backend Health Check
```bash
curl http://localhost:5000/api/health
```

### Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "1234567890",
    "password": "password123",
    "village": "Test Village"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`
- For MongoDB Atlas: whitelist your IP address

### Mobile App Can't Connect to Backend
1. Verify backend is running: http://localhost:5000/
2. Check your IP address is correct in `api.js`
3. Ensure phone is on same WiFi network
4. Check firewall settings

### Image Upload Not Working
- Ensure `uploads/` directory exists in backend
- Check write permissions

### Expo Crashes
- Clear Metro bundler cache: `npx expo start --clear`
- Reinstall node_modules: `rm -rf node_modules && npm install`

## Features

### User Features
- Register/Login with JWT authentication
- File complaints with image upload and location
- Track complaint status
- View government schemes
- AI chatbot assistance
- Village directory

### Admin Features
- View all complaints
- Update complaint status and priority
- Add admin notes
- Manage schemes
- View statistics dashboard
