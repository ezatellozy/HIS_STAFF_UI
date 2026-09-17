import React, { useState } from 'react';
import { FlaskConical, Clock, AlertTriangle, Check, Layers, ShieldCheck } from 'lucide-react';
import { Patient } from '../../../types/his';
import {
  OrderPriority,
  ClinicalOrderItem,
  LabOrderDetails,
  CDSSMockAlert
} from '../../../types/clinicalOrdersRequests';
import { LAB_CATALOG, LabCatalogItem } from '../../../data/mockOrdersRequestsData';
import { SharedOrderShell } from './SharedOrderShell';
import { useHis } from '../../../context/HisContext';

interface LabOrderComposerProps {
  patient: Patient;
  onClose: () => void;
  onSaveOrder: (newOrder: ClinicalOrderItem) => void;
}

export const LabOrderComposer: React.FC<LabOrderComposerProps> = ({
  patient,
  onClose,
  onSaveOrder
}) => {
  const { currentStaff, playChime } = useHis();

  const [priority, setPriority] = useState<OrderPriority>('stat');
  const [clinicalIndication, setClinicalIndication] = useState('اشتباه متلازمة الشريان التاجي الحادة NSTE-ACS');

  // Selected Lab test
  const [selectedLabId, setSelectedLabId] = useState<string>(LAB_CATALOG[0].id); // default Hs-Troponin I
  const selectedTest = LAB_CATALOG.find(t => t.id === selectedLabId) || LAB_CATALOG[0];

  // Specific lab fields
  const [collectionTiming, setCollectionTiming] = useState<'immediate' | 'routine_morning' | 'timed_interval'>('immediate');
  const [setsCount, setSetsCount] = useState<number>(selectedTest.id === 'lab-bcx' ? 2 : 1);
  const [fastingRequired, setFastingRequired] = useState<boolean>(selectedTest.fastingRequired);
  const [specialHandling, setSpecialHandling] = useState<string>(selectedTest.specialHandling || 'نقل فوري للمختبر في أنبوب جل أخضر.');

  // Mock CDSS duplicate check
  const [alerts, setAlerts] = useState<CDSSMockAlert[]>([]);

  const handleTestChange = (testId: string) => {
    const test = LAB_CATALOG.find(t => t.id === testId);
    if (!test) return;

    setSelectedLabId(testId);
    setFastingRequired(test.fastingRequired);
    setSpecialHandling(test.specialHandling || '');
    setSetsCount(test.id === 'lab-bcx' ? 2 : 1);

    if (test.id === 'lab-trop') {
      setAlerts([
        {
          id: 'cdss-trop-proto',
          type: 'duplicate_warning',
          severity: 'informational',
          titleAr: 'بروتوكول التروبونين التسلسلي (0h / 3h Protocol)',
          titleEn: 'Serial Troponin Protocol Active',
          messageAr: 'تم طلب القراءة الحالية. سيقوم النظام بجدولة إعادة سحب العينة الثانية تلقائياً بعد 3 ساعات.',
          messageEn: 'Automatic 3-hour re-draw reminder will be scheduled.',
          canOverride: false
        }
      ]);
    } else {
      setAlerts([]);
    }
  };

  const handleSubmit = () => {
    const labDetails: LabOrderDetails = {
      catalogId: selectedTest.id,
      loincCode: selectedTest.loincCode,
      testNameAr: selectedTest.testNameAr,
      testNameEn: selectedTest.testNameEn,
      specimenType: selectedTest.specimenType,
      collectionTiming,
      numberOfSets: setsCount > 1 ? setsCount : undefined,
      fastingStatus: fastingRequired ? 'fasting_12h' : 'not_required',
      collectionInstructions: specialHandling
    };

    const newOrder: ClinicalOrderItem = {
      id: `ORD-LAB-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: patient.id,
      encounterId: 'ENC-2026-ER-091',
      encounterLocation: 'قسم الطوارئ والحالات الحرجة',
      category: 'laboratory',
      orderTitleAr: `تحليل ${selectedTest.testNameAr} (${selectedTest.specimenType})`,
      orderTitleEn: `${selectedTest.testNameEn} [${selectedTest.loincCode}]`,
      priority,
      clinicalIndication,
      orderedBy: {
        id: currentStaff.id,
        name: currentStaff.name,
        role: currentStaff.title || 'طبيب معالج',
        specialty: currentStaff.department || 'الطب السريري'
      },
      orderedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      status: 'active',
      statusHistory: [
        {
          status: 'active',
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          changedBy: currentStaff.name,
          reason: 'تم إنشاء الطلب المخبري'
        }
      ],
      labDetails,
      resultPipelineStage: 'ordered',
      cdssAlerts: alerts
    };

    onSaveOrder(newOrder);
    playChime('success');
    onClose();
  };

  return (
    <SharedOrderShell
      patient={patient}
      titleAr="محرر الأوامر المخبرية والفحوصات (Laboratory Order Composer)"
      titleEn="CPOE Laboratory Diagnostic Composer"
      priority={priority}
      onPriorityChange={setPriority}
      clinicalIndication={clinicalIndication}
      onClinicalIndicationChange={setClinicalIndication}
      cdssAlerts={alerts}
      onCancel={onClose}
      onSubmit={handleSubmit}
      submitLabel="توقيع وإرسال أمر التحليل (Sign Lab Order)"
    >
      <div className="space-y-4 text-xs">
        
        {/* Test Selector from Catalog */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
          <label className="block font-extrabold text-slate-900 text-xs">
            اختر التحليل المطلوب من دليل الفحوصات المخبرية (Laboratory Directory): *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {LAB_CATALOG.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleTestChange(t.id)}
                className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                  selectedLabId === t.id
                    ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="font-extrabold text-slate-900 text-xs">{t.testNameAr}</div>
                  <div className="text-[11px] text-slate-500 font-sans">{t.testNameEn}</div>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10px]">
                  <span className="font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                    {t.loincCode}
                  </span>
                  <span className="text-teal-700 font-bold">{t.specimenType}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Specimen & Collection Timing Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-slate-200">
          
          {/* Specimen Type */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">نوع العينة المطلوبة (Specimen):</label>
            <input
              type="text"
              readOnly
              value={selectedTest.specimenType}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-100 font-bold text-slate-800"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              محدد تلقائياً حسب الفحص
            </span>
          </div>

          {/* Collection Timing */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">توقيت سحب العينة (Timing): *</label>
            <select
              value={collectionTiming}
              onChange={e => setCollectionTiming(e.target.value as any)}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 bg-white"
            >
              <option value="immediate">سحب فوري فوري (Immediate STAT)</option>
              <option value="routine_morning">ضمن السحب الصباحي الدوري (Routine AM)</option>
              <option value="timed_interval">موعد محدد ومجدول (Timed Interval)</option>
            </select>
          </div>

          {/* Number of sets (e.g. for blood cultures) */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">عدد العينات / المجموعات (Sets):</label>
            <input
              type="number"
              min={1}
              max={4}
              value={setsCount}
              onChange={e => setSetsCount(parseInt(e.target.value) || 1)}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              {selectedTest.id === 'lab-bcx' ? 'يوصى بزوجين من مواقع مختلفة' : 'مجموعة واحدة قياسية'}
            </span>
          </div>
        </div>

        {/* Fasting & Special Handling */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="fasting-check"
              checked={fastingRequired}
              onChange={e => setFastingRequired(e.target.checked)}
              className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
            />
            <label htmlFor="fasting-check" className="font-bold text-slate-800">
              يتطلب صيام المريض (Fasting Required - 8 to 12 Hours)
            </label>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              تعليمات خاصة للتعامل مع العينة ونقلها (Special Handling Instructions):
            </label>
            <input
              type="text"
              value={specialHandling}
              onChange={e => setSpecialHandling(e.target.value)}
              placeholder="مثال: وضع العينة على ثلج، حماية من الضوء، فحص فوري خلال 15 دقيقة..."
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-900"
            />
          </div>
        </div>
      </div>
    </SharedOrderShell>
  );
};
