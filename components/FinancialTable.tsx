
import React from 'react';
import { FinancialStatement } from '../types';

interface Props {
  data: FinancialStatement;
}

const FinancialTable: React.FC<Props> = ({ data }) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="py-4 px-6 font-semibold text-slate-700 text-sm">Description</th>
            {data.years.map((year, idx) => (
              <th key={idx} className="py-4 px-6 font-semibold text-slate-700 text-sm text-right">
                {year}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.rows.map((row, rowIdx) => (
            <tr 
              key={rowIdx} 
              className={`hover:bg-slate-50 transition-colors ${row.isTotal ? 'bg-slate-50 font-bold' : ''}`}
            >
              <td className={`py-3 px-6 text-sm text-slate-600 ${row.isTotal ? 'text-slate-900 uppercase tracking-tight' : ''}`}>
                {row.label}
              </td>
              {row.values.map((val, valIdx) => (
                <td 
                  key={valIdx} 
                  className={`py-3 px-6 text-sm text-right tabular-nums ${row.isTotal ? 'text-slate-900 border-t-2 border-slate-200' : 'text-slate-600'}`}
                >
                  {val}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FinancialTable;
