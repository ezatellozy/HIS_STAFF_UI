import React, { useState, useEffect } from 'react';
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
  Edit3,
  XCircle,
  Ban,
  FileText
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
  const [selectedTestIdForDisposition, setSelectedTestIdForDisposition] = useState<string | null>(null);
  const [dispositionReason, setDispositionReason] = useState<string>(
    'انحلال العينة يؤثر على دقة قياس هذا الفحص (Gross Hemolysis Interference)'
  );
  const [dispositionClinicalNote, setDispositionClinicalNote] = useState<string>('');
  const [amendmentReason, setAmendmentReason] = useState('إعادة تشغيل وتصحيح العينة بعد استبعاد التداخل اللوني المخبري');
  const [amendedNewValue, setAmendedNewValue] = useState('');
  const [authorName, setAuthorName] = useState('م. عاصم النجار (أخصائي كيمياء سريرية)');
  const [validationWarning, setValidationWarning] = useState<string | null>(null);

  // Synchronize state when accession or modal state changes to prevent context leaks
  useEffect(() => {
    if (isOpen) {
      setTests(accession.tests);
      setSelectedTestIdForAmend(null);
      setSelectedTestIdForDisposition(null);
      setValidationWarning(null);
    }
  }, [accession.id, isOpen]);

  if (!isOpen) return null;

  const handleValueChange = (testId: string, val: string) => {
    setValidationWarning(null);
    setTests(prev =>
      prev.map(t => {
        if (t.id !== testId) return t;
        const trimmed = val.trim();

        // Strict Governance Invariant: Missing != Normal!
        if (trimmed === '') {
          return {
            ...t,
            numericValue: undefined,
            textValue: undefined,
            flag: undefined
          };
        }

        const num = parseFloat(trimmed);
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
          textValue: !isNum ? trimmed : undefined,
          flag
        };
      })
    );
  };

  const handleApplyTechnicalVerification = () => {
    // Check for missing values in non-cancelled tests
    const missingTests = tests.filter(
      t => t.status !== 'cancelled' && t.numericValue === undefined && !t.textValue
    );

    if (missingTests.length > 0) {
      setValidationWarning(
        `تعذر الاعتماد الفني: يوجد (${missingTests.length}) فحص بدون نتيجة مسجلة: [${missingTests
          .map(m => m.testNameAr)
          .join('، ')}]. يجب إدخال النتائج أو تسجيل استبعاد/إلغاء فردي معتمد (تداخل عيني/QNS). المفقود لا يعامل كطبيعي.`
      );
      return;
    }

    const verifiedTests: TestResultItem[] = tests.map(t => {
      if (t.status === 'cancelled') return t;
      return {
        ...t,
        status: 'technically_verified',
        technicallyVerifiedBy: authorName,
        technicallyVerifiedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
      };
    });

    const updated: LabAccession = {
      ...accession,
      status: 'awaiting_clinical_val',
      tests: verifiedTests
    };

    onSaveResults(updated);
    // Check if any active test is critical
    const hasCritical = verifiedTests.some(
      t => t.status !== 'cancelled' && (t.flag === 'critical_high' || t.flag === 'critical_low')
    );
    if (hasCritical) {
      onOpenCriticalModal(updated);
    }
    onClose();
  };

  const handleExecuteDisposition = (testId: string) => {
    setTests(prev =>
      prev.map(t => {
        if (t.id !== testId) return t;
        return {
          ...t,
          status: 'cancelled',
          flag: undefined,
          numericValue: undefined,
          textValue: 'غير منجز / ملغى جزئياً',
          dispositionReason,
          dispositionClinicalNote: dispositionClinicalNote || dispositionReason
        };
      })
    );
    setSelectedTestIdForDisposition(null);
    setValidationWarning(null);
  };

  const handleRestoreTest = (testId: string) => {
    setTests(prev =>
      prev.map(t => {
        if (t.id !== testId) return t;
        return {
          ...t,
          status: 'received',
          flag: undefined,
          numericValue: undefined,
          textValue: undefined,
          dispositionReason: undefined,
          dispositionClinicalNote: undefined
        };
      })
    );
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
  const activeDispositionTest = tests.find(t => t.id === selectedTestIdForDisposition);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-5xl w-full p-6 space-y-5 text-right font-['Cairo',sans-serif] max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                تسجيل ومراجعة واعتماد النتائج المخبرية (Technical Result Verification Workbench)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                إدخال النتائج، التدقيق الفني، مطابقة المعدلات المرجعية والدلتا، والحوكمة الصارمة للقيم المفقودة.
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

        {/* Semantic Governance Invariant */}
        <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>محدد الحوكمة الإلزامي:</strong> النتيجة المفقودة ≠ صفر، النتيجة المفقودة ≠ طبيعية، المعلقة ≠ نهائية. لا يجوز اعتماد أي فحص فارغ كـ (طبيعي) بصمت، ويسمح بإلغاء فحص فردي متأثر بتداخل العينة دون إلغاء باقي الفحوصات الصالحة.
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold bg-amber-200/60 px-2 py-0.5 rounded text-amber-800">
            {accession.accessionNumber}
          </span>
        </div>

        {/* Validation Warning if attempted verification with missing data */}
        {validationWarning && (
          <div className="p-3 bg-red-50 border-2 border-red-300 rounded-xl flex items-center gap-2 text-xs text-red-900">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <span className="font-bold">{validationWarning}</span>
          </div>
        )}

        {/* Accession Context Header */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-4 gap-3 text-xs">
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
                <th className="p-2.5 text-center">إجراءات الفحص الفردي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {tests.map(test => {
                const isCritical = test.flag === 'critical_high' || test.flag === 'critical_low';
                const isAbnormal = test.flag === 'abnormal_high' || test.flag === 'abnormal_low';
                const isCancelled = test.status === 'cancelled';
                const isMissing = !isCancelled && test.numericValue === undefined && !test.textValue;

                return (
                  <tr
                    key={test.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      isCancelled
                        ? 'bg-slate-100/70 text-slate-400'
                        : isCritical
                        ? 'bg-red-50/70'
                        : isAbnormal
                        ? 'bg-amber-50/40'
                        : ''
                    }`}
                  >
                    <td className="p-2.5">
                      <div className={`font-bold ${isCancelled ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                        {test.testNameAr}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">{test.testCode}</div>
                      {isCancelled && test.dispositionReason && (
                        <div className="text-[10px] text-red-700 font-sans mt-0.5">
                          سبب الاستبعاد: {test.dispositionReason}
                        </div>
                      )}
                    </td>
                    <td className="p-2.5">
                      {isCancelled ? (
                        <span className="font-mono text-slate-500 italic bg-slate-200 px-2 py-0.5 rounded text-[11px]">
                          غير منجز (Cancelled)
                        </span>
                      ) : (
                        <input
                          type="text"
                          value={test.numericValue !== undefined ? test.numericValue : test.textValue || ''}
                          onChange={e => handleValueChange(test.id, e.target.value)}
                          placeholder="أدخل النتيجة..."
                          className={`w-28 px-2.5 py-1 rounded-lg border font-mono font-bold text-xs ${
                            isCritical
                              ? 'border-red-500 bg-red-100/60 text-red-900 focus:ring-red-500'
                              : isAbnormal
                              ? 'border-amber-400 bg-amber-50 text-amber-900'
                              : isMissing
                              ? 'border-slate-300 bg-white placeholder:text-slate-400 text-slate-900'
                              : 'border-slate-300 bg-white text-slate-900'
                          }`}
                        />
                      )}
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
                      {isCancelled ? (
                        <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold text-[10px] inline-flex items-center gap-1">
                          <Ban className="w-3 h-3 text-slate-500" />
                          <span>مستبعد/ملغى</span>
                        </span>
                      ) : isCritical ? (
                        <span className="px-2 py-0.5 rounded bg-red-600 text-white font-black text-[10px] inline-flex items-center gap-1 animate-pulse">
                          <AlertTriangle className="w-3 h-3" />
                          <span>قيمة حرجة (Critical)</span>
                        </span>
                      ) : isAbnormal ? (
                        <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-bold text-[10px]">
                          غير طبيعي (Abnormal)
                        </span>
                      ) : test.numericValue !== undefined || test.textValue ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          طبيعي (Normal)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-300 font-medium text-[10px]">
                          قيد الإدخال / غير متوفر (Pending)
                        </span>
                      )}
                    </td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono text-[10px]">
                        {test.status} (v{test.version})
                      </span>
                    </td>
                    <td className="p-2.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {!isCancelled ? (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedTestIdForAmend(test.id);
                                setSelectedTestIdForDisposition(null);
                                setAmendedNewValue(
                                  test.numericValue !== undefined ? `${test.numericValue}` : test.textValue || ''
                                );
                              }}
                              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                              title="تصحيح أو تعديل النتيجة مع حفظ السجل التاريخي"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>تعديل</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedTestIdForDisposition(test.id);
                                setSelectedTestIdForAmend(null);
                              }}
                              className="px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer border border-red-200"
                              title="استبعاد هذا الفحص تحديداً بسبب تداخل العينة دون إلغاء باقي الفحوصات"
                            >
                              <Ban className="w-3 h-3 text-red-600" />
                              <span>استبعاد فحص</span>
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRestoreTest(test.id)}
                            className="px-2 py-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer border border-teal-200"
                            title="إعادة تفعيل الفحص للتحليل"
                          >
                            <RotateCcw className="w-3 h-3 text-teal-600" />
                            <span>استعادة الفحص</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Individual Test Disposition Panel */}
        {activeDispositionTest && (
          <div className="p-4 bg-red-50 rounded-xl border border-red-300 space-y-3">
            <div className="flex items-center justify-between border-b border-red-200 pb-2">
              <div className="flex items-center gap-2 font-bold text-red-900 text-xs">
                <Ban className="w-4 h-4 text-red-700" />
                <span>
                  معالجة واستبعاد فحص فردي (Individual Test Disposition Protocol) — {activeDispositionTest.testNameAr}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTestIdForDisposition(null)}
                className="text-slate-500 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-red-800 leading-relaxed">
              <strong>قاعدة المعالجة الجزئية:</strong> استبعاد هذا الفحص فقط لوجود مانع فني أو تداخل لوني دون إلغاء الطلب الأصلي أو الفحوصات الأخرى في نفس العينة الصالحة للقياس.
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">سبب الاستبعاد المعتمد (Disposition Reason):</label>
                <select
                  value={dispositionReason}
                  onChange={e => setDispositionReason(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-red-300 rounded-lg text-xs text-slate-800"
                >
                  <option value="انحلال العينة يؤثر على دقة قياس هذا الفحص (Gross Hemolysis Interference)">
                    انحلال العينة يؤثر على هذا الفحص تحديداً (Hemolysis - e.g. Potassium)
                  </option>
                  <option value="عكارة شحمية تمنع القياس البصري الموثوق (Gross Lipemia Optical Interference)">
                    عكارة شحمية شديدة تمنع القياس البصري (Lipemic Interference)
                  </option>
                  <option value="كمية العينة غير كافية لإجراء هذا الفحص الإضافي (QNS for this specific test)">
                    كمية العينة غير كافية لهذا الفحص (QNS for this specific test)
                  </option>
                  <option value="انسداد بمسبار سحب الجهاز أثناء هذا التحليل (Analyzer Probe Aspiration Error)">
                    خلل سحب مسبار الجهاز أثناء التحليل (Aspiration Error)
                  </option>
                  <option value="إلغاء سريري بناء على توجيه استشاري القسم (Clinician Consulted Cancellation)">
                    إلغاء سريري معتمد من الطبيب (Clinician Request)
                  </option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">ملاحظة سريرية وتوجيه إضافي (Clinical Note):</label>
                <input
                  type="text"
                  value={dispositionClinicalNote}
                  onChange={e => setDispositionClinicalNote(e.target.value)}
                  placeholder="مثال: يرجى إعادة سحب أنبوب منفصل للبوتاسيوم، باقي الفحوصات معتمدة."
                  className="w-full px-3 py-1.5 bg-white border border-red-300 rounded-lg text-xs text-slate-800"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSelectedTestIdForDisposition(null)}
                className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => handleExecuteDisposition(activeDispositionTest.id)}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>اعتماد استبعاد الفحص مع إبقاء باقي الفحوصات</span>
              </button>
            </div>
          </div>
        )}

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
                    <span>الإصدار v{h.version}: <strong>{h.value} {activeAmendingTest.unit}</strong> ({h.flag || 'بدون تصنيف'})</span>
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
                <span>توثيق الاتصال بالقيمة الحرجة (Critical Result Protocol)</span>
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
