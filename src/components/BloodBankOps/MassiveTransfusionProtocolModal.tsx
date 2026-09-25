import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  Flame,
  ShieldAlert,
  Droplet,
  Clock,
  CheckCircle2,
  Layers,
  Check,
  User,
  Activity,
  Box,
  Thermometer,
  RotateCcw
} from 'lucide-react';
import { MassiveTransfusionProtocolSession, MtpProtocolProfileType } from '../../types/bloodBankOps';

interface MassiveTransfusionProtocolModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: MassiveTransfusionProtocolSession | null;
  onIssueMtpPack: (sessionId: string, packNumber: number) => void;
  onDeactivateMtp: (sessionId: string, reason: string) => void;
}

export const MassiveTransfusionProtocolModal: React.FC<MassiveTransfusionProtocolModalProps> = ({
  isOpen,
  onClose,
  session,
  onIssueMtpPack,
  onDeactivateMtp
}) => {
  if (!isOpen || !session) return null;

  const [deactivationReason, setDeactivationReason] = useState('تحقيق السيطرة الجراحية على النزيف واستقرار الضغط (Surgical Hemostasis Achieved)');
  const [showDeactivationPrompt, setShowDeactivationPrompt] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<MtpProtocolProfileType>(
    session.protocolType || 'adult_trauma_balanced'
  );

  // Cooler dispatch tracking (GAP-07)
  const [coolerId, setCoolerId] = useState('MTP-COOLER-04');
  const [transportRunner, setTransportRunner] = useState('مراسل الطوارئ حمود الشمري (جوال 5542)');
  const [icePacksVerified, setIcePacksVerified] = useState(true);
  const [safeTVueAttached, setSafeTVueAttached] = useState(true);
  const [coolerSealIntact, setCoolerSealIntact] = useState(true);
  const [returnedUnitsCount, setReturnedUnitsCount] = useState<number>(0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-rose-300 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-rose-950 text-white px-6 py-4 flex items-center justify-between border-b border-rose-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-600 text-white border border-rose-400">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">بروتوكول نقل الدم المكثف للطوارئ (MTP - GAP-07 Cooler & Pack Rounds)</h3>
                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                  حالة نشطة ومستمرة
                </span>
              </div>
              <p className="text-xs text-rose-200 mt-0.5">
                تأمين حزم الدم المتوازنة للنزيف الحاد بنسبة 1:1:1 مع تتبع صناديق التبريد (Cooler Chain)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-rose-300 hover:text-white hover:bg-rose-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs text-right">
          {/* Patient & Location Alert */}
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="font-bold text-rose-950 text-sm">{session.patientName}</div>
              <div className="text-[11px] text-rose-800 font-mono mt-0.5">
                MRN: {session.patientMrn} • الموقع: {session.location}
              </div>
              <div className="text-[11px] text-slate-600 mt-1">
                تفعيل بواسطة: <strong>{session.activatedByClinician}</strong> ({session.clinicalIndication})
              </div>
            </div>

            <div className="text-center p-3 rounded-xl bg-white border border-rose-200 shadow-2xs">
              <div className="text-[10px] text-slate-500">وقت التفعيل:</div>
              <div className="text-sm font-bold font-mono text-rose-900">{session.activatedAt}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">الدفعة الحالية: الحزمة #{session.currentPackNumber}</div>
            </div>
          </div>

          {/* Blood Bank Group Transition Alert (B03, B04, B17) */}
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-950 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-blue-700 shrink-0" />
              <span>
                <strong>مسار التحول من فصيلة الطوارئ (O-) إلى الفصيلة المطابقة (Type-Specific):</strong> تم تأكيد فصيلة المريض على عينتين مستقلتين؛ الحزم التالية تصرف مطابقة فصيلة المريض لتوفير مخزون الطوارئ O-.
              </span>
            </div>
            <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-blue-300 font-bold">
              Type-Specific Switch
            </span>
          </div>

          {/* Protocol Profile Selector */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
            <span className="font-bold text-slate-800">بروفايل النقل المكثف السريري:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedProfile('adult_trauma_balanced')}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                  selectedProfile === 'adult_trauma_balanced'
                    ? 'bg-rose-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-700'
                }`}
              >
                إصابات البالغين 1:1:1
              </button>
              <button
                type="button"
                onClick={() => setSelectedProfile('obstetric_hemorrhage')}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                  selectedProfile === 'obstetric_hemorrhage'
                    ? 'bg-rose-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-700'
                }`}
              >
                نزيف ولادة (Early Fibrinogen/Cryo)
              </button>
              <button
                type="button"
                onClick={() => setSelectedProfile('pediatric_massive')}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                  selectedProfile === 'pediatric_massive'
                    ? 'bg-rose-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-700'
                }`}
              >
                أطفال (Weight-based)
              </button>
            </div>
          </div>

          {/* Cooler Dispatch Tracking (GAP-07 / B24, B25) */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-rose-700" />
                <span className="font-bold text-slate-900">تتبع صندوق التبريد وسلسلة النقل (MTP Cooler Dispatch):</span>
              </div>
              <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                Cooler Barcode: {coolerId}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1">معرف صندوق التبريد (Cooler ID):</label>
                <input
                  type="text"
                  value={coolerId}
                  onChange={e => setCoolerId(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 text-xs font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">مراسل النقل المخصص (Dedicated Runner):</label>
                <input
                  type="text"
                  value={transportRunner}
                  onChange={e => setTransportRunner(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <label className="flex items-center gap-1.5 p-2 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={icePacksVerified}
                  onChange={e => setIcePacksVerified(e.target.checked)}
                  className="w-3.5 h-3.5 text-rose-600"
                />
                <span className="text-[11px] font-semibold text-slate-700">تجهيز قوالب التبريد 1-6°C</span>
              </label>

              <label className="flex items-center gap-1.5 p-2 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={safeTVueAttached}
                  onChange={e => setSafeTVueAttached(e.target.checked)}
                  className="w-3.5 h-3.5 text-rose-600"
                />
                <span className="text-[11px] font-semibold text-slate-700">مؤشر Safe-T-Vue نشط</span>
              </label>

              <label className="flex items-center gap-1.5 p-2 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={coolerSealIntact}
                  onChange={e => setCoolerSealIntact(e.target.checked)}
                  className="w-3.5 h-3.5 text-rose-600"
                />
                <span className="text-[11px] font-semibold text-slate-700">قفل الأمان وسدادة الصندوق</span>
              </label>
            </div>
          </div>

          {/* Ratio Progress 1:1:1 */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-900 text-xs block">
              توازن المشتقات المصروفة بنسبة (Balanced Resuscitation Ratio 1:1:1):
            </span>
            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block">كريات حمر (PRBCs)</span>
                <span className="text-lg font-bold font-mono text-red-700 mt-1 block">
                  {session.prbcUnitsIssued} وحدات
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block">بلازما مجمدة (FFP)</span>
                <span className="text-lg font-bold font-mono text-amber-700 mt-1 block">
                  {session.ffpUnitsIssued} وحدات
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block">صفائح دموية (PLT)</span>
                <span className="text-lg font-bold font-mono text-purple-700 mt-1 block">
                  {session.plateletUnitsIssued} وحدات
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block">راسب برودي (Cryo)</span>
                <span className="text-lg font-bold font-mono text-blue-700 mt-1 block">
                  {session.cryoUnitsIssued} وحدات
                </span>
              </div>
            </div>
          </div>

          {/* Pack Sequence Protocol */}
          <div className="space-y-2">
            <span className="font-bold text-slate-900 text-xs block">حزم بروتوكول نقل الدم المكثف المتتابعة:</span>
            <div className="space-y-2">
              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 text-xs">الحزمة #1 (MTP Pack 1)</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">4 وحدات PRBCs + 4 وحدات FFP</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>تم التجهيز والتسليم للعمليات</span>
                </span>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-amber-950 text-xs">الحزمة #2 (MTP Pack 2)</span>
                  <p className="text-[11px] text-amber-800 mt-0.5">4 وحدات PRBCs + 4 وحدات FFP + 1 وحدة صفائح فصادة</p>
                </div>
                <button
                  onClick={() => onIssueMtpPack(session.id, 2)}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-2xs flex items-center gap-1 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>صرف وتجهيز الحزمة #2 في الصندوق {coolerId}</span>
                </button>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between opacity-80">
                <div>
                  <span className="font-bold text-slate-900 text-xs">الحزمة #3 (MTP Pack 3)</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">4 PRBCs + 4 FFP + 1 PLT + 10 وحدات كرايو للفيبرينوجين</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold text-[10px]">
                  في الانتظار حسب استجابة المريض
                </span>
              </div>
            </div>
          </div>

          {/* Deactivation Prompt if toggled */}
          {showDeactivationPrompt ? (
            <div className="p-4 bg-slate-100 rounded-xl border border-slate-300 space-y-3 animate-in fade-in">
              <span className="font-bold text-slate-900 text-xs block">مبرر إنهاء بروتوكول نقل الدم المكثف (Deactivation & Cooler Reconciliation):</span>
              <input
                type="text"
                value={deactivationReason}
                onChange={e => setDeactivationReason(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-300 text-xs bg-white"
              />

              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-700 font-medium text-xs">عدد الوحدات غير المستخدمة المعادة في الصندوق:</span>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={returnedUnitsCount}
                  onChange={e => setReturnedUnitsCount(Number(e.target.value))}
                  className="w-20 p-1.5 rounded-lg border border-slate-200 text-xs font-mono font-bold text-center"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => setShowDeactivationPrompt(false)}
                  className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                >
                  تراجع
                </button>
                <button
                  onClick={() => {
                    onDeactivateMtp(session.id, deactivationReason);
                    setShowDeactivationPrompt(false);
                    onClose();
                  }}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg shadow-2xs cursor-pointer"
                >
                  تأكيد إنهاء وتوثيق إغلاق البروتوكول واستلام الصندوق
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-end">
              <button
                onClick={() => setShowDeactivationPrompt(true)}
                className="text-xs text-rose-700 hover:text-rose-900 font-bold underline"
              >
                إنهاء / إيقاف بروتوكول النقل المكثف وإرجاع الصندوق (Deactivate MTP)
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            تنبيه: يتم نقل حزم MTP عبر ممرض أو مراسل طوارئ مخصص لتفادي أي تأخير زمني.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            إغلاق النافذة
          </button>
        </div>
      </div>
    </div>
  );
};
