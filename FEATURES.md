# Fitur Sistem Pendaftaran Magang & Penelitian

## 1. Program Management (Admin)

### Create Program
Admin dapat membuat program magang atau penelitian baru dengan:
- Nama program
- Nama perusahaan
- Lokasi
- Deskripsi
- Persyaratan
- Kapasitas kuota
- Tanggal mulai & akhir
- Tipe (Magang/Penelitian)
- Status (Aktif/Tidak Aktif)

### Update Program ✅
Admin dapat mengedit program yang sudah dibuat dengan mengklik tombol "✏️ Edit" di table programs. Form akan pre-fill dengan data lama dan admin dapat mengupdate:
- Semua field nama, kuota, tanggal, dll
- Status aktif/tidak aktif
- Changes langsung tersimpan ke database

### Delete Program
Admin dapat:
- Soft delete: menandai sebagai deleted tapi data tetap ada
- Hard delete: hapus permanen dari database

---

## 2. Student Registration System

### Registration Rules ✅

**Mahasiswa dapat:**
- Mendaftar di multiple program yang BERBEDA (Magang ABC + Penelitian XYZ = BOLEH)
- Mendaftar ulang di program yang ditolak (setelah status "rejected")

**Mahasiswa TIDAK dapat:**
- Mendaftar 2x di program yang SAMA (kecuali sudah rejected)
- Contoh: Sudah daftar Magang ABC → tidak bisa daftar Magang ABC lagi
- Contoh: Sudah daftar Penelitian XYZ → tidak bisa daftar Penelitian XYZ lagi

### Registration Status
Setiap registrasi memiliki status:
- **Menunggu (pending)**: Dalam proses verifikasi admin
- **Diterima (approved)**: Sudah disetujui admin, kuota berkurang
- **Ditolak (rejected)**: Ditolak admin, mahasiswa bisa mendaftar ulang

### Button States

**Case 1: Belum mendaftar**
```
Button: "Daftar Sekarang"
Action: Click untuk mendaftar
```

**Case 2: Sudah mendaftar (Pending/Approved)**
```
Button: "✅ Sudah Terdaftar" (Disabled)
Status: Menunggu / Diterima (with color)
Action: Tidak bisa click
```

**Case 3: Pendaftaran ditolak**
```
Button: "Daftar Lagi"
Message: "Pendaftaran sebelumnya ditolak, Anda bisa mendaftar lagi"
Action: Click untuk mendaftar ulang
```

---

## 3. Quota Management ✅

### Automatic Quota Tracking
- Kapasitas awal: setting saat create program
- Registered count: otomatis increment saat ada registration baru
- Kuota tersisa: `capacity - registered_count`

### Quota Updates
**Ketika admin APPROVE registrasi:**
- Status berubah dari "pending" → "approved"
- `registered_count` otomatis bertambah 1
- Kuota tersisa berkurang

**Ketika admin REJECT registrasi:**
- Status berubah menjadi "rejected"
- `registered_count` tetap (tidak berubah)
- Kuota tersisa tetap

**Ketika admin merubah APPROVED → PENDING/REJECTED:**
- Status berubah
- `registered_count` otomatis berkurang 1
- Kuota tersisa bertambah

### Display
- Halaman Program: Menampilkan "X kuota tersisa" dengan capacity bar
- Admin Programs: Menampilkan "X / Y (Z tersisa)"

---

## 4. Admin Verification System

### Manage Registrations
Admin di halaman AdminRegistrations dapat:
- Filter by status (Pending, Approved, Rejected)
- Lihat detail: nama mahasiswa, program, tanggal daftar

### Status Management
Admin dapat mengubah status registrasi dengan dropdown:
- ⏳ Menunggu (Pending)
- ✅ Terima (Approved)
- ❌ Tolak (Rejected)

### Add Notes
Admin dapat menambahkan catatan/feedback untuk mahasiswa:
- Click tombol "📝" untuk add notes
- Catatan akan ditampilkan di halaman registrations mahasiswa

### Data Actions
- 📝 Tambah catatan
- 🗑️ Soft delete
- ❌ Hard delete

---

## 5. Search & Filter

### Student Programs
- **Search**: Cari berdasarkan nama program atau nama perusahaan
- **Filter**: Tampilkan All / Magang / Penelitian

### Student Registrations
- **Filter**: Pending / Approved / Rejected

### Admin Registrations
- **Filter**: By status & by user

---

## 6. Responsive Design ✅

Semua halaman responsive:
- **Mobile (< 768px)**: Single column layout, stacked buttons
- **Tablet (768px - 1024px)**: 2 column grid, optimized spacing
- **Desktop (> 1024px)**: Full layout, side-by-side display

### Responsive Elements
- Tables: Hidden columns di mobile, collapsed di tablet
- Forms: Full-width di mobile, inline di desktop
- Buttons: Stacked di mobile, horizontal di desktop
- Typography: Smaller fonts di mobile, larger di desktop

---

## 7. Authentication & Authorization

### Roles
- **Student**: Dapat browse programs, register, lihat registrations
- **Admin**: Dapat manage programs dan registrations
- **Unregistered**: Redirect ke login

### Session Management
- JWT token via Supabase
- HTTP-only cookies
- Auto refresh on page load

---

## 8. Database Schema

### Programs Table
```
id, title, company_name, type, location, capacity, 
registered_count, description, requirements, 
start_date, end_date, status, created_at, updated_at, deleted_at
```

### Registrations Table
```
id, user_id, program_id, status, submission_date, 
review_date, reviewed_by, notes, created_at, deleted_at
```

### Users Table
```
id, name, email, password_hash, role, created_at, updated_at
```

---

## 9. Error Handling

### User-Friendly Messages
- "Silakan login terlebih dahulu" - Saat belum login
- "Pendaftaran Anda masih dalam proses verifikasi" - Saat pending
- "Anda sudah diterima di program ini" - Saat approved
- "Gagal mendaftar: [error message]" - Saat terjadi error

### Validation
- Semua field required divalidasi
- Date range dicheck (start < end)
- Capacity harus > 0

---

## 10. Future Enhancements

Fitur yang bisa ditambahkan:
- Email notifications untuk status changes
- Document upload untuk registrasi
- Scoring system untuk ranking
- Schedule interview untuk approved applicants
- Download reports untuk admin
- Export data ke Excel
