# 🎓 Sistem Informasi Pendaftaran Magang dan Penelitian

> **Full-Stack Web Application for Internship & Research Registration Management**

![Status](https://img.shields.io/badge/Status-Complete-brightgreen)
![React](https://img.shields.io/badge/React-19.2.5-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B6FF)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E)

---

## 📋 Project Overview

Sistem Informasi Pendaftaran Magang dan Penelitian adalah aplikasi web berbasis React + Supabase yang mempermudah proses pendaftaran, verifikasi, dan pengelolaan data peserta magang & penelitian secara terstruktur dan efisien.

### ✨ Key Features

- 🔐 **Authentication** - Login & Register dengan role-based access
- 📋 **CRUD Operations** - Create, Read, Update, Delete dengan soft & hard delete
- 🔗 **Multi-Table JOIN** - Query dengan 4+ tabel untuk data lengkap
- 🔍 **Search & Filter** - Cari program, pendaftar, dan registrasi
- 📱 **Responsive Design** - Mobile-friendly dengan Tailwind CSS
- 👥 **Role-Based Access** - Separate views untuk Student & Admin
- 📊 **Dashboard** - Overview statistik dan data summary
- ✅ **Verification System** - Admin dapat approve/reject pendaftaran

---

## 🏗️ System Architecture

### Database Schema (5 Tables + Constraints)

**users** | **programs** | **registrations** | **supervisors** | **program_supervisors**

All tables include:
- Primary & Foreign Keys
- Unique constraints
- Check constraints
- Soft delete support (deleted_at)

---

## 🚀 Quick Start

### 1. Installation
```bash
cd frontend-magang
npm install
```

### 2. Setup Environment
```bash
# Create .env.local
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```

### 3. Setup Database
Follow [SETUP_GUIDE.md](./SETUP_GUIDE.md) for SQL scripts

### 4. Run Development Server
```bash
npm run dev
```

Access at: http://localhost:5173

---

## 📖 Demo Credentials

```
Admin:
Email: admin@test.com
Password: password

Student:
Email: student@test.com
Password: password
```

---

## 📁 Project Structure

```
src/
├── components/
│   └── Navbar.jsx
├── pages/
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Programs.jsx
│   ├── Registrations.jsx
│   ├── Details.jsx (JOIN query page)
│   └── admin/
│       ├── AdminPrograms.jsx
│       ├── AdminRegistrations.jsx
│       └── AdminSupervisors.jsx
├── App.jsx (Routing)
├── supabaseClient.js
└── index.css (Tailwind)
```

---

## ✅ All Requirements Met

- ✅ Database connection with CRUD
- ✅ ERD with 2+ actors (Admin, Student)
- ✅ 5 Tables with constraints (3+ minimum)
- ✅ Soft & Hard Delete operations
- ✅ Multi-table JOIN queries (4+ tables)
- ✅ Search & Filter functionality
- ✅ Authentication/Login system
- ✅ Responsive Navbar
- ✅ Eye-catching UI design

---

## 🎨 UI Features

- Gradient backgrounds
- Smooth animations
- Mobile responsive
- Icon-based design
- Loading states
- Color-coded badges
- Hover effects

---

## 📚 Documentation

- [ERD & Database Schema](./ERD_AND_SCHEMA.md)
- [Complete Setup Guide](./SETUP_GUIDE.md)

---

**Version**: 1.0.0 | **Status**: ✅ Production Ready | **Last Updated**: May 2026
