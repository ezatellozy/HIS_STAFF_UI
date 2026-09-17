import React, { useState } from 'react';
import { X, HeartPulse, Activity, AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react';
import { useHis } from '../../context/HisContext';
import { Appointment, Vitals } from '../../types/his';

interface RecordVitalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
}

export const RecordVitalsModal: React.FC<RecordVitalsModalProps> = ({
  isOpen,
  onClose,
  appointment
}) => {
  const { patients, clinics, saveVitals, currentStaff } = useHis();

  const [bpSystolic, setBpSystolic] = useState<number>(appointment?.vitals?.bpSystolic || 120);
  const [bpDiastolic, setBpDiastolic] = useState<number>(appointment?.vitals?.bpDiastolic || 80);
  const [pulseRate, setPulseRate] = useState<number>(appointment?.vitals?.pulseRate || 76);
  const [temp, setTemp] = useState<number>(appointment?.vitals?.temp || 36.8);
  const [respiratoryRate, setRespiratoryRate] = useState<number>(appointment?.vitals?.respiratoryRate || 16);
  const [spo2, setSpo2] = useState<number>(appointment?.vitals?.spo2 || 98);
  const [bloodGlucose, setBloodGlucose] = useState<number>(appointment?.vitals?.bloodGlucose || 105);
  const [painScore, setPainScore] = useState<number>(appointment?.vitals?.painScore || 1);
  const [triageNotes, setTriageNotes] = useState<string>(
    appointment?.vitals?.triageNotes || 'المريض واعي ومدرك، تم أخذ المؤشرات الحيوية الأولية'
  );

  if (!isOpen || !appointment) return null;

  const patient = patients.find(p => p.id === appointment.patientId);
  const clinic = clinics.find(c => c.id === appointment.clinicId);

  // Calculate NEWS2 Score (National Early Warning Score)
  const calculateNews2 = () => {
    let score = 0;
    // Respiration rate
    if (respiratoryRate <= 8 || respiratoryRate >= 25) score += 3;
    else if (respiratoryRate >= 21) score += 2;
    else if (respiratoryRate <= 11) score += 1;

    // SpO2
    if (spo2 <= 91) score += 3;
    else if (spo2 <= 93) score += 2;
    else if (spo2 <= 95) score += 1;

    // Systolic BP
    if (bpSystolic <= 90 || bpSystolic >= 220) score += 3;
    else if (bpSystolic <= 100) score += 2;
    else if (bpSystolic <= 110 || bpSystolic >= 160) score += 1;

    // Pulse
    if (pulseRate <= 40 || pulseRate >= 131) score += 3;
    else if (pulseRate >= 111) score += 2;
    else if (pulseRate <= 50 || pulseRate >= 91) score += 1;

    // Temperature
    if (temp <= 35.0) score += 3;
    else if (temp >= 39.1) score += 2;
    else if (temp <= 36.0 || temp >= 38.1) score += 1;

    return score;
  };

  const news2 = calculateNews2();

  const getTriageLevel = (score: number): Vitals['triageLevel'] => {
    if (score >= 7 || bpSystolic >= 190 || spo2 < 90) return 'level_1_resuscitation';
    if (score >= 5 || bpSystolic >= 160 || pulseRate >= 110) return 'level_2_emergent';
    if (score >= 3 || temp >= 38.5) return 'level_3_urgent';
    if (score >= 1) return 'level_4_less_urgent';
    return 'level_5_non_urgent';
  };

  const triageLevel = getTriageLevel(news2);

  const triageBadgeMap = {
    level_1_resuscitation: { text: 'إنعاش فوري (Immediate - Level 1)', color: 'bg-red-600 text-white' },
    level_2_emergent: { text: 'طوارئ عاجل (Emergent - Level 2)', color: 'bg-orange-600 text-white' },
    level_3_urgent: { text: 'عاجل (Urgent - Level 3)', color: 'bg-yellow-500 text-slate-900' },
    level_4_less_urgent: { text: 'أقل إلحاحاً (Less Urgent - Level 4)', color: 'bg-teal-600 text-white' },
    level_5_non_urgent: { text: 'حالة روتينية (Routine - Level 5)', color: 'bg-emerald-600 text-white' }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const vitalsData: Vitals = {
      bpSystolic,
      bpDiastolic,
      pulseRate,
      temp,
      respiratoryRate,
      spo2,
      bloodGlucose,
      painScore,
      recordedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      recordedBy: currentStaff.name,
      triageLevel,
      news2Score: news2,
      triageNotes
    };

    saveVitals(appointment.id, vitalsData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base md:text-lg">تسجيل العلامات الحيوية والفرز السريري (Triage Vitals)</h3>
              <p className="text-xs text-slate-400">
                المريض: <strong className="text-white">{patient?.fullNameAr}</strong> ({appointment.ticketNo})
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

        {/* Clinical Alert Ticker */}
        <div className="px-6 py-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">مقياس الإنذار المبكر (NEWS2):</span>
            <span className={`px-2 py-0.5 rounded-md font-mono font-bold text-xs ${
              news2 >= 5 ? 'bg-red-100 text-red-700' : news2 >= 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {news2} نقطة
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">تصنيف الفرز:</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${triageBadgeMap[triageLevel].color}`}>
              {triageBadgeMap[triageLevel].text}
            </span>
          </div>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm text-slate-800">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Blood Pressure Systolic */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                الضغط الانقباضي (BP Sys)
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="50"
                  max="260"
                  value={bpSystolic}
                  onChange={e => setBpSystolic(Number(e.target.value))}
                  className={`w-full px-2 py-1.5 text-center font-mono font-bold text-base rounded-lg border ${
                    bpSystolic >= 140 || bpSystolic <= 90
                      ? 'border-red-400 bg-red-50 text-red-700'
                      : 'border-slate-300'
                  }`}
                />
                <span className="text-[10px] text-slate-500">mmHg</span>
              </div>
            </div>

            {/* Blood Pressure Diastolic */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                الضغط الانبساطي (BP Dia)
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="30"
                  max="160"
                  value={bpDiastolic}
                  onChange={e => setBpDiastolic(Number(e.target.value))}
                  className={`w-full px-2 py-1.5 text-center font-mono font-bold text-base rounded-lg border ${
                    bpDiastolic >= 90 || bpDiastolic <= 50
                      ? 'border-red-400 bg-red-50 text-red-700'
                      : 'border-slate-300'
                  }`}
                />
                <span className="text-[10px] text-slate-500">mmHg</span>
              </div>
            </div>

            {/* Heart Rate / Pulse */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                النبض (Heart Rate)
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="30"
                  max="220"
                  value={pulseRate}
                  onChange={e => setPulseRate(Number(e.target.value))}
                  className={`w-full px-2 py-1.5 text-center font-mono font-bold text-base rounded-lg border ${
                    pulseRate >= 100 || pulseRate <= 55
                      ? 'border-red-400 bg-red-50 text-red-700'
                      : 'border-slate-300'
                  }`}
                />
                <span className="text-[10px] text-slate-500">bpm</span>
              </div>
            </div>

            {/* Temperature */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                الحرارة (Temp)
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.1"
                  min="33"
                  max="43"
                  value={temp}
                  onChange={e => setTemp(Number(e.target.value))}
                  className={`w-full px-2 py-1.5 text-center font-mono font-bold text-base rounded-lg border ${
                    temp >= 38.0 || temp <= 35.5
                      ? 'border-red-400 bg-red-50 text-red-700'
                      : 'border-slate-300'
                  }`}
                />
                <span className="text-[10px] text-slate-500">°C</span>
              </div>
            </div>

            {/* SpO2 */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                تشبع الأكسجين (SpO2)
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="70"
                  max="100"
                  value={spo2}
                  onChange={e => setSpo2(Number(e.target.value))}
                  className={`w-full px-2 py-1.5 text-center font-mono font-bold text-base rounded-lg border ${
                    spo2 < 95 ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-300'
                  }`}
                />
                <span className="text-[10px] text-slate-500">%</span>
              </div>
            </div>

            {/* Respiratory Rate */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                معدل التنفس (Resp)
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="8"
                  max="50"
                  value={respiratoryRate}
                  onChange={e => setRespiratoryRate(Number(e.target.value))}
                  className="w-full px-2 py-1.5 text-center font-mono font-bold text-base rounded-lg border border-slate-300"
                />
                <span className="text-[10px] text-slate-500">/min</span>
              </div>
            </div>

            {/* Blood Glucose */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                سكر عشوائي (RBS)
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="30"
                  max="600"
                  value={bloodGlucose}
                  onChange={e => setBloodGlucose(Number(e.target.value))}
                  className={`w-full px-2 py-1.5 text-center font-mono font-bold text-base rounded-lg border ${
                    bloodGlucose >= 200 || bloodGlucose <= 70
                      ? 'border-yellow-400 bg-yellow-50 text-yellow-800'
                      : 'border-slate-300'
                  }`}
                />
                <span className="text-[10px] text-slate-500">mg/dL</span>
              </div>
            </div>

            {/* Pain Score */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                مقياس الألم (Pain 0-10)
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={painScore}
                  onChange={e => setPainScore(Number(e.target.value))}
                  className="w-full px-2 py-1.5 text-center font-mono font-bold text-base rounded-lg border border-slate-300"
                />
                <span className="text-[10px] text-slate-500">/10</span>
              </div>
            </div>
          </div>

          {/* Triage Note */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ملاحظات التمريض السريرية والفرز (Nursing Triage Notes)
            </label>
            <textarea
              rows={2}
              value={triageNotes}
              onChange={e => setTriageNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-teal-500"
              placeholder="سجل أي ملاحظات خاصة بالحالة، شكوى المريض المباشرة، أو استجابة المريض..."
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 rounded-xl"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              <span>اعتماد العلامات الحيوية وإرسال المريض للطبيب</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
