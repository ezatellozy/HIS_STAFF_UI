import React, { useState } from 'react';
import {
  HandHygieneAuditSession,
  CareBundleAuditItem,
  ClinicalSafetyTracer,
  HandHygieneMoment,
  HandHygieneAction,
  QpsPersona,
  QpsActivityLog
} from '../../../types/qualitySafetyOps';
import {
  calculateHandHygieneRate,
  evaluateBundleCompliance
} from '../../../utils/qualitySafetyEngine';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Building,
  UserCheck,
  ClipboardList,
  Plus,
  Search,
  Filter,
  Layers,
  Info,
  Calendar,
  AlertTriangle
} from 'lucide-react';

interface Props {
  handHygieneAudits: HandHygieneAuditSession[];
  setHandHygieneAudits: React.Dispatch<React.SetStateAction<HandHygieneAuditSession[]>>;
  bundleAudits: CareBundleAuditItem[];
  setBundleAudits: React.Dispatch<React.SetStateAction<CareBundleAuditItem[]>>;
  tracers: ClinicalSafetyTracer[];
  activePersona: QpsPersona;
  onAddActivityLog: (log: QpsActivityLog) => void;
}

export const SafetyAuditBundleWorkspace: React.FC<Props> = ({
  handHygieneAudits,
  setHandHygieneAudits,
  bundleAudits,
  setBundleAudits,
  tracers,
  activePersona,
  onAddActivityLog
}) => {
  const [activeTab, setActiveTab] = useState<'hand_hygiene' | 'bundles' | 'tracers'>('hand_hygiene');

  // Hand hygiene filters
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [showNewHhModal, setShowNewHhModal] = useState(false);

  // New Hand Hygiene Session state
  const [newHhDept, setNewHhDept] = useState('العناية المركزة (ICU)');
  const [newHhRole, setNewHhRole] = useState<'physician' | 'nurse' | 'allied_health' | 'housekeeping'>('nurse');
  const [newHhMoment, setNewHhMoment] = useState<HandHygieneMoment>('moment_1_before_patient');
  const [newHhAction, setNewHhAction] = useState<HandHygieneAction>('handrub_alcohol');
  const [newHhNotes, setNewHhNotes] = useState('');

  // Overall compliance calculations
  const overallRate = calculateHandHygieneRate(handHygieneAudits, deptFilter);

  const getMomentLabel = (m: HandHygieneMoment) => {
    switch (m) {
      case 'moment_1_before_patient':
        return '1: قبل ملامسة المريض';
      case 'moment_2_before_aseptic':
        return '2: قبل إجراء تطهيري/معقم';
      case 'moment_3_after_body_fluid':
        return '3: بعد التعرض لسوائل الجسم';
      case 'moment_4_after_patient':
        return '4: بعد ملامسة المريض';
      case 'moment_5_after_surroundings':
      default:
        return '5: بعد ملامسة محيط وبيئة المريض';
    }
  };

  const getActionLabel = (a: HandHygieneAction) => {
    switch (a) {
      case 'handrub_alcohol':
        return { text: 'تطهير كحولي لليدين', compliant: true };
      case 'handwash_soap_water':
        return { text: 'غسيل بالماء والصابون', compliant: true };
      case 'missed_opportunity':
        return { text: 'فرصة مهملة (لم يتم التطهير)', compliant: false };
      case 'gloves_without_hygiene':
      default:
        return { text: 'ارتداء قفازات دون تطهير الأيدي', compliant: false };
    }
  };

  const handleAddHhAudit = (e: React.FormEvent) => {
    e.preventDefault();
    const actionInfo = getActionLabel(newHhAction);

    const newAudit: HandHygieneAuditSession = {
      id: `hha-${Date.now()}`,
      auditDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      auditorName: `${activePersona.name} (${activePersona.roleTitleAr})`,
      department: newHhDept,
      professionalCategory: newHhRole,
      moment: newHhMoment,
      actionTaken: newHhAction,
      isCompliant: actionInfo.compliant,
      notes: newHhNotes || undefined
    };

    setHandHygieneAudits(prev => [newAudit, ...prev]);

    onAddActivityLog({
      id: `ACT-HH-${Date.now()}`,
      timestamp: newAudit.auditDate,
      actorName: activePersona.name,
      actorRole: activePersona.roleTitleAr,
      action: `تسجيل ملاحظة تدقيق نظافة الأيدي (${actionInfo.compliant ? 'مطابق' : 'غير مطابق'})`,
      domain: 'audit',
      referenceId: newAudit.id,
      details: `${newHhDept} • ${getMomentLabel(newHhMoment)} • النتيجة: ${actionInfo.text}`
    });

    setShowNewHhModal(false);
    setNewHhNotes('');
  };

  return (
    <div className="space-y-4">
      {/* 1. Header Navigation */}
      <div className="bg-white rounded-3xl border border-slate-200 p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('hand_hygiene')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'hand_hygiene'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>نظافة الأيدي (WHO 5 Moments Audits)</span>
          </button>

          <button
            onClick={() => setActiveTab('bundles')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'bundles'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>حزم الرعاية السريرية (Care Bundles All-or-Nothing)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900/40 text-white font-mono">
              {bundleAudits.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('tracers')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'tracers'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>جولات التتبع والمسح السريري (Clinical Tracers)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900/40 text-white font-mono">
              {tracers.length}
            </span>
          </button>
        </div>

        {activeTab === 'hand_hygiene' && (
          <button
            onClick={() => setShowNewHhModal(true)}
            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>تسجيل ملاحظة نظافة أيدي</span>
          </button>
        )}
      </div>

      {/* 2. TAB: Hand Hygiene Audits */}
      {activeTab === 'hand_hygiene' && (
        <div className="space-y-4">
          {/* Rate Summary Card */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs">
              <div className="text-[11px] font-bold text-slate-500">نسبة الامتثال لنظافة الأيدي:</div>
              <div className="text-3xl font-black text-teal-700 font-mono mt-1">
                {typeof overallRate.complianceRatePercent === 'number'
                  ? `${overallRate.complianceRatePercent}%`
                  : 'غير متاح (0 ملاحظة)'}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                {overallRate.compliantCount} مطابق من أصل {overallRate.totalObserved} فرصة
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs">
              <div className="text-[11px] font-bold text-slate-500">المستهدف الوطني لسباهي:</div>
              <div className="text-3xl font-black text-slate-800 font-mono mt-1">90%</div>
              <div className="text-[10px] text-emerald-600 font-bold mt-1">معيار CBAHI IPC-08</div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs sm:col-span-2 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">تصفية بحسب القسم والوحدة:</span>
                <select
                  value={deptFilter}
                  onChange={e => setDeptFilter(e.target.value)}
                  className="bg-slate-50 text-slate-800 text-xs font-bold py-1 px-3 rounded-xl border border-slate-200 focus:outline-hidden"
                >
                  <option value="all">جميع الأقسام والمستشفى ككل</option>
                  <option value="العناية المركزة (ICU)">العناية المركزة (ICU)</option>
                  <option value="جناح التنويم الباطني 3A">جناح التنويم الباطني 3A</option>
                  <option value="جناح التنويم الجراحي 3B">جناح التنويم الجراحي 3B</option>
                  <option value="طوارئ الكبار (ER)">طوارئ الكبار (ER)</option>
                </select>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                التدقيق المباشر السري عبر مراقبي مكافحة العدوى وسفراء السلامة، مع رصد لحظات منظمة الصحة العالمية الخمس.
              </p>
            </div>
          </div>

          {/* Audit Observations Table */}
          <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs space-y-2">
            <h3 className="text-xs font-bold text-slate-800 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>سجل ملاحظات نظافة الأيدي الميدانية (Audit Sessions Log):</span>
              <span className="text-[10px] text-slate-400 font-mono">{handHygieneAudits.length} ملاحظة مسجلة</span>
            </h3>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-right">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-[10px]">
                    <th className="py-2">التوقيت والمراقب</th>
                    <th>القسم / الوحدة</th>
                    <th>الفئة المهنية</th>
                    <th>لحظة نظافة الأيدي (WHO Moment)</th>
                    <th>الإجراء المتخذ</th>
                    <th>النتيجة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {handHygieneAudits.map(audit => {
                    const actionInfo = getActionLabel(audit.actionTaken);
                    return (
                      <tr key={audit.id} className="hover:bg-slate-50/60">
                        <td className="py-2.5">
                          <div className="font-bold text-slate-800">{audit.auditDate}</div>
                          <div className="text-[10px] text-slate-400">{audit.auditorName}</div>
                        </td>
                        <td className="font-semibold text-slate-800">{audit.department}</td>
                        <td className="font-medium text-slate-700">
                          {audit.professionalCategory === 'physician'
                            ? 'طبيب'
                            : audit.professionalCategory === 'nurse'
                            ? 'تمريض'
                            : audit.professionalCategory === 'housekeeping'
                            ? 'خدمات نظافة'
                            : 'مهن صحية مساندة'}
                        </td>
                        <td className="text-slate-700">{getMomentLabel(audit.moment)}</td>
                        <td className="font-mono text-slate-800">{actionInfo.text}</td>
                        <td>
                          {audit.isCompliant ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>مطابق</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-700 font-bold bg-red-50 px-2 py-0.5 rounded-full border border-red-200 text-[10px]">
                              <XCircle className="w-3 h-3 text-red-600" />
                              <span>غير مطابق</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. TAB: Care Bundles All-or-Nothing */}
      {activeTab === 'bundles' && (
        <div className="space-y-3">
          <div className="bg-slate-900 text-slate-200 rounded-3xl p-4 text-xs space-y-1">
            <div className="font-bold text-amber-400 flex items-center gap-1.5">
              <Info className="w-4 h-4" />
              <span>مبدأ الكل أو لا شيء في حزم الرعاية (All-or-Nothing Rule):</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              وفق معايير مكافحة العدوى، لا تُعتبر حزمة الرعاية الوقائية مكتملة ومطابقة بنسبة 100% إلا إذا تم استيفاء جميع بنود قائمة التحقق دون أي استثناء. أي إخفاق في بند واحد يجعل الحزمة غير مكتملة (Non-Compliant).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {bundleAudits.map(b => (
              <div
                key={b.id}
                className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 font-mono">
                    {b.bundleType === 'clabsi_insertion'
                      ? 'حزمة تركيب القسطرة المركزية'
                      : b.bundleType === 'cauti_maintenance'
                      ? 'حزمة صيانة القسطرة البولية'
                      : 'حزمة الوقاية من التهاب الرئة VAP'}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      b.allElementsCompliant
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {b.allElementsCompliant ? 'مكتملة 100%' : `${b.compliancePercent}% (غير مكتملة)`}
                  </span>
                </div>

                <div className="text-xs text-slate-500">
                  المريض: <strong className="text-slate-800">{b.patientMrn}</strong> • {b.unit}
                </div>

                {/* Checklist items */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                  {b.checklistElements.map(el => (
                    <div
                      key={el.elementKey}
                      className="flex items-start gap-1.5 text-[11px]"
                    >
                      {el.compliant ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                      )}
                      <span className={el.compliant ? 'text-slate-700' : 'text-red-700 font-semibold'}>
                        {el.elementTextAr}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span>المدقق: {b.auditor}</span>
                  <span>{b.auditDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. TAB: Clinical Safety Tracers */}
      {activeTab === 'tracers' && (
        <div className="space-y-3">
          {tracers.map(tracer => (
            <div
              key={tracer.id}
              className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {tracer.tracerType === 'medication_management'
                      ? 'جولة التتبع السريري لإدارة وسلامة الأدوية الحساسة (Medication Safety Tracer)'
                      : 'جولة التتبع السريري للسلامة البيئية والتعقيم (Infection Control Tracer)'}
                  </h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    الوحدة: <strong className="text-slate-800">{tracer.unit}</strong> • المسّاح: {tracer.surveyor} • التاريخ: {tracer.tracerDate}
                  </div>
                </div>

                <div className="text-left">
                  <div className="text-[10px] text-slate-400">درجة الامتثال الكلية:</div>
                  <div className="text-xl font-black text-teal-700 font-mono">{tracer.scorePercent}%</div>
                </div>
              </div>

              <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-200">
                {tracer.findingsSummary}
              </div>

              {/* Non-compliant findings */}
              <div className="space-y-1.5 text-xs">
                <div className="font-bold text-red-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                  <span>نقاط عدم المطابقة المرصودة:</span>
                </div>
                <div className="space-y-1 text-[11px] text-slate-700">
                  {tracer.nonCompliantPoints.map((pt, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 p-2 rounded-xl bg-red-50/50 border border-red-200 text-red-900">
                      <span className="font-bold">•</span>
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Immediate remediation */}
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                <strong>الإجراء التصحيحي الفوري أثناء الجولة:</strong> {tracer.immediateRemediation}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. Modal: Add Hand Hygiene Audit */}
      {showNewHhModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-5 shadow-2xl text-right max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-teal-800 font-bold text-sm">
                <Plus className="w-4 h-4 text-teal-600" />
                <span>رصد ملاحظة نظافة أيدي ميدانية</span>
              </div>
              <button
                onClick={() => setShowNewHhModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddHhAudit} className="space-y-3 mt-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">القسم / الوحدة المرصودة:</label>
                <select
                  value={newHhDept}
                  onChange={e => setNewHhDept(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  <option value="العناية المركزة (ICU)">العناية المركزة (ICU)</option>
                  <option value="جناح التنويم الباطني 3A">جناح التنويم الباطني 3A</option>
                  <option value="جناح التنويم الجراحي 3B">جناح التنويم الجراحي 3B</option>
                  <option value="طوارئ الكبار (ER)">طوارئ الكبار (ER)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">الفئة المهنية للممارس الملاحظ:</label>
                <select
                  value={newHhRole}
                  onChange={e => setNewHhRole(e.target.value as any)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  <option value="physician">طبيب</option>
                  <option value="nurse">تمريض</option>
                  <option value="allied_health">مهن صحية مساندة</option>
                  <option value="housekeeping">خدمات نظافة وبيئة</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">لحظة نظافة الأيدي (WHO 5 Moments):</label>
                <select
                  value={newHhMoment}
                  onChange={e => setNewHhMoment(e.target.value as HandHygieneMoment)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  <option value="moment_1_before_patient">1: قبل ملامسة المريض</option>
                  <option value="moment_2_before_aseptic">2: قبل إجراء تطهيري أو معقم</option>
                  <option value="moment_3_after_body_fluid">3: بعد التعرض لمخاطر سوائل الجسم</option>
                  <option value="moment_4_after_patient">4: بعد ملامسة المريض</option>
                  <option value="moment_5_after_surroundings">5: بعد ملامسة محيط وبيئة المريض</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">الإجراء المتخذ من الممارس:</label>
                <select
                  value={newHhAction}
                  onChange={e => setNewHhAction(e.target.value as HandHygieneAction)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  <option value="handrub_alcohol">تطهير كحولي لليدين (مطابق)</option>
                  <option value="handwash_soap_water">غسيل بالماء والصابون (مطابق)</option>
                  <option value="missed_opportunity">فرصة مهملة - لم يتم التطهير (غير مطابق)</option>
                  <option value="gloves_without_hygiene">ارتداء قفازات دون تطهير الأيدي (غير مطابق)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">ملاحظات إضافية (اختياري):</label>
                <input
                  type="text"
                  placeholder="مثال: تم التطهير بفرك كامل اليدين 20 ثانية..."
                  value={newHhNotes}
                  onChange={e => setNewHhNotes(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewHhModal(false)}
                  className="px-4 py-1.5 bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  حفظ الملاحظة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
