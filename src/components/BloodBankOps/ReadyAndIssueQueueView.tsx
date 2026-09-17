import React, { useState } from 'react';
import {
  Clock,
  Search,
  Filter,
  Droplet,
  User,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Box,
  FileCheck,
  Thermometer,
  Layers
} from 'lucide-react';
import {
  BloodProductUnit,
  BloodProductRequest,
  ProductIssueRecord
} from '../../types/bloodBankOps';

interface ReadyAndIssueQueueViewProps {
  readyUnits: BloodProductUnit[];
  requests: BloodProductRequest[];
  recentIssues: ProductIssueRecord[];
  onOpenIssueModal: (request: BloodProductRequest, unit: BloodProductUnit) => void;
}

export const ReadyAndIssueQueueView: React.FC<ReadyAndIssueQueueViewProps> = ({
  readyUnits,
  requests,
  recentIssues,
  onOpenIssueModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'queue' | 'history'>('queue');

  const filteredReadyUnits = readyUnits.filter(u => {
    const matchesSearch =
      u.unitNumber.includes(searchTerm) ||
      (u.allocatedToPatientName && u.allocatedToPatientName.includes(searchTerm)) ||
      (u.allocatedToPatientMrn && u.allocatedToPatientMrn.includes(searchTerm));
    return matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-50 text-red-700 border border-red-200">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">طابور الوحدات الجاهزة للصرف والتسليم (Ready / Issue Queue)</h2>
              <p className="text-xs text-slate-500">
                مشتقات الدم المكتملة الفحوصات والمخصصة الجاهزة للاستلام من الفرق السريرية
              </p>
            </div>
          </div>

          {/* Subtabs & Search */}
          <div className="flex items-center gap-2">
            <div className="flex rounded-xl bg-slate-100 p-0.5 text-xs font-bold">
              <button
                onClick={() => setActiveSubTab('queue')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeSubTab === 'queue' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                الوحدات الجاهزة ({readyUnits.length})
              </button>
              <button
                onClick={() => setActiveSubTab('history')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeSubTab === 'history' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                سجل المنصرف حديثاً ({recentIssues.length})
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="بحث برقم الوحدة، المريض..."
                className="pr-9 pl-3 py-1.5 rounded-xl border border-slate-200 text-xs w-52 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
        </div>
      </div>

      {activeSubTab === 'queue' ? (
        /* Ready Queue Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredReadyUnits.map(unit => {
            const linkedRequest = requests.find(r => r.id === unit.allocatedToRequestId);
            return (
              <div
                key={unit.id}
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-red-500 transition-all shadow-2xs space-y-3"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-red-50 text-red-800 font-mono font-bold text-xs border border-red-200">
                    {unit.bloodGroup.displayAr}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800">
                    جاهز للصرف والتسليم
                  </span>
                </div>

                {/* Unit info */}
                <div>
                  <div className="font-mono font-bold text-slate-900 text-xs">{unit.unitNumber}</div>
                  <div className="font-bold text-slate-800 text-xs mt-0.5">{unit.componentNameAr}</div>
                  <div className="text-[11px] text-slate-500 font-mono">حجم: {unit.volumeMl} mL • انتهاء: {unit.expiryDate}</div>
                </div>

                {/* Patient / Ward Destination */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1">
                  <div className="flex items-center justify-between text-slate-700">
                    <span>المريض:</span>
                    <strong className="text-slate-900">{unit.allocatedToPatientName || 'غير محدد'}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-700">
                    <span>الرقم الطبي:</span>
                    <strong className="font-mono text-slate-900">{unit.allocatedToPatientMrn}</strong>
                  </div>
                  {linkedRequest && (
                    <div className="flex items-center justify-between text-slate-700">
                      <span>الموقع السريري:</span>
                      <strong className="text-slate-900">{linkedRequest.locationWardBed}</strong>
                    </div>
                  )}
                </div>

                {/* Cold chain warning */}
                <div className="flex items-center gap-1.5 text-[10px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                  <Thermometer className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>تأكيد نقل الوحدة داخل صندوق تبريد مخصص وتطبيق قاعدة الـ 30 دقيقة.</span>
                </div>

                {/* Action button */}
                <button
                  onClick={() => {
                    if (linkedRequest) {
                      onOpenIssueModal(linkedRequest, unit);
                    }
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تسليم وصرف الوحدة للقسم</span>
                </button>
              </div>
            );
          })}

          {filteredReadyUnits.length === 0 && (
            <div className="col-span-3 p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
              لا توجد وحدات بانتظار التسليم حالياً.
            </div>
          )}
        </div>
      ) : (
        /* History of Issued Units */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">كود الصرف والوحدة</th>
                  <th className="p-3.5">المريض والملف</th>
                  <th className="p-3.5">جهة وموقع الاستلام</th>
                  <th className="p-3.5">المستلم وقناة النقل</th>
                  <th className="p-3.5">وقت الصرف</th>
                  <th className="p-3.5">صندوق التبريد</th>
                  <th className="p-3.5">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentIssues.map(issue => (
                  <tr key={issue.id} className="hover:bg-slate-50">
                    <td className="p-3.5">
                      <div className="font-mono font-bold text-slate-900">{issue.id}</div>
                      <div className="font-mono text-[11px] text-red-700 font-bold mt-0.5">{issue.unitNumber}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{issue.patientName}</div>
                      <div className="font-mono text-[11px] text-slate-500 mt-0.5">{issue.patientMrn}</div>
                    </td>
                    <td className="p-3.5 font-medium text-slate-800">{issue.destinationLocation}</td>
                    <td className="p-3.5">
                      <div className="font-medium text-slate-800">{issue.receivingStaffName}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{issue.receivingStaffRole}</div>
                    </td>
                    <td className="p-3.5 text-slate-700">{issue.issuedAt}</td>
                    <td className="p-3.5 text-[11px] text-slate-600">{issue.transportCarrierId}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                        {issue.issueStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
