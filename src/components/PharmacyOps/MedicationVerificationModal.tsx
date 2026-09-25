import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Info,
  Pill,
  Clock,
  User,
  Activity,
  ArrowRightLeft,
  FileCheck,
  Building2,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { MedicationOrderContext, VerificationDecision, SubstitutionOption } from '../../types/pharmacyOps';

interface MedicationVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: MedicationOrderContext | null;
  onConfirmVerification: (orderId: string, decision: VerificationDecision, note?: string) => void;
  onOpenClarification: (order: MedicationOrderContext) => void;
  onNavigateToAxis8?: (patientId: string) => void;
}

export const MedicationVerificationModal: React.FC<MedicationVerificationModalProps> = ({
  isOpen,
  onClose,
  order,
  onConfirmVerification,
  onOpenClarification,
  onNavigateToAxis8
}) => {
  const [verificationNote, setVerificationNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [showSubstitutionPanel, setShowSubstitutionPanel] = useState(false);
  const [selectedAlternative, setSelectedAlternative] = useState<string | null>(null);

  if (!isOpen || !order) return null;

  // Mock available substitution options based on drug profile
  const mockSubstitutions: SubstitutionOption[] = [
    {
      id: 'sub-1',
      type: 'therapeutic_interchange',
      originalMedication: order.genericName,
      suggestedMedication: order.genericName.toLowerCase().includes('meropenem')
        ? 'Ertapenem 1g IV Once Daily'
        : 'Cefepime 2g IV Q8H + Metronidazole 500mg IV Q8H',
      suggestedStrength: 'حسب البروتوكول',
      suggestedRoute: 'IV Infusion',
      formularyStatus: 'formulary',
      stockStatus: 'available',
      authorityRequirement: 'prescriber_approval_required',
      clinicalRationale: 'بديل علاجي معتمد في دليل المنشأة لحالات نقص المخزون أو ترشيد المضادات.'
    },
    {
      id: 'sub-2',
      type: 'generic_substitution',
      originalMedication: order.brandName,
      suggestedMedication: `${order.genericName} (مستحضر جنيس معتمد Bioequivalent)`,
      suggestedStrength: order.strength,
      suggestedRoute: order.route,
      formularyStatus: 'formulary',
      stockStatus: 'available',
      authorityRequirement: 'pharmacist_independent_authority',
      clinicalRationale: 'استبدال جنيس مكافئ حيوياً يقع ضمن صلاحيات الصيدلي المعتمدة بالمنشأة.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">مساحة التدقيق السريري للوصفات (Medication Verification Workspace)</h3>
                <span className="font-mono text-xs text-teal-300 bg-teal-950 px-2 py-0.5 rounded border border-teal-800">
                  {order.id}
                </span>
                {order.isHighAlert && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white uppercase tracking-wider">
                    High Alert
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                فحص الملاءمة السريرية للجرعة، التحسس، التداخلات، والتوافق مع الدليل الدوائي
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Semantic Integrity Banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 text-xs text-amber-900 flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-medium">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              مبدأ الفصل التشغيلي: اعتماد الصيدلي (Verification) يتيح التحضير والصرف ولا يعني إعطاء الدواء للمريض (Administration)؛ توثيق الإعطاء يتم حصراً في سجل التمريض (Axis 8 MAR).
            </span>
          </span>
          <span className="text-[11px] font-mono text-amber-800 shrink-0 hidden md:inline">
            Verification ≠ Administration
          </span>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Section 1: Patient Clinical Context */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-teal-600" />
                <span className="font-bold text-sm text-slate-900">{order.patientName}</span>
                <span className="font-mono text-xs text-slate-500">({order.mrn})</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 text-[11px]">
                <span>الموقع: <strong>{order.locationWardBed}</strong></span>
                <span>•</span>
                <span>العمر: <strong>{order.patientAge} سنة</strong></span>
                <span>•</span>
                <span>الوزن: <strong>{order.patientWeightKg ? `${order.patientWeightKg} كجم` : 'غير مسجل'}</strong></span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900">
                <div className="font-bold flex items-center gap-1 mb-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  <span>ملف الحساسية الموثقة:</span>
                </div>
                <p>{order.patientAllergies.length > 0 ? order.patientAllergies.join('، ') : 'لا توجد حساسية مسجلة'}</p>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <div className="font-bold text-slate-800 mb-1">وظائف الكلى والكبد (Lab Profile):</div>
                <div className="text-slate-600">
                  الكلى: {order.patientRenalStatus ? (
                    <strong>{order.patientRenalStatus}</strong>
                  ) : (
                    <span className="text-amber-700 font-bold">غير مسجل (غير متوفر)</span>
                  )}
                </div>
                <div className="text-slate-600">
                  الكبد: {order.patientHepaticStatus ? (
                    <strong>{order.patientHepaticStatus}</strong>
                  ) : (
                    <span className="text-amber-700 font-bold">غير مسجل (غير متوفر)</span>
                  )}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <div className="font-bold text-slate-800 mb-1">التشخيص السريري الرئيسي:</div>
                <p className="text-slate-600 line-clamp-2">{order.patientPrimaryDiagnosis || 'غير مسجل'}</p>
              </div>
            </div>
          </div>

          {/* Section 1.5: Order Versioning & Re-verification Check */}
          {(order.isSourceChanged || order.reverificationRequired) && (
            <div className="bg-rose-50 border border-rose-300 rounded-xl p-3.5 text-rose-950 flex items-start gap-3 animate-pulse">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-rose-900">
                    تنبيه حرج: تعديل طلب المصدر — الإصدار المعتمد سابقاً غير سارٍ (Outdated Verification / Re-verification Required)
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-rose-200 font-mono text-[10px] text-rose-900 font-bold">
                    Source: {order.sourceOrderVersion || 'v2.0'} vs Reviewed: {order.reviewedOrderVersion || 'v1.0'}
                  </span>
                </div>
                <p className="text-[11px] text-rose-800 leading-relaxed">
                  تم تعديل أو إلغاء هذا الطلب من قبل الطبيب المعالج بعد تدقيقه أو تحضيره سابقاً. لا يجوز صرف المستحضر بالاعتماد القديم.
                </p>
                {order.sourceChangeReason && (
                  <div className="text-[10px] bg-white/80 p-1.5 rounded border border-rose-200 font-mono text-rose-900">
                    <strong>سبب التعديل بالمصدر:</strong> {order.sourceChangeReason}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 2: Medication Order Specifications */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Pill className="w-4 h-4 text-teal-600" />
                <span>تفاصيل المستحضر المطلوب من الطبيب (Axis 6 Source Order)</span>
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  إصدار الطلب: {order.sourceOrderVersion || 'v1.0'}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase font-mono ${
                  order.priority === 'stat'
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : order.priority === 'urgent'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  {order.priority}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div>
                <span className="text-slate-500 block text-[10px]">الاسم التجاري والعلمي:</span>
                <span className="font-bold text-slate-900 text-xs">{order.brandName}</span>
                <div className="mt-0.5">
                  {order.isTallMan ? (
                    <span className="font-mono text-xs font-bold text-teal-900 bg-amber-100 px-1 py-0.2 rounded border border-amber-300">
                      {order.tallManName || order.genericName}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-600 font-mono">{order.genericName}</span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">الجرعة والشكل:</span>
                <span className="font-bold text-slate-900 text-xs">{order.orderedDose}</span>
                <span className="block text-[10px] text-slate-500">{order.strength} • {order.dosageForm}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">طريقة الإعطاء والتكرار:</span>
                <span className="font-bold text-slate-900 text-xs">{order.route}</span>
                <span className="block text-[10px] text-slate-500">{order.frequency}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">الكمية الإجمالية والمدة:</span>
                <span className="font-bold text-slate-900 text-xs">{order.totalQuantityOrdered} {order.quantityUnit}</span>
                <span className="block text-[10px] text-slate-500">{order.durationDays ? `لمدة ${order.durationDays} أيام` : 'مستمر'}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-600 gap-2 pt-1">
              <div><strong>دواعي الوصف السريرية:</strong> {order.clinicalIndication}</div>
              <div><strong>الطبيب الواصف:</strong> {order.prescriberName} ({order.prescriberDepartment})</div>
            </div>
          </div>

          {/* Section 3: Clinical Review & Mock CDSS Alerts */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>مخرجات الفحص الدوائي الآلي والسياسات (Clinical Review & Policy Alerts):</span>
              </h4>
              <span className="text-[10px] text-slate-400">تنبيهات محاكاة (Mock Outcomes Only)</span>
            </div>

            {order.alerts && order.alerts.length > 0 ? (
              <div className="space-y-2">
                {order.alerts.map(alert => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-xl border flex items-start gap-3 ${
                      alert.severity === 'high_attention'
                        ? 'bg-rose-50 border-rose-200 text-rose-950'
                        : alert.severity === 'warning'
                        ? 'bg-amber-50 border-amber-200 text-amber-950'
                        : 'bg-blue-50 border-blue-200 text-blue-950'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {alert.severity === 'high_attention' ? (
                        <ShieldAlert className="w-4 h-4 text-rose-600" />
                      ) : alert.severity === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                      ) : (
                        <Info className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">{alert.titleAr}</span>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.2 rounded ${
                          alert.severity === 'high_attention'
                            ? 'bg-rose-200 text-rose-900'
                            : alert.severity === 'warning'
                            ? 'bg-amber-200 text-amber-900'
                            : 'bg-blue-200 text-blue-900'
                        }`}>
                          {alert.severity === 'high_attention' ? 'عالي الأهمية' : alert.severity === 'warning' ? 'تحذير' : 'إرشادي'}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] leading-relaxed opacity-90">{alert.detailAr}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>لم تظهر أي تعارضات تحسسية أو تداخلات دوائية حرجة مسجلة في ملف المريض.</span>
              </div>
            )}
          </div>

          {/* Section 4: Substitution / Therapeutic Interchange Drawer */}
          <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 text-xs">خيارات الاستبدال والبدائل الدوائية (Therapeutic Interchange):</span>
                <p className="text-[10px] text-slate-500">
                  أي بديل مقترح يتطلب موافقة وتعديل طلب الطبيب بالمصدر، ولا يُستبدل تلقائياً (Suggested ≠ Auto-substitution).
                </p>
              </div>
              <button
                onClick={() => setShowSubstitutionPanel(!showSubstitutionPanel)}
                className="px-3 py-1 rounded-lg text-xs font-bold text-teal-700 hover:bg-teal-50 border border-teal-300 flex items-center gap-1 cursor-pointer"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>{showSubstitutionPanel ? 'إخفاء البدائل' : 'استعراض البدائل المتاحة'}</span>
              </button>
            </div>

            {showSubstitutionPanel && (
              <div className="mt-3 space-y-2 pt-3 border-t border-slate-200">
                {mockSubstitutions.map(sub => (
                  <div
                    key={sub.id}
                    onClick={() => setSelectedAlternative(sub.suggestedMedication)}
                    className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                      selectedAlternative === sub.suggestedMedication
                        ? 'bg-teal-50 border-teal-500 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{sub.suggestedMedication}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {sub.authorityRequirement === 'pharmacist_independent_authority'
                          ? 'صلاحية صيدلانية مباشرة'
                          : 'يتطلب موافقة الطبيب الواصف'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1">{sub.clinicalRationale}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 5: Pharmacist Clinical Note Input */}
          {showNoteInput && (
            <div className="space-y-1.5 animate-in fade-in">
              <label className="font-bold text-slate-800 text-xs block">ملاحظة الصيدلي السريري المرفقة بالاعتماد:</label>
              <textarea
                value={verificationNote}
                onChange={e => setVerificationNote(e.target.value)}
                placeholder="أدخل أي توصيات صيدلانية أو متابعات سريرية خاصة بالجرعة أو الفحوصات الدورية..."
                rows={3}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenClarification(order)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>طلب استيضاح / تدخل صيدلاني</span>
            </button>
            <button
              onClick={() => setShowNoteInput(!showNoteInput)}
              className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
            >
              {showNoteInput ? 'إلغاء الملاحظة' : 'إضافة ملاحظة صيدلانية'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={() => {
                onConfirmVerification(
                  order.id,
                  verificationNote.trim() ? 'verified_with_note' : 'verified',
                  verificationNote.trim() || undefined
                );
                onClose();
              }}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>اعتماد الوصفة سريرياً (Verify Medication)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
