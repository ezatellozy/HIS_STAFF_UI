import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  Search,
  CheckCircle2,
  Clock,
  FlaskConical,
  Droplet,
  User,
  FileText,
  Activity,
  Check,
  Info,
  Phone,
  Radio,
  Share2,
  History,
  Lock,
  Layers
} from 'lucide-react';
import {
  TransfusionReactionCase,
  ReactionSeverity,
  ReactionTypeSuspected,
  HaemovigilanceImputabilityScore,
  LookbackInvestigationRecord,
  ReactionCommunicationLog
} from '../../types/bloodBankOps';
import { MOCK_LOOKBACK_INVESTIGATIONS } from '../../data/mockBloodBankOpsData';

interface TransfusionReactionsViewProps {
  cases: TransfusionReactionCase[];
  onUpdateCase: (updatedCase: TransfusionReactionCase) => void;
}

export const TransfusionReactionsView: React.FC<TransfusionReactionsViewProps> = ({
  cases,
  onUpdateCase
}) => {
  const [activeTab, setActiveTab] = useState<'reactions' | 'lookback' | 'communications'>('reactions');
  const [activeCaseId, setActiveCaseId] = useState<string>(cases[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [lookbackRecords, setLookbackRecords] = useState<LookbackInvestigationRecord[]>(MOCK_LOOKBACK_INVESTIGATIONS);

  const currentCase = cases.find(c => c.id === activeCaseId) || cases[0];

  const handleUpdateInvestigation = (key: keyof TransfusionReactionCase, value: any) => {
    if (!currentCase) return;
    const updated = { ...currentCase, [key]: value };
    onUpdateCase(updated);
  };

  if (!currentCase && activeTab === 'reactions') {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
        <AlertTriangle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
        <p className="text-slate-600 font-bold">لا توجد حالات اشتباه تفاعل نقل دم مسجلة</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-right">
      {/* Top Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                اليقظة الدموية وتوثيق سببية التفاعلات والتتبع الاستعادي (GAP-03 Imputability & GAP-07 Lookback)
              </h2>
              <p className="text-xs text-slate-500">
                التحقيق في تفاعلات نقل الدم، توثيق درجة السببية (Imputability - GAP-03)، والتتبع الاستعادي وسحب المشتقات (Lookback & Recall - GAP-07)
              </p>
            </div>
          </div>

          {activeTab === 'reactions' && (
            <div className="flex items-center gap-2">
              {cases.map(c => (
                <button
                  key={c.id}
                  onClick={() => setActiveCaseId(c.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeCaseId === c.id
                      ? 'bg-rose-600 text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>{c.id}</span>
                  <span className="mr-1 text-[10px] opacity-85">({c.patientName.split(' ')[0]})</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={() => setActiveTab('reactions')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'reactions' ? 'bg-rose-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            التحقيق في التفاعلات ودرجة السببية (Imputability - GAP-03) ({cases.length})
          </button>
          <button
            onClick={() => setActiveTab('lookback')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'lookback' ? 'bg-slate-900 text-white shadow-xs' : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>التتبع الاستعادي وسحب المشتقات (Lookback & Recall - GAP-07)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-900 text-[10px] font-mono font-bold">
              {lookbackRecords.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('communications')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'communications' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>سجل التواصل السريري العاجل (B28)</span>
          </button>
        </div>
      </div>

      {/* TAB 1: ACUTE REACTIONS & IMPUTABILITY */}
      {activeTab === 'reactions' && currentCase && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left 2 Cols: Clinical Report & Lab Steps */}
          <div className="lg:col-span-2 space-y-4">
            {/* Clinical Alert Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900 text-xs">{currentCase.id}</span>
                  <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px]">
                    {currentCase.suspectedType === 'acute_hemolytic' ? 'اشتباه تفاعل انحلالي حاد (Acute Hemolytic)' :
                     currentCase.suspectedType === 'febrile_non_hemolytic' ? 'تفاعل حموي غير انحلالي' : 'تفاعل تحسسي'}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">ساعة البلاغ: {currentCase.reportedAt}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                <div>
                  <span className="text-slate-500 block">المريض والموقع:</span>
                  <span className="font-bold text-slate-900">{currentCase.patientName}</span>
                  <div className="font-mono text-slate-600">MRN: {currentCase.patientMrn} • {currentCase.locationWardBed}</div>
                </div>

                <div>
                  <span className="text-slate-500 block">الوحدة محل التفاعل:</span>
                  <span className="font-mono font-bold text-red-700">{currentCase.unitNumber}</span>
                  <div className="text-slate-600 font-medium">كريات دم حمراء مكدسة (PRBCs)</div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-700 font-bold text-xs block mb-1">الأعراض السريرية المبلغة من الجناح/العناية:</span>
                <ul className="list-disc list-inside space-y-1 text-slate-700 text-xs">
                  {currentCase.clinicalSymptoms.map((sym, idx) => (
                    <li key={idx}>{sym}</li>
                  ))}
                </ul>
                <div className="mt-2 text-[11px] text-rose-800 font-bold flex items-center gap-1.5 pt-2 border-t border-slate-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>الإجراء السريري الفوري المتخذ: تم إيقاف نقل الدم فوراً وإبقاء الوريد مفتوحاً بمحلول ملحي.</span>
                </div>
              </div>
            </div>

            {/* Investigation Step 1: Clerical Check */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-bold text-slate-900 text-xs">1. التدقيق الكتابي الإلزامي (Clerical Check)</h3>
                <span className="text-[11px] text-slate-500">فحص مطابقة بيانات المريض والوحدة وكافة السجلات</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-800 text-xs">
                    مطابقة الاسم، الرقم الطبي، كود الوحدة، والفصيلة بين طلب الصرف وملف المريض:
                  </div>
                  <p className="text-[11px] text-slate-500">{currentCase.clericalCheckNotes}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                  متطابق وسليم
                </span>
              </div>
            </div>

            {/* Investigation Step 2: Laboratory Findings (DAT, Hemolysis, Group) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-bold text-slate-900 text-xs">2. الفحوصات المخبرية للتفاعل (Laboratory Testing Findings)</h3>
                <span className="text-[11px] text-slate-500">عينة ما بعد النقل ومخلفات الكيس المعادة</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* DAT */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[11px] text-slate-500 font-bold block">فحص كومبس المباشر (DAT):</span>
                  <div className={`font-mono font-bold text-sm ${
                    currentCase.directAntiglobulinTestDAT === 'positive_igg' ? 'text-rose-700' : 'text-emerald-700'
                  }`}>
                    {currentCase.directAntiglobulinTestDAT === 'positive_igg' ? 'Positive (IgG 2+)' : 'Negative'}
                  </div>
                  <span className="text-[10px] text-slate-500 block">ارتباط أضداد على كريات المريض</span>
                </div>

                {/* Free Hemoglobin */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[11px] text-slate-500 font-bold block">الهيموجلوبين الحر (مصل/بول):</span>
                  <div className={`font-mono font-bold text-sm ${
                    currentCase.freeHemoglobinInSerumUrine === 'present_hemolysis' ? 'text-rose-700' : 'text-emerald-700'
                  }`}>
                    {currentCase.freeHemoglobinInSerumUrine === 'present_hemolysis' ? 'Present (Hemolysis)' : 'None Detected'}
                  </div>
                  <span className="text-[10px] text-slate-500 block">دليل انحلال داخل الأوعية</span>
                </div>

                {/* Repeat Grouping */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[11px] text-slate-500 font-bold block">إعادة فحص الفصيلة:</span>
                  <div className="font-mono font-bold text-emerald-700 text-sm">Matched (B+)</div>
                  <span className="text-[10px] text-slate-500 block">لا يوجد خطأ في فصيلة ABO</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: Specialist Conclusion & Imputability */}
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="font-bold text-slate-900 text-xs">خلاصة استشاري طب نقل الدم والسببية (Imputability)</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">معايير ISBT / CDC لتحديد مدى ارتباط التفاعل بنقل الدم</p>
              </div>

              {/* Imputability Selector */}
              <div className="space-y-1.5">
                <label className="block text-slate-700 font-bold text-xs">
                  درجة السببية المعتمدة لليقظة الدموية (Imputability Score):
                </label>
                <select
                  value={currentCase.imputabilityScore || 'probable'}
                  onChange={e => handleUpdateInvestigation('imputabilityScore', e.target.value as HaemovigilanceImputabilityScore)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 text-slate-900"
                >
                  <option value="definite">مؤكد قطعي (Definite) - دلائل حاسمة لا تدع مجالاً للشك</option>
                  <option value="probable">مرجح بقوة (Probable) - الأدلة تدعم السببية بوضوح</option>
                  <option value="possible">محتمل (Possible) - قد يكون للنقل دور مع وجود أسباب سريرية أخرى</option>
                  <option value="unlikely">غير مرجح (Unlikely) - السبب السريري الآخر أكثر احتمالاً</option>
                  <option value="excluded">مستبعد (Excluded) - ثبت عدم ارتباط الأعراض بنقل الدم</option>
                  <option value="indeterminate_unassessable">غير محدد / قيد جمع البينات (Indeterminate)</option>
                </select>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
                <span className="font-bold text-rose-950 text-xs block">خلاصة التحقيق والتوصيات المستقبلية:</span>
                <p className="text-xs text-rose-900 leading-relaxed font-medium">
                  {currentCase.conclusionSummary}
                </p>
                <div className="pt-2 border-t border-rose-200 text-[11px] text-rose-800">
                  الاستشاري المسؤول: <strong>{currentCase.specialistConsultant}</strong>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-slate-700 font-bold text-xs">حالة ملف التحقيق الرقابي:</label>
                <select
                  value={currentCase.investigationStatus}
                  onChange={e => handleUpdateInvestigation('investigationStatus', e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50"
                >
                  <option value="reported_received">تم استلام البلاغ</option>
                  <option value="testing_underway">الفحوصات المخبرية جارية</option>
                  <option value="specialist_review">قيد مراجعة الاستشاري</option>
                  <option value="closed_concluded">مغلق وموثوق باليقظة الدموية</option>
                </select>
              </div>

              <button
                onClick={() => handleUpdateInvestigation('investigationStatus', 'closed_concluded')}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>إغلاق واعتماد تقرير اليقظة الدموية النهائي</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LOOKBACK & RECALL TRACEABILITY (GAP-07 / B29) */}
      {activeTab === 'lookback' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-amber-700 shrink-0" />
              <span>
                <strong>نظام التتبع الاستعادي وسحب المشتقات (Lookback & Recall - GAP-07):</strong> عند ظهور نتيجة إيجابية لعدوى منقولة بالدم لدى متبرع في تبرع لاحق، يتم حجر كافة المشتقات غير المصروفة فوراً، وتتبع المرضى المنقول لهم المشتقات لإشعار أطبائهم وإجراء الفحوصات الاستعادية.
              </span>
            </div>
            <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-amber-300 font-bold">
              Recall Protocol
            </span>
          </div>

          <div className="space-y-3">
            {lookbackRecords.map(rec => (
              <div key={rec.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 text-xs bg-white px-2 py-0.5 rounded border border-slate-200">
                      {rec.id}
                    </span>
                    <span className="font-mono text-xs text-red-700 font-bold">
                      تبرع رقم: {rec.donationId}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      {rec.status === 'recipients_traced' ? 'تم حصر المرضى المتلقين' : 'تم حجز الوحدات'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">تاريخ البلاغ: {rec.triggerDate}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block mb-0.5">سبب الاستدعاء والتتبع:</span>
                    <span className="font-bold text-slate-900">{rec.donorTestFinding}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block mb-0.5">الوحدات المصنعة المتأثرة:</span>
                    <div className="flex flex-wrap gap-1 font-mono text-[11px]">
                      {rec.affectedUnitIds.map(uid => (
                        <span key={uid} className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-700">
                          {uid}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 block mb-0.5">المسؤول عن التحقيق:</span>
                    <span className="font-bold text-slate-800">{rec.investigationOwner}</span>
                  </div>
                </div>

                {/* Progress Stats */}
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-200 text-center">
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">وحدات بالحجر الوقائي</span>
                    <span className="font-bold font-mono text-emerald-700 text-sm">
                      {rec.unitsInStorageQuarantinedCount} وحدات
                    </span>
                  </div>

                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">وحدات نُقلت لمرضى</span>
                    <span className="font-bold font-mono text-rose-700 text-sm">
                      {rec.unitsAlreadyTransfusedCount} وحدات
                    </span>
                  </div>

                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">المرضى المتلقين المحددين</span>
                    <span className="font-bold font-mono text-blue-700 text-sm">
                      {rec.recipientsIdentifiedCount} مرضى
                    </span>
                  </div>

                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">إشعارات الأطباء المعالجين</span>
                    <span className="font-bold font-mono text-purple-700 text-sm">
                      {rec.notificationsDeliveredCount} / {rec.notificationsAttemptedCount} مكتملة
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
                  <strong>ملاحظات المتابعة:</strong> {rec.notes}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CLINICAL COMMUNICATIONS AUDIT (B28) */}
      {activeTab === 'communications' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-950 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-blue-700 shrink-0" />
              <span>
                <strong>سجل التواصل السريري والإنذارات العاجلة (Clinical Notification Audit - B28):</strong> توثيق الاتصال الهاتفي الفوري بالأطباء المعالجين عند اشتباه أي تفاعل أو إيقاف عملية نقل الدم أو استدعاء مشتق دم.
              </span>
            </div>
            <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-blue-300 font-bold">
              Immediate Notification Policy
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">وقت الاتصال</th>
                  <th className="p-3">قناة التواصل</th>
                  <th className="p-3">المستلم والصفة السريرية</th>
                  <th className="p-3">حالة الإشعار والتأكيد</th>
                  <th className="p-3">موضوع الإشعار ومحتواه</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-mono">اليوم 08:35 ص</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[11px] flex items-center gap-1 w-fit">
                      <Phone className="w-3 h-3" />
                      <span>اتصال هاتفي مباشر</span>
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-slate-900">د. حسام السعيد</div>
                    <div className="text-slate-500 text-[10px]">أخصائي أول العناية المركزة ICU</div>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      تم التبليغ والاستلام والمصادقة
                    </span>
                  </td>
                  <td className="p-3 text-slate-700">
                    إبلاغ فوري بظهور أعراض تفاعل حاد مع وحدة PRBCs، تم تأكيد إيقاف النقل وإرسال عينة ما بعد النقل وبقايا الكيس.
                  </td>
                </tr>

                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-mono">اليوم 09:10 ص</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold text-[11px] flex items-center gap-1 w-fit">
                      <Radio className="w-3 h-3" />
                      <span>إنذار إلكتروني فوري (EMR Alert)</span>
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-slate-900">مكتب منسق زراعة الأعضاء</div>
                    <div className="text-slate-500 text-[10px]">برنامج زراعة الكبد</div>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      تمت القراءة والمصادقة
                    </span>
                  </td>
                  <td className="p-3 text-slate-700">
                    تنبيه أمان لنقل مشتقات دم مفلترة خالية من الكريات البيض ومشععة حصرياً لمريض الزراعة.
                  </td>
                </tr>

                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-mono">أمس 04:20 م</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[11px] flex items-center gap-1 w-fit">
                      <Share2 className="w-3 h-3" />
                      <span>إشعار سحب وتتبع (Lookback Notice)</span>
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-slate-900">د. سميرة الفهد</div>
                    <div className="text-slate-500 text-[10px]">استشارية أمراض الدم</div>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      تم التسليم ومتابعة فحص المريض
                    </span>
                  </td>
                  <td className="p-3 text-slate-700">
                    إشعار بملف التتبع LK-2026-001 وإجراء فحص استبعادي لفيروس الكبد C للمريض بعد 6 أسابيع من النقل.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
