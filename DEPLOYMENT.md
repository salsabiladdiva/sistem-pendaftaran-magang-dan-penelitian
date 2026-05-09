# 🚀 Deployment Guide

Panduan lengkap untuk mendeploy aplikasi ke Vercel.

## Prerequisites

- GitHub account dengan repository yang sudah ter-link
- Vercel account (sign up via vercel.com)
- Environment variables dari Supabase

## Step-by-Step Deployment ke Vercel

### 1. Persiapan Repository
```bash
# Pastikan semua changes sudah di-commit
git status

# Push ke GitHub (pastikan push ke branch)
git push origin daftar-program-perbaikan
```

### 2. Connect ke Vercel

**Option A: Via Vercel Dashboard**
1. Login ke https://vercel.com
2. Click "Add New..." → "Project"
3. Import project dari GitHub
4. Pilih repository: `salsabiladdiva/sistem-pendaftaran-magang-dan-penelitian`
5. Select branch: `daftar-program-perbaikan` (atau branch apapun yang ingin dideploy)

**Option B: Via Vercel CLI**
```bash
npm install -g vercel
vercel
# Follow the prompts
```

### 3. Set Environment Variables

Di Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Tambahkan:
   - **VITE_SUPABASE_URL**: `https://ihpdbxvoisjlzvhewmcb.supabase.co`
   - **VITE_SUPABASE_ANON_KEY**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (dari .env.local)

3. Apply ke semua environments: Production, Preview, Development

### 4. Configure Build Settings

Vercel akan auto-detect:
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

Jika perlu, bisa di-customize di project settings.

### 5. Deploy

```bash
# Automatic deployment saat push ke branch
git push origin daftar-program-perbaikan
# Vercel otomatis build & deploy

# Atau manual deploy via CLI
vercel --prod
```

## Post-Deployment Verification

✅ **Cek hal berikut:**

1. **Landing Page Loads**
   - Akses URL dari Vercel (misal: `https://system-magang.vercel.app`)
   - Pastikan halaman muncul tanpa error

2. **Authentication Works**
   - Coba login dengan credentials test
   - Verify Supabase connection

3. **Database Connection**
   - Cek apakah data programs muncul
   - Coba create registrasi baru

4. **Responsive Design**
   - Test di mobile device
   - Check di tablet dan desktop

5. **Console Errors**
   - Open DevTools (F12)
   - Pastikan tidak ada error di Console tab

## Environment Variables Reference

| Variable | Value | Source |
|----------|-------|--------|
| `VITE_SUPABASE_URL` | `https://ihpdbxvoisjlzvhewmcb.supabase.co` | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Same location as above |

## Troubleshooting

### Build Failed
```bash
# Check build locally
npm run build

# Check console output di Vercel Dashboard
# Vercel → Project → Deployments → Click failed deployment
```

### Environment Variables Not Loaded
- Verify di Vercel Settings → Environment Variables
- Pastikan variable names exact (case-sensitive)
- Redeploy setelah update env vars

### Blank Page / 404 Error
- Check `.vercel/project.json` konfigurasi
- Verify `dist/` folder generated correctly
- Check build output di Vercel logs

### Database Connection Error
- Verify Supabase credentials di env vars
- Test connection locally: `npm run dev`
- Check Supabase project status dan permissions

## Useful Vercel CLI Commands

```bash
# List projects
vercel projects

# View logs
vercel logs

# Promote deployment to production
vercel promote [deployment-url]

# Rollback ke deployment sebelumnya
vercel rollback

# Remove environment variable
vercel env rm VARIABLE_NAME
```

## Monitoring & Analytics

Vercel provides:
- **Real-time logs** di Dashboard
- **Performance metrics** via Analytics
- **Error tracking** via Serverless Functions logs
- **Deployment history** untuk rollback

## Next Steps

1. ✅ Deploy ke Vercel
2. ✅ Test semua fitur
3. ✅ Setup domain custom (optional)
4. ✅ Configure auto-deployment dari main/master branch
5. ✅ Setup monitoring & alerts

---

**Need Help?** 
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Check Vercel Dashboard logs untuk error details
