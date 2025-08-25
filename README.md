# 📚 VieBook – Smart Book Audio Platform (SBAP)

**VieBook** is an e-commerce platform for **eBooks and audiobooks**, enhanced with **AI Text-to-Speech** to automatically generate audiobooks from eBooks.  
The system is built with **ReactJS (Vite)** for the frontend and **ASP.NET Core Web API** for the backend.

---

## 🚀 Features

- 🔑 Authentication & Role-based Access: Admin / Staff / Book Owner / Customer / Guest
- 📖 eBook & Audiobook Management (CRUD)
- 🛒 Purchase & Order Management
- 🔊 AI Text-to-Speech: Convert eBooks into audiobooks automatically
- 💬 AI Chatbot & Chapter Summarization
- 🛡️ User Management & Authorization
- 🔔 Real-time Notifications
- 📊 Dashboard for Admin & Book Owners
- 📍 Smart Search, Suggestions & Filtering
- 💾 Purchase history, Wishlist, Feedback system

---

## 🛠️ Tech Stack

| Layer       | Stack                                          |
| ----------- | ---------------------------------------------- |
| Frontend    | ReactJS (Vite), JavaScript, TailwindCSS, Axios |
| Backend     | ASP.NET Core Web API, Entity Framework Core    |
| Database    | SQL Server                                     |
| AI Services | OCR, Text-to-Speech API, Chatbot AI            |
| Auth        | Cookie-based Auth, JWT (API), Google OAuth     |
| Real-time   | SignalR                                        |
| Deployment  | Docker, CI/CD                                  |

---

## ⚙️ Installation & Setup

### 1. Clone repository

```bash
git clone https://github.com/Thaohuong2k3/sbap.git
cd viebook
```

### 2. Install frontend dependencies

cd VieBook.FE
npm install

### 3. Run with Docker

From the project root, build and start all services:

docker-compose up --build

if want to clear the container + network + volume :

docker-compose down -v

NOTE:
Localhost configuration:

Database (SQL Server)

Host: localhost,1433

Username: sa

Password: YourStrong@Passw0rd

Backend API

URL: http://localhost:5757

Frontend App

URL: http://localhost:3008
