import React from 'react';
import { X, Printer, Activity, QrCode, ShieldCheck } from 'lucide-react';
import { useHis } from '../../context/HisContext';
import { EdinaLogo } from '../common/EdinaLogo';

export const PrintPrescriptionModal: React.FC = () => {
  const { printPrescriptionData, setPrintPrescriptionData } = useHis();

  if (!printPrescriptionData) return null;

  const { patient, consultation, doctor } = printPrescriptionData;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden print:border-none print:shadow-none print:w-full print:max-w-none animate-in fade-in zoom-in-95">
        {/* Print Action Bar (Hidden on print) */}
        <div className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-teal-400" />
            <span className="font-bold text-sm">معاينة الروشتة الطبية الإلكترونية للطباعة (Official Rx)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الروشتة (Print Rx)</span>
            </button>
            <button
              onClick={() => setPrintPrescriptionData(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Prescription Content */}
        <div className="p-8 space-y-6 text-slate-800 font-sans" id="printable-rx">
          {/* Hospital Letterhead Header */}
          <div className="border-b-2 border-teal-700 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <EdinaLogo variant="mark-only" size="lg" theme="light" />
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>مستشفيات إدينا التخصصية</span>
                  <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    Edina HIS Rx
                  </span>
                </h1>
                <p className="text-xs font-semibold text-teal-800">
                  Edina Specialized Hospital & Clinics • Medical City
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  ISO 9001:2026 Certified • JCI & CBAHI Accredited Hospital • الخط الساخن: 19888
                </p>
              </div>
            </div>

            <div className="text-left text-xs">
              <div className="font-bold text-slate-900">{doctor.name}</div>
              <div className="text-teal-700 text-[11px]">{doctor.title}</div>
              <div className="text-slate-500 text-[10px] font-mono">ترخيص مزاولة مهنة: {doctor.licenseNo}</div>
            </div>
          </div>

          {/* Patient Info Strip */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block">اسم المريض:</span>
              <strong className="text-slate-900 text-sm">{patient.fullNameAr}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">رقم الملف الطبي (MRN):</span>
              <strong className="text-teal-800 font-mono text-sm">{patient.mrn}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">السن / النوع:</span>
              <strong className="text-slate-800">{patient.age} سنة / {patient.gender === 'male' ? 'ذكر' : 'أنثى'}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">تاريخ الكشف:</span>
              <strong className="text-slate-800 font-mono">
                {new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'numeric', day: 'numeric' })}
              </strong>
            </div>
          </div>

          {/* Allergy Safety Banner if any */}
          {patient.allergies && patient.allergies.length > 0 && !patient.allergies.includes('لا توجد حساسية معروفة (NKDA)') && (
            <div className="px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-red-600" />
              <span>تنبيه حساسية المريض: <strong>{patient.allergies.join('، ')}</strong></span>
            </div>
          )}

          {/* Diagnosis / ICD-10 */}
          {consultation.icd10Codes && consultation.icd10Codes.length > 0 && (
            <div className="text-xs">
              <span className="text-slate-500 font-semibold block mb-1">التشخيص الطبي (Clinical Diagnosis):</span>
              <div className="flex flex-wrap gap-1.5">
                {consultation.icd10Codes.map(diag => (
                  <span
                    key={diag.code}
                    className="px-2.5 py-1 rounded-md bg-teal-50 text-teal-900 border border-teal-200 font-medium"
                  >
                    <strong>[{diag.code}]</strong> {diag.titleAr}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Rx Icon & Drugs List */}
          <div className="pt-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-3xl font-serif font-black text-teal-800 italic">℞</span>
              <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                العلاج والوصفة الدوائية المعتمدة (Prescribed Medications)
              </span>
            </div>

            <div className="space-y-3">
              {consultation.prescriptions && consultation.prescriptions.length > 0 ? (
                consultation.prescriptions.map((rx, idx) => (
                  <div
                    key={rx.id || idx}
                    className="p-3 bg-white rounded-xl border border-slate-200 flex items-start justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">
                          {rx.drugName} <span className="text-teal-700 font-mono text-xs">({rx.dose})</span>
                        </h4>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {rx.form} • طريق الإعطاء: {rx.route}
                        </span>
                      </div>
                      <div className="mt-1.5 mr-7 text-xs text-slate-700 space-y-0.5">
                        <div>
                          <strong>الجرعة والتكرار:</strong> {rx.frequency} — لمدة {rx.duration}
                        </div>
                        {rx.instructions && (
                          <div className="text-slate-600">
                            <strong>تعليمات الاستعمال:</strong> {rx.instructions}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
                  لا توجد أدوية مضافة في هذه الزيارة
                </div>
              )}
            </div>
          </div>

          {/* General Doctor Instructions & Next Visit */}
          {consultation.plan && (
            <div className="text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <strong className="text-slate-800 block mb-1">تعليمات وتوصيات الطبيب المعالج:</strong>
              <p className="text-slate-600 whitespace-pre-line">{consultation.plan}</p>
            </div>
          )}

          {/* Footer Signature & QR Stamp */}
          <div className="pt-8 border-t border-slate-200 flex items-end justify-between">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-slate-100 border border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400">
                <QrCode className="w-10 h-10 text-slate-700" />
                <span className="text-[8px] font-mono text-slate-600 mt-0.5">VERIFIED E-RX</span>
              </div>
              <div className="text-[10px] text-slate-500">
                <div>روشتة إلكترونية معتمدة برقم توثيق:</div>
                <div className="font-mono text-slate-800 font-bold">RX-{patient.mrn.slice(-4)}-{Date.now().toString().slice(-6)}</div>
                <div>صلاحية الصرف: 14 يوماً من تاريخ التحرير</div>
              </div>
            </div>

            <div className="text-center min-w-[200px]">
              <div className="text-xs font-bold text-slate-800">{doctor.name}</div>
              <div className="h-10 border-b border-slate-400 my-1 flex items-center justify-center text-slate-400 italic text-xs">
                توقيع الطبيب المعتمد
              </div>
              <div className="text-[10px] text-slate-500">ختم العيادات الخارجية</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
