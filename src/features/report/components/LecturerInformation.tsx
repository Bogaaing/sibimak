import React from 'react';

interface LecturerInformationProps {
  nidn: string;
  fullName: string;
  phoneNumber: string;
  email: string;
}

export const LecturerInformation: React.FC<LecturerInformationProps> = ({
  nidn,
  fullName,
  phoneNumber,
  email,
}) => {
  return (
    <div className="w-full mb-3.5">
      <h3 className="text-[12px] font-bold text-slate-950 mb-1">
        Dosen Pembimbing Akademik
      </h3>

      <table className="w-full border-collapse border border-black text-[11.5px] text-slate-950">
        <tbody>
          <tr className="border-b border-black">
            <td className="w-36 py-1 px-2.5 font-normal border-r border-transparent">
              NIDN
            </td>
            <td className="w-4 py-1 text-center font-normal">
              :
            </td>
            <td className="py-1 px-2.5 font-normal">
              {nidn || '-'}
            </td>
          </tr>
          <tr className="border-b border-black">
            <td className="w-36 py-1 px-2.5 font-normal border-r border-transparent">
              Nama
            </td>
            <td className="w-4 py-1 text-center font-normal">
              :
            </td>
            <td className="py-1 px-2.5 font-normal uppercase">
              {fullName || '-'}
            </td>
          </tr>
          <tr className="border-b border-black">
            <td className="w-36 py-1 px-2.5 font-normal border-r border-transparent">
              No. Handphone
            </td>
            <td className="w-4 py-1 text-center font-normal">
              :
            </td>
            <td className="py-1 px-2.5 font-normal">
              {phoneNumber || '-'}
            </td>
          </tr>
          <tr>
            <td className="w-36 py-1 px-2.5 font-normal border-r border-transparent">
              Email
            </td>
            <td className="w-4 py-1 text-center font-normal">
              :
            </td>
            <td className="py-1 px-2.5 font-normal">
              {email || '-'}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
