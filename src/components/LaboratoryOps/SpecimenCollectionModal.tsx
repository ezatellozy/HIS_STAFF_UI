import React, { useState } from 'react';
import {
  X,
  Barcode,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  ShieldCheck,
  Building2,
  FlaskConical,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { LabSpecimen, IncomingLabOrder } from '../../types/laboratoryOps';

interface SpecimenCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  specimen: LabSpecimen;
  order?: IncomingLabOrder;
  onConfirmCollection: (updatedSpecimen: LabSpecimen) => void;
  onMarkUnableToCollect: (specimenId: string, reason: string) => void;
}

export const SpecimenCollectionModal: React.FC<SpecimenCollectionModalProps> = ({
  isOpen,
  onClose,
  specimen,
  order,
  onConfirmCollection,
  onMarkUnableToCollect
}) => {
  const [patientConfirmed, setPatientConfirmed] = useState(false);
  const [collectorName, setCollectorName] = useState('ممرض السحب: رائد الفهد');
  const [collectionSite, setCollectionSite] = useState('الذراع الأيمن - الوريد المرفقي (Right Antecubital)');
  const [numberOfTubes, setNumberOfTubes] = useState(1);
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [barcodeVerified, setBarcodeVerified] = useState(false);
  const [specialHandlingNote, setSpecialHandlingNote] = useState(specimen.specialInstructions || '');
  const [unableReason, setUnableReason] = useState('');
  const [showUnableForm, setShowUnableForm] = useState(false);

  if (!isOpen) return null;

  const handleSimulateBarcodeScan = () => {
    setScannedBarcode(specimen.specimenBarcode);
    setBarcodeVerified(true);
  };

  const handleExecuteCollect = () => {
    if (!patientConfirmed) return;
    const updated: LabSpecimen = {
      ...specimen,
      status: 'collected',
      collectedDateTime: new Date().toISOString().replace('T', ' ').slice(0, 16),
      collectorName,
      specialInstructions: specialHandlingNote
    };
    onConfirmCollection(updated);
    onClose();
  };

  const handleExecuteUnable = () => {
    if (!unableReason) return;
    onMarkUnableToCollect(specimen.id, unableReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 text-right font-['Cairo',sans-serif]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                توثيق سحب العينة المخبرية (Specimen Collection Verification)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                تأكيد هوية المريض ومطابقة الباركود ونوع الأنبوب قبل السحب لضمان السلامة السريرية.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Safety Warning & Invariants */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>محدد الأمان السريري:</strong> المريض ≠ الزيارة ≠ العينة. لا يجوز تغيير سياق المريض أو نوع الحاوية بصمت أثناء السحب.
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold bg-blue-200/60 px-2 py-0.5 rounded text-blue-800">
            {specimen.collectionPriority.toUpperCase()}
          </span>
        </div>

        {/* Patient Identity Confirmation Card */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-teal-600" />
              <strong className="text-slate-900 text-sm">{specimen.patientName}</strong>
            </div>
            <span className="font-mono text-xs bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 font-bold">
              {specimen.mrn}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 pt-1 border-t border-slate-200/60">
            <div>
              <span className="text-slate-400 block">موقع المريض وسريره:</span>
              <strong className="text-slate-800">{specimen.collectionLocation}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">رقم الزيارة (Encounter ID):</span>
              <strong className="text-slate-800 font-mono">{specimen.encounterId}</strong>
            </div>
          </div>

          <label className="flex items-center gap-2.5 pt-2 text-xs font-bold text-teal-900 cursor-pointer">
            <input
              type="checkbox"
              checked={patientConfirmed}
              onChange={e => setPatientConfirmed(e.target.checked)}
              className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500 cursor-pointer"
            />
            <span>أقر بالتحقق البصري المزدوج من هوية المريض عبر مطابقة الإسورة بالاسم ورقم الـ MRN</span>
          </label>
        </div>

        {/* Barcode Scan Simulation */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Barcode className="w-4 h-4 text-slate-500" />
              <span>محاكاة مسح ملصق الباركود (Barcode Verification Simulation):</span>
            </span>
            <button
              type="button"
              onClick={handleSimulateBarcodeScan}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>محاكاة المسح الآلي للأنبوب</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={scannedBarcode}
              onChange={e => {
                setScannedBarcode(e.target.value);
                setBarcodeVerified(e.target.value === specimen.specimenBarcode);
              }}
              placeholder={`أدخل أو امسح الباركود (مثال: ${specimen.specimenBarcode})`}
              className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-mono text-xs text-slate-800 text-left"
              dir="ltr"
            />
            {barcodeVerified ? (
              <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" />
                <span>مطابق وموثق</span>
              </span>
            ) : (
              <span className="text-slate-400 text-xs px-2">بانتظار المسح</span>
            )}
          </div>
        </div>

        {/* Specimen Container & Collection Parameters */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-slate-600 font-bold mb-1">نوع الأنبوب / الحاوية المطلوبة:</label>
            <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold">
              <span className="w-3.5 h-3.5 rounded-full inline-block shrink-0 shadow-xs" style={{ backgroundColor: specimen.containerColorHex }} />
              <span>{specimen.containerType}</span>
            </div>
          </div>
          <div>
            <label className="block text-slate-600 font-bold mb-1">موقع السحب الوريدي / الجسدي:</label>
            <input
              type="text"
              value={collectionSite}
              onChange={e => setCollectionSite(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-slate-600 font-bold mb-1">اسم جامع العينة (Phlebotomist):</label>
            <input
              type="text"
              value={collectorName}
              onChange={e => setCollectorName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs"
            />
          </div>
          <div>
            <label className="block text-slate-600 font-bold mb-1">تعليمات مناولة خاصة (Special Handling):</label>
            <input
              type="text"
              value={specialHandlingNote}
              onChange={e => setSpecialHandlingNote(e.target.value)}
              placeholder="مثال: حفظ بالثلج، حماية من الضوء، صيام مؤكد..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs"
            />
          </div>
        </div>

        {/* Unable to collect accordion */}
        <div className="pt-2 border-t border-slate-100">
          {!showUnableForm ? (
            <button
              type="button"
              onClick={() => setShowUnableForm(true)}
              className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>تعذر السحب؟ (Patient Unavailable / Difficult Access)</span>
            </button>
          ) : (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
              <span className="text-xs font-bold text-amber-900 block">توثيق سبب تعذر سحب العينة:</span>
              <select
                value={unableReason}
                onChange={e => setUnableReason(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs text-slate-800 font-medium"
              >
                <option value="">اختر مبرر التعذر...</option>
                <option value="المريض غير متواجد بالسرير (في قسم الأشعة)">المريض غير متواجد بالسرير (في قسم الأشعة)</option>
                <option value="صعوبة شديدة في الوصول للأوردة (Veins Inaccessible)">صعوبة شديدة في الوصول للأوردة (Veins Inaccessible)</option>
                <option value="المريض رفض السحب (Patient Refusal)">المريض رفض السحب (Patient Refusal)</option>
                <option value="المريض غير صائم للتحاليل المشروطة بالصيام">المريض غير صائم للتحاليل المشروطة بالصيام</option>
              </select>
              <div className="flex items-center gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setShowUnableForm(false)}
                  className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  تراجع
                </button>
                <button
                  type="button"
                  onClick={handleExecuteUnable}
                  disabled={!unableReason}
                  className="px-3 py-1 text-xs bg-amber-700 hover:bg-amber-600 text-white rounded-lg font-bold disabled:opacity-50 cursor-pointer"
                >
                  تسجيل تعذر السحب
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleExecuteCollect}
            disabled={!patientConfirmed}
            className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>تأكيد سحب العينة واعتماد الوقت</span>
          </button>
        </div>
      </div>
    </div>
  );
};
