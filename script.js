/* ==========================================================
   RuangKampus - script.js
   Interaktivitas halaman Beranda:
   1. Pencarian, tab kategori, dan filter fasilitas
   2. Popup Jadwal Resmi
   3. Popup Lapor Kondisi dengan validasi formulir
   4. Pembaruan status kartu ruang setelah laporan terkirim

   Catatan: data jadwal dan status hanya contoh (tanpa server).
   Pembaruan "real-time" disimulasikan di sisi browser.
   ========================================================== */

'use strict';

/* ---------- 1. Data contoh ---------- */

// Jadwal resmi contoh per ruang. "terpakai: true" berarti ruang sedang dipakai kegiatan akademik.
const JADWAL = {
  'kelas-1': [
    { waktu: '08.00–10.00', ket: 'Basis Data', terpakai: true },
    { waktu: '10.00–17.00', ket: 'Kosong / siap pakai', terpakai: false },
  ],
  'kelas-2': [
    { waktu: '08.00–12.00', ket: 'Pemrograman Web', terpakai: true },
    { waktu: '12.00–17.00', ket: 'Kosong / siap pakai', terpakai: false },
  ],
  'kelas-3': [
    { waktu: '08.00–10.00', ket: 'Struktur Data', terpakai: true },
    { waktu: '10.00–12.00', ket: 'Kosong / siap pakai', terpakai: false },
    { waktu: '13.00–15.00', ket: 'Interaksi Manusia dan Komputer', terpakai: true },
  ],
  'lab-1': [
    { waktu: '08.00–11.00', ket: 'Pemrograman Front-End', terpakai: true },
    { waktu: '11.00–17.00', ket: 'Kosong / siap pakai', terpakai: false },
  ],
  'lab-2': [
    { waktu: '08.00–11.00', ket: 'Jaringan Komputer', terpakai: true },
    { waktu: '11.00–17.00', ket: 'Kosong / siap pakai', terpakai: false },
  ],
  'selasar': [
    { waktu: '08.00–17.00', ket: 'Kosong / siap pakai', terpakai: false },
  ],
  'perpustakaan': [
    { waktu: '08.00–17.00', ket: 'Kosong / siap pakai', terpakai: false },
  ],
};

// Teks label status yang tampil pada badge kartu.
const LABEL_STATUS = {
  tersedia: 'Tersedia',
  terpakai: 'Terpakai',
};

/* ---------- 2. Referensi elemen DOM ---------- */

const inputCari = document.getElementById('input-cari');
const formCari = document.getElementById('form-cari');
const tabs = document.querySelectorAll('.tab');
const checkboxFasilitas = document.querySelectorAll('input[name="fasilitas"]');
const tombolReset = document.getElementById('btn-reset');
const daftarRuang = document.getElementById('room-list');
const kartu = daftarRuang.querySelectorAll('.card');
const teksJumlah = document.getElementById('jumlah-ruang');
const pesanKosong = document.getElementById('pesan-kosong');

const dialogJadwal = document.getElementById('dialog-jadwal');
const subJadwal = document.getElementById('sub-jadwal');
const judulJadwal = document.getElementById('judul-jadwal');
const daftarJadwal = document.getElementById('daftar-jadwal');

const dialogLapor = document.getElementById('dialog-lapor');
const formLapor = document.getElementById('form-lapor');
const inputRuang = document.getElementById('lapor-ruang');
const pilihKondisi = document.getElementById('lapor-kondisi');
const errorKondisi = document.getElementById('error-kondisi');
const inputCatatan = document.getElementById('lapor-catatan');
const hitungCatatan = document.getElementById('hitung-catatan');

const toast = document.getElementById('toast');

// State: kartu yang sedang dilaporkan, kategori aktif, dan timer notifikasi.
let kartuAktif = null;
let kategoriAktif = 'semua';
let timerToast = null;

/* ---------- 3. Pencarian, tab kategori, dan filter fasilitas ---------- */

/**
 * Menampilkan atau menyembunyikan setiap kartu sesuai
 * kata kunci, kategori aktif, dan fasilitas yang dicentang.
 */
function terapkanFilter() {
  const kataKunci = inputCari.value.trim().toLowerCase();
  const fasilitasDipilih = Array.from(checkboxFasilitas)
    .filter((cb) => cb.checked)
    .map((cb) => cb.value);

  let jumlahTampil = 0;

  kartu.forEach((k) => {
    const teksCari = (k.dataset.nama + ' ' + k.querySelector('.card-meta').textContent).toLowerCase();
    const fasilitasKartu = k.dataset.fasilitas.split(' ');

    const cocokKata = teksCari.includes(kataKunci);
    const cocokKategori = kategoriAktif === 'semua' || k.dataset.kategori === kategoriAktif;
    // Semua fasilitas yang dipilih harus ada di kartu (logika "dan")
    const cocokFasilitas = fasilitasDipilih.every((f) => fasilitasKartu.includes(f));

    const tampil = cocokKata && cocokKategori && cocokFasilitas;
    k.hidden = !tampil;
    if (tampil) jumlahTampil += 1;
  });

  teksJumlah.textContent = 'Menampilkan ' + jumlahTampil + ' ruangan';
  pesanKosong.hidden = jumlahTampil !== 0;
}

// Pencarian: tersaring saat mengetik; menekan Enter tidak memuat ulang halaman.
inputCari.addEventListener('input', terapkanFilter);
formCari.addEventListener('submit', (e) => e.preventDefault());

// Tab kategori: hanya satu tab yang aktif (aria-pressed="true")
tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    kategoriAktif = tab.dataset.kategori;
    tabs.forEach((t) => t.setAttribute('aria-pressed', String(t === tab)));
    terapkanFilter();
  });
});

// Filter fasilitas
checkboxFasilitas.forEach((cb) => cb.addEventListener('change', terapkanFilter));

// Tombol reset mengembalikan semua filter ke kondisi awal
tombolReset.addEventListener('click', () => {
  inputCari.value = '';
  checkboxFasilitas.forEach((cb) => { cb.checked = false; });
  kategoriAktif = 'semua';
  tabs.forEach((t) => t.setAttribute('aria-pressed', String(t.dataset.kategori === 'semua')));
  terapkanFilter();
});

/* ---------- 4. Fungsi bantu popup ---------- */

/** Membuka dialog; memakai atribut "open" bila showModal tidak didukung browser. */
function bukaDialog(dialog) {
  if (typeof dialog.showModal === 'function') {
    dialog.showModal();
  } else {
    dialog.setAttribute('open', '');
  }
}

/** Menutup dialog dengan cara yang sama aman. */
function tutupDialog(dialog) {
  if (typeof dialog.close === 'function') {
    dialog.close();
  } else {
    dialog.removeAttribute('open');
  }
}

/** Nama ruang dan lantai dari sebuah kartu, misalnya "Kelas 1 (Lantai 3)". */
function labelRuang(k) {
  return k.dataset.nama + ' (Lantai ' + k.dataset.lantai + ')';
}

// Semua tombol [data-tutup] di dalam dialog menutup dialog terdekat.
document.querySelectorAll('[data-tutup]').forEach((tombol) => {
  tombol.addEventListener('click', () => tutupDialog(tombol.closest('dialog')));
});

// Klik di luar kotak dialog (pada latar gelap) juga menutup popup.
[dialogJadwal, dialogLapor].forEach((dialog) => {
  dialog.addEventListener('click', (e) => {
    const kotak = dialog.getBoundingClientRect();
    const diLuar =
      e.clientX < kotak.left || e.clientX > kotak.right ||
      e.clientY < kotak.top || e.clientY > kotak.bottom;
    if (diLuar) tutupDialog(dialog);
  });
});

/* ---------- 5. Popup Jadwal Resmi ---------- */

/** Mengisi dan membuka popup jadwal untuk satu kartu ruang. */
function bukaJadwal(k) {
  judulJadwal.textContent = k.dataset.nama;
  subJadwal.textContent = 'Lantai ' + k.dataset.lantai;
  daftarJadwal.replaceChildren(); // kosongkan isi lama

  const slot = JADWAL[k.dataset.id] || [];
  slot.forEach((s) => {
    const item = document.createElement('li');

    const kiri = document.createElement('div');
    const waktu = document.createElement('p');
    waktu.className = 'time';
    waktu.textContent = s.waktu;
    const ket = document.createElement('p');
    ket.className = 'desc';
    ket.textContent = s.ket;
    kiri.append(waktu, ket);

    const badge = document.createElement('span');
    badge.className = 'badge ' + (s.terpakai ? 'badge-terpakai' : 'badge-tersedia');
    badge.textContent = s.terpakai ? 'Terpakai' : 'Bisa dipakai';

    item.append(kiri, badge);
    daftarJadwal.append(item);
  });

  if (slot.length === 0) {
    const kosong = document.createElement('li');
    kosong.textContent = 'Jadwal belum tersedia untuk ruang ini.';
    daftarJadwal.append(kosong);
  }

  bukaDialog(dialogJadwal);
}

/* ---------- 6. Popup Lapor Kondisi dan validasi ---------- */

/** Menghapus pesan galat dan penanda tidak valid pada pilihan kondisi. */
function bersihkanGalat() {
  errorKondisi.textContent = '';
  pilihKondisi.removeAttribute('aria-invalid');
}

/** Menampilkan jumlah karakter catatan. */
function perbaruiHitungan() {
  hitungCatatan.textContent = inputCatatan.value.length + ' / ' + inputCatatan.maxLength + ' karakter';
}

/** Membuka popup lapor untuk satu kartu ruang dengan formulir yang bersih. */
function bukaLapor(k) {
  kartuAktif = k;
  formLapor.reset();
  inputRuang.value = labelRuang(k); // nama ruang terisi otomatis
  bersihkanGalat();
  perbaruiHitungan();
  bukaDialog(dialogLapor);
  pilihKondisi.focus();
}

/**
 * Memvalidasi formulir. Kondisi wajib dipilih; catatan opsional.
 * @returns {boolean} true bila formulir valid
 */
function validasiForm() {
  if (pilihKondisi.value === '') {
    errorKondisi.textContent = 'Pilih kondisi ruangan terlebih dahulu.';
    pilihKondisi.setAttribute('aria-invalid', 'true');
    pilihKondisi.focus();
    return false;
  }
  bersihkanGalat();
  return true;
}

// Galat hilang begitu pengguna memilih kondisi; hitung karakter catatan saat mengetik.
pilihKondisi.addEventListener('change', bersihkanGalat);
inputCatatan.addEventListener('input', perbaruiHitungan);

// Kirim laporan
formLapor.addEventListener('submit', (e) => {
  e.preventDefault(); // tidak memuat ulang halaman
  if (!validasiForm()) return;

  perbaruiStatusKartu(kartuAktif, pilihKondisi.value);
  tutupDialog(dialogLapor);
  tampilkanToast(
    'Laporan terkirim: ' + kartuAktif.dataset.nama + ' kini ' +
    LABEL_STATUS[pilihKondisi.value].toLowerCase() + '.'
  );
});

/* ---------- 7. Pembaruan status kartu dan notifikasi ---------- */

/**
 * Mengubah badge status dan keterangan waktu pada kartu.
 * @param {HTMLElement} k   kartu ruang
 * @param {string} status   "tersedia" atau "terpakai"
 */
function perbaruiStatusKartu(k, status) {
  const badge = k.querySelector('[data-badge]');
  badge.textContent = LABEL_STATUS[status];
  badge.classList.remove('badge-tersedia', 'badge-terpakai');
  badge.classList.add('badge-' + status);
  k.dataset.status = status;
  k.querySelector('[data-updated]').textContent = 'Diperbarui baru saja';
}

/** Menampilkan notifikasi singkat selama 3 detik. */
function tampilkanToast(pesan) {
  toast.textContent = pesan;
  toast.hidden = false;
  clearTimeout(timerToast);
  timerToast = setTimeout(() => { toast.hidden = true; }, 3000);
}

/* ---------- 8. Tombol di setiap kartu ---------- */

// Satu pendengar untuk seluruh daftar (event delegation)
daftarRuang.addEventListener('click', (e) => {
  const tombol = e.target.closest('[data-aksi]');
  if (!tombol) return;
  const k = tombol.closest('.card');
  if (tombol.dataset.aksi === 'jadwal') bukaJadwal(k);
  if (tombol.dataset.aksi === 'lapor') bukaLapor(k);
});

// Hitung awal saat halaman dimuat
terapkanFilter();
