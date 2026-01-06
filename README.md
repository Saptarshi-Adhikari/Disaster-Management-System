# 🚨 Disaster Management System

A comprehensive, real-time disaster management platform designed to coordinate emergency response, manage resources efficiently, and save lives during natural and man-made disasters.

## 🌟 Overview

The Disaster Management System is a modern web application built to enhance disaster preparedness, response, and recovery efforts. It bridges the gap between affected communities, volunteers, government agencies, and relief organizations through real-time communication and intelligent resource allocation.

### 🎯 Key Features

- **📊 Real-time Dashboard**: Monitor active disasters, resource availability, and response metrics
- **🚨 Instant Alert System**: Push notifications, SMS, and email alerts for emergency situations
- **📍 Incident Reporting**: Crowdsourced disaster reporting with geolocation
- **🗺️ Interactive Maps**: Visualize affected areas, shelters, and resource distribution points
- **👥 Volunteer Coordination**: Manage volunteer registrations, assignments, and tracking
- **📦 Resource Management**: Track and allocate emergency supplies, medical equipment, and personnel
- **🤖 AI-Powered Insights**: Predictive analytics for disaster impact and optimal resource routing
- **📱 Mobile Responsive**: Accessible on all devices for on-the-go emergency management
- **🔒 Secure Authentication**: Role-based access control for admins, responders, and citizens

## 🏗️ Architecture

The system follows a modern microservices architecture with:

- **Frontend**: Next.js with responsive UI
- **Backend**: Node.js/Express RESTful API
- **Database**: Firebase
- **Real-time**: WebSocket for live updates
- **External APIs**: Weather data, mapping services, SMS/Email gateways

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js / Next.js
- **Styling**: Tailwind CSS / Material-UI
- **State Management**: Redux / Zustand
- **Maps**: Leaflet / Google Maps API
- **Charts**: Recharts / Chart.js
- **Real-time**: Socket.io Client

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Authentication**: JWT / Passport.js
- **API**: RESTful / GraphQL
- **Real-time**: Socket.io

### Database & Storage
- **Primary DB**: Firebase
- **Cache**: Redis
- **File Storage**: AWS S3 / Cloudinary
- **Time-series**: InfluxDB

### DevOps & Deployment
- **Hosting**: Vercel (Frontend) / AWS/Railway (Backend)
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry, Prometheus

## 📋 Prerequisites

Before running this project, ensure you have:

- Node.js (v18.x or higher)
- npm or yarn
- PostgreSQL (v14+) or MongoDB
- Redis (v6+)
- Git

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Saptarshi-Adhikari/Disaster-Management-System.git
cd Disaster-Management-System
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install
```

### 3. Start Development Servers

```bash
# Terminal 1 - Start backend
cd server
npm run dev

### User Roles

1. **Admin**: Full system access, manage disasters, users, and resources
2. **Normal**: Access to active incidents, resource allocation,etc
