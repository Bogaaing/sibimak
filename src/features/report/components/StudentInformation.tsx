import React from 'react';

interface StudentInformationProps {
  nim: string;
  fullName: string;
  classNameStr: string;
  programType: string;
  phoneNumber: string;
  email: string;
}

export const StudentInformation: React.FC<StudentInformationProps> = ({
  nim,
  fullName,
  classNameStr,
  programType,
  phoneNumber,
  email,
}) => {
  return (
    <div className="w-full mb-3.5">
      <h3 className="text-[12px] font-bold text-slate-950 mb-1">
        Mahasiswa
      </h3>

      <table className="w-full border-collapse border border-black text-[11.5px] text-slate-950">
        <tbody>
          {/* Row 1: NIM & Reguler */}
          <tr className="border-b border-black">
            <td className="w-20 py-1 px-2.5 font-normal border-r border-transparent">
              NIM
            </td>
            <td className="w-4 py-1 text-center font-normal">
              :
            </td>
            <td className="py-1 px-2.5 font-normal border-r border-black w-[35%]">
              {nim || '-'}
            </td>
            <td className="w-32 py-1 px-2.5 font-normal border-r border-transparent">
              Reguler
            </td>
            <td className="w-4 py-1 text-center font-normal">
              :
            </td>
            <td className="py-1 px-2.5 font-normal">
              {programType || 'Reguler'}
            </td>
          </tr>

          {/* Row 2: Nama & No. Handphone */}
          <tr className="border-b border-black">
            <td className="w-20 py-1 px-2.5 font-normal border-r border-transparent">
              Nama
            </td>
            <td className="w-4 py-1 text-center font-normal">
              :
            </td>
            <td className="py-1 px-2.5 font-normal uppercase border-r border-black">
              {fullName || '-'}
            </td>
            <td className="w-32 py-1 px-2.5 font-normal border-r border-transparent">
              No. Handphone
            </td>
            <td className="w-4 py-1 text-center font-normal">
              :
            </td>
            <td className="py-1 px-2.5 font-normal">
              {phoneNumber || '-'}
            </td>
          </tr>

          {/* Row 3: Kelas & E-Mail */}
          <tr>
            <td className="w-20 py-1 px-2.5 font-normal border-r border-transparent">
              Kelas
            </td>
            <td className="w-4 py-1 text-center font-normal">
              :
            </td>
            <td className="py-1 px-2.5 font-normal border-r border-black">
              {classNameStr || '-'}
            </td>
            <td className="w-32 py-1 px-2.5 font-normal border-r border-transparent">
              E-Mail
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
