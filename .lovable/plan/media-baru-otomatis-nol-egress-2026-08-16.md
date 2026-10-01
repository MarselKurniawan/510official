# Media baru otomatis nol egress

Tujuan: upload foto lewat admin panel nggak lagi nambah beban Cloud, sama seperti foto lama yang sudah dipindah ke CDN.

## Kondisi sekarang

- Foto lama (gallery, press, merch) sudah pakai path CDN — nol egress.
- Foto baru yang di-upload lewat admin masih masuk ke storage Cloud, diakses lewat signed URL (cache 30 hari, tapi tetap kena egress tiap cache habis / device baru).

## Yang mau dikerjain

### 1. Kompresi lebih ketat sebelum upload
Sekarang gambar dikecilkan ke maks 1920px WebP. Untuk foto galeri/merch itu masih besar. Turunkan ke maks 1600px dengan kualitas WebP yang lebih hemat, jadi ukuran file turun signifikan tanpa kelihatan beda di layar.

### 2. Cache signed URL dibikin lebih awet
Perpanjang masa berlaku dan simpan hasilnya lebih rapi, plus satu permintaan tanda tangan untuk banyak foto sekaligus (bukan satu-satu). Efeknya: jumlah request ke Cloud turun drastis saat halaman galeri atau shop dibuka.

### 3. Penanda "belum di CDN" di admin
Di panel admin, foto yang masih tersimpan di Cloud dikasih penanda kecil, jadi kamu tahu mana yang masih menyedot dan bisa minta aku pindahkan ke CDN kapan pun.

## Catatan teknis

- Perubahan kompresi di `src/lib/image-compress.ts`.
- Batch signing + cache di `src/lib/admin-upload.ts`, dipakai `src/components/ResolvedImg.tsx`.
- Penanda status di editor gambar admin (`src/routes/_authenticated/admin.tsx`).
- Tidak ada perubahan database dan tidak ada tampilan publik yang berubah.

## Yang nggak diubah

Semua section homepage, shop all, halaman press, dan struktur admin tetap sama.
