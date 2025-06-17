# Collabrix Frontend

🎯 **Collabrix** is a collaborative project management platform.  
This repository contains the **Next.js frontend**, providing an intuitive and responsive UI that connects with the Spring Boot backend.

---

## 🌐 Features

- 🔐 User authentication and session management  
- 🧩 Create and manage projects  
- 👥 Invite and manage project members  
- ✅ Assign and track tasks  
- 📊 Responsive UI using Tailwind CSS  
- 🔗 API integration with Spring Boot backend  

---

## 🚀 Live Demo

🔗 Access the deployed frontend here:  
**[https://collabrix-dev.vercel.app](https://collabrix-dev.vercel.app)**

---

## 📦 Tech Stack

- **Next.js**
- **React**
- **Tailwind CSS**
- **Axios** for API communication
- **Framer Motion** (for animations)

---

## 🔐 Sample Environment Variables

Create a `.env.local` file in the root and add the following:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8081/api

# For production (e.g., Render backend)
# NEXT_PUBLIC_API_BASE_URL=https://collabrix-backend.onrender.com/api
````

> ⚠️ Do not commit `.env.local` to GitHub.

---

## 📦 Getting Started Locally

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/Collabrix-Frontend.git
cd Collabrix-Frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the development server

```bash
npm run dev
```

Frontend will be available at: `http://localhost:3000`

---

## 📦 Production Build

```bash
npm run build
npm start
```

---

## ☁️ Deployment Notes

This frontend is deployed using [**Vercel**](https://vercel.com/) for seamless integration with Next.js.

In your Vercel project settings, set the following environment variable:

```env
NEXT_PUBLIC_API_BASE_URL=https://collabrix-backend.onrender.com/api
```

Once set, trigger a redeploy and you're live 🎉


---

## 🔗 Related Projects

* 🧠 [Collabrix Backend (Spring Boot)](https://github.com/mehul515/Collabrix-Backend)

---
