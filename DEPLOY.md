# NERVA AI Platform Deployment Guide

This document outlines the deployment architecture and configuration requirements for **NERVA AI — The Autonomous Nervous System for Business Operations**.

## Project Architecture

NERVA AI consists of two main components:
1. **Frontend**: A React / Vite / TypeScript client dashboard application.
2. **Backend**: An Express.js Node API service that handles simulation states, telemetry correlation, policy validation, execution workflows, and incident memory storage.

---

## Backend Deployment (e.g., Render Web Service)

Deploy the Express API server as a Node.js web service.

* **Repository Root Directory**: `backend`
* **Build Command**: `npm install`
* **Start Command**: `npm start`
* **Environment Variables**:
  * `PORT`: Port for Express server (automatically set by Render, defaults to `5000` fallback).
  * `MONGODB_URI`: (Optional) MongoDB connection string for Incident Memory storage (defaults to local fallback `mongodb://127.0.0.1:27017/nerva-ai`).
  * `GEMINI_API_KEY`: (Optional) Google Gemini API Key for the optional NERVA Explanation & Analysis layer. Kept strictly server-side for security.

---

## Frontend Deployment (e.g., Vercel, Netlify, Render Static Site)

Deploy the Vite React application as a static site.

* **Repository Root Directory**: `frontend`
* **Build Command**: `npm install && npm run build`
* **Output/Publish Directory**: `dist`
* **Environment Variables**:
  * None required. Vite compiles static HTML/JS/CSS assets. API calls are proxied or resolved relative to the origin.

---

## Verification & Health Check

* **Backend Health Check Endpoint**: `GET /`
  * Response: `"NERVA AI Platform API is running successfully."`
* **Backend API Root**: `GET /api/nerva`
