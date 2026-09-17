import React, { useState } from 'react';
import {
  FileCheck,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Send,
  Sliders,
  Scale
} from 'lucide-react';
import { Patient } from '../../../types/his';
import { useHis } from '../../../context/HisContext';
import { ClinicalActionDialog } from '../common/ClinicalActionDialog';

interface AssessmentInstrumentsHubProps {
  patient: Patient;
}

export const AssessmentInstrumentsHub: React.FC<AssessmentInstrumentsHubProps> = ({ patient }) => {
  const { currentStaff, playChime } = useHis();

  const [activeScaleId, setActiveScaleId] = useState<'morse_fall' | 'braden_scale' | 'vte_risk'>('morse_fall');

  // Morse Fall Scale interactive state
  const [historyOfFalling, setHistoryOfFalling] = useState<number>(25); // 0 or 25
  const [secondaryDiagnosis, setSecondaryDiagnosis] = useState<number>(15); // 0 or 15
  const [ambulatoryAid, setAmbulatoryAid] = useState<number>(15); // 0, 15, or 30
  const [ivTherapy, setIvTherapy] = useState<number>(20); // 0 or 20
  const [gait, setGait] = useState<number>(10); // 0, 10, or 20
  const [mentalStatus, setMentalStatus] = useState<number>(0); // 0 or 15

  const totalMorseScore = historyOfFalling + secondaryDiagnosis + ambulatoryAid + ivTherapy + gait + mentalStatus;
  const fallRiskLevel =
    totalMorseScore >= 45
      ? 'خطر سقوط مرتفع (High Fall Risk)'
      : totalMorseScore >= 25
      ? 'خطر سقوط متوسط (Moderate Risk)'
      : 'خطر سقوط منخفض (Low Risk)';

  // Braden Scale interactive state
  const [sensory, setSensory] = useState(3);
  const [moisture, setMoisture] = useState(3);
  const [activityScore, setActivityScore] = useState(2);
  const [mobility, setMobility] = useState(2);
  const [nutrition, setNutrition] = useState(3);
  const [friction, setFriction] = useState(2);

  const totalBradenScore = sensory + moisture + activityScore + mobility + nutrition + friction;
  const bradenRiskLevel =
    totalBradenScore <= 12
      ? 'خطر قرح فراش مرتفع جداً (High Risk)'
      : totalBradenScore <= 14
      ? 'خطر متوسط (Moderate)'
      : 'خطر منخفض (Mild/Low)';

  // VTE Caprini Risk interactive state
  const [vteAgeFactor, setVteAgeFactor] = useState<number>(1);
  const [vteSurgeryFactor, setVteSurgeryFactor] = useState<number>(2);
  const [vteMobilityFactor, setVteMobilityFactor] = useState<number>(1);
  const [vteMalignancyFactor, setVteMalignancyFactor] = useState<number>(0);

  const totalVteScore = vteAgeFactor + vteSurgeryFactor + vteMobilityFactor + vteMalignancyFactor;
  const vteRiskLevel =
    totalVteScore >= 5
      ? 'خطر تجلط مرتفع جداً (Highest Risk - Prophylaxis Required)'
      : totalVteScore >= 3
      ? 'خطر تجلط مرتفع (High Risk)'
      : 'خطر تجلط متوسط/منخفض (Moderate/Low)';

  const [completedScales, setCompletedScales] = useState<string[]>(['morse_fall']);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: '',
    message: ''
  });

  const handleSaveAssessment = () => {
    if (!completedScales.includes(activeScaleId)) {
      setCompletedScales([...completedScales, activeScaleId]);
    }
    playChime('success');
    const scaleName =
      activeScaleId === 'morse_fall'
        ? 'مقياس خطر السقوط (Morse Fall Scale)'
        : activeScaleId === 'braden_scale'
        ? 'مقياس قرح الفراش (Braden Pressure Injury Scale)'
        : 'مقياس تقييم التجلط الوريدي (Caprini VTE Risk)';

    setConfirmDialog({
      isOpen: true,
      title: 'اعتماد المقياس السريري بنجاح',
      message: `تم حفظ ${scaleName} بنجاح وربطه بالملف السريري للمريض (${patient.fullNameAr || patient.name}). تم تحديث راية الأمان السريري وتوجيه بروتوكول الوقاية المعتمد.`
    });
  };

  return (
    <div className="space-y-4">
      {/* Scale Selector Strip */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-900">
                مقاييس التقييم السريري المعتمدة (Clinical Assessment Scales & Instruments)
              </h4>
              <p className="text-xs text-slate-500">
                أدوات التقييم الكمي المعتمدة حسب معايير CBAHI وJCI مع التوثيق المباشر لمصدر البيانات
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-slate-400">MRN: {patient.mrn}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
          <button
            type="button"
            onClick={() => setActiveScaleId('morse_fall')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
              activeScaleId === 'morse_fall'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>مقياس السقوط (Morse Fall Scale)</span>
            {completedScales.includes('morse_fall') && (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveScaleId('braden_scale')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
              activeScaleId === 'braden_scale'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>مقياس قرح الفراش (Braden Scale)</span>
            {completedScales.includes('braden_scale') && (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveScaleId('vte_risk')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
              activeScaleId === 'vte_risk'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>تقييم التجلط الوريدي (Caprini VTE Risk)</span>
            {completedScales.includes('vte_risk') && (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
            )}
          </button>
        </div>
      </div>

      {/* Interactive Scale Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 text-xs">
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between text-[11px] text-slate-600">
          <div className="flex items-center gap-1.5 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>مصدر التعبئة الذكية (Data Provenance):</span>
            <strong className="text-slate-900">سجل التمريض المعتمد • منذ 12 دقيقة (13:45)</strong>
          </div>
          <span className="font-semibold text-slate-500">المقيم: {currentStaff.name} ({currentStaff.title})</span>
        </div>

        {/* 1. Morse Fall Scale */}
        {activeScaleId === 'morse_fall' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-extrabold text-sm text-slate-900">
                مقياس مورس لتقييم خطر السقوط (Morse Fall Scale)
              </h4>
              <span className="px-2.5 py-1 rounded-full font-mono font-bold text-xs bg-teal-100 text-teal-800">
                المجموع الحالي: {totalMorseScore} نقطة
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <strong className="text-slate-800 block">1. هل يوجد تاريخ سابق للسقوط خلال آخر 3 أشهر؟</strong>
                  <span className="text-[10px] text-slate-400">History of falling</span>
                </div>
                <select
                  value={historyOfFalling}
                  onChange={e => setHistoryOfFalling(Number(e.target.value))}
                  className="p-1.5 rounded-lg border border-slate-300 font-bold bg-white"
                >
                  <option value={0}>لا (No - 0 pts)</option>
                  <option value={25}>نعم (Yes - 25 pts)</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <strong className="text-slate-800 block">2. وجود تشخيص مرضي ثانوي أو أكثر؟</strong>
                  <span className="text-[10px] text-slate-400">Secondary diagnosis</span>
                </div>
                <select
                  value={secondaryDiagnosis}
                  onChange={e => setSecondaryDiagnosis(Number(e.target.value))}
                  className="p-1.5 rounded-lg border border-slate-300 font-bold bg-white"
                >
                  <option value={0}>لا (No - 0 pts)</option>
                  <option value={15}>نعم (Yes - 15 pts)</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <strong className="text-slate-800 block">3. استخدام وسائل مساعدة للحركة والمشي؟</strong>
                  <span className="text-[10px] text-slate-400">Ambulatory aid</span>
                </div>
                <select
                  value={ambulatoryAid}
                  onChange={e => setAmbulatoryAid(Number(e.target.value))}
                  className="p-1.5 rounded-lg border border-slate-300 font-bold bg-white"
                >
                  <option value={0}>بدون مساعدة / ملازم للسرير (0 pts)</option>
                  <option value={15}>عكاز أو مشاية (Crutches/Walker - 15 pts)</option>
                  <option value={30}>يستند على الجدران والأثاث (Furniture - 30 pts)</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <strong className="text-slate-800 block">4. هل المريض متصل بمحاليل وريدية أو قسطرة؟</strong>
                  <span className="text-[10px] text-slate-400">IV Therapy / Heparin lock</span>
                </div>
                <select
                  value={ivTherapy}
                  onChange={e => setIvTherapy(Number(e.target.value))}
                  className="p-1.5 rounded-lg border border-slate-300 font-bold bg-white"
                >
                  <option value={0}>لا (No - 0 pts)</option>
                  <option value={20}>نعم (Yes - 20 pts)</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <strong className="text-slate-800 block">5. طريقة المشي والاتزان (Gait):</strong>
                  <span className="text-[10px] text-slate-400">Normal / Weak / Impaired</span>
                </div>
                <select
                  value={gait}
                  onChange={e => setGait(Number(e.target.value))}
                  className="p-1.5 rounded-lg border border-slate-300 font-bold bg-white"
                >
                  <option value={0}>طبيعي أو ملازم للسرير (0 pts)</option>
                  <option value={10}>ضعيف مع خطوات قصيرة (Weak - 10 pts)</option>
                  <option value={20}>مضطرب مع صعوبة بالنهوض (Impaired - 20 pts)</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <strong className="text-slate-800 block">6. الحالة العقلية والإدراك الذاتي (Mental Status):</strong>
                  <span className="text-[10px] text-slate-400">Knows limits / Overestimates ability</span>
                </div>
                <select
                  value={mentalStatus}
                  onChange={e => setMentalStatus(Number(e.target.value))}
                  className="p-1.5 rounded-lg border border-slate-300 font-bold bg-white"
                >
                  <option value={0}>يدرك قدراته الحركية بدقة (0 pts)</option>
                  <option value={15}>ينسى محدوديته الحركية أو مفرط الثقة (15 pts)</option>
                </select>
              </div>
            </div>

            <div
              className={`p-4 rounded-xl border flex items-center justify-between ${
                totalMorseScore >= 45
                  ? 'bg-red-50 border-red-300 text-red-900'
                  : totalMorseScore >= 25
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-900'
              }`}
            >
              <div>
                <div className="font-bold text-sm">النتيجة السريرية: {fallRiskLevel}</div>
                <div className="text-[11px] mt-0.5">
                  {totalMorseScore >= 45
                    ? 'تفعيل إجراءات السلامة المشددة: رفع حواجز السرير، أساور التنبيه الصفراء، والمرافقة الدائمة.'
                    : 'إجراءات الوقاية القياسية مع التوعية السريرية.'}
                </div>
              </div>
              <div className="text-xl font-black font-mono">{totalMorseScore}</div>
            </div>
          </div>
        )}

        {/* 2. Braden Scale */}
        {activeScaleId === 'braden_scale' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-extrabold text-sm text-slate-900">
                مقياس برادن لتقييم قرح الفراش (Braden Pressure Injury Scale)
              </h4>
              <span className="px-2.5 py-1 rounded-full font-mono font-bold text-xs bg-teal-100 text-teal-800">
                المجموع: {totalBradenScore} / 23
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block font-bold mb-1">الإدراك الحسي (Sensory):</label>
                <select
                  value={sensory}
                  onChange={e => setSensory(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value={1}>محدود تماماً (1)</option>
                  <option value={2}>محدود جداً (2)</option>
                  <option value={3}>محدود قليلاً (3)</option>
                  <option value={4}>لا يوجد خلل (4)</option>
                </select>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block font-bold mb-1">الرطوبة (Moisture):</label>
                <select
                  value={moisture}
                  onChange={e => setMoisture(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value={1}>رطوبة دائمة (1)</option>
                  <option value={2}>رطب جداً (2)</option>
                  <option value={3}>رطب أحياناً (3)</option>
                  <option value={4}>نادر الرطوبة (4)</option>
                </select>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block font-bold mb-1">النشاط البدني (Activity):</label>
                <select
                  value={activityScore}
                  onChange={e => setActivityScore(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value={1}>ملازم للسرير (1)</option>
                  <option value={2}>ملازم للكرسي (2)</option>
                  <option value={3}>يمشي أحياناً (3)</option>
                  <option value={4}>يمشي بتكرار (4)</option>
                </select>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block font-bold mb-1">الحركية وتغيير الوضع (Mobility):</label>
                <select
                  value={mobility}
                  onChange={e => setMobility(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value={1}>عديم الحركة تماماً (1)</option>
                  <option value={2}>حركة محدودة جداً (2)</option>
                  <option value={3}>حركة محدودة قليلاً (3)</option>
                  <option value={4}>لا توجد محدودية (4)</option>
                </select>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block font-bold mb-1">التغذية (Nutrition):</label>
                <select
                  value={nutrition}
                  onChange={e => setNutrition(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value={1}>فقيرة جداً (1)</option>
                  <option value={2}>غير كافية (2)</option>
                  <option value={3}>مناسبة (3)</option>
                  <option value={4}>ممتازة (4)</option>
                </select>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block font-bold mb-1">الاحتكاك والقص (Friction & Shear):</label>
                <select
                  value={friction}
                  onChange={e => setFriction(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value={1}>مشكلة واضحة (1)</option>
                  <option value={2}>مشكلة محتملة (2)</option>
                  <option value={3}>لا توجد مشكلة ظاهرة (3)</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-900 font-bold flex items-center justify-between">
              <span>التصنيف السريري: {bradenRiskLevel}</span>
              <span className="font-mono text-sm">{totalBradenScore} / 23</span>
            </div>
          </div>
        )}

        {/* 3. VTE Risk */}
        {activeScaleId === 'vte_risk' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-extrabold text-sm text-slate-900">
                تقييم خطر التجلط الوريدي والانسداد الرئوي (Caprini VTE Risk Score)
              </h4>
              <span className="px-2.5 py-1 rounded-full font-mono font-bold text-xs bg-teal-100 text-teal-800">
                المجموع الحالي: {totalVteScore} نقطة
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block font-bold mb-1">عامل العمر (Age Profile):</label>
                <select
                  value={vteAgeFactor}
                  onChange={e => setVteAgeFactor(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value={0}>أقل من 41 سنة (0 pts)</option>
                  <option value={1}>41 - 60 سنة (1 pt)</option>
                  <option value={2}>61 - 74 سنة (2 pts)</option>
                  <option value={3}>75 سنة فأكثر (3 pts)</option>
                </select>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block font-bold mb-1">نوع التدخل الجراحي أو التنويم:</label>
                <select
                  value={vteSurgeryFactor}
                  onChange={e => setVteSurgeryFactor(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value={0}>إجراء طفيف / عيادات (0 pts)</option>
                  <option value={1}>جراحة صغرى مخطط لها (1 pt)</option>
                  <option value={2}>جراحة كبرى أو تنويم حرج (2 pts)</option>
                  <option value={3}>جراحة عظام كبرى / قسطرة معقدة (3 pts)</option>
                </select>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block font-bold mb-1">الحركة والراحة بالسرير:</label>
                <select
                  value={vteMobilityFactor}
                  onChange={e => setVteMobilityFactor(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value={0}>حركة كاملة بدون تقييد (0 pts)</option>
                  <option value={1}>ملازم للسرير أقل من 72 ساعة (1 pt)</option>
                  <option value={2}>ملازم للسرير أكثر من 72 ساعة (2 pts)</option>
                </select>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block font-bold mb-1">الأورام الخبيثة أو سيرة تخثر سابقة:</label>
                <select
                  value={vteMalignancyFactor}
                  onChange={e => setVteMalignancyFactor(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value={0}>لا يوجد (0 pts)</option>
                  <option value={2}>تاريخ مرضي سابق لـ DVT/PE (2 pts)</option>
                  <option value={3}>ورم خبيث نشط تحت العلاج (3 pts)</option>
                </select>
              </div>
            </div>

            <div
              className={`p-4 rounded-xl border flex items-center justify-between ${
                totalVteScore >= 5
                  ? 'bg-rose-50 border-rose-300 text-rose-900'
                  : totalVteScore >= 3
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-900'
              }`}
            >
              <div>
                <div className="font-bold text-sm">تصنيف الخطر: {vteRiskLevel}</div>
                <div className="text-[11px] mt-0.5">
                  {totalVteScore >= 5
                    ? 'يوصى بالوقاية الدوائية المركبة (LMWH + الجوارب الضاغطة الميكانيكية IPC).'
                    : 'يوصى بالمشي المبكر والوقاية الميكانيكية.'}
                </div>
              </div>
              <div className="text-xl font-black font-mono">{totalVteScore}</div>
            </div>
          </div>
        )}

        {/* Action Strip */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="text-[11px] text-slate-500">
            المقيّم المعتمد: <strong>{currentStaff.name}</strong> ({currentStaff.title})
          </div>
          <button
            type="button"
            onClick={handleSaveAssessment}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>اعتماد وتحديث المقياس السريري</span>
          </button>
        </div>
      </div>

      <ClinicalActionDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        title={confirmDialog.title}
        message={confirmDialog.message}
        severity="info"
      />
    </div>
  );
};
