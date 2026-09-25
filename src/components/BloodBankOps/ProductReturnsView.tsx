import React, { useState } from 'react';
import {
  RotateCcw,
  Clock,
  Thermometer,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Search,
  User,
  Droplet,
  X,
  Trash2,
  Building2,
  Layers,
  FileSpreadsheet,
  Check
} from 'lucide-react';
import {
  ProductReturnRecord,
  ProductDispositionOutcome,
  ReturnReason,
  UnitDestructionRecord,
  ProductReturnPolicy
} from '../../types/bloodBankOps';
import {
  MOCK_BRANCHES,
  MOCK_PRODUCT_RETURN_POLICIES,
  MOCK_DESTRUCTION_RECORDS
} from '../../data/mockBloodBankOpsData';

interface ProductReturnsViewProps {
  returns: ProductReturnRecord[];
  onConfirmNewDisposition: (newReturn: ProductReturnRecord) => void;
}

export const ProductReturnsView: React.FC<ProductReturnsViewProps> = ({
  returns,
  onConfirmNewDisposition
}) => {
  const [activeTab, setActiveTab] = useState<'returns' | 'destructions' | 'policies'>('returns');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [showIntakeModal, setShowIntakeModal] = useState(false);
  const [showDestructionModal, setShowDestructionModal] = useState(false);

  // Destruction records state
  const [destructionRecords, setDestructionRecords] = useState<UnitDestructionRecord[]>(MOCK_DESTRUCTION_RECORDS);

  // New return form state
  const [unitNumber, setUnitNumber] = useState('=W0422 26 10947 00');
  const [patientMrn, setPatientMrn] = useState('MRN-88425');
  const [returnedByStaff, setReturnedByStaff] = useState('ممرض العمليات تركي الدوسري');
  const [reason, setReason] = useState<ReturnReason>('transfusion_delayed_procedure');
  const [elapsedMinutes, setElapsedMinutes] = useState<number>(20);
  const [bagIntegrityChecked, setBagIntegrityChecked] = useState(true);
  const [portNotPunctured, setPortNotPunctured] = useState(true);
  const [temperatureIndicatorOk, setTemperatureIndicatorOk] = useState(true);
  const [dispositionOutcome, setDispositionOutcome] = useState<ProductDispositionOutcome>('returned_to_available_inventory');
  const [dispositionNotes, setDispositionNotes] = useState('تم فحص سلامة كيس الدم وعدم فتح المنافذ وثبات درجة الحرارة أقل من 6°C ضمن فترة الـ 30 دقيقة المعتمدة.');

  // New destruction form state
  const [destUnitNumber, setDestUnitNumber] = useState('=W0422 26 88124 00');
  const [destProductType, setDestProductType] = useState('كريات دم حمراء مكدسة (PRBC)');
  const [destReason, setDestReason] = useState('تجاوزت الوحدة 30 دقيقة خارج الثلاجة مع تغير لون مؤشر الحرارة');
  const [destWitness, setDestWitness] = useState('أخصائي مختبر سامي الشهري');

  const filteredReturns = returns.filter(r =>
    r.unitNumber.includes(searchTerm) ||
    r.patientMrn.includes(searchTerm) ||
    r.id.includes(searchTerm)
  );

  const handleSaveIntake = () => {
    const newRecord: ProductReturnRecord = {
      id: `RET-2026-${Math.floor(100 + Math.random() * 900)}`,
      unitId: 'DIN-RET-TEMP',
      unitNumber,
      patientId: 'p5',
      patientMrn,
      issuedAt: 'أمس 02:30 م',
      returnedAt: 'الآن',
      elapsedMinutesOutsideFridge: elapsedMinutes,
      returnedByStaff,
      receivedByTechnologist: 'أخصائي مختبر بدر العتيبي',
      reason,
      bagIntegrityChecked,
      portNotPunctured,
      temperatureIndicatorOk,
      dispositionOutcome,
      dispositionNotes,
      dispositionAuthorizer: 'د. سامية المهيدب (استشارية بنك الدم)'
    };
    onConfirmNewDisposition(newRecord);
    setShowIntakeModal(false);

    // If discarded, also prompt or auto-record destruction record
    if (dispositionOutcome === 'discarded_biohazard_waste') {
      const autoDestruction: UnitDestructionRecord = {
        id: `DEST-2026-${Math.floor(100 + Math.random() * 900)}`,
        unitNumber,
        productTypeAr: 'كريات دم حمراء مكدسة (PRBC)',
        bloodGroupDisplayAr: 'O سالب (O-)',
        reasonAr: `إتلاف وحدة معادة تجاوزت الشروط: ${dispositionNotes}`,
        dispositionOutcome: 'discarded_biohazard_waste',
        destroyedAt: 'اليوم ' + new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        technologistName: 'أخصائي مختبر بدر العتيبي',
        witnessName: 'أخصائي مختبر سامي الشهري',
        destructionMethod: 'incineration_autoclave',
        biohazardManifestId: `BIO-MNF-${Math.floor(1000 + Math.random() * 9000)}`,
        regulatoryComplianceNoteAr: 'تم التوثيق والمصادقة المزدوجة وفق معايير CBAHI و AABB لإتلاف مشتقات الدم البيولوجية.'
      };
      setDestructionRecords(prev => [autoDestruction, ...prev]);
    }
  };

  const handleSaveDestruction = () => {
    const newDest: UnitDestructionRecord = {
      id: `DEST-2026-${Math.floor(100 + Math.random() * 900)}`,
      unitNumber: destUnitNumber,
      productTypeAr: destProductType,
      bloodGroupDisplayAr: 'A موجب (A+)',
      reasonAr: destReason,
      dispositionOutcome: 'discarded_biohazard_waste',
      destroyedAt: 'اليوم ' + new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      technologistName: 'أخصائي مختبر بدر العتيبي',
      witnessName: destWitness,
      destructionMethod: 'incineration_autoclave',
      biohazardManifestId: `BIO-MNF-${Math.floor(1000 + Math.random() * 9000)}`,
      regulatoryComplianceNoteAr: 'توثيق مزدوج وفق سياسة النفايات الطبية الخطرة.'
    };
    setDestructionRecords(prev => [newDest, ...prev]);
    setShowDestructionModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">سجل استلام العائدات وتقرير المصير (Returns & Destruction - GAP-04, GAP-08)</h2>
              <p className="text-xs text-slate-500">
                سلسلة التبريد، قاعدة الـ 30 دقيقة، سجل إتلاف النفايات الطبية، وتتبع الفروع المتعددة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Multi-Branch Filter (GAP-08) */}
            <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-xl border border-slate-200 text-xs">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={selectedBranchId}
                onChange={e => setSelectedBranchId(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none"
              >
                <option value="all">كافة الفروع والمستشفيات ({MOCK_BRANCHES.length})</option>
                {MOCK_BRANCHES.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.nameAr}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="بحث بالوحدة أو الملف..."
                className="pr-9 pl-3 py-1.5 rounded-xl border border-slate-200 text-xs w-44 focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              onClick={() => setShowIntakeModal(true)}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>استلام وحدة معادة</span>
            </button>

            <button
              onClick={() => setShowDestructionModal(true)}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>توثيق إتلاف وحدة</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={() => setActiveTab('returns')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'returns' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            سجل الوحدات المعادة وقرارات المصير ({filteredReturns.length})
          </button>
          <button
            onClick={() => setActiveTab('destructions')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'destructions' ? 'bg-rose-600 text-white shadow-xs' : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>سجل الإتلاف والنفايات الطبية المزدوج (GAP-05)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-rose-800 text-white text-[10px] font-mono">
              {destructionRecords.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('policies')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'policies' ? 'bg-slate-800 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>سياسات الإرجاع المعتمدة حسب المشتق (GAP-04)</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Returns Table */}
      {activeTab === 'returns' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">كود الإرجاع والوحدة</th>
                  <th className="p-3.5">المريض المستهدف</th>
                  <th className="p-3.5">سبب الإرجاع</th>
                  <th className="p-3.5">الوقت خارج الثلاجة</th>
                  <th className="p-3.5">فحص السلامة والمؤشرات</th>
                  <th className="p-3.5">القرار النهائي للمصير (Disposition)</th>
                  <th className="p-3.5">المعتمد وملاحظات التدقيق</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReturns.map(ret => (
                  <tr key={ret.id} className="hover:bg-slate-50">
                    <td className="p-3.5">
                      <div className="font-mono font-bold text-slate-900">{ret.id}</div>
                      <div className="font-mono text-[11px] text-red-700 font-bold mt-0.5">{ret.unitNumber}</div>
                    </td>

                    <td className="p-3.5">
                      <div className="font-mono text-slate-700 font-bold">{ret.patientMrn}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">أعيد بواسطة: {ret.returnedByStaff}</div>
                    </td>

                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-medium">
                        {ret.reason === 'transfusion_delayed_procedure' ? 'تأجيل العملية الجراحية' :
                         ret.reason === 'patient_condition_stabilized' ? 'استقرار حالة المريض' :
                         ret.reason === 'suspected_adverse_reaction' ? 'اشتباه تفاعل نقل دم' : ret.reason}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className={`font-mono font-bold ${
                          ret.elapsedMinutesOutsideFridge <= 30 ? 'text-emerald-700' : 'text-rose-700'
                        }`}>
                          {ret.elapsedMinutesOutsideFridge} دقيقة
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 mt-0.5 block">
                        {ret.elapsedMinutesOutsideFridge <= 30 ? 'ضمن الحد المسموح (≤30 min)' : 'تجاوزت الحد المسموح'}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <div className="space-y-0.5 text-[10px]">
                        <div className="flex items-center gap-1 text-emerald-700">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>الكيس سليم وغير مثقوب</span>
                        </div>
                        <div className="flex items-center gap-1 text-emerald-700">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>مؤشر التبريد سليم (&lt;6°C)</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                        ret.dispositionOutcome === 'returned_to_available_inventory'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : ret.dispositionOutcome === 'discarded_biohazard_waste'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {ret.dispositionOutcome === 'returned_to_available_inventory' ? 'مقبول: أعيد للمخزون الصالح' :
                         ret.dispositionOutcome === 'discarded_biohazard_waste' ? 'مرفوض: إتلاف نفايات طبية' :
                         'محجوز للتحقيق المخبري'}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <div className="text-[11px] text-slate-700 font-medium max-w-xs leading-relaxed">
                        {ret.dispositionNotes}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        المصادقة: <strong>{ret.dispositionAuthorizer}</strong>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Destruction Records (GAP-05) */}
      {activeTab === 'destructions' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden space-y-3 p-4">
          <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-700 shrink-0" />
              <span>
                <strong>سجل إتلاف وحدات الدم البيولوجية (Dual-Witness Destruction Log - GAP-05):</strong> يتطلب إتلاف أي وحدة مصادقة فاحصين اثنين (Dual Sign-off)، وتوثيق رقم بوليصة النفايات الطبية الخطرة (Manifest ID) وأسلوب المعالجة بالحرارة/الأوتوكلاف.
              </span>
            </div>
            <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-rose-300 font-bold">
              CBAHI & AABB Standard
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">معرف الإتلاف والوحدة</th>
                  <th className="p-3">نوع المشتق والفصيلة</th>
                  <th className="p-3">سبب الإتلاف النظامي</th>
                  <th className="p-3">طريقة المعالجة وبوليصة النفايات</th>
                  <th className="p-3">التوقيع المزدوج (Technologist & Witness)</th>
                  <th className="p-3">وقت الإتلاف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {destructionRecords.map(d => (
                  <tr key={d.id} className="hover:bg-rose-50/20">
                    <td className="p-3">
                      <div className="font-mono font-bold text-slate-900">{d.id}</div>
                      <div className="font-mono text-[11px] text-red-700 font-bold mt-0.5">{d.unitNumber}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{d.productTypeAr}</div>
                      <div className="text-[11px] font-mono text-red-700">{d.bloodGroupDisplayAr}</div>
                    </td>
                    <td className="p-3">
                      <div className="text-slate-800 leading-relaxed">{d.reasonAr}</div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-medium text-[10px] block w-fit">
                        {d.destructionMethod === 'incineration_autoclave' ? 'حرق وأوتوكلاف طبي' : 'إتلاف نفايات خطرة'}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500 mt-1 block">
                        Manifest: {d.biohazardManifestId}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="text-slate-900 font-bold">{d.technologistName}</div>
                      <div className="text-slate-600 text-[10px] mt-0.5">
                        الشاهد المستقل: <strong className="text-rose-900">{d.witnessName}</strong>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-slate-700 font-mono">{d.destroyedAt}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Return Policies Matrix (GAP-04) */}
      {activeTab === 'policies' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MOCK_PRODUCT_RETURN_POLICIES.map(p => (
            <div key={p.productType} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 text-right">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-bold text-sm text-slate-900">{p.productTypeAr}</h3>
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {p.maxMinutesOutsideControlledStorage} دقيقة كحد أقصى
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-bold text-slate-700 block mb-0.5">النطاق الحراري المقبول:</span>
                  <p className="text-slate-800">{p.temperatureRangeDescriptionAr}</p>
                </div>

                <div>
                  <span className="font-bold text-slate-700 block mb-0.5">شروط سلامة كيس ومشتق الدم:</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
                    {p.inspectionCriteriaAr.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="font-bold text-slate-700 block mb-0.5">شروط العودة للمخزون الصالح:</span>
                  <p className="text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200 text-[11px]">
                    {p.canReturnToAvailableInventoryCriteriaAr}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Intake Modal */}
      {showIntakeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <h3 className="text-sm font-bold">نموذج استلام وفحص وحدة معادة (Returned Product Intake)</h3>
              <button
                onClick={() => setShowIntakeModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">رقم الوحدة (DIN):</label>
                  <input
                    type="text"
                    value={unitNumber}
                    onChange={e => setUnitNumber(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">الرقم الطبي للمريض (MRN):</label>
                  <input
                    type="text"
                    value={patientMrn}
                    onChange={e => setPatientMrn(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">الموظف المعيد وقسمه:</label>
                  <input
                    type="text"
                    value={returnedByStaff}
                    onChange={e => setReturnedByStaff(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">سبب الإرجاع:</label>
                  <select
                    value={reason}
                    onChange={e => setReason(e.target.value as any)}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs"
                  >
                    <option value="transfusion_delayed_procedure">تأجيل العملية الجراحية / الإجراء</option>
                    <option value="patient_condition_stabilized">استقرار حالة المريض وعدم الحاجة للوحدة</option>
                    <option value="transfusion_cancelled">إلغاء أمر نقل الدم سريرياً</option>
                    <option value="suspected_adverse_reaction">اشتباه تفاعل نقل دم أثناء البدء</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">المدة المنقضية خارج الثلاجة (بالدقائق):</label>
                <input
                  type="number"
                  value={elapsedMinutes}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setElapsedMinutes(val);
                    if (val > 30) {
                      setDispositionOutcome('discarded_biohazard_waste');
                      setDispositionNotes('تجاوزت الوحدة فترة الـ 30 دقيقة خارج الثلاجة المراقبة؛ لا تجوز إعادتها للمخزون الصالح حسب السياسة ويجب إتلافها.');
                    } else {
                      setDispositionOutcome('returned_to_available_inventory');
                      setDispositionNotes('الوحدة ضمن فترة الـ 30 دقيقة والمؤشر سليم؛ صالحة للعودة للمخزون.');
                    }
                  }}
                  className="w-full p-2 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-800">سلامة الكيس وعدم وجود أي ثقوب أو تسريب:</span>
                  <input
                    type="checkbox"
                    checked={bagIntegrityChecked}
                    onChange={e => setBagIntegrityChecked(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-800">منافذ الكيس (Ports) مغلقة ولم يتم ثقبها بإبرة نقل الدم:</span>
                  <input
                    type="checkbox"
                    checked={portNotPunctured}
                    onChange={e => setPortNotPunctured(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-800">مؤشر الحرارة التراكمي (Safe-T-Vue) لم يتغير لونه (أقل من 6°C):</span>
                  <input
                    type="checkbox"
                    checked={temperatureIndicatorOk}
                    onChange={e => setTemperatureIndicatorOk(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">القرار الفني لمصير الوحدة (Disposition):</label>
                <select
                  value={dispositionOutcome}
                  onChange={e => setDispositionOutcome(e.target.value as any)}
                  className="w-full p-2 rounded-xl border border-slate-200 text-xs font-bold"
                >
                  <option value="returned_to_available_inventory">إعادة للمخزون الصالح للاستخدام</option>
                  <option value="discarded_biohazard_waste">إتلاف ونفايات طبية حيوية (Biohazard Waste)</option>
                  <option value="quarantined_for_inspection">عزل لفحص إضافي</option>
                  <option value="retained_for_reaction_investigation">حجز للتحقيق في تفاعل نقل الدم</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">ملاحظات ومبررات القرار:</label>
                <textarea
                  rows={2}
                  value={dispositionNotes}
                  onChange={e => setDispositionNotes(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setShowIntakeModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveIntake}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs"
              >
                حفظ واعتماد المصير
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Destruction Modal */}
      {showDestructionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col text-right">
            <div className="bg-rose-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-rose-300" />
                <h3 className="text-sm font-bold">توثيق إتلاف وحدة دم (Dual Sign-off Destruction)</h3>
              </div>
              <button
                onClick={() => setShowDestructionModal(false)}
                className="p-1 rounded-lg text-rose-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">رقم الوحدة المعتزمة للإتلاف (DIN):</label>
                <input
                  type="text"
                  value={destUnitNumber}
                  onChange={e => setDestUnitNumber(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">نوع المشتق:</label>
                <input
                  type="text"
                  value={destProductType}
                  onChange={e => setDestProductType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">السبب النظامي للإتلاف:</label>
                <textarea
                  rows={2}
                  value={destReason}
                  onChange={e => setDestReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">الشاهد المستقل (Dual-Witness Technologist):</label>
                <input
                  type="text"
                  value={destWitness}
                  onChange={e => setDestWitness(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                تنبيه: سيتم تسجيل رقم البوليصة تلقائياً في السجل الرقابي المعتمد للنفايات الحيوية (CBAHI Compliance).
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setShowDestructionModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveDestruction}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs"
              >
                تأكيد الإتلاف وتوليد بوليصة النفايات
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
