# Event Management API

A simple Event Management Web Application API built using **Node.js**, **Express.js**, and **MongoDB (Mongoose)**.

## Features

- 👥 **User Authentication** with 3 roles:
  - `admin`, `organizer`, `user`
- 📅 **Event Management**
  - Create, update, view, and delete events
  - Book and cancel event registrations
- ✉️ **Email Ticket Delivery**
  - Sends ticket confirmation via email using **Nodemailer**
- 🔔 **Notifications**
  - Scheduled event reminders using **Node-Cron**
  - Firebase integrated for push notifications

## 🛠️ Tech Stack

- Node.js + Express.js
- MongoDB + Mongoose
- Nodemailer
- Node-Cron
- Firebase Admin SDK

## 📬 API Collection

Postman collection is included for easy testing.

## 🚀 Getting Started

1. Clone the repo  
   `git clone https://github.com/your-username/event_management_api.git`

2. Install dependencies  
   `npm install`

3. Set environment variables in `.env`

4. Start the server  
   `npm start`

---

Clean structure, RESTful routes, and role-based access control included.  
Basic unit tests recommended for core functionality.
