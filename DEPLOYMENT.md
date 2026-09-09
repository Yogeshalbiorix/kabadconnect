# 🚀 KabadConnect — MongoDB Atlas & Vercel Deployment Guide

This guide explains how to deploy **KabadConnect** to **Vercel** with **MongoDB Atlas** database in less than 5 minutes.

---

## 📋 Table of Contents
1. [MongoDB Atlas Setup (Free M0 Cluster)](#1-mongodb-atlas-setup)
2. [Deploying to Vercel (1-Click)](#2-deploying-to-vercel)
3. [Setting Environment Variables on Vercel](#3-setting-environment-variables-on-vercel)
4. [Testing & Verifying Live Deployment](#4-testing--verifying-live-deployment)
5. [Serverless API Endpoints Reference](#5-serverless-api-endpoints-reference)

---

## 1. MongoDB Atlas Setup

KabadConnect uses **MongoDB Atlas** for persisting scrap pickup orders, live rate cards, and partner records.

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up / log in.
2. Click **Create** and select the **M0 Free Cluster** (free forever, 512 MB storage).
3. **Database Access (User & Password)**:
   - Go to **Security** ➔ **Database Access** ➔ **Add New Database User**.
   - Select **Password** authentication.
   - Enter a username (e.g., `kabad_admin`) and a secure password.
   - Role: **Read and write to any database**.
4. **Network Access (Whitelist IP)**:
   - Go to **Security** ➔ **Network Access** ➔ **Add IP Address**.
   - Click **Allow Access from Anywhere** (`0.0.0.0/0`) so Vercel Serverless Functions can connect.
5. **Get Connection String**:
   - Go to **Database** ➔ Click **Connect** on your cluster.
   - Choose **Drivers** (Node.js).
   - Copy the connection string, for example:
     ```
     mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/kabadconnect?retryWrites=true&w=majority
     ```
   - Replace `<username>` and `<password>` with your database user credentials.

---

## 2. Deploying to Vercel

1. Push your repository to **GitHub** or **GitLab**:
   ```bash
   git init
   git add .
   git commit -m "feat: KabadConnect with MongoDB & Vercel serverless API"
   git branch -M main
   git remote add origin https://github.com/your-username/kabadconnect.git
   git push -u origin main
   ```
2. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New Project**.
3. Import your `kabadconnect` repository.
4. **Framework Preset**: Vercel will automatically detect `Vite` (configured via `vercel.json`).
5. In **Environment Variables**, add:
   - `MONGODB_URI`: Your MongoDB Atlas connection string from Step 1.
   - `VITE_MAPBOX_TOKEN`: Your Mapbox public token.
6. Click **Deploy**!

Within ~60 seconds, your site will be live at `https://your-project.vercel.app`.

---

## 3. Setting Environment Variables on Vercel

If you already deployed without environment variables, you can add them anytime:
1. Go to your project on Vercel ➔ **Settings** ➔ **Environment Variables**.
2. Add:
   | Key | Value | Notes |
   |-----|-------|-------|
   | `MONGODB_URI` | `mongodb+srv://<user>:<password>@cluster.mongodb.net/kabadconnect?retryWrites=true&w=majority` | Required for live MongoDB storage |
   | `VITE_MAPBOX_TOKEN` | `pk.eyJ...` | For interactive Mapbox scrap collection map |
3. Go to **Deployments** ➔ Click **Redeploy** on the latest commit.

---

## 4. Testing & Verifying Live Deployment

Once deployed, you can verify everything directly:

1. **Check Database Health**:
   Visit `https://your-project.vercel.app/api/health` in your browser.
   You will see:
   ```json
   {
     "status": "healthy",
     "database": "connected",
     "connected": true,
     "pingMs": 42,
     "message": "Successfully connected to MongoDB Atlas cluster."
   }
   ```
2. **Seed Initial 24 Scrap Rates & Partners**:
   You can trigger a seed anytime by sending a `POST` request to `/api/seed`, or simply open the **Admin Control Room** in the web app and click **Database Status ➔ Test Connection**.
3. **Book a Doorstep Pickup**:
   Schedule a pickup on the web app — the order will be saved directly into MongoDB Atlas under the `orders` collection.

---

## 5. Serverless API Endpoints Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Ping MongoDB Atlas and check latency |
| `GET` | `/api/orders` | Fetch pickup orders (filtered by `userId` or `status`) |
| `POST` | `/api/orders` | Create a new doorstep pickup booking in MongoDB |
| `PUT` | `/api/orders?id=KC-7729` | Update order status, kabadwala assignment, or cancellation |
| `GET` | `/api/rates` | Retrieve live scrap rates for 24 items across all categories |
| `PUT` | `/api/rates` | Admin live scrap rate update |
| `GET` | `/api/partners` | Get verified kabadwala partners (supports `?city=delhi`) |
| `POST` | `/api/seed` | Seed default 24 scrap rates and partners into MongoDB Atlas |
