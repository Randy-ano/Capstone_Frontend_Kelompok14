import { Component } from "react";

// Berkas halaman dimuat terpisah (React.lazy); jika gagal (mis. koneksi putus), tampilkan pesan alih-alih layar kosong.
export default class BatasMuat extends Component {
  state = { gagal: false };

  static getDerivedStateFromError() {
    return { gagal: true };
  }

  render() {
    if (!this.state.gagal) return this.props.children;
    return (
      <div className="w-full px-space-md sm:px-space-lg py-space-xl">
        <div role="alert" className="kartu p-space-xl flex flex-col items-center text-center gap-space-md max-w-xl mx-auto">
          <span aria-hidden="true" className="material-symbols-outlined text-[32px] text-error">cloud_off</span>
          <p className="font-body-md text-body-md text-on-surface-variant">Halaman gagal dimuat. Periksa koneksi Anda, lalu muat ulang.</p>
          <button type="button" onClick={() => window.location.reload()} className="tombol-utama">
            <span aria-hidden="true" className="material-symbols-outlined text-[18px]">refresh</span>
            Muat Ulang
          </button>
        </div>
      </div>
    );
  }
}
