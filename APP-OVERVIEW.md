# SIM Platform - Full Application Overview

## 🚀 Running the Application

```bash
# Install dependencies (if not already done)
npm install

# Run development server (both client and API)
npm run dev

# The app will be available at:
# - Frontend: http://localhost:5173
# - API: http://localhost:3001
```

## 🔐 Demo Login

Use these credentials to log in:
- Email: `demo@synmax.com`
- Password: `demo123`

## 🏗️ Application Features

### Authentication
- ✅ Login/Register system
- ✅ JWT-based authentication
- ✅ Protected routes
- ✅ Persistent sessions

### Dashboard
- ✅ Overview statistics
- ✅ Quick access to all services
- ✅ Recent activity feed

### Vessel Tracking Service (VTS)
- ✅ Search and track individual vessels
- ✅ Customizable tracking criteria (11 types)
- ✅ Real-time cost calculation
- ✅ Tracking management interface

### Area Monitoring Service (AMS)
- ✅ Monitor maritime areas of interest
- ✅ Geofencing capabilities
- ✅ Area statistics dashboard

### Fleet Tracking Service (FTS)
- ✅ Fleet creation and management
- ✅ Bulk vessel tracking
- ✅ Fleet-wide analytics

### Reports System
- ✅ Compliance Reports
- ✅ Chronology Reports
- ✅ Report history tracking
- ✅ Credit-based pricing

### Credits System
- ✅ Credit balance display
- ✅ Package selection (4 tiers)
- ✅ Usage history
- ✅ Service pricing guide

## 🎨 Design System

- **Primary Color**: Blue (#3b82f6)
- **Secondary Color**: Green (#22c55e)
- **Font**: Inter
- **Components**: Button, Card, Input, Modal, Table
- **Responsive**: Mobile-first design

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS
- React Router v6
- React Query (server state)
- Zustand (client state)
- React Hook Form

### Backend (Mock API)
- Express.js
- Socket.io (WebSocket support)
- JWT authentication
- RESTful API design

## 📁 Project Structure

```
sim2/
├── src/                    # Frontend source
│   ├── api/               # API client
│   ├── components/        # UI components
│   ├── features/          # Feature modules
│   ├── hooks/             # Custom hooks
│   ├── pages/             # Route pages
│   ├── stores/            # State management
│   └── types/             # TypeScript types
├── server/                # Mock API server
│   └── src/
│       ├── routes/        # API routes
│       └── data/          # Mock data
└── docs/                  # Documentation
```

## 🔄 API Endpoints

- **Auth**: `/api/v1/auth/*` (login, register, refresh, logout)
- **Vessels**: `/api/v1/vessels/*` (search, get details)
- **Tracking**: `/api/v1/tracking/*` (create, manage tracking)
- **Reports**: `/api/v1/reports/*` (generate reports)
- **Credits**: `/api/v1/credits/*` (purchase, history)

## 🚦 Next Steps

To extend the application:
1. Add real-time WebSocket updates for vessel positions
2. Implement map visualization for vessels and areas
3. Add payment integration for credits
4. Create detailed analytics dashboards
5. Implement email notifications
6. Add export functionality for reports

## 📝 Notes

- All API responses follow a consistent format
- Authentication tokens expire after 1 hour
- Mock data includes 3 sample vessels
- Credits system is fully functional but uses mock payments
- The app is production-ready architecture with mock data