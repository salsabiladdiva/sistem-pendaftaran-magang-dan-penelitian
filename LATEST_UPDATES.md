# Latest Updates (May 9, 2026)

## 🎯 New Features & Fixes

### 1. Global Pending Registration Check ✨
**Issue Fixed**: Mahasiswa bisa submit multiple pending registrations sekaligus
**Solution**: 
- Added global check untuk ALL pending registrations (bukan hanya per-program)
- Jika ada 1 pendaftaran dengan status "pending", mahasiswa TIDAK bisa mendaftar ke program lain
- Must menunggu sampai pendaftaran sebelumnya di-approve atau di-reject

**User Experience**:
- Button berubah menjadi "⏳ Ada Pendaftaran Menunggu" (disabled)
- Clear message: "Anda masih memiliki pendaftaran yang sedang diverifikasi. Tunggu hasilnya sebelum mendaftar ke program lain."
- Untuk setiap program yang user coba daftar

**Technical Details**:
- New state: `hasPendingRegistration` to track any pending status
- Updated `fetchUserRegistrations()` to set this state
- Updated `handleRegister()` with global pending check
- Updated button display logic with priority: pending > registered > rejected > available

### 2. Admin Program Management ✅
**Status**: Already Implemented
- Admin dapat **Edit Program**:
  - Klik button "✏️ Edit" di table
  - Form akan muncul dengan data program saat ini
  - Bisa ubah: nama program, kuota, tanggal mulai/selesai, deskripsi, dll
  - Klik "💾 Update" untuk save changes

- Feature Details:
  - Form responsif (mobile-friendly)
  - Real-time update ke database
  - All fields editable: title, company_name, location, type, capacity, dates, description, requirements, status

## 📊 Registration Flow (Updated)

### For Students:
```
1. View Programs → Filter by type/search
2. Click "Daftar Sekarang"
   ├─ IF ada pending registration → BLOCK (pesan: ada pendaftaran menunggu)
   ├─ IF sudah daftar program ini & bukan rejected → BLOCK (sudah terdaftar)
   ├─ IF ditolak di program ini → ALLOW (tombol "Daftar Lagi")
   └─ OTHERWISE → ALLOW
3. Status becomes "pending"
4. Student lihat "⏳ Menunggu" status
```

### For Admin:
```
1. Open AdminPrograms
2. Click "✏️ Edit" untuk edit program
3. Update data → Click "💾 Update"
4. Change automatic (no refresh needed)
```

## 🔄 Quota Management
- When admin approves registration:
  - Status changed to "approved"
  - `registered_count` automatically increases by 1
  - Remaining quota decreases
- When admin rejects:
  - Status changed to "rejected"
  - Student bisa "Daftar Lagi" (re-register)
  - Quota tidak berubah

## ✅ Testing Scenarios

### Scenario 1: Student dengan Pending Registration
1. Student A daftar Magang ABC → Status pending
2. Student A coba daftar Penelitian XYZ
   - Result: BLOCKED dengan pesan "Ada pendaftaran menunggu"
3. Admin approve registrasi Magang ABC
   - Status berubah approved
4. Student A sekarang BISA daftar Penelitian XYZ
   - Result: ALLOWED

### Scenario 2: Student dengan Rejected Registration
1. Student B daftar Magang ABC → Status pending
2. Admin reject
   - Status: rejected
3. Student B coba daftar Magang ABC lagi
   - Button: "Daftar Lagi" (ALLOWED)
4. Student B bisa daftar Penelitian XYZ juga (ALLOWED)
   - Result: MULTIPLE registrations allowed (rejected + new)

### Scenario 3: Admin Edit Program
1. Admin buka AdminPrograms
2. Klik "✏️ Edit" di program Magang ABC
3. Ubah kuota dari 30 → 50
4. Ubah nama dari "Magang ABC" → "Magang XYZ 2026"
5. Klik "💾 Update"
   - Result: Changes saved immediately
   - Students lihat updated name & kuota

## 📁 Code Changes

### Modified Files:
- `src/pages/Programs.jsx` - Added global pending check logic

### New State Variables:
- `hasPendingRegistration` - Boolean flag untuk track any pending

### Updated Functions:
- `fetchUserRegistrations()` - Now sets hasPendingRegistration
- `handleRegister()` - Added global pending check before specific program check
- Button display logic - Added hasPendingRegistration check first

## 🚀 Deployment

Build Status: ✅ PASSED
- No errors
- No warnings
- Build size: 497 KB (135 KB gzip)

Ready untuk di-deploy ke Vercel!

## 📝 Git Commits

```
389ed4e feat: add global pending registration check
```

---

**Last Updated**: 9 May 2026
**Version**: 1.1.1
