**Dibuat oleh:** Ghaziyah Raihanah (1003250062) · FrontEnd · Tugas 2 (HTML, CSS, JavaScript)

# RuangKampus: Halaman Beranda (Daftar Status Ruang)

Implementasi HTML, CSS, dan JavaScript untuk halaman **Beranda** dari wireframe RuangKampus (Tugas 1, Figma). RuangKampus membantu mahasiswa melihat status dan jadwal resmi ruang belajar kampus sebelum berjalan ke ruangan itu.

> Data ruang, fasilitas, dan jadwal hanya **contoh**. Tidak ada server atau database. Pembaruan status setelah laporan dikirim disimulasikan di browser.

## Fitur

- **Pencarian** ruang berdasarkan nama atau kategori.
- **Tab kategori**: Semua, Kelas, Lab. Kom, Ruang Bersama.
- **Filter fasilitas** (Stopkontak, Wi-Fi, AC, PC) dengan tombol reset; jumlah ruang yang tampil diperbarui otomatis.
- **Kartu ruang** berisi status (Tersedia/Terpakai), jumlah kursi, fasilitas, dan keterangan waktu pembaruan.
- **Popup Jadwal Resmi** per ruang.
- **Popup Lapor Kondisi** dengan **validasi formulir**: kondisi wajib dipilih, catatan opsional (maksimal 120 karakter dengan penghitung). Setelah terkirim, badge status kartu berubah dan muncul notifikasi.

## Komponen HTML semantik

| Komponen | Elemen utama |
| --- | --- |
| Header situs | `<header>` |
| Panel pencarian, kategori, filter | `<section>`, `<form role="search">`, `<nav>`, `<details>`, `<fieldset>` |
| Daftar dan kartu ruang | `<section>`, `<article>`, `<ul>` |
| Popup Jadwal Resmi | `<dialog>` |
| Popup Lapor Kondisi (formulir) | `<dialog>`, `<form>`, `<label>`, `<select>`, `<textarea>` |
| Footer | `<footer>` |

Aksesibilitas yang diterapkan: tautan lompat, label pada semua kolom, `aria-live` pada jumlah ruang dan notifikasi, `aria-pressed` pada tab, `aria-invalid` dan pesan galat pada form, fokus keyboard yang terlihat, area ketuk minimal 44 px, dan status ditulis dengan label teks (tidak hanya warna).

## Struktur proyek

```
.
├── index.html   # struktur halaman (HTML semantik)
├── styles.css   # tampilan; warna dan jarak lewat custom property di :root
├── script.js    # filter, popup, validasi form, pembaruan status
└── README.md
```

## Cara menjalankan

1. Unduh atau salin keempat berkas ke satu folder.
2. Buka `index.html` di browser. Tidak perlu instalasi.

Opsional, lewat server lokal:

```bash
python3 -m http.server 8000
# lalu buka http://localhost:8000
```
## Demo

Lihat langsung di: https://ziyy12.github.io/ruangkampus-beranda/

## Catatan desain

- Warna dan jarak memakai custom property (`--color-*`, `--space-*`) supaya konsisten dan mudah diubah.
- Skala jarak kelipatan 8 px; tata letak mengikuti grid ponsel (margin 16 px) dan berubah menjadi 2 dan 3 kolom pada layar lebih lebar.
- Halaman lain pada wireframe (misalnya halaman Masuk) tidak diimplementasikan.

## Perbedaan dengan wireframe Figma

- Logo dan avatar di header diganti logo teks.
- Ikon fasilitas (Wi-Fi, stopkontak, AC, PC) diganti label teks agar terbaca pembaca layar.
