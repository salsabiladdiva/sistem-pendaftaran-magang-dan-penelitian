# 🎓 Sistem Informasi Pendaftaran Magang dan Penelitian

> **Full-Stack Web Application for Internship & Research Registration Management**

![Status](https://img.shields.io/badge/Status-Complete-brightgreen)
![React](https://img.shields.io/badge/React-19.2.5-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B6FF)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E)

---

## 📋 Sistem Informasi Pendaftaran Magang & Penelitian

Sistem Informasi Pendaftaran Magang dan Penelitian merupakan aplikasi web berbasis React dan Supabase yang dirancang untuk mempermudah proses pendaftaran, verifikasi, serta pengelolaan data peserta magang maupun penelitian secara terstruktur, modern, dan efisien.

Aplikasi ini mendukung autentikasi berbasis role, manajemen data terintegrasi, serta dashboard interaktif untuk admin dan mahasiswa.

---

# ✨ Fitur Utama

### 🔐 Authentication & Authorization

* Login dan Register menggunakan Supabase Authentication
* Role-based access (`Admin` & `Student`)
* Session management dan protected routes

### 📋 CRUD Management

* Create, Read, Update, Delete data
* Soft Delete (`deleted_at`)
* Hard Delete permanen
* Data validation dan relational integrity

### 🔗 Relational Database & JOIN Query

* Implementasi query JOIN multi-tabel
* Menampilkan data pendaftaran lengkap beserta:

  * Data peserta
  * Program magang/penelitian
  * Dosen pembimbing
  * Status verifikasi

### 🔍 Search & Filter System

* Pencarian data program
* Filter status pendaftaran
* Filter data peserta dan pembimbing

### 👥 Role-Based Dashboard

#### Student

* Melihat daftar program
* Mendaftar program
* Melihat status pendaftaran

#### Admin

* Mengelola program
* Verifikasi pendaftaran
* Mengelola data pembimbing
* Monitoring seluruh registrasi

### 📱 Responsive UI

* Responsive di desktop maupun mobile
* Dibangun menggunakan Tailwind CSS
* Interactive UI dengan animasi modern

---

# 🏗️ System Architecture

## Database Schema

Sistem menggunakan 5 tabel utama:

| Table                 | Description                                |
| --------------------- | ------------------------------------------ |
| `users`               | Menyimpan data pengguna dan role           |
| `programs`            | Data program magang & penelitian           |
| `registrations`       | Data pendaftaran peserta                   |
| `supervisors`         | Data dosen/pembimbing                      |
| `program_supervisors` | Relasi many-to-many program dan pembimbing |

---

## Database Features

Seluruh tabel telah menerapkan:

* Primary Key
* Foreign Key
* Unique Constraint
* Check Constraint
* Soft Delete (`deleted_at`)
* Relational Integrity

---

# 🚀 Quick Start

## 1️⃣ Install Dependencies

```bash
cd frontend-magang
npm install
```

---

## 2️⃣ Setup Environment Variables

Buat file `.env.local`

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 3️⃣ Setup Database

Jalankan SQL script sesuai dokumentasi pada:

```bash
SETUP_GUIDE.md
```

---

## 4️⃣ Run Development Server

```bash
npm run dev
```

Aplikasi dapat diakses melalui:

```bash
http://localhost:5173
```

---

# 🔑 Demo Account

## Admin Account

```txt
Email    : admin@test.com
Password : password
```

## Student Account

```txt
Email    : student@test.com
Password : password
```

---

# 📁 Project Structure

```bash
src/
├── components/
│   └── Navbar.jsx
│
├── pages/
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Programs.jsx
│   ├── Registrations.jsx
│   ├── Details.jsx
│   │
│   └── admin/
│       ├── AdminPrograms.jsx
│       ├── AdminRegistrations.jsx
│       └── AdminSupervisors.jsx
│
├── App.jsx
├── supabaseClient.js
└── index.css
```

---

# 🔄 Workflow Sistem

```text
Student Register/Login
        ↓
Melihat Program
        ↓
Melakukan Pendaftaran
        ↓
Admin Memverifikasi
        ↓
Status Approve / Reject
```

---

# ✅ Requirement Checklist

| Requirement               | Status |
| ------------------------- | ------ |
| Database Connection       | ✅      |
| CRUD Operations           | ✅      |
| Authentication System     | ✅      |
| Multi-table JOIN Query    | ✅      |
| Search & Filter           | ✅      |
| Soft Delete & Hard Delete | ✅      |
| Role-Based Access         | ✅      |
| Responsive UI             | ✅      |
| Dashboard & Statistics    | ✅      |
| Verification System       | ✅      |

---

# 🎨 UI & UX Features

* Modern gradient interface
* Smooth hover animations
* Responsive navbar
* Interactive dashboard cards
* Loading states & skeleton UI
* Color-coded status badges
* Clean typography & spacing
* Mobile-first design approach

---

# 📚 Documentation

| Documentation       | Description                 |
| ------------------- | --------------------------- |
| `ERD_AND_SCHEMA.md` | ERD dan struktur database   |
| `SETUP_GUIDE.md`    | Panduan instalasi dan setup |
| `README.md`         | Dokumentasi utama project   |

---

# 🛠️ Tech Stack

## Frontend

* React.js
* Tailwind CSS
* React Router DOM

## Backend & Database

* Supabase
* PostgreSQL

## Authentication

* Supabase Auth

---

# 📌 Project Status

Version      : 1.0.0
Status       : ✅ Production Ready
Last Update  : May 2026

---

# 👨‍💻 Developed For

Project ini dikembangkan sebagai implementasi sistem informasi berbasis web dengan konsep full-stack modern menggunakan React dan Supabase, serta menerapkan relational database management, authentication system, dan responsive UI design.

