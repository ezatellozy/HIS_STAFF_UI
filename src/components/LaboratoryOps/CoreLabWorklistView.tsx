import React, { useState } from 'react';
import {
  FlaskConical,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Cpu,
  ShieldCheck,
  PhoneCall,
  ExternalLink,
  Eye,
  Edit3,
  RotateCcw,
  Sparkles,
  Layers
} from 'lucide-react';
import { LabAccession, LabSection, LabOrderPriority } from '../../types/laboratoryOps';

interface CoreLabWorklistViewProps {
  accessions: LabAccession[];
  onOpenResultModal: (accession: LabAccession) => void;
  onOpenCriticalModal: (accession: LabAccession) => void;
  onPreviewAccession: (accession: LabAccession) => void;
  onDeepLinkAxis7: (patientId: string) => void;
  onReleaseFinal: (accessionId: string) => void;
}

export const CoreLabWorklistView: React.FC<CoreLabWorklistViewProps> = ({
  accessions,
  onOpenResultModal,
  onOpenCriticalModal,
  onPreviewAccession,
  onDeepLinkAxis7,
  onReleaseFinal
}) => {
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAccessions = accessions.filter(acc => {
    const matchesSection = selectedSection === 'all' || acc.section === selectedSection;
    const matchesPriority = priorityFilter === 'all' || acc.priority === priorityFilter;
    const matchesSearch =
      acc.patientName.includes(searchTerm) ||
      acc.mrn.includes(searchTerm) ||
      acc.accessionNumber.includes(searchTerm) ||
      acc.testPanelName.includes(searchTerm);

    return matchesSection && matchesPriority && matchesSearch;
  });

  return (
    <div className="space-y-4 text-right font-['Cairo',sans-serif]">
      {/* Bench Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-teal-600" />
            <h2 className="text-base font-black text-slate-900">
              بنش التحليل الآلي والمختبر الأساسي (Core Laboratory & Automated Bench Worklist)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            الكيمياء السريرية، تعداد الدم الكامل، والتخثر • إدخال النتائج، التحقق الفني، وتنبيهات القراءات الحرجة والدلتا.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="بحث بالمريض أو رقم الترقيم..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs w-48 text-right focus:ring-2 focus:ring-teal-500"
          />

          <select
            value={selectedSection}
            onChange={e => setSelectedSection(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
          >
            <option value="all">كافة الأقسام الأساسية</option>
            <option value="chemistry">الكيمياء السريرية (Chemistry)</option>
            <option value="hematology">أمراض الدم (Hematology)</option>
            <option value="coagulation">التخثر (Coagulation)</option>
          </select>

          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
          >
            <option value="all">كافة الأولويات</option>
            <option value="stat">STAT (طارئ فوري)</option>
            <option value="urgent">Urgent (مستعجل)</option>
            <option value="routine">Routine (روتيني)</option>
          </select>
        </div>
      </div>

      {/* Accessions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-xs text-right">
          <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
            <tr>
              <th className="p-3">رقم الترقيم (Accession) والمريض</th>
              <th className="p-3">الأولوية والزمن المستهدف (TAT)</th>
              <th className="p-3">الباقة والجهاز المحلل</th>
              <th className="p-3">ملخص الفحوصات والنتائج</th>
              <th className="p-3">حالة التحقق الفني</th>
              <th className="p-3">إبلاغ القيمة الحرجة</th>
              <th className="p-3 text-center">الإجراءات الفنية</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filteredAccessions.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400">
                  لا توجد عينات في هذا البنش حالياً
                </td>
              </tr>
            ) : (
              filteredAccessions.map(acc => {
                const criticalTests = acc.tests.filter(
                  t => t.flag === 'critical_high' || t.flag === 'critical_low'
                );
                const hasCritical = criticalTests.length > 0;
                const isCommAcknowledged =
                  acc.criticalCommunication?.acknowledgementStatus === 'acknowledged';

                return (
                  <tr key={acc.id} className={`hover:bg-slate-50/80 transition-colors ${hasCritical && !isCommAcknowledged ? 'bg-red-50/40' : ''}`}>
                    <td className="p-3">
                      <div className="font-bold text-slate-900 text-sm">{acc.patientName}</div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-0.5">
                        <span>{acc.mrn}</span>
                        <span>•</span>
                        <span className="font-bold text-teal-700">{acc.accessionNumber}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        استلام: {acc.receivedDateTime}
                      </div>
                    </td>

                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block mb-1 ${
                          acc.priority === 'stat'
                            ? 'bg-red-100 text-red-800 border border-red-200 animate-pulse'
                            : acc.priority === 'urgent'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {acc.priority.toUpperCase()}
                      </span>
                      <div className="text-[11px] text-slate-600 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>الهدف: {acc.tatTargetMinutes} دقيقة</span>
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="font-bold text-slate-900 text-xs">{acc.testPanelName}</div>
                      <div className="text-[11px] text-teal-700 font-medium flex items-center gap-1 mt-0.5">
                        <Cpu className="w-3 h-3" />
                        <span>{acc.instrumentContext.analyzerName}</span>
                      </div>
                    </td>

                    <td className="p-3 max-w-sm">
                      <div className="flex flex-wrap gap-1.5">
                        {acc.tests.map(t => {
                          const isCrit = t.flag === 'critical_high' || t.flag === 'critical_low';
                          const isAbn = t.flag === 'abnormal_high' || t.flag === 'abnormal_low';

                          return (
                            <span
                              key={t.id}
                              className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold flex items-center gap-1 ${
                                isCrit
                                  ? 'bg-red-600 text-white animate-pulse'
                                  : isAbn
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                              title={`${t.testNameAr} - المرجع: ${t.referenceRangeText}`}
                            >
                              <span>{t.testCode}:</span>
                              <span>{t.numericValue ?? t.textValue}</span>
                            </span>
                          );
                        })}
                      </div>
                    </td>

                    <td className="p-3">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold inline-block ${
                          acc.status === 'released'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : acc.status === 'awaiting_tech_val'
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            : acc.status === 'awaiting_clinical_val'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {acc.status === 'released'
                          ? 'معتمد ونهائي'
                          : acc.status === 'awaiting_tech_val'
                          ? 'بانتظار التحقق الفني'
                          : acc.status === 'awaiting_clinical_val'
                          ? 'بانتظار الاعتماد السريري'
                          : acc.status}
                      </span>
                    </td>

                    <td className="p-3">
                      {hasCritical ? (
                        isCommAcknowledged ? (
                          <span className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>تم الإبلاغ بالقراءة المتبادلة</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => onOpenCriticalModal(acc)}
                            className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] flex items-center gap-1 shadow-xs cursor-pointer animate-bounce"
                          >
                            <PhoneCall className="w-3 h-3" />
                            <span>مطلوب إبلاغ هاتفي فوري</span>
                          </button>
                        )
                      ) : (
                        <span className="text-slate-400 text-[10px]">لا توجد قيم حرجة</span>
                      )}
                    </td>

                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onPreviewAccession(acc)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                          title="معاينة تفاصيل الترقيم"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onOpenResultModal(acc)}
                          className="px-2.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                          title="إدخال النتائج وتعديلها والتحقق الفني"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>مراجعة وإدخال</span>
                        </button>

                        {acc.status !== 'released' && (
                          <button
                            onClick={() => onReleaseFinal(acc.id)}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-pointer"
                            title="إطلاق واعتماد النتيجة النهائية (Release Final)"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => onDeepLinkAxis7(acc.patientId)}
                          className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 cursor-pointer"
                          title="عرض نتائج المريض في مساحة الطبيب (Axis 7)"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
