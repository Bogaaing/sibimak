import React from 'react';
import { formatDate } from '../../../lib/utils';
import { ValidationStatus } from '../../../types/database.types';

export interface FormGuidanceItem {
  id: string;
  session_date: string;
  title: string;
  topic_description: string;
  validation_status?: ValidationStatus;
  type?: 'KELAS' | 'INDIVIDU';
}

interface GuidanceHistoryTableProps {
  records: FormGuidanceItem[];
  signatureUrl?: string | null;
}

export const GuidanceHistoryTable: React.FC<GuidanceHistoryTableProps> = ({
  records,
  signatureUrl = '/assets/ahmadasepsuhendi-ttd.png',
}) => {
  // Helper to format topic description into multi-line items (a. b. c. etc.)
  const renderTopicLines = (title: string, description: string) => {
    if (!description) {
      return <div>{title}</div>;
    }

    const lines = description
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length > 1) {
      return (
        <div className="space-y-0.5 text-left">
          {lines.map((line, idx) => {
            const hasBullet = /^[a-zA-Z0-9][\.\)]\s/.test(line) || /^[-•*]\s/.test(line);
            const bulletPrefix = hasBullet ? '' : `${String.fromCharCode(97 + idx)}. `;
            const cleanLine = hasBullet ? line.replace(/^[-•*]\s/, `${String.fromCharCode(97 + idx)}. `) : line;

            return (
              <div key={idx} className="leading-snug">
                {hasBullet ? cleanLine : `${bulletPrefix}${cleanLine}`}
              </div>
            );
          })}
        </div>
      );
    }

    const sentences = description
      .split(/(?<=[.?!;])\s+(?=[A-Z0-9])/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (sentences.length > 1) {
      return (
        <div className="space-y-0.5 text-left">
          {sentences.map((sent, idx) => (
            <div key={idx} className="leading-snug">
              {String.fromCharCode(97 + idx)}. {sent}
            </div>
          ))}
        </div>
      );
    }

    return <div className="leading-snug text-left">{description}</div>;
  };

  return (
    <div className="w-full mb-2">
      <h3 className="text-[12px] font-bold text-slate-950 mb-1">
        Pelaksanaan Bimbingan Akademik
      </h3>

      <table className="w-full border-collapse border border-black text-[11.5px] text-slate-950">
        <thead>
          <tr className="border-b border-black">
            <th className="w-12 py-1.5 px-2 text-center font-bold border-r border-black">
              No
            </th>
            <th className="w-36 py-1.5 px-2 text-center font-bold border-r border-black">
              Tanggal Bimbingan
            </th>
            <th className="py-1.5 px-3 text-center font-bold border-r border-black">
              Topik Bimbingan
            </th>
            <th className="w-28 py-1.5 px-2 text-center font-bold">
              Paraf Dosen
            </th>
          </tr>
        </thead>
        <tbody>
          {records.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                className="py-8 text-center text-slate-500 italic text-[11px]"
              >
                Belum ada data pelaksanaan bimbingan akademik pada periode ini.
              </td>
            </tr>
          ) : (
            records.map((item, index) => {
              const isValid = item.validation_status === 'VALID';

              return (
                <tr
                  key={item.id || index}
                  className="border-b border-black align-middle break-inside-avoid"
                >
                  <td className="py-2 px-2 text-center font-normal border-r border-black align-middle">
                    {index + 1}.
                  </td>
                  <td className="py-2 px-2.5 font-normal border-r border-black whitespace-nowrap align-middle">
                    {formatDate(item.session_date)}
                  </td>
                  <td className="py-2 px-3 font-normal border-r border-black text-left align-middle">
                    {renderTopicLines(item.title, item.topic_description)}
                  </td>
                  <td className="py-1 px-2 text-center h-16 w-28 align-middle">
                    {isValid ? (
                      /* Automatic official signature asset display */
                      <img
                        src={signatureUrl || '/assets/ahmadasepsuhendi-ttd.png'}
                        alt="Paraf Dosen PA"
                        className="max-h-12 max-w-[85px] mx-auto object-contain"
                      />
                    ) : (
                      /* Blank area when PENDING or DITOLAK */
                      <div className="w-full h-full min-h-[48px]" />
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
