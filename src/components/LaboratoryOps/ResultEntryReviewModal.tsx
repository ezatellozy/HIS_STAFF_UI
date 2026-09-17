import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  History,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Layers,
  PhoneCall,
  User,
  FlaskConical,
  Clock,
  Edit3
} from 'lucide-react';
import {
  LabAccession,
  TestResultItem,
  ResultFlag,
  TestResultStatus,
  ResultVersionAudit
} from '../../types/laboratoryOps';

interface ResultEntryReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  accession: LabAccession;
  onSaveResults: (updatedAccession: LabAccession) => void;
  onOpenCriticalModal: (accession: LabAccession) => void;
}

export const ResultEntryReviewModal: React.FC<ResultEntryReviewModalProps> = ({
  isOpen,
  onClose,
  accession,
  onSaveResults,
  onOpenCriticalModal
}) => {
  const [tests, setTests] = useState<TestResultItem[]>(accession.tests);
  const [selectedTestIdForAmend, setSelectedTestIdForAmend] = useState<string | null>(null);
  const [amendmentReason, setAmendmentReason] = useState('إعادة تشغيل وتصحيح العينة بعد استبعاد التداخل اللوني المخبري');
  const [amendedNewValue, setAmendedNewValue] = useState('');
  const [authorName, setAuthorName] = useState('م. عاصم النجار (أخصائي كيمياء سريرية)');

  if (!isOpen) return null;

  const handleValueChange = (testId: string, val: string) => {
    setTests(prev =>
      prev.map(t => {
        if (t.id !== testId) return t;
        const num = parseFloat(val);
        const isNum = !isNaN(num);
        let flag: ResultFlag = 'normal';

        if (isNum) {
          if (t.criticalHigh !== undefined && num >= t.criticalHigh) {
            flag = 'critical_high';
          } else if (t.criticalLow !== undefined && num <= t.criticalLow) {
            flag = 'critical_low';
          } else if (t.referenceHigh !== undefined && num > t.referenceHigh) {
            flag = 'abnormal_high';
          } else if (t.referenceLow !== undefined && num < t.referenceLow) {
            flag = 'abnormal_low';
          }
        }

        return {
          ...t,
          numericValue: isNum ? num : undefined,
          textValue: !isNum ? val : undefined,
          flag
        };
      })
    );
  };

  const handleApplyTechnicalVerification = () => {
    const verifiedTests: TestResultItem[] = tests.map(t => ({
      ...t,
      status: 'technically_verified',
      technicallyVerifiedBy: authorName,
      technicallyVerifiedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    }));

    const updated: LabAccession = {
      ...accession,
      status: 'awaiting_clinical_val',
      tests: verifiedTests
    };

    onSaveResults(updated);
    // Check if any test is critical
    const hasCritical = verifiedTests.some(
      t => t.flag === 'critical_high' || t.flag === 'critical_low'
    );
    if (hasCritical) {
      onOpenCriticalModal(updated);
    }
    onClose();
  };

  const handleExecuteAmendment = (testId: string) => {
    if (!amendedNewValue) return;
    const num = parseFloat(amendedNewValue);
    const isNum = !isNaN(num);

    setTests(prev =>
      prev.map(t => {
        if (t.id !== testId) return t;

        const previousValStr = t.numericValue !== undefined ? `${t.numericValue}` : t.textValue || '';
        const auditRecord: ResultVersionAudit = {
          version: t.version,
          value: previousValStr,
          flag: t.flag,
          status: t.status,
          amendedBy: authorName,
          amendedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
          amendmentReason,
          clinicalNote: `تم استبدال القيمة القديمة (${previousValStr} ${t.unit}) بالقيمة المصححة (${amendedNewValue} ${t.unit}) مع الاحتفاظ بكامل السجل التاريخي.`
        };

        let newFlag: ResultFlag = 'normal';
        if (isNum) {
          if (t.criticalHigh !== undefined && num >= t.criticalHigh) newFlag = 'critical_high';
          else if (t.criticalLow !== undefined && num <= t.criticalLow) newFlag = 'critical_low';
          else if (t.referenceHigh !== undefined && num > t.referenceHigh) newFlag = 'abnormal_high';
          else if (t.referenceLow !== undefined && num < t.referenceLow) newFlag = 'abnormal_low';
        }

        return {
          ...t,
          numericValue: isNum ? num : undefined,
          textValue: !isNum ? amendedNewValue : undefined,
          flag: newFlag,
          status: 'corrected',
          version: t.version + 1,
          versionHistory: [...(t.versionHistory || []), auditRecord]
        };
      })
    );

    setSelectedTestIdForAmend(null);
    setAmendedNewValue('');
  };

  const activeAmendingTest = tests.find(t => t.id === selectedTestIdForAmend);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full p-6 space-y-5 text-right font-['Cairo',sans-serif] max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">
                  إدخال ومراجعة النتائج المخبرية والتحقق الفني
                </h3>
                <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 text-xs font-mono font-bold">
                  {accession.accessionNumber}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Technical Result Review & Verification Surface • القسم: {accession.section} • الجهاز: {accession.instrumentContext.analyzerName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Patient Safety & Specimen Invariant Banner */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-4 gap-3 text-xs text-slate-700">
          <div>
            <span className="text-slate-400 block">المريض:</span>
            <strong className="text-slate-900">{accession.patientName}</strong>
          </div>
          <div>
            <span className="text-slate-400 block">الرقم الطبي (MRN):</span>
            <strong className="text-slate-900 font-mono">{accession.mrn}</strong>
          </div>
          <div>
            <span className="text-slate-400 block">الطبيب والقسم:</span>
            <strong className="text-slate-900">{accession.orderingDoctor} ({accession.orderingService})</strong>
          </div>
          <div>
            <span className="text-slate-400 block">ضبط الجودة (QC Status):</span>
            <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>مقبول وضمن النطاق</span>
            </span>
          </div>
        </div>

        {/* Core Tests Table */}
        <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl">
          <table className="w-full text-xs text-right">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="p-2.5">الاختبار المخبري</th>
                <th className="p-2.5">النتيجة المسجلة</th>
                <th className="p-2.5">الوحدة</th>
                <th className="p-2.5">المعدل المرجعي</th>
                <th className="p-2.5">الدلتا / القيمة السابقة</th>
                <th className="p-2.5">التصنيف</th>
                <th className="p-2.5">الحالة</th>
                <th className="p-2.5 text-center">إجراء وتصحيح</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {tests.map(test => {
                const isCritical = test.flag === 'critical_high' || test.flag === 'critical_low';
                const isAbnormal = test.flag === 'abnormal_high' || test.flag === 'abnormal_low';

                return (
                  <tr
                    key={test.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      isCritical ? 'bg-red-50/70' : isAbnormal ? 'bg-amber-50/40' : ''
                    }`}
                  >
                    <td className="p-2.5">
                      <div className="font-bold text-slate-900">{test.testNameAr}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{test.testCode}</div>
                    </td>
                    <td className="p-2.5">
                      <input
                        type="text"
                        value={test.numericValue !== undefined ? test.numericValue : test.textValue || ''}
                        onChange={e => handleValueChange(test.id, e.target.value)}
                        className={`w-28 px-2.5 py-1 rounded-lg border font-mono font-bold text-xs ${
                          isCritical
                            ? 'border-red-500 bg-red-100/60 text-red-900 focus:ring-red-500'
                            : isAbnormal
                            ? 'border-amber-400 bg-amber-50 text-amber-900'
                            : 'border-slate-300 bg-white text-slate-900'
                        }`}
                      />
                    </td>
                    <td className="p-2.5 font-mono text-slate-500">{test.unit}</td>
                    <td className="p-2.5 font-mono text-slate-600">{test.referenceRangeText}</td>
                    <td className="p-2.5">
                      {test.previousDelta ? (
                        <div className="text-[11px] font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded inline-block">
                          {test.previousDelta}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">{test.previousValue || 'لا يوجد سابق'}</span>
                      )}
                    </td>
                    <td className="p-2.5">
                      {isCritical ? (
                        <span className="px-2 py-0.5 rounded bg-red-600 text-white font-black text-[10px] inline-flex items-center gap-1 animate-pulse">
                          <AlertTriangle className="w-3 h-3" />
                          <span>قيمة حرجة (Critical)</span>
                        </span>
                      ) : isAbnormal ? (
                        <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-bold text-[10px]">
                          غير طبيعي (Abnormal)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          طبيعي (Normal)
                        </span>
                      )}
                    </td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono text-[10px]">
                        {test.status} (v{test.version})
                      </span>
                    </td>
                    <td className="p-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTestIdForAmend(test.id);
                          setAmendedNewValue(
                            test.numericValue !== undefined ? `${test.numericValue}` : test.textValue || ''
                          );
                        }}
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                        title="تصحيح أو تعديل النتيجة مع حفظ السجل التاريخي"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>تعديل/نسخ</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Amendment & Version Audit Drawer/Panel */}
        {activeAmendingTest && (
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-300 space-y-3">
            <div className="flex items-center justify-between border-b border-amber-200 pb-2">
              <div className="flex items-center gap-2 font-bold text-amber-900 text-xs">
                <History className="w-4 h-4 text-amber-700" />
                <span>
                  حوكمة تعديل النتائج المخبرية (Result Correction / Amendment Audit Protocol) — {activeAmendingTest.testNameAr}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTestIdForAmend(null)}
                className="text-slate-500 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-amber-800">
              <strong>محدد الحوكمة:</strong> يحظر النظام استبدال النتيجة الأصلية بصمت. يتم حفظ القيمة السابقة وتاريخ التغيير وهوية المعدل ومبرر التعديل في سجل دائم.
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">القيمة الجديدة المصححة ({activeAmendingTest.unit}):</label>
                <input
                  type="text"
                  value={amendedNewValue}
                  onChange={e => setAmendedNewValue(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg font-mono font-bold text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">سبب ومبرر التعديل الفني (Amendment Reason):</label>
                <input
                  type="text"
                  value={amendmentReason}
                  onChange={e => setAmendmentReason(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs"
                />
              </div>
            </div>

            {/* Version History Table if any */}
            {activeAmendingTest.versionHistory && activeAmendingTest.versionHistory.length > 0 && (
              <div className="p-2 bg-white rounded-lg border border-amber-200 text-[11px] space-y-1">
                <span className="font-bold text-slate-700 block">الإصدارات السابقة المسجلة:</span>
                {activeAmendingTest.versionHistory.map((h, i) => (
                  <div key={i} className="flex items-center justify-between text-slate-600 border-b border-slate-100 pb-1">
                    <span>الإصدار v{h.version}: <strong>{h.value} {activeAmendingTest.unit}</strong> ({h.flag})</span>
                    <span>عدّلها: {h.amendedBy} في {h.amendedAt} — سبب: {h.amendmentReason}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSelectedTestIdForAmend(null)}
                className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => handleExecuteAmendment(activeAmendingTest.id)}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold text-xs shadow-xs cursor-pointer"
              >
                اعتماد التعديل كنسخة جديدة (Commit Amended Version)
              </button>
            </div>
          </div>
        )}

        {/* Modal Action Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              إغلاق
            </button>
            {accession.tests.some(t => t.flag === 'critical_high' || t.flag === 'critical_low') && (
              <button
                type="button"
                onClick={() => onOpenCriticalModal(accession)}
                className="px-4 py-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-red-300"
              >
                <PhoneCall className="w-4 h-4 text-red-600 animate-bounce" />
                <span>توثيق الاتصال بالقيمة الحرجة (Critical Read-Back)</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleApplyTechnicalVerification}
            className="px-6 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>التحقق الفني واعتماد النتائج (Technically Verify)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
