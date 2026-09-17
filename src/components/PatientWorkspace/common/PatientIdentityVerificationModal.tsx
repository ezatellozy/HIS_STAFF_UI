import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Scan,
  UserCheck,
  IdCard,
  Calendar,
  X,
  Lock,
  ArrowRight,
  Sparkles,
  HelpCircle,
  FileCheck2,
  Fingerprint
} from 'lucide-react';
import { Patient } from '../../../types/his';
import {
  VerificationIdentifierType,
  VerificationMethod,
  VerificationAttemptRecord
} from '../../../types/clinicalIdentityVerification';

export interface PatientIdentityVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  actionTitle: string;
  actionDescription?: string;
  onVerificationSuccess: (record: VerificationAttemptRecord) => void;
  staffName: string;
  staffRole: string;
}

export const PatientIdentityVerificationModal: React.FC<PatientIdentityVerificationModalProps> = ({
  isOpen,
  onClose,
  patient,
  actionTitle,
  actionDescription,
  onVerificationSuccess,
  staffName,
  staffRole
}) => {
  if (!isOpen) return null;

  const [method, setMethod] = useState<VerificationMethod>('verbal_direct');

  // Input states for verification check
  const [nameInput, setNameInput] = useState('');
  const [dobInput, setDobInput] = useState('');
  const [mrnInput, setMrnInput] = useState('');
  const [nationalIdInput, setNationalIdInput] = useState('');
  const [emergencyTempIdInput, setEmergencyTempIdInput] = useState('');

  // Explicitly selected verified identifiers
  const [selectedIdentifiers, setSelectedIdentifiers] = useState<VerificationIdentifierType[]>([
    'fullName',
    'dob'
  ]);

  // Status simulation
  const [verificationResult, setVerificationResult] = useState<'idle' | 'success' | 'mismatch' | 'override'>('idle');
  const [mismatchReason, setMismatchReason] = useState<string>('');
  const [overrideReason, setOverrideReason] = useState('');
  const [showOverrideInput, setShowOverrideInput] = useState(false);

  // Check if current patient is temporary
  const isTemporary =
    patient.mrn?.startsWith('TEMP-') ||
    patient.fullNameAr?.includes('مجهول') ||
    (patient as any).isTemporaryUnknown ||
    patient.nationalId?.includes('PENDING');

  const toggleIdentifier = (idType: VerificationIdentifierType) => {
    setSelectedIdentifiers(prev =>
      prev.includes(idType) ? prev.filter(t => t !== idType) : [...prev, idType]
    );
  };

  // Simulate quick autofill matching the current patient
  const handleSimulateMatch = () => {
    setNameInput(patient.fullNameAr);
    setDobInput(patient.dob);
    setMrnInput(patient.mrn);
    setNationalIdInput(patient.nationalId);
    setEmergencyTempIdInput(isTemporary ? patient.mrn : '');
    setVerificationResult('idle');
    setMismatchReason('');
  };

  // Simulate mismatch (e.g. wrong MRN or DOB)
  const handleSimulateMismatch = () => {
    setNameInput(patient.fullNameAr);
    setDobInput('1980-01-01'); // Wrong DOB
    setMrnInput('MRN-9999-WRONG'); // Wrong MRN
    setVerificationResult('idle');
    setMismatchReason('');
  };

  // Perform validation according to Two-Identifier rule
  const handleVerify = () => {
    if (selectedIdentifiers.length < 2) {
      setVerificationResult('mismatch');
      setMismatchReason('تتطلب السياسة المعتمدة مطابقة معرّفين اثنين على الأقل من المعرفات المحددة للشخص.');
      return;
    }

    const matched: VerificationIdentifierType[] = [];

    if (selectedIdentifiers.includes('fullName')) {
      const cleanInput = nameInput.trim().toLowerCase();
      const cleanActual = patient.fullNameAr.trim().toLowerCase();
      const cleanEn = patient.fullNameEn.trim().toLowerCase();
      if (cleanInput.length > 0 && (cleanActual.includes(cleanInput) || cleanEn.includes(cleanInput) || cleanInput.includes(cleanActual.slice(0, 5)))) {
        matched.push('fullName');
      }
    }

    if (selectedIdentifiers.includes('dob')) {
      if (dobInput.trim() === patient.dob.trim()) {
        matched.push('dob');
      }
    }

    if (selectedIdentifiers.includes('mrn')) {
      if (mrnInput.trim().toUpperCase() === patient.mrn.trim().toUpperCase()) {
        matched.push('mrn');
      }
    }

    if (selectedIdentifiers.includes('nationalOrOfficialId')) {
      if (nationalIdInput.trim() === patient.nationalId.trim()) {
        matched.push('nationalOrOfficialId');
      }
    }

    if (selectedIdentifiers.includes('designatedEmergencyTemporaryId')) {
      // Under configured ADT policy: An emergency department number qualifies ONLY
      // when explicitly assigned and designated as a temporary patient identifier (for unidentified/trauma patients).
      // Normal encounter numbers represent the visit/episode, NOT person identity, and are never an independent person identifier.
      const candidateTempId = emergencyTempIdInput.trim().toUpperCase() || mrnInput.trim().toUpperCase();
      if (isTemporary && candidateTempId === patient.mrn.trim().toUpperCase()) {
        matched.push('designatedEmergencyTemporaryId');
      }
    }

    // If method is barcode_scan, the technology read and validated the patient's MRN on the wristband
    if (method === 'barcode_scan' && selectedIdentifiers.includes('mrn') && !matched.includes('mrn')) {
      if (mrnInput.trim().toUpperCase() === patient.mrn.trim().toUpperCase()) {
        matched.push('mrn');
      }
    }

    if (matched.length >= 2) {
      setVerificationResult('success');
      setMismatchReason('');
      const record: VerificationAttemptRecord = {
        id: `verif-${Date.now()}`,
        patientId: patient.id,
        contextActionTitle: actionTitle,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        verifiedBy: staffName,
        verifiedByRole: staffRole,
        method,
        matchedIdentifiers: matched,
        result: 'matched',
        isMockOperationalHistory: true,
        notes: `تم التحقق بنجاح عبر مطابقة [${matched.join(' + ')}]`
      };
      setTimeout(() => {
        onVerificationSuccess(record);
      }, 700);
    } else {
      setVerificationResult('mismatch');
      setMismatchReason(
        `فشل التحقق: تم مطابقة ${matched.length} معرّف شخصي فقط من أصل 2 مطلوبين بالسياسة. يرجى التحقق بدقة لمنع الخطأ في هوية المريض أو استدعاء إجراء التجاوز الاضطراري التجريبي.`
      );
    }
  };

  const handleEmergencyOverride = () => {
    if (!overrideReason.trim()) {
      return;
    }
    const record: VerificationAttemptRecord = {
      id: `verif-ovr-${Date.now()}`,
      patientId: patient.id,
      contextActionTitle: actionTitle,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      verifiedBy: staffName,
      verifiedByRole: staffRole,
      method,
      matchedIdentifiers: selectedIdentifiers,
      result: 'emergency_override',
      isMockOperationalHistory: true,
      mismatchDetails: 'تجاوز اضطراري في حالة طارئة منقذة للحياة (Mock Operational History - Prototype Simulation Only)',
      notes: overrideReason
    };
    onVerificationSuccess(record);
  };

  return (
    <div
      id="patient-identity-verification-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
      dir="rtl"
    >
      <div
        id="patient-identity-verification-card"
        className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header with safety-focused coloring */}
        <div className="bg-gradient-to-r from-slate-900 to-teal-950 text-white p-5 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-base text-white">
                  إجراء التحقق النشط من هوية المريض
                </h3>
                <span className="text-xs text-teal-200/80 font-medium">
                  Active Patient Identity Verification Pattern (2 Person-Specific Identifiers)
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Action Trigger context & Encounter ID Separation */}
          <div className="mt-3.5 bg-slate-800/80 rounded-xl p-2.5 border border-slate-700/80 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-300">الإجراء السريري المطلوب:</span>
              <strong className="text-teal-300 font-bold">{actionTitle}</strong>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
              <span>معرّف الزيارة (Encounter ID):</span>
              <span className="font-mono font-bold text-amber-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">
                {patient.activeEncounterId || 'ENC-ACTIVE'}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                (منفصل عن هوية المريض ولا يحل محلها)
              </span>
            </div>
          </div>
        </div>

        {/* Temporary Identity Warning Banner */}
        {isTemporary && (
          <div className="bg-amber-50 border-b border-amber-200 px-5 py-3 flex items-start gap-3 text-xs text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block">تنبيه: هوية طوارئ مؤقتة معتمدة بموجب سياسة ADT (Emergency Temp Identity)</strong>
              <p className="text-amber-800 mt-0.5 leading-relaxed text-[11px]">
                المريض مقيد بهوية طوارئ مؤقتة ({patient.mrn}). معرّف الزيارة السريرية ({patient.activeEncounterId || 'Encounter'}) منفصل تماماً عن هوية الشخص. يجوز اعتماد رقم الطوارئ المؤقت المخصص عند استيفاء ضوابط ADT أو عبر مسح سوار الطوارئ المعتمد. يحظر استخدام رقم الغرفة أو السرير كمعرّف.
              </p>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs overflow-y-auto max-h-[70vh]">
          {/* Policy Rule Clarification Notice */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-teal-600" />
                معايير الأمان المعتمدة في المستشفى:
              </span>
              <span className="text-rose-700 font-bold bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-[10px]">
                يحظر استخدام الغرفة أو السرير كمعرّف
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              وفقاً للمعايير العالمية لسلامة المرضى، يتم التحقق بمطابقة <strong>معرّفين اثنين على الأقل خاصين بالشخص</strong> (مثل الاسم الثلاثي، تاريخ الميلاد، الرقم الطبي MRN، أو مسح شفرة السوار).
            </p>
          </div>

          {/* Verification Method Tabs */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5 text-xs">طريقة التحقق السريري (Verification Method):</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => {
                  setMethod('verbal_direct');
                  setSelectedIdentifiers(['fullName', 'dob']);
                }}
                className={`p-2.5 rounded-xl border text-right text-xs font-bold transition-all cursor-pointer flex flex-col gap-1 ${
                  method === 'verbal_direct'
                    ? 'bg-teal-50 border-teal-500 text-teal-900 ring-1 ring-teal-400'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1 text-[11px]">
                  <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>سؤال المريض/المرافق</span>
                </div>
                <span className="text-[10px] font-normal text-slate-500">نطق الاسم والميلاد</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMethod('barcode_scan');
                  setSelectedIdentifiers(['fullName', 'mrn']);
                  setMrnInput(patient.mrn);
                  setNameInput(patient.fullNameAr);
                }}
                className={`p-2.5 rounded-xl border text-right text-xs font-bold transition-all cursor-pointer flex flex-col gap-1 ${
                  method === 'barcode_scan'
                    ? 'bg-teal-50 border-teal-500 text-teal-900 ring-1 ring-teal-400'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1 text-[11px]">
                  <Scan className="w-3.5 h-3.5 text-teal-600" />
                  <span>مسح السوار الإلكتروني</span>
                </div>
                <span className="text-[10px] font-normal text-slate-500">Barcode / 2D DataMatrix (MRN)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMethod('visual_credential');
                  setSelectedIdentifiers(['fullName', 'nationalOrOfficialId']);
                  setNameInput(patient.fullNameAr);
                  setNationalIdInput(patient.nationalId);
                }}
                className={`p-2.5 rounded-xl border text-right text-xs font-bold transition-all cursor-pointer flex flex-col gap-1 ${
                  method === 'visual_credential'
                    ? 'bg-teal-50 border-teal-500 text-teal-900 ring-1 ring-teal-400'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1 text-[11px]">
                  <IdCard className="w-3.5 h-3.5 text-teal-600" />
                  <span>وثيقة رسمية مصورة</span>
                </div>
                <span className="text-[10px] font-normal text-slate-500">بطاقة الهوية / الإقامة</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMethod('biometric_token');
                  setSelectedIdentifiers(['mrn', 'dob']);
                  setMrnInput(patient.mrn);
                  setDobInput(patient.dob);
                }}
                className={`p-2.5 rounded-xl border text-right text-xs font-bold transition-all cursor-pointer flex flex-col gap-1 ${
                  method === 'biometric_token'
                    ? 'bg-teal-50 border-teal-500 text-teal-900 ring-1 ring-teal-400'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1 text-[11px]">
                  <Fingerprint className="w-3.5 h-3.5 text-teal-600" />
                  <span>رمز مصادقة آمن</span>
                </div>
                <span className="text-[10px] font-normal text-slate-500">Biometric / Token</span>
              </button>
            </div>
          </div>

          {/* Person-Specific Identifiers to Verify */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700 text-xs">
                المعرّفات الشخصية المطلوب مطابقتها (حدد معرّفين على الأقل):
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSimulateMatch}
                  className="text-[11px] text-teal-700 hover:text-teal-900 underline font-bold cursor-pointer"
                >
                  محاكاة تطابق صحيح ✓
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={handleSimulateMismatch}
                  className="text-[11px] text-rose-700 hover:text-rose-900 underline font-bold cursor-pointer"
                >
                  محاكاة عدم تطابق ✗
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 1. Full Name */}
              <div
                className={`p-3 rounded-2xl border transition-all ${
                  selectedIdentifiers.includes('fullName')
                    ? 'border-teal-300 bg-teal-50/40'
                    : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <label className="flex items-center gap-2 font-bold text-slate-800 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedIdentifiers.includes('fullName')}
                      onChange={() => toggleIdentifier('fullName')}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span>1. الاسم الرباعي المعتمد</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">Full Name</span>
                </div>
                <input
                  type="text"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  placeholder="أدخل أو تأكد من الاسم المنطوق"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:ring-2 focus:ring-teal-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  المسجل في النظام: <strong className="text-slate-700">{patient.fullNameAr}</strong>
                </span>
              </div>

              {/* 2. Date of Birth */}
              <div
                className={`p-3 rounded-2xl border transition-all ${
                  selectedIdentifiers.includes('dob')
                    ? 'border-teal-300 bg-teal-50/40'
                    : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <label className="flex items-center gap-2 font-bold text-slate-800 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedIdentifiers.includes('dob')}
                      onChange={() => toggleIdentifier('dob')}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span>2. تاريخ الميلاد (DOB)</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">Date of Birth</span>
                </div>
                <input
                  type="text"
                  value={dobInput}
                  onChange={e => setDobInput(e.target.value)}
                  placeholder="YYYY-MM-DD"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-semibold focus:ring-2 focus:ring-teal-500 text-left"
                  dir="ltr"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  المسجل في النظام: <strong className="text-slate-700 font-mono">{patient.dob}</strong> (العمر: {patient.age})
                </span>
              </div>

              {/* 3. MRN */}
              <div
                className={`p-3 rounded-2xl border transition-all ${
                  selectedIdentifiers.includes('mrn')
                    ? 'border-teal-300 bg-teal-50/40'
                    : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <label className="flex items-center gap-2 font-bold text-slate-800 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedIdentifiers.includes('mrn')}
                      onChange={() => toggleIdentifier('mrn')}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span>3. الرقم الطبي العام (MRN)</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">MRN Code</span>
                </div>
                <input
                  type="text"
                  value={mrnInput}
                  onChange={e => setMrnInput(e.target.value)}
                  placeholder="MRN-XXXX-XXXX"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-semibold focus:ring-2 focus:ring-teal-500 text-left"
                  dir="ltr"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  المسجل في النظام: <strong className="text-slate-700 font-mono">{patient.mrn}</strong>
                </span>
              </div>

              {/* 4. National / Official ID */}
              <div
                className={`p-3 rounded-2xl border transition-all ${
                  selectedIdentifiers.includes('nationalOrOfficialId')
                    ? 'border-teal-300 bg-teal-50/40'
                    : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <label className="flex items-center gap-2 font-bold text-slate-800 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedIdentifiers.includes('nationalOrOfficialId')}
                      onChange={() => toggleIdentifier('nationalOrOfficialId')}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span>4. الهوية الرسمية / الإقامة</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">National ID</span>
                </div>
                <input
                  type="text"
                  value={nationalIdInput}
                  onChange={e => setNationalIdInput(e.target.value)}
                  placeholder="10 / 14 رقماً"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-semibold focus:ring-2 focus:ring-teal-500 text-left"
                  dir="ltr"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  المسجل في النظام: <strong className="text-slate-700 font-mono">{patient.nationalId}</strong>
                </span>
              </div>

              {/* 5. Designated Emergency Temporary ID (ADT Policy Only) */}
              <div
                className={`p-3 rounded-2xl border transition-all sm:col-span-2 ${
                  selectedIdentifiers.includes('designatedEmergencyTemporaryId')
                    ? 'border-amber-400 bg-amber-50/50'
                    : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <label className="flex items-center gap-2 font-bold text-slate-800 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedIdentifiers.includes('designatedEmergencyTemporaryId')}
                      onChange={() => toggleIdentifier('designatedEmergencyTemporaryId')}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>5. معرّف الطوارئ المؤقت المخصص (Designated Temporary Emergency ID)</span>
                  </label>
                  <span className="text-[10px] text-amber-800 bg-amber-100 font-bold px-1.5 py-0.5 rounded">
                    سياسة ADT للطوارئ فقط (معرّف الزيارة العادي لا يمثل هوية الشخص)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={emergencyTempIdInput}
                    onChange={e => setEmergencyTempIdInput(e.target.value)}
                    placeholder="TEMP-ER-XXXX / رمز سوار الطوارئ المعتمد"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-semibold focus:ring-2 focus:ring-amber-500 text-left"
                    dir="ltr"
                  />
                  {isTemporary && (
                    <button
                      type="button"
                      onClick={() => setEmergencyTempIdInput(patient.mrn)}
                      className="px-2.5 py-1.5 rounded-xl bg-amber-200/70 hover:bg-amber-300 text-amber-950 text-[10px] font-bold shrink-0 transition-colors cursor-pointer"
                    >
                      مطابقة السوار المؤقت
                    </button>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  {isTemporary
                    ? `المعرف المؤقت المعتمد في ADT: ${patient.mrn} (مخصص كمعرف شخص مؤقت لحين استكمال التثبيت)`
                    : 'لا ينطبق على الحالات الروتينية (المريض يمتلك ملفاً ثابتاً وهوية مكتملة؛ معرّف الزيارة العادي يمثل اللقاء السريري فقط ولا يُعد معرّف شخص)'}
                </span>
              </div>
            </div>
          </div>

          {/* Validation Result Messages */}
          {verificationResult === 'mismatch' && (
            <div
              id="verification-mismatch-banner"
              className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 space-y-2 animate-in fade-in"
            >
              <div className="flex items-center gap-2 font-black text-xs text-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>تحذير أمان صارم: عدم تطابق معرّفات هوية المريض! (Safety Gate Mismatch)</span>
              </div>
              <p className="text-[11px] leading-relaxed text-rose-800">
                {mismatchReason}
              </p>

              <div className="pt-2 border-t border-rose-200 flex items-center justify-between">
                <span className="text-[11px] text-rose-700">
                  تم إيقاف المتابعة لحماية المريض من الخطأ السريري.
                </span>
                <button
                  type="button"
                  onClick={() => setShowOverrideInput(!showOverrideInput)}
                  className="text-xs font-bold text-rose-800 underline hover:text-rose-950 cursor-pointer"
                >
                  {showOverrideInput ? 'إخفاء خيار التجاوز' : 'تجاوز اضطراري في حالة حرجة؟'}
                </button>
              </div>

              {showOverrideInput && (
                <div className="p-3 bg-white rounded-xl border border-rose-300 space-y-2 mt-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800 block text-xs">
                      سبب التجاوز الاضطراري (توثيق بسجل التشغيل التجريبي Mock Operational History):
                    </label>
                    <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-bold">
                      محاكاة تجريبية Prototype
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={overrideReason}
                    onChange={e => setOverrideReason(e.target.value)}
                    placeholder="مثال: حالة طوارئ حرجة فورية مهددة للحياة / مريض فاقد للوعي بدون مرافق وتم تفعيل كود إنعاش..."
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-rose-500"
                  />
                  <button
                    type="button"
                    onClick={handleEmergencyOverride}
                    disabled={!overrideReason.trim()}
                    className="w-full py-2 bg-rose-700 hover:bg-rose-800 disabled:bg-slate-300 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>تأكيد التجاوز السريري الاضطراري والتوثيق بسجل التشغيل التجريبي (Mock Operational History)</span>
                  </button>
                  <span className="text-[10px] text-slate-500 text-center block">
                    (إجراء محاكاة تجريبي فقط لا يمثل سجلاً قانونياً أو مدققاً حقيقياً)
                  </span>
                </div>
              )}
            </div>
          )}

          {verificationResult === 'success' && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center gap-3 animate-in fade-in">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <strong className="block font-bold text-xs text-emerald-900">
                  تم التحقق من هوية المريض بنجاح (Verification Confirmed)
                </strong>
                <span className="text-[11px] text-emerald-700">
                  تم استيفاء معايير التحقق بمطابقة معرّفين اثنين لشخص المريض. جاري المتابعة...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>الممارس الموثق: <strong>{staffName}</strong> ({staffRole})</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              إلغاء
            </button>

            <button
              type="button"
              onClick={handleVerify}
              className="px-5 py-2 rounded-xl text-xs font-black bg-teal-600 hover:bg-teal-700 text-white shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>تأكيد التحقق والمتابعة</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
