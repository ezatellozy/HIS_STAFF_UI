import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FlaskConical,
  Droplet,
  Search,
  Filter,
  Check,
  User,
  Info,
  Clock,
  ArrowRight
} from 'lucide-react';
import { CompatibilityRecord, CrossmatchMethod } from '../../types/bloodBankOps';

interface CompatibilityWorkspaceProps {
  records: CompatibilityRecord[];
  onOpenAllocation?: (requestId: string) => void;
  onOpenEmergencyReleaseModal?: () => void;
}

export const CompatibilityWorkspace: React.FC<CompatibilityWorkspaceProps> = ({
  records,
  onOpenAllocation,
  onOpenEmergencyReleaseModal
}) => {
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredRecords = records.filter(r => {
    const matchesSearch =
      r.patientName.includes(searchTerm) ||
      r.patientMrn.includes(searchTerm) ||
      r.unitNumber.includes(searchTerm) ||
      r.requestId.includes(searchTerm);

    const matchesMethod = methodFilter === 'all' || r.method === methodFilter;

    return matchesSearch && matchesMethod;
  });

  return (
    <div className="space-y-4">
      {/* Top Header & Fast Actions */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">مختبر التوافق والمطابقة المصلية (Compatibility & Crossmatch)</h2>
              <p className="text-xs text-slate-500">
                الفحص المصلي الفوري، المطابقة بالجلوبيولين البشري (AHG)، والتوافق الإلكتروني وفق سياسة بنك الدم
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="بحث برقم الوحدة، المريض، الطلب..."
                className="pr-9 pl-3 py-1.5 rounded-xl border border-slate-200 text-xs w-56 focus:outline-none focus:border-teal-500"
              />
            </div>

            <select
              value={methodFilter}
              onChange={e => setMethodFilter(e.target.value)}
              className="py-1.5 px-3 rounded-xl border border-slate-200 text-xs bg-slate-50 font-medium text-slate-700 focus:outline-none"
            >
              <option value="all">كافة الطرق ({records.length})</option>
              <option value="serologic_immediate_spin">فوري (Immediate Spin)</option>
              <option value="antiglobulin_crossmatch_ahg">أضداد جلوبيولين (AHG)</option>
              <option value="electronic_compatibility">إلكتروني (Electronic)</option>
              <option value="emergency_uncrossmatched">صرف طارئ غير متوافق</option>
            </select>

            {onOpenEmergencyReleaseModal && (
              <button
                onClick={onOpenEmergencyReleaseModal}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>صرف طارئ (Emergency Release)</span>
              </button>
            )}
          </div>
        </div>

        {/* Policy Guidance */}
        <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-200/70 flex items-center justify-between text-xs text-teal-950">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-teal-700 shrink-0" />
            <span>
              قاعدة التوافق المعتمدة: المرضى الذين لديهم أجسام مضادة حالية أو تاريخية يلزم لهم فحص AHG كامل، ولا يسمح بالصرف الفوري أو الإلكتروني.
            </span>
          </div>
          <span className="font-mono text-[10px] font-bold bg-white px-2 py-0.5 rounded border border-teal-300">
            AABB Standards Aligned
          </span>
        </div>
      </div>

      {/* Crossmatch Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">الطلب والمريض</th>
                <th className="p-3.5">فصيلة المريض</th>
                <th className="p-3.5">الوحدة المفحوصة وفصيلتها</th>
                <th className="p-3.5">طريقة المطابقة المعتمدة</th>
                <th className="p-3.5">نتيجة التوافق</th>
                <th className="p-3.5">المتطلبات الخاصة المحققة</th>
                <th className="p-3.5">الفاحص والمصادقة</th>
                <th className="p-3.5 text-center">الإجراء التالي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map(rec => (
                <tr key={rec.id} className="hover:bg-teal-50/20 transition-colors">
                  {/* Request & Patient */}
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900">{rec.patientName}</div>
                    <div className="font-mono text-[11px] text-slate-500 mt-0.5">
                      MRN: {rec.patientMrn} • {rec.requestId}
                    </div>
                  </td>

                  {/* Patient Group */}
                  <td className="p-3.5">
                    <span className="px-2 py-1 rounded-lg bg-red-50 text-red-800 font-mono font-bold text-xs border border-red-200">
                      {rec.patientGroup.displayAr}
                    </span>
                  </td>

                  {/* Unit and Group */}
                  <td className="p-3.5">
                    <div className="font-mono font-bold text-slate-900">{rec.unitNumber}</div>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      فصيلة الوحدة: <strong className="font-mono text-red-700">{rec.unitGroup.displayAr}</strong>
                    </div>
                  </td>

                  {/* Method */}
                  <td className="p-3.5">
                    <div className="font-medium text-slate-800">{rec.methodDisplayAr}</div>
                    <div className="text-[10px] font-mono text-slate-500 mt-0.5">{rec.method}</div>
                  </td>

                  {/* Result */}
                  <td className="p-3.5">
                    {rec.result === 'compatible' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>متوافق (Compatible)</span>
                      </span>
                    ) : rec.result === 'emergency_uncrossmatched_released' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-[11px] border border-rose-200">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>صرف طارئ غير متوافق</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>الفحص جاري</span>
                      </span>
                    )}
                  </td>

                  {/* Satisfied Requirements */}
                  <td className="p-3.5">
                    <div className="space-y-0.5">
                      {rec.satisfiedRequirementsList.map((req, i) => (
                        <div key={i} className="text-[10px] text-slate-700 flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{req}</span>
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* Tech & Verifier */}
                  <td className="p-3.5">
                    <div className="text-slate-800 font-medium">{rec.technologistName}</div>
                    {rec.verifierName && (
                      <div className="text-[10px] text-teal-700 font-medium mt-0.5">
                        مصادقة: {rec.verifierName}
                      </div>
                    )}
                    <div className="text-[10px] text-slate-400 mt-0.5">{rec.testedAt}</div>
                  </td>

                  {/* Action */}
                  <td className="p-3.5 text-center">
                    {onOpenAllocation && (
                      <button
                        onClick={() => onOpenAllocation(rec.requestId)}
                        className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] transition-colors shadow-2xs inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>تخصيص الوحدة</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    لا توجد سجلات تطابق البحث في مختبر التوافق.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
