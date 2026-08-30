import React from 'react';

export const FormHeader: React.FC = () => {
  return (
    <div className="w-full">
      {/* 3-Column Header Layout: Left Logo | Center Text | Right Logo */}
      <div className="flex items-center justify-between gap-3 pb-2">
        {/* Left: Logo Yayasan Sasmita Jaya (Enhanced Size) */}
        <div 
          className="flex-shrink-0 flex items-center justify-center"
          style={{ width: '145px', height: '135px', minWidth: '145px', minHeight: '135px' }}
        >
          <img
            src="/assets/logoyayasan.png"
            alt="Logo Yayasan Sasmita Jaya"
            className="w-full h-full object-contain transform scale-110"
            style={{ width: '145px', height: '135px', maxWidth: '145px', maxHeight: '135px' }}
          />
        </div>

        {/* Center: Institution Identity Typography */}
        <div className="flex-1 text-center text-slate-950 leading-tight px-1">
          <h3 className="text-[13px] font-bold tracking-wider uppercase">
            YAYASAN SASMITA JAYA GROUP
          </h3>
          <h1 className="text-[18.5px] font-black tracking-tight uppercase mt-0.5">
            UNIVERSITAS PAMULANG
          </h1>
          <h2 className="text-[14px] font-semibold tracking-normal mt-0.5">
            Fakultas Ilmu Komputer
          </h2>
          <h2 className="text-[14px] font-semibold tracking-normal">
            Program Studi Sistem Informasi
          </h2>
          <p className="text-[11px] font-medium tracking-wide mt-0.5">
            SK MENDIKNAS NO. 136/D/O/2001
          </p>
          <p className="text-[9.5px] text-slate-800 leading-tight mt-0.5">
            Kampus Pusat: Jln. Surya Kencana No. 1 Pamulang - Tangerang Selatan Telp. (021) 742 7010, 741 2566
          </p>
          <p className="text-[9.5px] text-slate-800 font-medium">
            www.unpam.ac.id
          </p>
        </div>

        {/* Right: Logo Universitas Pamulang */}
        <div 
          className="flex-shrink-0 flex items-center justify-center"
          style={{ width: '125px', height: '125px', minWidth: '125px', minHeight: '125px' }}
        >
          <img
            src="/assets/logo-unpam.jpg"
            alt="Logo Universitas Pamulang"
            className="w-full h-full object-contain"
            style={{ width: '125px', height: '125px', maxWidth: '125px', maxHeight: '125px' }}
          />
        </div>
      </div>

      {/* Double Separator Line (Thick Top + Thin Bottom with small gap) */}
      <div className="w-full mt-1 mb-4">
        <div className="h-[2.5px] bg-slate-950 w-full"></div>
        <div className="h-[1.5px] bg-transparent w-full"></div>
        <div className="h-[1px] bg-slate-950 w-full"></div>
      </div>

      {/* Document Title */}
      <div className="text-center my-3">
        <h2 className="text-[14.5px] font-bold text-slate-950 uppercase tracking-wide">
          FORMULIR BIMBINGAN AKADEMIK
        </h2>
      </div>
    </div>
  );
};
