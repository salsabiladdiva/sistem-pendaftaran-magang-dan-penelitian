# 🚀 Quick Start Guide

Panduan cepat untuk menjalankan aplikasi Sistem Pendaftaran Magang & Penelitian.

## 1. Setup Lokal (Development)

### Requirements
- Node.js 16+ (check: `node --version`)
- npm atau yarn
- Text editor (VS Code recommended)

### Installation Steps

```bash
# Clone repository (jika belum)
git clone https://github.com/salsabiladdiva/sistem-pendaftaran-magang-dan-penelitian.git
cd sistem-pendaftaran-magang-dan-penelitian

# Install dependencies
npm install

# Copy environment variables (sudah ada di root)
# File: .env.local
# Pastikan credentials Supabase sudah ter-setup

# Start development server
npm run dev
```

**Access:** http://localhost:5173

---

## 2. Environment Variables Setup

File `.env.local` sudah tersedia di root project dengan template.

**Konfigurasi yang diperlukan:**

```env
# .env.local
VITE_SUPABASE_URL=https://ihpdbxvoisjlzvhewmcb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> Credentials sudah diisi. Jika ingin mengubah Supabase project:
> 1. Buka https://supabase.com/dashboard
> 2. Pilih project Anda
> 3. Go to Settings → API
> 4. Copy URL dan anon key
> 5. Update di `.env.local`

---

## 3. Login Credentials

Gunakan credentials ini untuk testing (sudah ter-setup di Supabase):

### Student Account
- **Email**: student@test.com
- **Password**: password
- **Role**: Student

### Admin Account
- **Email**: admin@test.com
- **Password**: password
- **Role**: Admin

---

## 4. Project Structure

```
src/
├── pages/
│   ├── Login.jsx              # Login page
│   ├── Dashboard.jsx          # Student dashboard
│   ├── Programs.jsx           # Browse & register programs
│   ├── Registrations.jsx      # View my registrations
│   ├── Details.jsx            # Detailed view with JOIN
│   └── admin/
│       ├── AdminPrograms.jsx     # Manage programs
│       ├── AdminRegistrations.jsx # Verify registrations
│       └── AdminSupervisors.jsx   # Manage supervisors
├── components/
│   └── Navbar.jsx             # Navigation
├── supabaseClient.js          # Supabase config
├── App.jsx                    # Routing
└── index.css                  # Tailwind styles
```

---

## 5. Key Features to Test

### Student Side
- [ ] Login dengan student account
- [ ] View available programs
- [ ] Search dan filter programs
- [ ] Register ke program (max 1 per program)
- [ ] View my registrations
- [ ] Check status (pending/approved/rejected)

### Admin Side
- [ ] Login dengan admin account
- [ ] View all programs
- [ ] Create new program
- [ ] Edit existing program
- [ ] Delete program (soft/hard delete)
- [ ] View all registrations
- [ ] Approve/Reject registrations
- [ ] Add notes/comments

---

## 6. Common Commands

```bash
# Development
npm run dev              # Start dev server on http://localhost:5173

# Production
npm run build            # Build for production
npm run preview          # Preview production build locally

# Code quality
npm run lint             # Check code style with ESLint

# Clean
rm -rf node_modules dist  # Clean install (jika ada issue)
npm install               # Reinstall dependencies
```

---

## 7. Troubleshooting

### Issue: "Cannot find module '@supabase/supabase-js'"
```bash
# Solution:
npm install @supabase/supabase-js
npm install
```

### Issue: "Environment variables not loaded"
```bash
# Solution:
# 1. Restart dev server: npm run dev
# 2. Clear browser cache: Ctrl+Shift+Delete
# 3. Verify .env.local exists and has correct values
```

### Issue: "Supabase connection error"
```bash
# Solution:
# 1. Check internet connection
# 2. Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY di .env.local
# 3. Check Supabase project is active (dashboard.supabase.com)
# 4. Verify database has tables created (see SETUP_GUIDE.md)
```

### Issue: "Build fails"
```bash
# Solution:
npm run build              # Check build output
npm install --save-dev vite  # Ensure vite is installed
npm run build              # Try again
```

---

## 8. Deployment to Vercel

For detailed deployment instructions, see: [DEPLOYMENT.md](./DEPLOYMENT.md)

Quick version:
```bash
# 1. Push changes to GitHub
git push origin daftar-program-perbaikan

# 2. Open https://vercel.com
# 3. Import project from GitHub
# 4. Set environment variables (VITE_SUPABASE_*)
# 5. Deploy!

# Or via CLI:
npm install -g vercel
vercel
```

---

## 9. Performance Tips

- **Mobile**: Test dengan device atau DevTools
- **Responsiveness**: Resize browser window
- **Network**: Check DevTools Network tab
- **Bundle size**: `npm run build` outputs size info

---

## 10. Need Help?

- 📖 Full docs: [README.md](./README.md)
- 🔧 Deployment: [DEPLOYMENT.md](./DEPLOYMENT.md)
- 📊 Database: [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- 💻 GitHub: https://github.com/salsabiladdiva/sistem-pendaftaran-magang-dan-penelitian

---

**Happy coding! 🎉**
