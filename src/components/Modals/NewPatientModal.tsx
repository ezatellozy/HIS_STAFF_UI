import React, { useState } from 'react';
import { X, UserPlus, ShieldAlert, Heart, Phone, FileText, CheckCircle } from 'lucide-react';
import { useHis } from '../../context/HisContext';
import { Patient } from '../../types/his';

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (patient: Patient) => void;
}

export const NewPatientModal: React.FC<NewPatientModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { registerPatient } = useHis();

  const [formData, setFormData] = useState({
    fullNameAr: '',
    fullNameEn: '',
    nationalId: '',
    gender: 'male' as 'male' | 'female',
    dob: '1990-01-01',
    bloodType: 'O+' as Patient['bloodType'],
    phone: '',
    email: '',
    address: 'القاهرة، مصر',
    insuranceProvider: 'علاج نقدي (Cash / Private)',
    insurancePolicyNo: 'CASH',
    insuranceClass: 'Cash' as Patient['insuranceClass'],
    insuranceCoveragePercent: 0,
    emergencyName: '',
    emergencyRelation: 'أقارب درجة أولى',
    emergencyPhone: '',
    chronicConditions: [] as string[],
    allergies: [] as string[]
  });

  const [newChronic, setNewChronic] = useState('');
  const [newAllergy, setNewAllergy] = useState('');

  if (!isOpen) return null;

  // Calculate age from DOB
  const calculateAge = (dobString: string) => {
    const birth = new Date(dobString);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return Math.max(0, age);
  };

  const commonAllergies = ['بنسلين (Penicillin)', 'سلفا (Sulfonamides)', 'أسبرين (Aspirin)', 'فول سوداني (Peanut)', 'لاتكس (Latex)'];
  const commonConditions = ['ارتفاع ضغط الدم (HTN)', 'السكري (DM)', 'ربو شعبي (Asthma)', 'قصور شرايين تاجية (CAD)'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullNameAr.trim() || !formData.phone.trim()) {
      alert('يرجى إدخال اسم المريض ورقم الهاتف');
      return;
    }

    const patient = registerPatient({
      fullNameAr: formData.fullNameAr,
      fullNameEn: formData.fullNameEn || formData.fullNameAr,
      nationalId: formData.nationalId || `ID-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      gender: formData.gender,
      dob: formData.dob,
      age: calculateAge(formData.dob),
      bloodType: formData.bloodType,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      insuranceProvider: formData.insuranceProvider,
      insurancePolicyNo: formData.insurancePolicyNo,
      insuranceClass: formData.insuranceClass,
      insuranceCoveragePercent: formData.insuranceCoveragePercent,
      emergencyContact: {
        name: formData.emergencyName || 'غير مسجل',
        relation: formData.emergencyRelation,
        phone: formData.emergencyPhone || formData.phone
      },
      chronicConditions: formData.chronicConditions,
      allergies: formData.allergies.length > 0 ? formData.allergies : ['لا توجد حساسية معروفة (NKDA)']
    });

    if (onSuccess) {
      onSuccess(patient);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base md:text-lg">فتح ملف مريض جديد (New Patient Registration)</h3>
              <p className="text-xs text-slate-400">
                تسجيل بيانات المريض وتوليد رقم الملف الطبي المركزي (MRN)
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

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 text-slate-800 text-sm">
          {/* Section 1: Demographics */}
          <div>
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3 pb-1 border-b border-slate-200 flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              البيانات الشخصية والرقم القومي
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  الاسم الرباعي باللغة العربية <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: حسام عادل الشناوي"
                  value={formData.fullNameAr}
                  onChange={e => setFormData({ ...formData, fullNameAr: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  الاسم بالإنجليزية (Full Name in English)
                </label>
                <input
                  type="text"
                  dir="ltr"
                  placeholder="e.g. Hossam Adel El-Shennawy"
                  value={formData.fullNameEn}
                  onChange={e => setFormData({ ...formData, fullNameEn: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-left"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  الرقم القومي / رقم الإقامة / جواز السفر
                </label>
                <input
                  type="text"
                  dir="ltr"
                  placeholder="14 رقماً للبطاقة القومية"
                  value={formData.nationalId}
                  onChange={e => setFormData({ ...formData, nationalId: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-left font-mono"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">النوع</label>
                  <select
                    value={formData.gender}
                    onChange={e => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })}
                    className="w-full px-2 py-2 text-sm rounded-lg border border-slate-300 focus:ring-teal-500"
                  >
                    <option value="male">ذكر (Male)</option>
                    <option value="female">أنثى (Female)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">تاريخ الميلاد</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={e => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-2 py-2 text-sm rounded-lg border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">فصيلة الدم</label>
                  <select
                    value={formData.bloodType}
                    onChange={e => setFormData({ ...formData, bloodType: e.target.value as Patient['bloodType'] })}
                    className="w-full px-2 py-2 text-sm rounded-lg border border-slate-300 font-mono"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bt => (
                      <option key={bt} value={bt}>{bt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  رقم الهاتف المحمول <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  dir="ltr"
                  required
                  placeholder="+20 100 000 0000"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-teal-500 text-left font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">محل الإقامة / العنوان</label>
                <input
                  type="text"
                  placeholder="المدينة، الحي"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Insurance & Billing Tier */}
          <div>
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3 pb-1 border-b border-slate-200 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-blue-600" />
              بيانات التغطية التأمينية والمالية
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">جهة التأمين الطبي</label>
                <select
                  value={formData.insuranceProvider}
                  onChange={e => {
                    const provider = e.target.value;
                    let coverage = 0;
                    let cls: Patient['insuranceClass'] = 'Cash';
                    if (provider.includes('Bupa')) {
                      coverage = 90;
                      cls = 'VIP';
                    } else if (provider.includes('Tawuniya') || provider.includes('التعاونية')) {
                      coverage = 80;
                      cls = 'A';
                    } else if (provider.includes('MedNet') || provider.includes('ميدنت')) {
                      coverage = 75;
                      cls = 'B';
                    } else if (provider.includes('نقابة')) {
                      coverage = 80;
                      cls = 'A';
                    }
                    setFormData({
                      ...formData,
                      insuranceProvider: provider,
                      insuranceCoveragePercent: coverage,
                      insuranceClass: cls
                    });
                  }}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-teal-500"
                >
                  <option value="علاج نقدي (Cash / Private)">علاج نقدي خاص (Cash)</option>
                  <option value="بوبا للتأمين (Bupa Global)">بوبا العالمية (Bupa Global)</option>
                  <option value="التعاونية للتأمين (Tawuniya)">التعاونية للتأمين (Tawuniya)</option>
                  <option value="ميدنت للرعاية الصحية (MedNet)">ميدنت (MedNet Health)</option>
                  <option value="تأمين نقابة المهندسين / الأطباء">نقابة المهن الطبية / المهندسين</option>
                  <option value="مصر للتأمين التكافلي">مصر للتأمين التكافلي</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">رقم البوليصة / الكارت</label>
                <input
                  type="text"
                  dir="ltr"
                  placeholder="Policy / Card No"
                  value={formData.insurancePolicyNo}
                  onChange={e => setFormData({ ...formData, insurancePolicyNo: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 font-mono text-left"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">نسبة التغطية التأمينية (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.insuranceCoveragePercent}
                  onChange={e => setFormData({ ...formData, insuranceCoveragePercent: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 font-mono text-center"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Clinical Safety (Allergies & Chronic) */}
          <div>
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3 pb-1 border-b border-slate-200 flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-600" />
              السلامة السريرية: الحساسية الدوائية والأمراض المزمنة
            </h4>

            {/* Allergies Warning */}
            <div className="mb-4 bg-red-50 p-3 rounded-xl border border-red-200">
              <label className="block text-xs font-bold text-red-900 mb-1.5 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                الحساسية الدوائية والغذائية (Drug & Food Allergies):
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {commonAllergies.map(alg => {
                  const isSelected = formData.allergies.includes(alg);
                  return (
                    <button
                      type="button"
                      key={alg}
                      onClick={() => {
                        if (isSelected) {
                          setFormData({ ...formData, allergies: formData.allergies.filter(a => a !== alg) });
                        } else {
                          setFormData({ ...formData, allergies: [...formData.allergies, alg] });
                        }
                      }}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                        isSelected
                          ? 'bg-red-600 text-white border-red-700 font-bold shadow-xs'
                          : 'bg-white text-slate-700 border-red-200 hover:bg-red-100'
                      }`}
                    >
                      {alg} {isSelected && '✓'}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="إضافة حساسية أخرى (مثال: ألبان، بنج موضعي...)"
                  value={newAllergy}
                  onChange={e => setNewAllergy(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-red-300 bg-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newAllergy.trim()) {
                      setFormData({ ...formData, allergies: [...formData.allergies, newAllergy.trim()] });
                      setNewAllergy('');
                    }
                  }}
                  className="px-3 py-1.5 text-xs bg-red-700 hover:bg-red-800 text-white rounded-lg font-bold"
                >
                  إضافة
                </button>
              </div>
            </div>

            {/* Chronic Conditions */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                الأمراض المزمنة المسجلة (Chronic Conditions):
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {commonConditions.map(cond => {
                  const isSelected = formData.chronicConditions.includes(cond);
                  return (
                    <button
                      type="button"
                      key={cond}
                      onClick={() => {
                        if (isSelected) {
                          setFormData({
                            ...formData,
                            chronicConditions: formData.chronicConditions.filter(c => c !== cond)
                          });
                        } else {
                          setFormData({
                            ...formData,
                            chronicConditions: [...formData.chronicConditions, cond]
                          });
                        }
                      }}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                        isSelected
                          ? 'bg-teal-600 text-white border-teal-700 font-bold'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {cond} {isSelected && '✓'}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="إضافة مرض مزمن آخر..."
                  value={newChronic}
                  onChange={e => setNewChronic(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newChronic.trim()) {
                      setFormData({
                        ...formData,
                        chronicConditions: [...formData.chronicConditions, newChronic.trim()]
                      });
                      setNewChronic('');
                    }
                  }}
                  className="px-3 py-1.5 text-xs bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-bold"
                >
                  إضافة
                </button>
              </div>
            </div>
          </div>

          {/* Section 4: Emergency Contact */}
          <div>
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3 pb-1 border-b border-slate-200 flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-600" />
              بيانات التواصل في حالات الطوارئ (Emergency Contact)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">اسم الشخص للطوارئ</label>
                <input
                  type="text"
                  placeholder="مثال: أحمد (الابن / الزوج)"
                  value={formData.emergencyName}
                  onChange={e => setFormData({ ...formData, emergencyName: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">صلة القرابة</label>
                <input
                  type="text"
                  placeholder="زوجة، ابن، والد..."
                  value={formData.emergencyRelation}
                  onChange={e => setFormData({ ...formData, emergencyRelation: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">رقم هاتف الطوارئ</label>
                <input
                  type="tel"
                  dir="ltr"
                  placeholder="+20 100 000 0000"
                  value={formData.emergencyPhone}
                  onChange={e => setFormData({ ...formData, emergencyPhone: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 font-mono text-left"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              <span>تأكيد التسجيل وإنشاء رقم الملف (MRN)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
