# Free Deployment Guide for Furniture E-Commerce

## Option 1: Deploy on Render.com (Recommended - Free tier)

### Backend Deployment

1. Sign up at [Render.com](https://render.com)
2. Create a New Web Service
3. Connect your GitHub repository
4. Configure settings:
   - Name: furniture-ecommerce-backend
   - Region: Oregon (US West)
   - Branch: main
   - Build Command: pip install -r requirements.txt
   - Start Command: gunicorn app:app
   - Plan: Free
   - Environment: Python 3.12
5. Set Environment Variables:
   - SECRET_KEY: your-secret-key-here
   - DB_HOST: (provided by Render PostgreSQL)
   - DB_PORT: 5432
   - DB_NAME: furniture_ecommerce
   - DB_USER: (provided by Render)
   - DB_PASSWORD: (provided by Render)
6. Deploy

### Frontend Deployment

1. Create a New Static Site on Render
2. Connect your GitHub repository
3. Configure settings:
   - Name: furniture-ecommerce-frontend
   - Build Command: npm run build
   - Publish Directory: frontend/build
   - Plan: Free
4. Set Environment Variables:
   - REACT_APP_API_URL: https://furniture-ecommerce-backend.onrender.com
5. Deploy

## Access Your App
- Frontend: https://furniture-ecommerce-frontend.onrender.com
- Backend API: https://furniture-ecommerce-backend.onrender.com
- Swagger docs: https://furniture-ecommerce-backend.onrender.com/api-docs

## Alternative: Deploy on Railway.app

1. Sign up at [Railway.app](https://railway.app)
2. Create New Project
3. Deploy from GitHub
4. Configure PostgreSQL database
5. Set environment variables
6. Deploy both frontend and backend

## What You Need to Do:

1. Push your code to GitHub
2. Create accounts on Render.com or Railway.app
3. Configure environment variables
4. Deploy both services
5. Your app will be live with a free URL!
