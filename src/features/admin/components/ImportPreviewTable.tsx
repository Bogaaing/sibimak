import React from 'react';
import { ValidatedImportRow } from '../../../services/studentImport.service';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';

interface ImportPreviewTableProps {
  rows: ValidatedImportRow[];
}

export const ImportPreviewTable: React.FC<ImportPreviewTableProps> = ({ rows }) => {
  return (
    <div className="overflow-x-auto max-h-[340px] border border-slate-200 rounded-xl">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10 shadow-2xs">
          <tr>
            <th className="px-3.5 py-2.5 w-12 text-center">No</th>
            <th className="px-3.5 py-2.5">NIM</th>
            <th className="px-3.5 py-2.5">Nama Lengkap</th>
            <th className="px-3.5 py-2.5">Email</th>
            <th className="px-3.5 py-2.5">No. Handphone</th>
            <th className="px-3.5 py-2.5">Status Validasi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((row) => {
            const isValid = row.status === 'VALID';
            const isDuplicate = row.status === 'DUPLIKAT_DATABASE' || row.status === 'DUPLIKAT_FILE';

            return (
              <tr 
                key={row.rowNumber} 
                className={`transition-colors ${
                  isValid 
                    ? 'hover:bg-slate-50/70' 
                    : isDuplicate 
                    ? 'bg-amber-50/40 hover:bg-amber-50/60' 
                    : 'bg-rose-50/40 hover:bg-rose-50/60'
                }`}
              >
                <td className="px-3.5 py-2.5 font-medium text-slate-400 text-center">
                  {row.rowNumber}
                </td>
                <td className="px-3.5 py-2.5 font-mono font-bold text-slate-900">
                  {row.nim || <span className="text-slate-300 italic">-</span>}
                </td>
                <td className="px-3.5 py-2.5 font-bold text-slate-900">
                  {row.fullName || <span className="text-slate-300 italic">-</span>}
                </td>
                <td className="px-3.5 py-2.5 text-slate-600">
                  {row.email || <span className="text-slate-400 text-[11px] italic">Otomatis (@student)</span>}
                </td>
                <td className="px-3.5 py-2.5 font-mono text-slate-600">
                  {row.phoneNumber || <span className="text-slate-300 italic">-</span>}
                </td>
                <td className="px-3.5 py-2.5">
                  {isValid ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Valid</span>
                    </span>
                  ) : isDuplicate ? (
                    <div className="space-y-0.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        <span>Duplikat</span>
                      </span>
                      <p className="text-[10px] text-amber-800 font-medium leading-tight">
                        {row.statusMessage}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <XCircle className="w-3 h-3 text-rose-600" />
                        <span>Error</span>
                      </span>
                      <p className="text-[10px] text-rose-700 font-medium leading-tight">
                        {row.statusMessage}
                      </p>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
