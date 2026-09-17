import React, { useState } from 'react';
import {
  Search,
  UserPlus,
  AlertTriangle,
  ShieldAlert,
  Phone,
  Calendar,
  CheckCircle2,
  XCircle,
  FileText,
  UserCheck,
  Eye,
  AlertCircle,
  RefreshCw,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  History,
  Baby,
  Tag,
  Info
} from 'lucide-react';
import {
  PatientAccessRecord,
  DuplicateCheckMatch,
  AdministrativeAlert
} from '../../types/patientAccessAdt';

interface PatientAccessRegistrationViewProps {
  patients: PatientAccessRecord[];
  onSelectPatient: (patient: PatientAccessRecord) => void;
  onRegisterNewPatient: (newPatient: PatientAccessRecord) => void;
  onOpenPatientWorkspace: (mrn: string, encounterId?: string) => void;
}

export const PatientAccessRegistrationView: React.FC<PatientAccessRegistrationViewProps> = ({
  patients,
  onSelectPatient,
  onRegisterNewPatient,
  onOpenPatientWorkspace
}) => {
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilterType, setSearchFilterType] = useState<'all' | 'mrn' | 'nationalId' | 'name' | 'mobile'>('all');
  const [selectedPatient, setSelectedPatient] = useState<PatientAccessRecord | null>(patients[0] || null);

  // Modals & Panels
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isUnknownErModalOpen, setIsUnknownErModalOpen] = useState(false);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [targetMergePatientId, setTargetMergePatientId] = useState<string>('');
  const [mergeVerificationNote, setMergeVerificationNote] = useState('تم التحقق عبر البصمة ومطابقة الهوية الوطنية من الهلال الأحمر');
  const [duplicateReviewMatch, setDuplicateReviewMatch] = useState<DuplicateCheckMatch | null>(null);

  // New Patient Form State
  const [newFullNameAr, setNewFullNameAr] = useState('');
  const [newFullNameEn, setNewFullNameEn] = useState('');
  const [newNationalId, setNewNationalId] = useState('');
  const [newDob, setNewDob] = useState('');
  const [newGender, setNewGender] = useState<'male' | 'female'>('male');
  const [newMobile, setNewMobile] = useState('');
  const [newCity, setNewCity] = useState('الرياض');
  const [newDistrict, setNewDistrict] = useState('');
  const [newEmergencyName, setNewEmergencyName] = useState('');
  const [newEmergencyRelation, setNewEmergencyRelation] = useState('');
  const [newEmergencyMobile, setNewEmergencyMobile] = useState('');
  const [newCommPref, setNewCommPref] = useState<'sms' | 'whatsapp' | 'call'>('sms');
  const [newAdminAlertType, setNewAdminAlertType] = useState<string>('none');
  const [newAdminAlertText, setNewAdminAlertText] = useState('');

  // Newborn & Multiple-Birth Profile State
  const [registrationProfile, setRegistrationProfile] = useState<'standard' | 'newborn'>('standard');
  const [selectedMotherId, setSelectedMotherId] = useState<string>('p-access-06');
  const [isMultipleBirth, setIsMultipleBirth] = useState<boolean>(true);
  const [birthOrder, setBirthOrder] = useState<number>(1);
  const [tempNewbornName, setTempNewbornName] = useState<string>('وليد نورة السالم - 1');
  const [verificationContext, setVerificationContext] = useState<string>('تمت مطابقة سوار الوليد المزدوج مع سوار الأم وبصمة القدم في جناح الولادة (L&D)');
  const [newbornGender, setNewbornGender] = useState<'male' | 'female'>('male');
  const [newbornBirthTime, setNewbornBirthTime] = useState<string>(new Date().toISOString().substring(0, 16));

  // Unknown ER Form State
  const [unknownTraumaTag, setUnknownTraumaTag] = useState(`TRAUMA-${Math.floor(100 + Math.random() * 900)}`);
  const [unknownEstGender, setUnknownEstGender] = useState<'male' | 'female'>('male');
  const [unknownEstAge, setUnknownEstAge] = useState(30);
  const [unknownLocation, setUnknownLocation] = useState('نقل إسعافي عبر الهلال الأحمر - حادث سير');

  // Filtered Patients
  const filteredPatients = patients.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    if (searchFilterType === 'mrn') return p.mrn.toLowerCase().includes(q);
    if (searchFilterType === 'nationalId') return p.nationalId?.toLowerCase().includes(q) || p.passportNo?.toLowerCase().includes(q);
    if (searchFilterType === 'name') return p.fullNameAr.includes(q) || p.fullNameEn.toLowerCase().includes(q);
    if (searchFilterType === 'mobile') return p.mobile.includes(q);
    return (
      p.mrn.toLowerCase().includes(q) ||
      p.fullNameAr.includes(q) ||
      p.fullNameEn.toLowerCase().includes(q) ||
      (p.nationalId && p.nationalId.includes(q)) ||
      (p.passportNo && p.passportNo.toLowerCase().includes(q)) ||
      p.mobile.includes(q)
    );
  });

  // Handle Registration Trigger & Duplicate Check
  const handleInitiateRegistration = () => {
    if (registrationProfile === 'newborn') {
      // Newborn registration: bypass standard duplicate check, proceed directly with newborn creation
      completeRegistration();
      return;
    }

    // Check if any existing patient matches name similarity or exact national ID
    const matched = patients.find(p => {
      if (newNationalId && p.nationalId === newNationalId) return true;
      if (newFullNameAr && p.fullNameAr.trim() === newFullNameAr.trim()) return true;
      if (newMobile && p.mobile === newMobile) return true;
      return false;
    });

    if (matched) {
      setDuplicateReviewMatch({
        existingPatient: matched,
        similarityScore: matched.nationalId === newNationalId ? 98 : 82,
        matchingFields: [
          {
            field: 'fullNameAr',
            labelAr: 'الاسم الرباعي',
            existingVal: matched.fullNameAr,
            candidateVal: newFullNameAr,
            isExact: matched.fullNameAr === newFullNameAr
          },
          {
            field: 'nationalId',
            labelAr: 'الهوية الوطنية / الإقامة',
            existingVal: matched.nationalId || 'غير مسجل',
            candidateVal: newNationalId || 'غير مدخل',
            isExact: matched.nationalId === newNationalId
          },
          {
            field: 'dob',
            labelAr: 'تاريخ الميلاد',
            existingVal: matched.dob,
            candidateVal: newDob || 'غير محدد',
            isExact: matched.dob === newDob
          },
          {
            field: 'mobile',
            labelAr: 'رقم الجوال',
            existingVal: matched.mobile,
            candidateVal: newMobile,
            isExact: matched.mobile === newMobile
          }
        ],
        reviewStatus: 'pending'
      });
      return;
    }

    // Proceed with registration
    completeRegistration();
  };

  const completeRegistration = () => {
    if (registrationProfile === 'newborn') {
      const mockGeneratedMrn = `MRN-2026-${Math.floor(9000 + Math.random() * 900)}`;
      const mother = patients.find(p => p.id === selectedMotherId) || patients.find(p => p.gender === 'female') || patients[0];
      const motherName = mother ? mother.fullNameAr : 'نورة عبد العزيز السالم';
      const motherMrn = mother ? mother.mrn : 'MRN-2026-3301';

      const newbornRecord: PatientAccessRecord = {
        id: `p-nb-${Date.now()}`,
        mrn: mockGeneratedMrn,
        nationalId: undefined, // Explicitly unknown / pending official issuance
        fullNameAr: tempNewbornName || `وليد ${motherName} (${birthOrder})`,
        fullNameEn: `Newborn ${birthOrder} of ${mother ? mother.fullNameEn : 'Mother'}`,
        dob: newbornBirthTime.replace('T', ' '),
        gender: newbornGender,
        mobile: mother ? mother.mobile : '0551122334',
        address: mother ? mother.address : { city: 'الرياض', district: 'حي الغدير' },
        emergencyContact: {
          name: motherName,
          relationship: 'الأم',
          mobile: mother ? mother.mobile : '0551122334'
        },
        communicationPreference: 'sms',
        status: 'active',
        isNewborn: true,
        motherPatientId: mother ? mother.id : undefined,
        motherMrn: motherMrn,
        motherNameAr: motherName,
        multipleBirthIndicator: isMultipleBirth,
        birthOrder: birthOrder,
        temporaryNewbornNamingContext: tempNewbornName,
        identityAmbiguityWarning: isMultipleBirth
          ? `تنبيه تشابه الهوية (توأم ${birthOrder}): يجب التحقق من سوار التعريف الثنائي وبصمة القدم ورقم الملف المستقل (${mockGeneratedMrn})`
          : undefined,
        identificationVerificationContext: verificationContext,
        registeredAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        previousEncountersCount: 0,
        administrativeAlerts: [
          {
            id: `adm-nb-${Date.now()}`,
            type: 'identity_warning',
            title: `ملف وليد مستقل ${isMultipleBirth ? `- ولادة متعددة (توأم ${birthOrder})` : ''}`,
            message: `ملف طبي منفصل برقم مستقل تماماً عن رقم الأم (${motherMrn}). الاسم الرسمي ورقم الهوية الوطنية يصدران لاحقاً عبر الأحوال المدنية.`,
            severity: 'medium',
            createdAt: new Date().toISOString().split('T')[0],
            isAdministrative: true
          }
        ]
      };

      onRegisterNewPatient(newbornRecord);
      setSelectedPatient(newbornRecord);
      setIsRegisterModalOpen(false);
      resetForm();
      return;
    }

    const mockGeneratedMrn = `MRN-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const adminAlerts: AdministrativeAlert[] = [];
    if (newAdminAlertType !== 'none' && newAdminAlertText) {
      adminAlerts.push({
        id: `adm-${Date.now()}`,
        type: newAdminAlertType as AdministrativeAlert['type'],
        title: 'تنبيه إداري مسجل عند فتح الملف',
        message: newAdminAlertText,
        severity: 'medium',
        createdAt: new Date().toISOString().split('T')[0],
        isAdministrative: true
      });
    }

    const created: PatientAccessRecord = {
      id: `p-${Date.now()}`,
      mrn: mockGeneratedMrn,
      nationalId: newNationalId || undefined,
      fullNameAr: newFullNameAr || 'مريض جديد',
      fullNameEn: newFullNameEn || 'New Patient',
      dob: newDob || '1990-01-01',
      gender: newGender,
      mobile: newMobile || '0500000000',
      address: { city: newCity, district: newDistrict },
      emergencyContact: {
        name: newEmergencyName || 'المرافق',
        relationship: newEmergencyRelation || 'قريب',
        mobile: newEmergencyMobile || newMobile
      },
      communicationPreference: newCommPref,
      status: 'active',
      registeredAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      previousEncountersCount: 0,
      administrativeAlerts: adminAlerts
    };

    onRegisterNewPatient(created);
    setSelectedPatient(created);
    setIsRegisterModalOpen(false);
    setDuplicateReviewMatch(null);
    resetForm();
  };

  const resetForm = () => {
    setNewFullNameAr('');
    setNewFullNameEn('');
    setNewNationalId('');
    setNewDob('');
    setNewMobile('');
    setNewDistrict('');
    setNewEmergencyName('');
    setNewEmergencyRelation('');
    setNewEmergencyMobile('');
    setNewAdminAlertType('none');
    setNewAdminAlertText('');
    setRegistrationProfile('standard');
    setIsMultipleBirth(true);
    setBirthOrder(1);
    setTempNewbornName('وليد نورة السالم - 1');
  };

  // Register Unknown ER Patient
  const handleRegisterUnknownErPatient = () => {
    const tempId = `TEMP-ER-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const createdUnknown: PatientAccessRecord = {
      id: `p-unk-${Date.now()}`,
      mrn: tempId,
      fullNameAr: `مجهول الهوية (${unknownTraumaTag})`,
      fullNameEn: `Unidentified Trauma (${unknownTraumaTag})`,
      dob: `${new Date().getFullYear() - unknownEstAge}-01-01`,
      gender: unknownEstGender,
      mobile: '0000000000',
      address: { city: 'الرياض', district: unknownLocation },
      emergencyContact: {
        name: 'طاقم الإسعاف المنقول عبره',
        relationship: 'مستقبل الطوارئ',
        mobile: '997'
      },
      communicationPreference: 'sms',
      status: 'temporary_unidentified',
      isTemporaryUnknown: true,
      temporaryTag: unknownTraumaTag,
      registeredAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      previousEncountersCount: 0,
      administrativeAlerts: [
        {
          id: `adm-unk-${Date.now()}`,
          type: 'identity_warning',
          title: 'ملف طوارئ مؤقت لمجهول الهوية',
          message: `تم إنشاء الملف برقم مؤقت للإنقاذ الفوري (${unknownTraumaTag}). يجب مطابقة الهوية الرسمية لاحقاً عند التعرف على المريض.`,
          severity: 'high',
          createdAt: new Date().toISOString().split('T')[0],
          isAdministrative: true
        }
      ]
    };

    onRegisterNewPatient(createdUnknown);
    setSelectedPatient(createdUnknown);
    setIsUnknownErModalOpen(false);
  };

  // Handle Execute Merge of Temporary ER Patient into Master Patient
  const handleExecuteMerge = () => {
    if (!selectedPatient) return;
    const target = patients.find(p => p.id === targetMergePatientId);
    if (!target) return;

    // Simulate safe identity merge
    const mergedRecord: PatientAccessRecord = {
      ...target,
      previousEncountersCount: target.previousEncountersCount + (selectedPatient.previousEncountersCount || 1),
      administrativeAlerts: [
        ...(target.administrativeAlerts || []),
        {
          id: `merge-${Date.now()}`,
          type: 'identity_warning',
          title: `سجل دمج هوية طوارئ مؤقتة (${selectedPatient.mrn})`,
          message: `تم دمج ملف الطوارئ المؤقت ${selectedPatient.mrn} (${selectedPatient.temporaryTag || 'Trauma'}) بهذا الملف الرئيسي. ملاحظة التحقق: ${mergeVerificationNote}. جميع الفحوصات والزيارات السابقة محتفظ بها.`,
          severity: 'medium',
          createdAt: new Date().toISOString().split('T')[0],
          isAdministrative: true
        }
      ]
    };

    onRegisterNewPatient(mergedRecord);
    setSelectedPatient(mergedRecord);
    setIsMergeModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Administrative Identity Surface vs Clinical Workspace */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-5 border border-blue-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-300 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>بيئة تسجيل الدخول والهوية الإدارية للمريض (Administrative Patient Identity Surface)</span>
          </div>
          <h2 className="text-xl font-black text-white">إدارة تسجيل وهوية المرضى والبحث المركزي</h2>
          <p className="text-xs text-blue-200 mt-1 max-w-2xl">
            مخصصة للبحث الموحد ومنع التكرار، والتحقق من الهويات الرسمية. لا تمثل بديلاً عن السجل السريري الطبي؛
            الأرقام الطبية (MRN) تصدر آلياً من النظام لضمان النزاهة المؤسسية.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={() => setIsUnknownErModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer border border-amber-400"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>تسجيل طوارئ مجهول الهوية (ER Unknown)</span>
          </button>

          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer border border-blue-400"
          >
            <UserPlus className="w-4 h-4" />
            <span>تسجيل مريض جديد (New Patient)</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Search & Match Panel (Left/Center) + Selected Demographic Detail (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Search & Results List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search Controls */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="ابحث بالاسم، رقم الملف MRN، الهوية الوطنية، جواز السفر أو الجوال..."
                  className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                  >
                    مسح
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto shrink-0 overflow-x-auto text-xs">
                {(['all', 'mrn', 'nationalId', 'name', 'mobile'] as const).map(fType => (
                  <button
                    key={fType}
                    onClick={() => setSearchFilterType(fType)}
                    className={`px-2.5 py-1.5 rounded-lg font-bold border transition-colors cursor-pointer ${
                      searchFilterType === fType
                        ? 'bg-blue-50 text-blue-700 border-blue-300'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {fType === 'all' && 'الكل'}
                    {fType === 'mrn' && 'MRN'}
                    {fType === 'nationalId' && 'الهوية'}
                    {fType === 'name' && 'الاسم'}
                    {fType === 'mobile' && 'الجوال'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
              <span>
                عدد النتائج المطابقة: <strong className="text-slate-800 font-bold">{filteredPatients.length}</strong> مريض
              </span>
              <span className="text-[11px] text-slate-400">
                مطابقة دقيقة ومقترحة (Exact & Possible Matches)
              </span>
            </div>
          </div>

          {/* Results List */}
          <div className="space-y-2">
            {filteredPatients.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center">
                <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-700">لا توجد نتائج مطابقة لبحثك</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                  تأكد من صحة رقم الملف الطبي أو الهوية الوطنية، أو يمكنك تسجيل ملف مريض جديد فوراً مع مراجعة منع التكرار.
                </p>
                <button
                  onClick={() => setIsRegisterModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>تسجيل ملف جديد بهذا الاسم</span>
                </button>
              </div>
            ) : (
              filteredPatients.map(p => {
                const isSelected = selectedPatient?.id === p.id;
                const hasAdminAlert = p.administrativeAlerts && p.administrativeAlerts.length > 0;
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedPatient(p);
                      onSelectPatient(p);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-500 shadow-sm ring-1 ring-blue-500/30'
                        : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-black text-slate-900">{p.fullNameAr}</h4>
                          {p.isNewborn && (
                            <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 border border-purple-300 text-[10px] font-bold flex items-center gap-1">
                              <Baby className="w-3 h-3 text-purple-600" />
                              وليد مستقل {p.birthOrder ? `(توأم ${p.birthOrder})` : ''}
                            </span>
                          )}
                          {p.isTemporaryUnknown && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3 text-amber-600" />
                              مؤقت (طوارئ مجهول)
                            </span>
                          )}
                          {hasAdminAlert && (
                            <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-800 border border-red-300 text-[10px] font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-red-600" />
                              تنبيه إداري
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-500 font-medium">
                          {p.fullNameEn}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-slate-600 pt-1 flex-wrap">
                          <span className="font-mono font-bold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded">
                            {p.mrn}
                          </span>
                          {p.nationalId && (
                            <span>الهوية: <strong className="font-mono text-slate-700">{p.nationalId}</strong></span>
                          )}
                          {p.passportNo && (
                            <span>جواز السفر: <strong className="font-mono text-slate-700">{p.passportNo}</strong></span>
                          )}
                          <span>الميلاد: {p.dob}</span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span className="font-mono">{p.mobile}</span>
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 text-left">
                        <span className="text-[11px] px-2 py-1 rounded-lg bg-slate-100 text-slate-600 font-bold border border-slate-200">
                          {p.previousEncountersCount} زيارات سابقة
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected Demographic Identity & Administrative Actions (5 cols) */}
        <div className="lg:col-span-5">
          {selectedPatient ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-5 sticky top-24">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    ملف الهوية الإدارية المعتمد
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-1">
                    {selectedPatient.fullNameAr}
                  </h3>
                  <div className="text-xs text-slate-500">{selectedPatient.fullNameEn}</div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-black text-blue-700 bg-blue-100 px-2.5 py-1 rounded-xl border border-blue-300">
                    {selectedPatient.mrn}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1">
                    مسجل منذ: {selectedPatient.registeredAt}
                  </div>
                </div>
              </div>

              {/* Administrative Alerts if any */}
              {selectedPatient.administrativeAlerts && selectedPatient.administrativeAlerts.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>تنبيهات إدارية مسجلة (Administrative Alerts):</span>
                  </div>
                  {selectedPatient.administrativeAlerts.map(alt => (
                    <div key={alt.id} className="text-xs bg-white/70 p-2 rounded-lg border border-amber-200">
                      <strong className="block text-amber-950">{alt.title}</strong>
                      <p className="text-[11px] text-amber-800 mt-0.5">{alt.message}</p>
                    </div>
                  ))}
                  <div className="text-[10px] text-amber-700 font-medium">
                    * ملاحظة أمان: التنبيهات الإدارية تفصل تماماً عن الحساسيات والملاحظات السريرية.
                  </div>
                </div>
              )}

              {/* Newborn & Multiple Birth Specific Identity Context */}
              {selectedPatient.isNewborn && (
                <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-black text-xs text-purple-950">
                      <Baby className="w-4 h-4 text-purple-600" />
                      ملف هوية وليد مستقل (Distinct Newborn Profile)
                    </span>
                    {selectedPatient.multipleBirthIndicator && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-200 text-purple-900 text-[10px] font-bold">
                        ولادة متعددة / توأم ({selectedPatient.birthOrder || 1})
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-white/80 p-2.5 rounded-lg border border-purple-200">
                    <div>
                      <span className="text-slate-500 block">رقم ملف الأم (Mother MRN):</span>
                      <strong className="font-mono text-purple-950 font-bold">{selectedPatient.motherMrn}</strong>
                      <span className="text-[10px] text-slate-500 block">{selectedPatient.motherNameAr}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">الاسم المؤقت / سياق التسمية:</span>
                      <strong className="text-purple-950">{selectedPatient.temporaryNewbornNamingContext || selectedPatient.fullNameAr}</strong>
                    </div>
                  </div>

                  {selectedPatient.identityAmbiguityWarning && (
                    <div className="p-2 rounded-lg bg-amber-100/80 border border-amber-300 text-amber-950 text-[11px] flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-bold">تنبيه تشابه الهوية في التوائم:</strong>
                        <span>{selectedPatient.identityAmbiguityWarning}</span>
                      </div>
                    </div>
                  )}

                  {selectedPatient.identificationVerificationContext && (
                    <div className="text-[10px] text-purple-800 bg-purple-100/60 px-2 py-1 rounded">
                      <strong>إثبات الهوية السريرية:</strong> {selectedPatient.identificationVerificationContext}
                    </div>
                  )}

                  <div className="text-[10px] text-slate-500 border-t border-purple-200/60 pt-1">
                    * المعيار المؤسسي: لكل وليد رقم طبي مستقل (MRN). لا يُستخدم رقم الأم كمعرّف للوليد، ولا تُلغى استقلاليته.
                  </div>
                </div>
              )}

              {/* Demographic Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[11px]">الهوية / الإقامة:</span>
                  <strong className="font-mono text-slate-800">
                    {selectedPatient.nationalId || selectedPatient.passportNo || 'غير مسجل'}
                  </strong>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[11px]">تاريخ الميلاد / العمر:</span>
                  <strong className="text-slate-800">{selectedPatient.dob}</strong>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[11px]">الجنس:</span>
                  <strong className="text-slate-800">{selectedPatient.gender === 'male' ? 'ذكر' : 'أنثى'}</strong>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[11px]">رقم الجوال:</span>
                  <strong className="font-mono text-slate-800">{selectedPatient.mobile}</strong>
                </div>

                <div className="col-span-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[11px]">العنوان السكني:</span>
                  <strong className="text-slate-800">
                    {selectedPatient.address.city}، {selectedPatient.address.district}
                    {selectedPatient.address.street ? `، ${selectedPatient.address.street}` : ''}
                  </strong>
                </div>

                <div className="col-span-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[11px]">جهة الاتصال في الطوارئ (Next of Kin):</span>
                  <div className="flex items-center justify-between mt-0.5">
                    <strong className="text-slate-800">
                      {selectedPatient.emergencyContact.name} ({selectedPatient.emergencyContact.relationship})
                    </strong>
                    <span className="font-mono text-slate-600">{selectedPatient.emergencyContact.mobile}</span>
                  </div>
                </div>
              </div>

              {/* Active Encounter Context Indicator */}
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-indigo-600" />
                    حالة الزيارة الحالية (Encounter Context)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-indigo-200 text-indigo-900 font-mono font-bold text-[10px]">
                    {selectedPatient.activeEncounterId || 'لا توجد زيارة نشطة'}
                  </span>
                </div>
                <p className="text-[11px] text-indigo-800 mt-1">
                  المريض ≠ الزيارة (Encounter). يمكن فتح الملف السريري الكامل إذا كان المريض في زيارة فعالة ومصرح بها.
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2">
                {selectedPatient.isTemporaryUnknown && (
                  <button
                    onClick={() => {
                      // Set default target to the first non-temporary patient
                      const nonTemp = patients.find(p => !p.isTemporaryUnknown);
                      if (nonTemp) setTargetMergePatientId(nonTemp.id);
                      setIsMergeModalOpen(true);
                    }}
                    className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>تسوية ودمج هوية الطوارئ المؤقتة بالملف المعتمد</span>
                  </button>
                )}

                <button
                  onClick={() => onOpenPatientWorkspace(selectedPatient.mrn, selectedPatient.activeEncounterId)}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>فتح السجل السريري للمريض (Patient Workspace)</span>
                </button>

                <p className="text-[10px] text-center text-slate-400">
                  الانتقال يحفظ سياق البحث ويسمح بالرجوع المباشر (Origin Preservation)
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
              اختر مريضاً من القائمة لعرض تفاصيل هويته الإدارية
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: New Patient Registration Form with Mock MRN Generation Notice */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-blue-600" />
                  تسجيل مريض جديد (New Patient Registration)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  الرقم الطبي (MRN) يُنشأ آلياً من النظام لضمان النزاهة وتفادي الإدخال اليدوي المكرر.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsRegisterModalOpen(false);
                  resetForm();
                }}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Selection Tabs */}
            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setRegistrationProfile('standard')}
                className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  registrationProfile === 'standard'
                    ? 'bg-white text-blue-700 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>تسجيل مريض قياسي (Standard Patient)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRegistrationProfile('newborn');
                  const mother = patients.find(p => p.gender === 'female' && !p.isNewborn) || patients[0];
                  if (mother) {
                    setSelectedMotherId(mother.id);
                    setTempNewbornName(`وليد ${mother.fullNameAr} - 1`);
                  }
                }}
                className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  registrationProfile === 'newborn'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Baby className="w-4 h-4" />
                <span>تسجيل وليد / ولادة متعددة (Newborn Profile)</span>
              </button>
            </div>

            {/* Standard Registration Fields */}
            {registrationProfile === 'standard' ? (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">الاسم الرباعي بالعربية *</label>
                    <input
                      type="text"
                      value={newFullNameAr}
                      onChange={e => setNewFullNameAr(e.target.value)}
                      placeholder="مثال: خالد محمد عبد العزيز الشمري"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">الاسم بالإنجليزية *</label>
                    <input
                      type="text"
                      value={newFullNameEn}
                      onChange={e => setNewFullNameEn(e.target.value)}
                      placeholder="e.g. Khalid Mohammed Al-Shammari"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">رقم الهوية الوطنية / الإقامة *</label>
                    <input
                      type="text"
                      value={newNationalId}
                      onChange={e => setNewNationalId(e.target.value)}
                      placeholder="10 أرقام تبدأ بـ 1 أو 2"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">تاريخ الميلاد *</label>
                    <input
                      type="date"
                      value={newDob}
                      onChange={e => setNewDob(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">الجنس *</label>
                    <select
                      value={newGender}
                      onChange={e => setNewGender(e.target.value as 'male' | 'female')}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="male">ذكر (Male)</option>
                      <option value="female">أنثى (Female)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">رقم الجوال الشخصي *</label>
                    <input
                      type="text"
                      value={newMobile}
                      onChange={e => setNewMobile(e.target.value)}
                      placeholder="05XXXXXXXX"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                </div>

                {/* Address & Emergency Contact */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="font-bold text-slate-800">بيانات العنوان وجهة الاتصال في الطوارئ</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={newCity}
                      onChange={e => setNewCity(e.target.value)}
                      placeholder="المدينة"
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      value={newDistrict}
                      onChange={e => setNewDistrict(e.target.value)}
                      placeholder="الحي السكني"
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                    <select
                      value={newCommPref}
                      onChange={e => setNewCommPref(e.target.value as any)}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    >
                      <option value="sms">تفضيل التواصل: رسائل SMS</option>
                      <option value="whatsapp">تفضيل التواصل: واتساب</option>
                      <option value="call">تفضيل التواصل: اتصال هاتفي</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={newEmergencyName}
                      onChange={e => setNewEmergencyName(e.target.value)}
                      placeholder="اسم قريب الطوارئ"
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      value={newEmergencyRelation}
                      onChange={e => setNewEmergencyRelation(e.target.value)}
                      placeholder="صلة القرابة (أب، زوج، أخ...)"
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      value={newEmergencyMobile}
                      onChange={e => setNewEmergencyMobile(e.target.value)}
                      placeholder="جوال الطوارئ"
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Optional Administrative Alert on creation */}
                <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-blue-900">تنبيه إداري خاص (اختياري):</label>
                    <span className="text-[10px] text-blue-700 font-medium">ليس حساسية سريرية أو تشخيصاً طبياً</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <select
                      value={newAdminAlertType}
                      onChange={e => setNewAdminAlertType(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-xs text-slate-800"
                    >
                      <option value="none">لا يوجد تنبيه إداري</option>
                      <option value="confidentiality_vip">خصوصية إدارية / كبار الشخصيات (VIP)</option>
                      <option value="payer_restriction">متطلب موافقة مالية أو تأمينية</option>
                      <option value="identity_warning">تحقق إضافي من وثيقة الهوية</option>
                    </select>
                    {newAdminAlertType !== 'none' && (
                      <input
                        type="text"
                        value={newAdminAlertText}
                        onChange={e => setNewAdminAlertText(e.target.value)}
                        placeholder="نص التنبيه الإداري للموظفين..."
                        className="px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-xs text-slate-800"
                      />
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Dedicated Newborn & Multiple-Birth Registration Profile */
              <div className="space-y-4 text-xs">
                {/* Newborn Core Principle Callout */}
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-purple-900 space-y-1 text-xs">
                  <div className="flex items-center gap-2 font-bold text-purple-950">
                    <Baby className="w-4 h-4 text-purple-700" />
                    <span>معايير تسجيل المواليد وحوكمة الهوية الوطنية (Joint Commission & IHE PAM):</span>
                  </div>
                  <p className="text-[11px] text-purple-800">
                    • <strong>استقلالية الهوية:</strong> يُخصص لكل وليد رقم طبي مستقل (MRN) فوراً، ولا يُستخدم رقم الأم كمعرّف للوليد.
                  </p>
                  <p className="text-[11px] text-purple-800">
                    • <strong>معلومات مجهولة صراحة:</strong> الاسم الرسمي ورقم الهوية الوطنية يظلان غير معروفين صراحة (Explicitly Unknown) حتى التبليغ الرسمي لدى الأحوال المدنية.
                  </p>
                </div>

                {/* Mother Linkage */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ملف الأم المرتبط (Mother Reference) *
                  </label>
                  <select
                    value={selectedMotherId}
                    onChange={e => {
                      setSelectedMotherId(e.target.value);
                      const m = patients.find(p => p.id === e.target.value);
                      if (m) setTempNewbornName(`وليد ${m.fullNameAr} - ${birthOrder}`);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-xs"
                  >
                    {patients.filter(p => p.gender === 'female' && !p.isNewborn).map(m => (
                      <option key={m.id} value={m.id}>
                        {m.fullNameAr} — {m.mrn} (هوية: {m.nationalId || 'مسجلة'})
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    * رقم ملف الأم هو مرجع نسب ورعاية، ولا يحل محل رقم ملف الوليد المستقل.
                  </span>
                </div>

                {/* Multiple Birth Indicator & Order */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isMultipleBirth}
                        onChange={e => setIsMultipleBirth(e.target.checked)}
                        className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                      />
                      <span>حالة ولادة متعددة / توائم (Multiple Birth Indicator)</span>
                    </label>
                    {isMultipleBirth && (
                      <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold">
                        يتطلب تدقيق تشابه الهوية
                      </span>
                    )}
                  </div>

                  {isMultipleBirth && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          ترتيب الولادة في التوائم (Birth Sequence / Order) *
                        </label>
                        <select
                          value={birthOrder}
                          onChange={e => {
                            const ord = parseInt(e.target.value);
                            setBirthOrder(ord);
                            const m = patients.find(p => p.id === selectedMotherId);
                            if (m) setTempNewbornName(`وليد ${m.fullNameAr} - ${ord}`);
                          }}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-purple-900"
                        >
                          <option value={1}>1 — التوأم الأول (Twin A)</option>
                          <option value={2}>2 — التوأم الثاني (Twin B)</option>
                          <option value={3}>3 — التوأم الثالث (Triplet C)</option>
                          <option value={4}>4 — التوأم الرابع (Quadruplet D)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          الاسم المؤقت وسياق التسمية *
                        </label>
                        <input
                          type="text"
                          value={tempNewbornName}
                          onChange={e => setTempNewbornName(e.target.value)}
                          placeholder="مثال: وليد نورة السالم - 1"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Gender & Birth Timestamp */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">الجنس البيولوجي *</label>
                    <select
                      value={newbornGender}
                      onChange={e => setNewbornGender(e.target.value as 'male' | 'female')}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <option value="male">ذكر (Male)</option>
                      <option value="female">أنثى (Female)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">تاريخ ووقت الولادة الدقيق *</label>
                    <input
                      type="datetime-local"
                      value={newbornBirthTime}
                      onChange={e => setNewbornBirthTime(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                    />
                  </div>
                </div>

                {/* Clinical Verification Context */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    سياق التحقق من الهوية السريرية (Identification Verification Context) *
                  </label>
                  <input
                    type="text"
                    value={verificationContext}
                    onChange={e => setVerificationContext(e.target.value)}
                    placeholder="مثال: مطابقة سوار الوليد المزدوج مع سوار الأم وبصمة القدم في L&D"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                {/* Identity Ambiguity Warning Notice */}
                {isMultipleBirth && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-xs font-bold text-amber-950">
                        تنبيه منع أخطاء تشابه الهوية (Multiple Birth Safety):
                      </strong>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        تشابه الأسماء المؤقتة وتطابق تاريخ الميلاد للأشقاء التوائم يتطلب دائماً التأكد من سوار المعصم ورقم الملف المستقل في كل خطوة صرف دوائي أو فحص دم.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div className="text-[11px] text-slate-500">
                {registrationProfile === 'standard'
                  ? 'سيتم فحص التشابه ومنع تكرار الملفات تلقائياً قبل الحفظ.'
                  : 'سيتم توليد رقم ملف طبي مستقل للوليد وربط نسب الرعاية بالأم.'}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleInitiateRegistration}
                  disabled={registrationProfile === 'standard' ? !newFullNameAr.trim() : !tempNewbornName.trim()}
                  className={`px-5 py-2 rounded-xl font-bold text-xs shadow-sm cursor-pointer disabled:opacity-50 text-white ${
                    registrationProfile === 'standard'
                      ? 'bg-blue-600 hover:bg-blue-500'
                      : 'bg-purple-600 hover:bg-purple-500'
                  }`}
                >
                  {registrationProfile === 'standard'
                    ? 'فحص التكرار وإصدار الملف (MRN)'
                    : 'تسجيل الوليد وإصدار الملف المستقل'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Possible Duplicate Review (Duplicate Patient Safety) */}
      {duplicateReviewMatch && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border-2 border-amber-500 shadow-2xl max-w-2xl w-full p-6 space-y-5">
            <div className="flex items-center gap-3 border-b border-amber-100 pb-3">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-amber-950">
                  تنبيه احتمالية وجود ملف مريض مكرر (Possible Duplicate Match)
                </h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  تم رصد تشابه عالي ({duplicateReviewMatch.similarityScore}%) مع ملف مسجل مسبقاً. لمنع تكرار الهويات الطبية، يرجى المراجعة بدقة.
                </p>
              </div>
            </div>

            {/* Comparison Table */}
            <div className="overflow-hidden rounded-xl border border-slate-200 text-xs">
              <table className="w-full text-right">
                <thead className="bg-slate-100 text-slate-700 font-bold">
                  <tr>
                    <th className="p-2.5">الحقل</th>
                    <th className="p-2.5 bg-blue-50/60 text-blue-950">الملف القائم المسجل ({duplicateReviewMatch.existingPatient.mrn})</th>
                    <th className="p-2.5 bg-amber-50/60 text-amber-950">البيانات المدخلة الآن</th>
                    <th className="p-2.5 text-center">التطابق</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {duplicateReviewMatch.matchingFields.map((f, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-600">{f.labelAr}</td>
                      <td className="p-2.5 font-mono text-slate-800">{f.existingVal}</td>
                      <td className="p-2.5 font-mono text-slate-800">{f.candidateVal}</td>
                      <td className="p-2.5 text-center">
                        {f.isExact ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            متطابق تماماً
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                            متقارب
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <strong className="block text-slate-800">قواعد حوكمة ملفات المرضى:</strong>
              <p className="text-[11px]">
                • لا يتم الدمج الآلي للملفات (No automatic merge) لتفادي اختلاط السجلات السريرية.
              </p>
              <p className="text-[11px]">
                • إذا كان هو نفس المريض: يرجى فتح واستخدام الملف القائم ({duplicateReviewMatch.existingPatient.mrn}).
              </p>
              <p className="text-[11px]">
                • إذا تم التأكد أنهما شخصان مختلفان (تشابه أسماء): يمكنك تأكيد الاستقلالية والمتابعة لإنشاء ملف جديد.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-2">
              <button
                onClick={() => setDuplicateReviewMatch(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
              >
                رجوع وتعديل البيانات
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    // Use existing patient
                    setSelectedPatient(duplicateReviewMatch.existingPatient);
                    onSelectPatient(duplicateReviewMatch.existingPatient);
                    setDuplicateReviewMatch(null);
                    setIsRegisterModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>استخدام الملف القائم ({duplicateReviewMatch.existingPatient.mrn})</span>
                </button>

                <button
                  onClick={() => {
                    // Confirm distinct and proceed
                    completeRegistration();
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-sm cursor-pointer"
                >
                  تأكيد أنه شخص مختلف وإصدار ملف جديد
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ER Unknown/Unidentified Patient Registration */}
      {isUnknownErModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border-2 border-amber-500 shadow-2xl max-w-xl w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-amber-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    تسجيل طوارئ مجهول الهوية (ER Unknown / Trauma Tag)
                  </h3>
                  <p className="text-xs text-amber-800 mt-0.5">
                    إصدار هوية نظام مؤقتة للإنقاذ والإنعاش الفوري دون تأخير سريري.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsUnknownErModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                <strong className="block">معيار الهوية المؤقتة:</strong>
                <p className="text-[11px] mt-0.5">
                  يصدر النظام معرّفاً مؤقتاً بتنسيق <code className="font-mono font-bold">TEMP-ER-YYYY-XXX</code> وسوار طوارئ مشفر لتتبع العينات والأشعة، لحين تسوية الهوية لاحقاً مع البصمة أو الأوراق الثبوتية.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رمز بطاقة الإصابات (Trauma Tag Code) *</label>
                  <input
                    type="text"
                    value={unknownTraumaTag}
                    onChange={e => setUnknownTraumaTag(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الجنس التقديري الظاهري *</label>
                  <select
                    value={unknownEstGender}
                    onChange={e => setUnknownEstGender(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="male">ذكر (Male)</option>
                    <option value="female">أنثى (Female)</option>
                    <option value="unknown">غير محدد بدقة (Unspecified)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">العمر التقريبي بالسنوات *</label>
                  <input
                    type="number"
                    value={unknownEstAge}
                    onChange={e => setUnknownEstAge(Number(e.target.value))}
                    min={1}
                    max={100}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">مصدر النقل / موقع الحادث</label>
                  <input
                    type="text"
                    value={unknownLocation}
                    onChange={e => setUnknownLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-[11px] text-slate-400">
                يمكن تتبع المريض بالملف المؤقت في كافة محطات الرعاية
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsUnknownErModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleRegisterUnknownErPatient}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-sm cursor-pointer"
                >
                  إصدار هوية الطوارئ المؤقتة فوراً
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Merge Temporary ER Trauma Identity into Master Patient */}
      {isMergeModalOpen && selectedPatient && selectedPatient.isTemporaryUnknown && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border-2 border-amber-500 shadow-2xl max-w-xl w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-amber-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800">
                  <ShieldCheck className="w-6 h-6 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    تسوية هوية الطوارئ المؤقتة ودمج الملف (Merge Temporary Identity)
                  </h3>
                  <p className="text-xs text-amber-800 mt-0.5">
                    ربط السجل الإسعافي بالملف الطبي المعتمد بعد التحقق الثبوتي من هوية المريض.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMergeModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Source Temporary Record */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-1">
                <span className="text-amber-800 font-bold block">الملف المؤقت المصدر (Source Temporary Record):</span>
                <div className="flex items-center justify-between font-mono text-xs">
                  <strong className="text-amber-950">{selectedPatient.mrn} — {selectedPatient.fullNameAr}</strong>
                  <span className="text-amber-700 bg-amber-200/70 px-2 py-0.5 rounded text-[10px] font-bold">
                    {selectedPatient.temporaryTag}
                  </span>
                </div>
              </div>

              {/* Target Master Record Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">الملف الرئيسي المستهدف للدمج (Master Patient) *</label>
                <select
                  value={targetMergePatientId}
                  onChange={e => setTargetMergePatientId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-xs"
                >
                  {patients.filter(p => !p.isTemporaryUnknown).map(p => (
                    <option key={p.id} value={p.id}>
                      {p.fullNameAr} — {p.mrn} {p.nationalId ? `(هوية: ${p.nationalId})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Verification Notes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">طريقة ومبرر التحقق الثبوتي (Verification Note) *</label>
                <textarea
                  rows={2}
                  value={mergeVerificationNote}
                  onChange={e => setMergeVerificationNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              {/* Invariant Guarantees (FHIR Patient.link Semantics) */}
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-900 space-y-1.5 text-[11px]">
                <strong className="block text-blue-950 font-bold">ضمانات تكامل البيانات وسلامة المريض (FHIR Patient.link Semantics):</strong>
                <p>• يُربط السجل المؤقت بـ <code className="font-bold text-blue-800">linkType: 'replaced-by'</code> مع السجل المعتمد المستهدف <code className="font-bold text-blue-800">('replaces')</code>.</p>
                <p>• يُحفظ المعرّف المؤقت <code className="font-bold">{selectedPatient.mrn}</code> كمعرّف بديل (Historical Identifier / Alias) دون أي حذف فيزيائي للبيانات.</p>
                <p>• تُربط وتُسند كافة الزيارات والفحوصات المخبرية والإشعاعية التي تولدت أثناء الحالة بالملف المعتمد مع الحفاظ على سلامة التسلسل الزمني.</p>
                <p className="text-red-700 font-medium pt-1 border-t border-blue-200/60">
                  * حظر أمان قطعي: الدمج يُستخدم فقط لنفس الفرد الإنساني الواحد (Same Individual). يُحظر قطعياً دمج سجلين لأفراد مستقلين (كالوليد وأمه).
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsMergeModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleExecuteMerge}
                disabled={!targetMergePatientId}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-sm cursor-pointer disabled:opacity-50"
              >
                تأكيد دمج السجلات وتسوية الهوية
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
