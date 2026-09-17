import React, { useState, useMemo } from 'react';
import {
  HeartPulse,
  Activity,
  Plus,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Filter,
  Layers,
  Thermometer,
  Wind,
  Brain,
  Droplet,
  Flame,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  FileSpreadsheet,
  LineChart as LineChartIcon,
  ShieldAlert,
  Info,
  Edit3,
  Check,
  Scale,
  Ruler,
  ShieldCheck
} from 'lucide-react';
import { useHis } from '../../../context/HisContext';
import { Patient } from '../../../types/his';
import {
  VitalsCategoryTab,
  EarlyWarningDeteriorationScore,
  ObservationValueState,
  ObservationAbsenceContext
} from '../../../types/clinicalWorkspace';
import {
  MOCK_FLOWSHEET_TIME_SLOTS,
  MOCK_DETAILED_OBSERVATION_ROWS,
  MOCK_FLUID_BALANCE_SLOTS,
  MOCK_DETERIORATION_SCORES,
  MOCK_ANTHROPOMETRICS,
  DetailedObservationRow
} from '../../../data/mockClinicalWorkspaceData';

interface VitalsFlowsheetActivityProps {
  patient: Patient;
}

export const VitalsFlowsheetActivity: React.FC<VitalsFlowsheetActivityProps> = ({ patient }) => {
  const { playChime } = useHis();

  // State
  const [timeSlots, setTimeSlots] = useState<string[]>(MOCK_FLOWSHEET_TIME_SLOTS);
  const [observationRows, setObservationRows] = useState<DetailedObservationRow[]>(MOCK_DETAILED_OBSERVATION_ROWS);
  const [fluidSlots, setFluidSlots] = useState(MOCK_FLUID_BALANCE_SLOTS);
  const [activeCategory, setActiveCategory] = useState<VitalsCategoryTab>('all');
  const [viewMode, setViewMode] = useState<'matrix' | 'chart'>('matrix');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCellInfo, setSelectedCellInfo] = useState<{
    parameter: string;
    value: number | string;
    unit: string;
    recordedAt: string;
    recordedBy: string;
    recordedByRole: string;
    verifiedBy?: string;
    verifiedByRole?: string;
    method?: string;
    derivationType?: 'measured' | 'calculated_derived' | 'device_synced';
    derivationFormula?: string;
    provenanceDetails?: string;
    loincCode?: string;
    ucumUnit?: string;
    normalRange: string;
    amendedReason?: string;
    absenceContext?: ObservationAbsenceContext;
  } | null>(null);

  // Form State for new entry
  const [formTime, setFormTime] = useState('17:00');
  const [formBpSys, setFormBpSys] = useState('122');
  const [formBpDia, setFormBpDia] = useState('78');
  const [formPulse, setFormPulse] = useState('78');
  const [formTemp, setFormTemp] = useState('36.8');
  const [formSpo2, setFormSpo2] = useState('98');
  const [formRr, setFormRr] = useState('16');
  const [formPain, setFormPain] = useState('2');
  const [formMethod, setFormMethod] = useState('قياس سريري مباشر ومراقبة بجانب السرير');
  const [formClinicianRole, setFormClinicianRole] = useState('Authorized Clinician - Clinical Fellow');
  const [formMeasuredBy, setFormMeasuredBy] = useState('د. وليد الصاوي');
  const [formRecordedBy, setFormRecordedBy] = useState('سارة مصطفى (Authorized Clinician - Registered Nurse)');
  const [formVerifiedBy, setFormVerifiedBy] = useState('د. طارق المنشاوي (Authorized Clinician - Attending Physician)');
  const [formDataSource, setFormDataSource] = useState('Bedside Monitor (Philips IntelliVue MX800)');
  const [formSoftWarning, setFormSoftWarning] = useState<string | null>(null);
  const [validationAlert, setValidationAlert] = useState<string | null>(null);

  // Deterioration score
  const deteriorationScore = MOCK_DETERIORATION_SCORES[patient.id] || MOCK_DETERIORATION_SCORES['pat-1'];
  // Anthropometrics baseline
  const patientAnthro = MOCK_ANTHROPOMETRICS[patient.id] || MOCK_ANTHROPOMETRICS['pat-1'];

  // Filter rows based on selected category
  const filteredRows = useMemo(() => {
    if (activeCategory === 'all') return observationRows;
    if (activeCategory === 'core') return observationRows.filter(r => r.group === 'core');
    if (activeCategory === 'anthropometrics') return observationRows.filter(r => r.group === 'anthropometrics');
    if (activeCategory === 'hemodynamics') return observationRows.filter(r => r.group === 'hemodynamics');
    if (activeCategory === 'respiratory') return observationRows.filter(r => r.group === 'ventilation');
    if (activeCategory === 'neuro') return observationRows.filter(r => r.group === 'neuro');
    if (activeCategory === 'scores') return observationRows.filter(r => r.group === 'scores');
    if (activeCategory === 'fluids') return observationRows.filter(r => r.group === 'fluids');
    return observationRows;
  }, [observationRows, activeCategory]);

  // Running Fluid Totals
  const latestFluid = fluidSlots[fluidSlots.length - 1];
  const totalIntake24h = fluidSlots.reduce((acc, s) => acc + s.totalIntakeMl, 0);
  const totalOutput24h = fluidSlots.reduce((acc, s) => acc + s.totalOutputMl, 0);
  const net24hBalance = totalIntake24h - totalOutput24h;

  // Chart data extraction for Systolic, Diastolic, HR, SpO2
  const chartPoints = useMemo(() => {
    const sysRow = observationRows.find(r => r.parameterName.includes('الانقباضي'));
    const diaRow = observationRows.find(r => r.parameterName.includes('الانبساطي'));
    const hrRow = observationRows.find(r => r.parameterName.includes('نبضات القلب'));
    const spo2Row = observationRows.find(r => r.parameterName.includes('تشبع الأكسجين'));
    const newsRow = observationRows.find(r => r.parameterName.includes('NEWS2'));

    return timeSlots.map((time, idx) => {
      return {
        time: time.replace('الآن (مباشر ', '').replace(')', ''),
        sys: Number(sysRow?.values[idx]?.value) || 120,
        dia: Number(diaRow?.values[idx]?.value) || 80,
        hr: Number(hrRow?.values[idx]?.value) || 75,
        spo2: Number(spo2Row?.values[idx]?.value) || 98,
        news: Number(newsRow?.values[idx]?.value) || 1
      };
    });
  }, [timeSlots, observationRows]);

  // Handle adding a new column to matrix
  const handleSaveObservation = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationAlert(null);

    const sys = parseInt(formBpSys, 10);
    const dia = parseInt(formBpDia, 10);
    const pulse = parseInt(formPulse, 10);
    const temp = parseFloat(formTemp);
    const spo2 = parseInt(formSpo2, 10);
    const rr = parseInt(formRr, 10);

    // Hard technical block ONLY for impossible technical input errors
    if (isNaN(sys) || isNaN(dia) || sys < 20 || sys > 350 || dia < 10 || dia > 250) {
      setValidationAlert('خطأ تقني في الإدخال: قيمة ضغط الدم غير رقمية أو خارجة تماماً عن النطاق الفيزيائي للمجس (20-350 mmHg).');
      return;
    }

    if (isNaN(pulse) || pulse < 10 || pulse > 300) {
      setValidationAlert('خطأ تقني في الإدخال: قيمة النبض خارج الحدود الفيزيائية للمجس.');
      return;
    }

    if (isNaN(temp) || temp < 28 || temp > 45) {
      setValidationAlert('خطأ تقني في الإدخال: درجة الحرارة خارج الحدود الفيزيائية للمجس.');
      return;
    }

    // Soft Clinical Warning for unusual physiological relationships (e.g. Systolic <= Diastolic)
    // Allows the Authorized Clinician to either "Correct" or "Confirm as Recorded" with provenance audit
    const isPhysiologicalInversion = sys <= dia;
    const isUnusual = isPhysiologicalInversion || (sys >= 170 || sys <= 85 || dia >= 110 || pulse >= 130 || pulse <= 45 || temp >= 39.0 || spo2 < 90);
    
    if (isUnusual && !formSoftWarning) {
      if (isPhysiologicalInversion) {
        setFormSoftWarning('تنبيه سريري مرن (Soft Clinical Warning): الضغط الانقباضي أصغر من أو يساوي الانبساطي (Systolic BP <= Diastolic BP) - علاقة فسيولوجية غير معتادة. يرجى مراجعة الجهاز أو المريض؛ يمكنك التصحيح (Correct) أو الضغط أدناه على "تأكيد كقراءة مسجلة (Confirm as Recorded)" لتوثيقها رسمياً مع سجل التدقيق.');
      } else {
        setFormSoftWarning('تنبيه سريري مرن (Soft Clinical Warning): تم رصد قيم سريرية حرجة/غير معتادة. يمكنك التصحيح أو الضغط على "تأكيد كقراءة مسجلة (Confirm as Recorded)" للمتابعة والتوثيق.');
      }
      return;
    }

    const newSlotIndex = timeSlots.length;
    const newSlotTime = `${formTime} (جديد)`;

    const recordedProvenanceAudit = isPhysiologicalInversion
      ? 'تم التأكيد السريري كقراءة مسجلة استثنائية (Confirmed as Recorded: Systolic BP <= Diastolic BP with clinician audit log)'
      : formSoftWarning
      ? 'تم التوثيق السريري بعد مراجعة التنبيه المرن'
      : undefined;

    // Update observation rows with new slot value
    const updatedRows = observationRows.map(row => {
      let val: number | string = '-';
      let state: ObservationValueState = 'normal';

      if (row.parameterName.includes('الانقباضي')) {
        val = sys;
        if (sys > 140 || sys < 90 || isPhysiologicalInversion) state = 'abnormal';
      } else if (row.parameterName.includes('الانبساطي')) {
        val = dia;
        if (dia > 90 || dia < 60 || isPhysiologicalInversion) state = 'abnormal';
      } else if (row.parameterName.includes('متوسط الضغط')) {
        val = Math.round(dia + (sys - dia) / 3);
        if (val < 65) state = 'critical';
      } else if (row.parameterName.includes('نبضات القلب')) {
        val = pulse;
        if (pulse > 100 || pulse < 50) state = 'abnormal';
      } else if (row.parameterName.includes('تشبع الأكسجين')) {
        val = spo2;
        if (spo2 < 94) state = 'critical';
      } else if (row.parameterName.includes('درجة حرارة')) {
        val = temp;
        if (temp >= 38.0 || temp <= 35.5) state = 'abnormal';
      } else if (row.parameterName.includes('معدل التنفس')) {
        val = rr;
        if (rr > 22 || rr < 10) state = 'abnormal';
      } else if (row.parameterName.includes('الألم')) {
        val = parseInt(formPain, 10);
        if (val >= 6) state = 'abnormal';
      } else {
        val = row.values[row.values.length - 1]?.value ?? '-';
        state = 'normal';
      }

      return {
        ...row,
        values: [
          ...row.values,
          {
            slotIndex: newSlotIndex,
            value: val,
            state: state,
            trend: 'stable' as const,
            recordedAt: formTime,
            recordedBy: formRecordedBy,
            recordedByRole: formClinicianRole,
            measuredBy: formMeasuredBy,
            measuredByRole: formClinicianRole,
            verifiedBy: formVerifiedBy,
            deviceSource: formDataSource,
            derivationType: row.technicalMetadata?.calculationFormula ? ('calculated_derived' as const) : ('measured' as const),
            provenanceDetails: recordedProvenanceAudit,
            method: `${formMethod} [Data Source: ${formDataSource}]`
          }
        ]
      };
    });

    setTimeSlots([...timeSlots, newSlotTime]);
    setObservationRows(updatedRows);
    setShowAddModal(false);
    setFormSoftWarning(null);
    playChime('success');
  };

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------- */}
      {/* FLOWSHEET HEADER & SUMMARY STRIP                              */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
                مصفوفة العلامات الحيوية والملاحظات السريرية (Flowsheet Matrix)
              </span>
              <span className="text-slate-400 font-mono text-xs">
                {timeSlots.length} فترات زمنية متسلسلة
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 mt-1">
              مصفوفة الرصد والمتابعة السريرية الشاملة مع دعم الرموز القياسية (LOINC / UCUM)
            </h2>
            <p className="text-xs text-slate-500">
              تصنيف سريري متعدد الفئات • فحص موثوقية القيم الحرجة • تتبع مسار توازن السوائل I/O بدقة
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('matrix')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'matrix'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>مصفوفة زمنية (Matrix)</span>
              </button>
              <button
                onClick={() => setViewMode('chart')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'chart'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LineChartIcon className="w-3.5 h-3.5" />
                <span>رسوم بيانية للاتجاه (Trend)</span>
              </button>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل عمود قياس جديد</span>
            </button>
          </div>
        </div>

        {/* Dynamic Summary Metric Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Tile 1: NEWS2 Deterioration Score */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-600" />
                <span>مقياس NEWS2 الحالي</span>
              </span>
              <span className="font-mono text-xs font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                1 / 20 (Low Risk)
              </span>
            </div>
            <div className="text-xs font-bold text-slate-800">
              {deteriorationScore.riskLabelAr}
            </div>
            <div className="text-[10px] text-slate-500">
              {deteriorationScore.actionRecommendationAr}
            </div>
          </div>

          {/* Tile 2: Total Intake (I/O) */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <Droplet className="w-3.5 h-3.5 text-blue-600" />
                <span>إجمالي المدخول 24h</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">UCUM: mL</span>
            </div>
            <div className="font-mono font-black text-sm text-blue-900">
              {totalIntake24h} mL
            </div>
            <div className="text-[10px] text-slate-500">
              محاليل وريدية + أدوية + تغذية
            </div>
          </div>

          {/* Tile 3: Total Output (I/O) */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <Droplet className="w-3.5 h-3.5 text-amber-600" />
                <span>إجمالي المطروح 24h</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">UCUM: mL</span>
            </div>
            <div className="font-mono font-black text-sm text-amber-900">
              {totalOutput24h} mL
            </div>
            <div className="text-[10px] text-slate-500">
              إدرار بول {latestFluid.urineMlPerKgPerHour} mL/kg/h + درانق
            </div>
          </div>

          {/* Tile 4: Net Balance */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">صافي توازن السوائل (Net)</span>
              <span className="text-[10px] font-mono text-slate-400">تراكمي 24 ساعة</span>
            </div>
            <div
              className={`font-mono font-black text-sm ${
                net24hBalance >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {net24hBalance > 0 ? `+${net24hBalance}` : net24hBalance} mL
            </div>
            <div className="text-[10px] text-slate-500">
              {net24hBalance >= 0 ? 'توازن إيجابي ملائم سريرياً' : 'توازن سلبي يتطلب تقييم الجفاف'}
            </div>
          </div>
        </div>

        {/* Category Tab Filter */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1 ml-2">
            <Filter className="w-3.5 h-3.5" />
            <span>عرض الفئة السريرية:</span>
          </span>

          {[
            { id: 'all', label: 'جميع الملاحظات المدمجة', icon: Layers },
            { id: 'core', label: 'العلامات الأساسية (Core)', icon: HeartPulse },
            { id: 'anthropometrics', label: 'القياسات الجسمانية (Anthropometrics)', icon: Scale },
            { id: 'hemodynamics', label: 'الهيموديناميكا (Hemodynamics)', icon: Activity },
            { id: 'respiratory', label: 'التنفس وأجهزة التنفس (Ventilation)', icon: Wind },
            { id: 'neuro', label: 'العصبية والوعي (Neuro & GCS)', icon: Brain },
            { id: 'scores', label: 'درجات الإنذار المبكر (Scores)', icon: Flame },
            { id: 'fluids', label: 'توازن السوائل والمطروح (I/O)', icon: Droplet }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id as VitalsCategoryTab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Anthropometrics Contextual Cadence Bar (Baseline & Periodic) */}
      {(activeCategory === 'all' || activeCategory === 'anthropometrics') && (
        <div className="bg-gradient-to-r from-teal-50 via-slate-50 to-white rounded-2xl border border-teal-200/80 p-4 shadow-2xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-teal-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-xs sm:text-sm text-slate-900">
                  القياسات الجسمانية ومؤشرات النمو (Anthropometric Baseline & Status)
                </h3>
                <span className="text-[11px] text-slate-500">
                  تُقاس دورياً أو عند الدخول السريري (Cadence: Baseline / Periodic) • لا تتطلب تكراراً بالساعة
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-600 bg-white/80 px-3 py-1.5 rounded-xl border border-teal-200">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>المصدر: {patientAnthro.provenanceSource}</span>
              <span className="text-slate-400">|</span>
              <span>{patientAnthro.measuredBy} ({patientAnthro.measuredByRole})</span>
              <span className="text-slate-400">|</span>
              <span className="font-mono">{patientAnthro.measuredAt}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-slate-500">الطول (Height)</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  قياس مباشر
                </span>
              </div>
              <span className="font-mono font-black text-sm text-slate-900">{patientAnthro.heightCm}</span>
              <span className="text-[10px] text-slate-400 mr-1">cm (LOINC: 8302-2)</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-slate-500">الوزن (Weight)</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  قياس مباشر
                </span>
              </div>
              <span className="font-mono font-black text-sm text-slate-900">{patientAnthro.weightKg}</span>
              <span className="text-[10px] text-slate-400 mr-1">kg (LOINC: 29463-7)</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-slate-500">مؤشر كتلة الجسم (BMI)</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                  مشتق حسابياً
                </span>
              </div>
              <span className="font-mono font-black text-sm text-amber-900">{patientAnthro.bmi}</span>
              <span className="text-[10px] text-amber-700 mr-1">kg/m² (Formula: Wt / Ht²)</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-teal-200 bg-teal-50/30 shadow-2xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-teal-900 font-bold">مساحة سطح الجسم (BSA)</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-teal-100 text-teal-800 border border-teal-300">
                  مشتق حسابياً (DuBois)
                </span>
              </div>
              <span className="font-mono font-black text-sm text-teal-950">{patientAnthro.bsaM2}</span>
              <span className="text-[10px] text-teal-700 mr-1">m² (0.007184 × Ht^0.725 × Wt^0.425)</span>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW MODE 1: MATRIX TABULAR TIME-SERIES VIEW                  */}
      {/* ------------------------------------------------------------- */}
      {viewMode === 'matrix' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200">
                  <th className="p-3 font-extrabold text-slate-800 w-64 sticky right-0 bg-slate-100 z-10 border-l border-slate-200">
                    المؤشر السريري (Clinical Observation)
                  </th>
                  <th className="p-3 font-mono font-bold text-slate-500 w-24 text-center border-l border-slate-200">
                    الوحدة (UCUM)
                  </th>
                  <th className="p-3 font-mono text-[11px] text-slate-500 w-36 text-center border-l border-slate-200">
                    المعدل المرجعي (Ref Range)
                  </th>
                  {timeSlots.map((time, idx) => (
                    <th
                      key={idx}
                      className="p-3 font-mono font-bold text-slate-900 text-center min-w-[120px] border-l border-slate-200"
                    >
                      <div className="text-sm font-black">{time}</div>
                      <div className="text-[10px] font-sans font-normal text-slate-500 truncate max-w-[110px] mx-auto">
                        {idx === timeSlots.length - 1 ? 'مباشر Telemetry' : 'توثيق سريري'}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredRows.map((row, rowIdx) => {
                  return (
                    <tr key={rowIdx} className="hover:bg-slate-50/80 transition-colors">
                      {/* Parameter Name & LOINC */}
                      <td className="p-2.5 px-3 font-sans font-bold text-slate-800 sticky right-0 bg-white z-10 border-l border-slate-200">
                        <div className="text-xs font-bold text-slate-900">{row.parameterName}</div>
                        {row.technicalMetadata?.loincCode && (
                          <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                            LOINC: {row.technicalMetadata.loincCode}
                          </div>
                        )}
                      </td>

                      {/* Unit */}
                      <td className="p-2.5 text-center text-slate-500 border-l border-slate-200 text-[11px]">
                        {row.unit}
                      </td>

                      {/* Normal Range */}
                      <td className="p-2.5 text-center text-slate-500 border-l border-slate-200 text-[11px] font-sans">
                        {row.normalRange}
                      </td>

                      {/* Values across time slots */}
                      {timeSlots.map((_, slotIdx) => {
                        const cell = row.values.find(v => v.slotIndex === slotIdx) || row.values[slotIdx];
                        if (!cell) {
                          return (
                            <td key={slotIdx} className="p-2.5 text-center border-l border-slate-200 text-slate-300">
                              -
                            </td>
                          );
                        }

                        const isCritical = cell.state === 'critical';
                        const isAbnormal = cell.state === 'abnormal';
                        const isAmended = cell.state === 'amended';
                        const isAbsent = cell.absenceContext?.isAbsent;

                        return (
                          <td
                            key={slotIdx}
                            onClick={() =>
                              setSelectedCellInfo({
                                parameter: row.parameterName,
                                value: cell.value,
                                unit: row.unit,
                                recordedAt: cell.recordedAt,
                                recordedBy: cell.recordedBy,
                                recordedByRole: cell.recordedByRole,
                                verifiedBy: cell.verifiedBy,
                                verifiedByRole: cell.verifiedByRole,
                                method: cell.method,
                                derivationType: cell.derivationType,
                                derivationFormula: row.technicalMetadata?.calculationFormula,
                                provenanceDetails: cell.provenanceDetails,
                                loincCode: row.technicalMetadata?.loincCode,
                                ucumUnit: row.technicalMetadata?.ucumUnit,
                                normalRange: row.normalRange,
                                amendedReason: cell.amendedReason,
                                absenceContext: cell.absenceContext
                              })
                            }
                            className={`p-2.5 text-center border-l border-slate-200 font-black cursor-pointer hover:ring-2 hover:ring-teal-400 hover:ring-inset transition-all ${
                              isAbsent
                                ? 'bg-slate-50 text-slate-500'
                                : isCritical
                                ? 'bg-rose-100 text-rose-800'
                                : isAbnormal
                                ? 'bg-amber-50 text-amber-900'
                                : isAmended
                                ? 'bg-blue-50 text-blue-900'
                                : 'text-slate-900'
                            }`}
                          >
                            {isAbsent ? (
                              <div className="flex flex-col items-center justify-center gap-0.5">
                                <span className="font-mono text-slate-400 font-bold text-sm">—</span>
                                <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                                  غير متوفر
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-1">
                                <span>{cell.value}</span>
                                {cell.trend === 'up' && <TrendingUp className="w-3 h-3 text-rose-600" />}
                                {cell.trend === 'down' && <TrendingDown className="w-3 h-3 text-emerald-600" />}
                              </div>
                            )}

                            {/* Clinician provenance sub-indicator */}
                            <div className="text-[9px] font-sans font-normal text-slate-400 mt-0.5 flex items-center justify-center gap-1">
                              <span>{cell.recordedBy.split(' ')[0]}</span>
                              {cell.derivationType === 'calculated_derived' && (
                                <span className="text-amber-600 font-bold" title="مشتق حسابياً">calc</span>
                              )}
                              {cell.derivationType === 'device_synced' && (
                                <span className="text-teal-600 font-bold" title="مزامنة جهاز">sync</span>
                              )}
                              {isAmended && <span className="text-blue-600 font-bold">(معدل)</span>}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Fluid Balance Hourly Section */}
          {(activeCategory === 'all' || activeCategory === 'fluids') && (
            <div className="border-t-2 border-slate-200 p-4 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-blue-950 flex items-center gap-2">
                  <Droplet className="w-4 h-4 text-blue-700" />
                  <span>جدول توازن السوائل بالساعة (Hourly Fluid Balance & Urine Output Tracker)</span>
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  معايير التقييم: إدرار البول المستهدف ≥ 0.5 mL/kg/hour
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {fluidSlots.map((slot, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between font-mono">
                      <strong className="text-slate-900 text-xs">{slot.slotTime}</strong>
                      <span className="text-[10px] text-slate-500">I/O</span>
                    </div>
                    <div className="text-xs space-y-0.5">
                      <div className="flex items-center justify-between text-blue-800 font-bold">
                        <span>المدخول:</span>
                        <span className="font-mono">{slot.totalIntakeMl} mL</span>
                      </div>
                      <div className="flex items-center justify-between text-amber-800 font-bold">
                        <span>المطروح:</span>
                        <span className="font-mono">{slot.totalOutputMl} mL</span>
                      </div>
                      <div className="flex items-center justify-between font-mono font-black pt-1 border-t border-slate-100">
                        <span>الصافي:</span>
                        <span className={slot.slotNetBalanceMl >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                          {slot.slotNetBalanceMl > 0 ? `+${slot.slotNetBalanceMl}` : slot.slotNetBalanceMl} mL
                        </span>
                      </div>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 bg-slate-50 p-1 rounded text-center">
                      {slot.urineMlPerKgPerHour ? `${slot.urineMlPerKgPerHour} mL/kg/h` : 'بول طبيعي'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW MODE 2: RESPONSIVE SVG TREND CHARTS                      */}
      {/* ------------------------------------------------------------- */}
      {viewMode === 'chart' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Blood Pressure & Heart Rate (SVG) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
                    <HeartPulse className="w-4 h-4 text-rose-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      اتجاه ضغط الدم ونبض القلب (BP & Pulse Trend)
                    </h3>
                    <span className="text-[11px] text-slate-500">الوحدات: mmHg و beats/min</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold">
                  <span className="flex items-center gap-1 text-rose-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" /> الانقباضي
                  </span>
                  <span className="flex items-center gap-1 text-amber-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block" /> الانبساطي
                  </span>
                  <span className="flex items-center gap-1 text-blue-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" /> النبض
                  </span>
                </div>
              </div>

              {/* Responsive SVG Chart */}
              <div className="pt-4 overflow-x-auto">
                <div className="min-w-[420px]">
                  <svg viewBox="0 0 500 200" className="w-full h-52 text-xs">
                    {/* Background Grid Lines */}
                    <line x1="40" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="40" y1="65" x2="480" y2="65" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="40" y1="110" x2="480" y2="110" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="40" y1="155" x2="480" y2="155" stroke="#f1f5f9" strokeWidth="1" />

                    {/* Y-axis Labels */}
                    <text x="30" y="24" fill="#94a3b8" textAnchor="end" fontSize="10">160</text>
                    <text x="30" y="69" fill="#94a3b8" textAnchor="end" fontSize="10">120</text>
                    <text x="30" y="114" fill="#94a3b8" textAnchor="end" fontSize="10">80</text>
                    <text x="30" y="159" fill="#94a3b8" textAnchor="end" fontSize="10">40</text>

                    {/* Lines & Points */}
                    {(() => {
                      const count = chartPoints.length;
                      const stepX = (480 - 60) / Math.max(count - 1, 1);
                      const getY = (val: number) => {
                        const clamped = Math.max(40, Math.min(180, val));
                        return 160 - ((clamped - 40) / 140) * 140;
                      };

                      const pointsSys = chartPoints.map((p, i) => `${60 + i * stepX},${getY(p.sys)}`).join(' ');
                      const pointsDia = chartPoints.map((p, i) => `${60 + i * stepX},${getY(p.dia)}`).join(' ');
                      const pointsPulse = chartPoints.map((p, i) => `${60 + i * stepX},${getY(p.hr)}`).join(' ');

                      return (
                        <>
                          <polyline fill="none" stroke="#e11d48" strokeWidth="2.5" points={pointsSys} />
                          <polyline fill="none" stroke="#f59e0b" strokeWidth="2" points={pointsDia} />
                          <polyline fill="none" stroke="#2563eb" strokeWidth="2" points={pointsPulse} />

                          {chartPoints.map((p, i) => {
                            const cx = 60 + i * stepX;
                            return (
                              <g key={i}>
                                <circle cx={cx} cy={getY(p.sys)} r="3.5" fill="#e11d48" />
                                <circle cx={cx} cy={getY(p.dia)} r="3" fill="#f59e0b" />
                                <circle cx={cx} cy={getY(p.hr)} r="3" fill="#2563eb" />
                                <text x={cx} y="185" fill="#64748b" textAnchor="middle" fontSize="10" fontWeight="bold">
                                  {p.time}
                                </text>
                              </g>
                            );
                          })}
                        </>
                      );
                    })()}
                  </svg>
                </div>
              </div>
            </div>

            {/* Chart 2: SpO2 & Early Warning Score (SVG) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                    <Wind className="w-4 h-4 text-teal-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      تشبع الأكسجين ودرجة التدهور (SpO2 & NEWS2 Trend)
                    </h3>
                    <span className="text-[11px] text-slate-500">الوحدات: % و نقاط التدهور</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold">
                  <span className="flex items-center gap-1 text-emerald-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" /> SpO2 %
                  </span>
                  <span className="flex items-center gap-1 text-rose-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" /> NEWS2 Score
                  </span>
                </div>
              </div>

              {/* Responsive SVG Chart */}
              <div className="pt-4 overflow-x-auto">
                <div className="min-w-[420px]">
                  <svg viewBox="0 0 500 200" className="w-full h-52 text-xs">
                    {/* Background Grid Lines */}
                    <line x1="40" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="40" y1="65" x2="480" y2="65" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="40" y1="110" x2="480" y2="110" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="40" y1="155" x2="480" y2="155" stroke="#f1f5f9" strokeWidth="1" />

                    {/* Y-axis Labels for SpO2 */}
                    <text x="30" y="24" fill="#94a3b8" textAnchor="end" fontSize="10">100%</text>
                    <text x="30" y="69" fill="#94a3b8" textAnchor="end" fontSize="10">96%</text>
                    <text x="30" y="114" fill="#94a3b8" textAnchor="end" fontSize="10">92%</text>
                    <text x="30" y="159" fill="#94a3b8" textAnchor="end" fontSize="10">88%</text>

                    {/* Right Y-axis for NEWS2 */}
                    <text x="490" y="24" fill="#e11d48" textAnchor="start" fontSize="10">12</text>
                    <text x="490" y="69" fill="#e11d48" textAnchor="start" fontSize="10">8</text>
                    <text x="490" y="114" fill="#e11d48" textAnchor="start" fontSize="10">4</text>
                    <text x="490" y="159" fill="#e11d48" textAnchor="start" fontSize="10">0</text>

                    {/* Lines & Points */}
                    {(() => {
                      const count = chartPoints.length;
                      const stepX = (470 - 60) / Math.max(count - 1, 1);

                      const getSpo2Y = (val: number) => {
                        const clamped = Math.max(88, Math.min(100, val));
                        return 160 - ((clamped - 88) / 12) * 140;
                      };

                      const getNewsY = (val: number) => {
                        const clamped = Math.max(0, Math.min(12, val));
                        return 160 - (clamped / 12) * 140;
                      };

                      const pointsSpo2 = chartPoints.map((p, i) => `${60 + i * stepX},${getSpo2Y(p.spo2)}`).join(' ');
                      const pointsNews = chartPoints.map((p, i) => `${60 + i * stepX},${getNewsY(p.news)}`).join(' ');

                      return (
                        <>
                          <polyline fill="none" stroke="#059669" strokeWidth="2.5" points={pointsSpo2} />
                          <polyline fill="none" stroke="#dc2626" strokeWidth="2" strokeDasharray="4 2" points={pointsNews} />

                          {chartPoints.map((p, i) => {
                            const cx = 60 + i * stepX;
                            return (
                              <g key={i}>
                                <circle cx={cx} cy={getSpo2Y(p.spo2)} r="3.5" fill="#059669" />
                                <rect x={cx - 3} y={getNewsY(p.news) - 3} width="6" height="6" fill="#dc2626" />
                                <text x={cx} y="185" fill="#64748b" textAnchor="middle" fontSize="10" fontWeight="bold">
                                  {p.time}
                                </text>
                              </g>
                            );
                          })}
                        </>
                      );
                    })()}
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* AUDIT TRAIL / CELL DETAIL DRAWER (PROVENANCE & DERIVATION)    */}
      {/* ------------------------------------------------------------- */}
      {selectedCellInfo && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-5 space-y-4 text-right">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span>سجل العمليات السريرية ومصدر التوثيق (Clinical Provenance & Version History)</span>
                  <span className="text-[11px] text-slate-500 block font-normal">
                    توثيق متعدد التخصصات • تاريخ تشغيلي تجريبي (Mock Operational History)
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedCellInfo(null)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Parameter & Value Banner */}
            {selectedCellInfo.absenceContext?.isAbsent ? (
              <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-950">{selectedCellInfo.parameter}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900 border border-amber-300">
                    غير مسجل / غير متاح (Missing Observation)
                  </span>
                </div>
                <div className="p-2.5 bg-white/90 rounded-lg border border-amber-200 space-y-1">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="font-bold text-slate-800">سبب الغياب السريري الموثق:</span>
                    <span className="font-extrabold text-amber-900">{selectedCellInfo.absenceContext.reasonLabelAr}</span>
                  </div>
                  {selectedCellInfo.absenceContext.documentationNote && (
                    <p className="text-[11px] text-slate-600 mr-6">
                      {selectedCellInfo.absenceContext.documentationNote}
                    </p>
                  )}
                  <div className="mt-2 p-2 bg-slate-100 rounded text-[11px] font-bold text-slate-700 border border-slate-200">
                    دلالة قواعد السلامة السريرية: القيمة المفقودة ليست صفراً وليست طبيعية (Missing ≠ Zero, Missing ≠ Normal). لا يتم استخدام القيمة في حساب مقاييس التدهور ولا تُعتبر طبيعية.
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center justify-between">
                  <span>المعدل المرجعي للمؤشر: <span className="font-sans font-bold text-slate-700">{selectedCellInfo.normalRange}</span></span>
                  <span className="font-mono text-[10px] text-slate-400">التوقيت المجدول: {selectedCellInfo.recordedAt}</span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{selectedCellInfo.parameter}</span>
                  {selectedCellInfo.loincCode && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-teal-50 text-teal-800 border border-teal-200">
                      LOINC: {selectedCellInfo.loincCode}
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono font-black text-2xl text-teal-900">
                    {selectedCellInfo.value}
                  </span>
                  <span className="font-mono text-slate-600 font-bold text-xs">
                    {selectedCellInfo.unit}
                  </span>
                  {selectedCellInfo.ucumUnit && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      (UCUM: {selectedCellInfo.ucumUnit})
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 flex items-center justify-between">
                  <span>المعدل المرجعي المقبول: <span className="font-sans font-bold text-slate-700">{selectedCellInfo.normalRange}</span></span>
                  <span className="font-mono text-[10px] text-slate-400">التوقيت: {selectedCellInfo.recordedAt}</span>
                </div>
              </div>
            )}

            {/* Derivation Type / Source Badge */}
            <div className="p-3 rounded-xl border space-y-1.5 text-xs bg-slate-50/70 border-slate-200">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">طبيعة ومصدر القياس (Derivation Type):</span>
                {selectedCellInfo.derivationType === 'calculated_derived' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                    مشتق حسابياً (Calculated / Derived)
                  </span>
                )}
                {selectedCellInfo.derivationType === 'device_synced' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-100 text-teal-900 border border-teal-300">
                    مزامنة تلقائية من الجهاز (Device Synced)
                  </span>
                )}
                {(!selectedCellInfo.derivationType || selectedCellInfo.derivationType === 'measured') && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-900 border border-blue-300">
                    قياس سريري مباشر (Direct Measured)
                  </span>
                )}
              </div>

              {selectedCellInfo.derivationFormula && (
                <div className="p-2 bg-amber-50/80 rounded-lg border border-amber-200 text-[11px] font-mono text-amber-950">
                  <span className="font-sans font-bold block text-[10px] text-amber-800">معادلة الاشتقاق المعتمدة:</span>
                  {selectedCellInfo.derivationFormula}
                </div>
              )}

              {selectedCellInfo.provenanceDetails && (
                <div className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200">
                  <strong className="block text-[10px] text-slate-500">تفاصيل التحقق والمصدر:</strong>
                  {selectedCellInfo.provenanceDetails}
                </div>
              )}
            </div>

            {/* Clinician Responsibility & Audit (Multi-disciplinary: MD, RN, System) */}
            <div className="space-y-2 text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                <span className="font-bold text-slate-600">المسؤول عن الرصد / التسجيل:</span>
                <span className="font-bold text-slate-900">
                  {selectedCellInfo.recordedBy}
                  <span className="mr-1.5 px-2 py-0.5 rounded text-[10px] bg-slate-100 font-mono text-slate-700 border border-slate-200">
                    {selectedCellInfo.recordedByRole}
                  </span>
                </span>
              </div>

              {selectedCellInfo.verifiedBy && (
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="font-bold text-teal-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>تم التحقق والاعتماد بواسطة:</span>
                  </span>
                  <span className="font-bold text-slate-900">
                    {selectedCellInfo.verifiedBy}
                    <span className="mr-1.5 px-2 py-0.5 rounded text-[10px] bg-teal-50 font-mono text-teal-800 border border-teal-200">
                      {selectedCellInfo.verifiedByRole}
                    </span>
                  </span>
                </div>
              )}

              {selectedCellInfo.method && (
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-600">طريقة القياس / الجهاز:</span>
                  <span className="text-slate-800 font-medium">{selectedCellInfo.method}</span>
                </div>
              )}

              {selectedCellInfo.amendedReason && (
                <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 mt-2">
                  <strong className="block text-[11px]">سبب التعديل السريري (Clinical Amendment Reason):</strong>
                  <span className="text-[11px]">{selectedCellInfo.amendedReason}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedCellInfo(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: RECORD NEW VITALS & OBSERVATIONS                       */}
      {/* ------------------------------------------------------------- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl p-6 space-y-4 text-right max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-teal-900 font-extrabold text-sm sm:text-base">
                <Activity className="w-5 h-5 text-teal-700" />
                <span>إضافة عمود قياس جديد (Add Vitals Column)</span>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setFormSoftWarning(null);
                  setValidationAlert(null);
                }}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Validation Alert (Hard Technical Error) */}
            {validationAlert && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <div>
                  <strong className="block font-bold">خطأ تقني في الإدخال:</strong>
                  <span>{validationAlert}</span>
                </div>
              </div>
            )}

            {/* Soft Clinical Warning (Non-blocking, highlights clinical verification) */}
            {formSoftWarning && (
              <div className="p-3.5 bg-amber-50 border-2 border-amber-300 text-amber-950 rounded-xl text-xs space-y-2.5 shadow-xs">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
                  <div>
                    <strong className="block font-black text-amber-950 text-sm">تنبيه سريري مرن (Soft Clinical Warning):</strong>
                    <p className="mt-0.5 leading-relaxed text-amber-900">{formSoftWarning}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-amber-200">
                  <button
                    type="button"
                    onClick={() => setFormSoftWarning(null)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 font-bold hover:bg-amber-100 transition-colors"
                  >
                    ✏️ تصحيح القيم (Correct Values)
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-2xs transition-colors"
                  >
                    ✓ تأكيد كقراءة مسجلة (Confirm as Recorded with Clinical Provenance)
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveObservation} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">وقت القراءة (Time):</label>
                  <input
                    type="time"
                    value={formTime}
                    onChange={e => setFormTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    مصدر البيانات / الجهاز (Data Source / Device):
                  </label>
                  <select
                    value={formDataSource}
                    onChange={e => setFormDataSource(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-800 bg-white"
                  >
                    <option value="Bedside Monitor (Philips IntelliVue MX800)">Bedside Monitor (Philips IntelliVue MX800) [Data Source]</option>
                    <option value="Central Telemetry Stream (Station B)">Central Telemetry Stream (Station B) [Data Source]</option>
                    <option value="Direct Radial Arterial Line Transducer">Direct Radial Arterial Line Transducer [Data Source]</option>
                    <option value="Manual Aneroid Sphygmomanometer & Stethoscope">Manual Aneroid Sphygmomanometer & Stethoscope</option>
                    <option value="Point-of-Care Glucometer (Accu-Chek Inform II)">Point-of-Care Glucometer (Accu-Chek Inform II)</option>
                  </select>
                </div>
              </div>

              {/* Provenance: Authorized Clinician Details */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <span className="font-extrabold text-slate-900">
                    جهة التسجيل السريرية والاعتماد (Authorized Clinician Provenance)
                  </span>
                  <span className="text-[10px] text-slate-400">
                    المونيتور مصدر بيانات وليس مسجلاً سريرياً (Monitor is Data Source, not Clinical Recorder)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-0.5">القائم بالقياس (Measured By):</label>
                    <input
                      type="text"
                      value={formMeasuredBy}
                      onChange={e => setFormMeasuredBy(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-0.5">القائم بالتوثيق (Recorded By):</label>
                    <input
                      type="text"
                      value={formRecordedBy}
                      onChange={e => setFormRecordedBy(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-0.5">الدور المهني المعتمد (Role):</label>
                    <select
                      value={formClinicianRole}
                      onChange={e => setFormClinicianRole(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 font-medium bg-white"
                    >
                      <option value="Authorized Clinician - Clinical Fellow">Authorized Clinician - Clinical Fellow (زميل سريري)</option>
                      <option value="Authorized Clinician - Resident Physician">Authorized Clinician - Resident Physician (طبيب مقيم)</option>
                      <option value="Authorized Clinician - Attending Physician">Authorized Clinician - Attending / Consultant (استشاري معالج)</option>
                      <option value="Authorized Clinician - Registered Nurse">Authorized Clinician - Registered Nurse (ممرض قانوني RN)</option>
                      <option value="Authorized Clinician - Respiratory Therapist">Authorized Clinician - Respiratory Therapist (أخصائي علاج تنفسي)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-0.5">التدقيق والاعتماد السريري (Verified By):</label>
                  <input
                    type="text"
                    value={formVerifiedBy}
                    onChange={e => setFormVerifiedBy(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 font-medium text-slate-700"
                    placeholder="اسم الممارس المخول بالتدقيق والاعتماد"
                  />
                </div>
              </div>

              {/* Core Vitals */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="font-extrabold text-slate-900 border-b border-slate-200 pb-1.5">
                  العلامات الحيوية الأساسية (Core Vitals - UCUM Units)
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">الضغط الانقباضي (mmHg):</label>
                    <input
                      type="number"
                      value={formBpSys}
                      onChange={e => setFormBpSys(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 font-mono font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">الضغط الانبساطي (mmHg):</label>
                    <input
                      type="number"
                      value={formBpDia}
                      onChange={e => setFormBpDia(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 font-mono font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">النبض (Pulse /min):</label>
                    <input
                      type="number"
                      value={formPulse}
                      onChange={e => setFormPulse(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 font-mono font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">الحرارة (Temp °C):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formTemp}
                      onChange={e => setFormTemp(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 font-mono font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">تشبع الأكسجين (SpO2 %):</label>
                    <input
                      type="number"
                      value={formSpo2}
                      onChange={e => setFormSpo2(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 font-mono font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">معدل التنفس (RR /min):</label>
                    <input
                      type="number"
                      value={formRr}
                      onChange={e => setFormRr(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 font-mono font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">مقياس الألم (NRS 0-10):</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={formPain}
                      onChange={e => setFormPain(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 font-mono font-bold"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Submit / Cancel */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormSoftWarning(null);
                    setValidationAlert(null);
                  }}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-xs transition-colors"
                >
                  {formSoftWarning ? 'تأكيد وحفظ مع التوثيق' : 'حفظ وتسجيل في المصفوفة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
