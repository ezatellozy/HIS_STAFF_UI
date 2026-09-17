import React, { useState } from 'react';
import {
  Truck,
  Building2,
  Barcode,
  Search,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { SendOutShipment } from '../../types/laboratoryOps';

interface SendOutLabViewProps {
  shipments: SendOutShipment[];
  onPreviewShipment?: (shipment: SendOutShipment) => void;
}

export const SendOutLabView: React.FC<SendOutLabViewProps> = ({ shipments }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = shipments.filter(
    s =>
      s.patientName.includes(searchTerm) ||
      s.mrn.includes(searchTerm) ||
      s.shipmentNumber.includes(searchTerm) ||
      s.referenceLabName.includes(searchTerm)
  );

  return (
    <div className="space-y-4 text-right font-['Cairo',sans-serif]">
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-black text-slate-900">
              إدارة الفحوصات المرسلة للمختبرات المرجعية الخارجية (Send-Out / Reference Labs)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            تتبع الشحنات الطبية المبردة للفحوصات الجينية والنادرة خارج المنشأة • مراقبة أرقام الشحن وبوالص النقل وإدخال النتائج المرجعية.
          </p>
        </div>

        <input
          type="text"
          placeholder="بحث بالمريض أو المختبر المرجعي..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs w-56 text-right focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Shipments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-xs text-right">
          <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
            <tr>
              <th className="p-3">رقم الشحنة والمريض</th>
              <th className="p-3">المختبر المرجعي المتعاقد</th>
              <th className="p-3">الفحص المطلوب</th>
              <th className="p-3">بوليصة الشحن والنقل</th>
              <th className="p-3">حالة الشحنة</th>
              <th className="p-3">ملخص النتيجة المرجعية</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filtered.map(ship => (
              <tr key={ship.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-3">
                  <div className="font-bold text-slate-900 text-sm">{ship.patientName}</div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-0.5">
                    <span>{ship.mrn}</span>
                    <span>•</span>
                    <span className="text-blue-700 font-bold">{ship.shipmentNumber}</span>
                  </div>
                </td>

                <td className="p-3">
                  <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>{ship.referenceLabName}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                    رقم مرجعي: {ship.accessionNumber}
                  </span>
                </td>

                <td className="p-3">
                  <strong className="text-slate-900 text-xs">{ship.testName}</strong>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    تاريخ التجهيز: {ship.preparedAt}
                  </span>
                </td>

                <td className="p-3">
                  {ship.courierTrackingNumber ? (
                    <div className="font-mono text-[11px] bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 inline-block text-slate-700">
                      {ship.courierTrackingNumber}
                    </div>
                  ) : (
                    <span className="text-slate-400 text-[10px]">بانتظار الناقل</span>
                  )}
                </td>

                <td className="p-3">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold inline-block ${
                      ship.status === 'result_returned'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : ship.status === 'processing'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {ship.status === 'result_returned'
                      ? 'تم استلام النتيجة'
                      : ship.status === 'processing'
                      ? 'قيد المعالجة بالمرجع'
                      : ship.status === 'dispatched'
                      ? 'في طريق الشحن'
                      : 'قيد التجهيز'}
                  </span>
                </td>

                <td className="p-3 max-w-xs">
                  {ship.returnedResultSummary ? (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-950 p-2 rounded-lg text-[11px] leading-tight font-medium">
                      {ship.returnedResultSummary}
                    </div>
                  ) : (
                    <span className="text-slate-400 text-[10px] italic">بانتظار الإفراج من المختبر المرجعي</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
