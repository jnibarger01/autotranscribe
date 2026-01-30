import React from 'react';
import { Invoice, AppState } from '../types';
import { AlertTriangle, Info } from 'lucide-react';

interface InvoiceViewProps {
  invoice: Invoice;
  language: 'EN' | 'ES';
}

const InvoiceView: React.FC<InvoiceViewProps> = ({ invoice, language }) => {
  const isSpanish = language === 'ES';

  // Helper to format currency
  const fmt = (num: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);

  // Defensive check for dealer info (source of reported crash)
  const dealerInfo = invoice.dealer_info || "Unknown Dealer\nAddress Unavailable";
  const dealerLines = dealerInfo.split('\n');
  const dealerName = dealerLines[0];
  const dealerAddr = dealerLines.slice(1).join('\n');

  return (
    <div className="bg-white shadow-xl border border-slate-200 min-h-[1000px] p-8 md:p-12 relative overflow-hidden">
      {/* Reconstruction Watermark if Spanish */}
      {isSpanish && (
        <div className="absolute top-4 right-4 text-xs font-mono text-slate-400 border border-slate-200 px-2 py-1 rounded">
          AUTOTRANSCRIBE RECONSTRUCTION V1.0
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between mb-8 border-b-2 border-slate-800 pb-4">
        <div className="w-full md:w-1/2">
          <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">
            {dealerName}
          </h1>
          <p className="text-sm text-slate-600 whitespace-pre-line mt-1">
            {dealerAddr}
          </p>
        </div>
        <div className="w-full md:w-1/3 mt-4 md:mt-0 text-right">
            <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="font-bold text-slate-500 uppercase">{isSpanish ? 'Factura #' : 'Invoice #'}</span>
                <span className="font-mono">{invoice.invoice_number}</span>
                <span className="font-bold text-slate-500 uppercase">{isSpanish ? 'Fecha' : 'Date'}</span>
                <span className="font-mono">{invoice.date}</span>
                <span className="font-bold text-slate-500 uppercase">VIN</span>
                <span className="font-mono text-xs">{invoice?.vehicle?.vin || 'N/A'}</span>
            </div>
        </div>
      </div>

      {/* Customer / Vehicle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-slate-50 p-4 rounded border border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">{isSpanish ? 'Cliente' : 'Customer'}</h3>
            <p className="font-bold">{invoice?.customer?.name || 'N/A'}</p>
            <p className="text-sm text-slate-600">{invoice?.customer?.address || ''}</p>
            <p className="text-xs text-slate-400 mt-1">ID: {invoice?.customer?.id || 'N/A'}</p>
        </div>
        <div className="bg-slate-50 p-4 rounded border border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">{isSpanish ? 'Vehículo' : 'Vehicle'}</h3>
            <p className="font-bold">{invoice?.vehicle?.year_make_model || 'Unknown Vehicle'}</p>
            <div className="flex gap-4 mt-2">
                <div className="text-sm">
                    <span className="text-slate-500 mr-2">{isSpanish ? 'Millas' : 'Mileage'}:</span>
                    {invoice?.vehicle?.mileage || 'N/A'}
                </div>
                <div className="text-sm">
                    <span className="text-slate-500 mr-2">{isSpanish ? 'Color' : 'Color'}:</span>
                    {invoice?.vehicle?.color || 'N/A'}
                </div>
            </div>
        </div>
      </div>

      {/* Jobs */}
      <div className="space-y-6 invoice-font">
        {(invoice.jobs || []).map((job) => (
            <div key={job.job_number} className="border border-slate-300 rounded-sm overflow-hidden">
                {/* Job Header */}
                <div className="bg-slate-800 text-white px-4 py-2 flex justify-between items-center">
                    <span className="font-bold">JOB #{job.job_number}</span>
                    <span className="uppercase font-medium tracking-wide text-sm">{job.job_title}</span>
                </div>

                {/* Complaint/Correction */}
                <div className="p-4 bg-slate-50 text-sm border-b border-slate-200">
                    <div className="grid grid-cols-[100px_1fr] gap-2 mb-2">
                        <span className="font-bold text-slate-600">{isSpanish ? 'QUEJA:' : 'COMPLAINT:'}</span>
                        <p className="text-slate-800">{job.complaint}</p>
                    </div>
                    <div className="grid grid-cols-[100px_1fr] gap-2">
                        <span className="font-bold text-slate-600">{isSpanish ? 'CORRECCIÓN:' : 'CORRECTION:'}</span>
                        <p className="text-slate-800">{job.correction}</p>
                    </div>
                </div>

                {/* Line Items Table */}
                <table className="w-full text-sm">
                    <thead className="bg-slate-100 border-b border-slate-200 text-xs text-slate-500 uppercase font-medium">
                        <tr>
                            <th className="px-4 py-2 text-left w-24">Type</th>
                            <th className="px-4 py-2 text-left w-32">Code/Part</th>
                            <th className="px-4 py-2 text-left">Description</th>
                            <th className="px-4 py-2 text-right w-20">Qty/Hrs</th>
                            <th className="px-4 py-2 text-right w-24">Price</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {(job.labor || []).map((l, idx) => (
                            <tr key={`labor-${idx}`}>
                                <td className="px-4 py-2 text-slate-500 font-mono text-xs">LABOR</td>
                                <td className="px-4 py-2 font-mono text-xs">{l.op_code}</td>
                                <td className="px-4 py-2">{l.description}</td>
                                <td className="px-4 py-2 text-right">{l.hours?.toFixed(2)}</td>
                                <td className="px-4 py-2 text-right font-medium">{fmt(l.amount)}</td>
                            </tr>
                        ))}
                        {(job.parts || []).map((p, idx) => (
                            <tr key={`part-${idx}`}>
                                <td className="px-4 py-2 text-slate-500 font-mono text-xs">PART</td>
                                <td className="px-4 py-2 font-mono text-xs">{p.part_number}</td>
                                <td className="px-4 py-2">{p.description}</td>
                                <td className="px-4 py-2 text-right">{p.quantity}</td>
                                <td className="px-4 py-2 text-right font-medium">{fmt(p.total_price)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-slate-50 border-t border-slate-200">
                        <tr>
                            <td colSpan={4} className="px-4 py-2 text-right font-bold text-slate-600">JOB TOTAL</td>
                            <td className="px-4 py-2 text-right font-bold text-slate-900">{fmt(job.job_total)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        ))}
      </div>

      {/* Footer / Totals */}
      <div className="mt-8 flex flex-col md:flex-row justify-between items-start">
        {/* Legal Text */}
        <div className="w-full md:w-2/3 pr-8">
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">
                {isSpanish ? 'Avisos Legales' : 'Legal Disclaimers'}
            </h4>
            <div className="text-[10px] text-slate-400 space-y-2 text-justify">
                {(invoice.disclaimers || []).map((text, i) => (
                    <p key={i}>{text}</p>
                ))}
            </div>
        </div>

        {/* Grand Totals */}
        <div className="w-full md:w-1/3 mt-8 md:mt-0">
            {invoice.totals ? (
            <table className="w-full text-sm">
                <tbody className="divide-y divide-slate-100">
                    <tr>
                        <td className="py-2 text-slate-600">{isSpanish ? 'Total Partes' : 'Total Parts'}</td>
                        <td className="py-2 text-right font-medium">{fmt(invoice.totals.parts_amount)}</td>
                    </tr>
                    <tr>
                        <td className="py-2 text-slate-600">{isSpanish ? 'Total Mano de Obra' : 'Total Labor'}</td>
                        <td className="py-2 text-right font-medium">{fmt(invoice.totals.labor_amount)}</td>
                    </tr>
                    <tr>
                        <td className="py-2 text-slate-600 group relative cursor-help">
                            {isSpanish ? 'G.O.G. y Suministros' : 'G.O.G. & Supplies'}
                            {isSpanish && (
                                <Info className="inline w-3 h-3 ml-1 text-blue-400" />
                            )}
                             {/* Tooltip for G.O.G */}
                             {isSpanish && (
                                <div className="absolute bottom-full left-0 w-48 bg-slate-800 text-white text-[10px] p-2 rounded shadow-lg hidden group-hover:block z-10 mb-1">
                                    Gastos de taller (Gas, Aceite, Grasa) y materiales fungibles.
                                </div>
                             )}
                        </td>
                        <td className="py-2 text-right font-medium">{fmt(invoice.totals.misc_charges)}</td>
                    </tr>
                    <tr>
                        <td className="py-2 text-slate-600">{isSpanish ? 'Impuestos' : 'Tax'}</td>
                        <td className="py-2 text-right font-medium">{fmt(invoice.totals.tax)}</td>
                    </tr>
                    <tr className="border-t-2 border-slate-900">
                        <td className="py-3 text-lg font-bold text-slate-900">{isSpanish ? 'TOTAL' : 'TOTAL'}</td>
                        <td className="py-3 text-right text-lg font-bold text-slate-900">{fmt(invoice.totals.grand_total)}</td>
                    </tr>
                </tbody>
            </table>
            ) : (
                <div className="text-red-500 text-sm">Totals unavailable</div>
            )}
        </div>
      </div>
      
      {/* Footer Validation Warning */}
      {isSpanish && (
          <div className="mt-8 flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded text-xs border border-amber-200">
              <AlertTriangle className="w-4 h-4" />
              <span>Translation generated by AutoTranscribe AI. Check totals against original document.</span>
          </div>
      )}
    </div>
  );
};

export default InvoiceView;