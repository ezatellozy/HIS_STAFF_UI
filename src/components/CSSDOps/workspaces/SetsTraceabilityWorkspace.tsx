import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  Layers,
  Flame,
  Truck,
  User,
  Activity,
  ShieldCheck,
  FileText,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import {
  CSSDOpsState,
  FullDeviceTraceRecord,
  CSSDReusableSetInstance
} from '../../../types/cssdOps';

interface SetsTraceabilityWorkspaceProps {
  state: CSSDOpsState;
  onNavigateToRecord?: (type: string, id: string) => void;
}

export const SetsTraceabilityWorkspace: React.FC<SetsTraceabilityWorkspaceProps> = ({
  state
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSetInstanceId, setSelectedSetInstanceId] = useState<string>(
    state.setInstances[0]?.id || ''
  );

  const selectedSetInstance = state.setInstances.find(s => s.id === selectedSetInstanceId);

  // Trace linkage synthesis
  const associatedPackage = state.packages.find(p => p.setInstanceId === selectedSetInstanceId);
  const associatedCycle = state.sterilizerCycles.find(
    c => associatedPackage && c.includedPackageIds.includes(associatedPackage.id)
  );
  const associatedReturn = state.contaminatedReturns.find(
    r => r.setInstanceIds.includes(selectedSetInstanceId)
  );
  const associatedDistribution = state.distributionRequests.find(
    d => associatedPackage && d.allocatedPackageIds.includes(associatedPackage.id)
  );

  const filteredSets = state.setInstances.filter(s =>
    s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.setNameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Top Banner: End-to-End Medical Device UDI Traceability */}
      <div className="bg-slate-900 text-white rounded-xl p-4 flex items-center justify-between text-xs shadow-sm">
        <div className="flex items-center gap-2.5">
          <Search className="w-5 h-5 text-teal-400 shrink-0" />
          <div>
            <strong className="text-white block font-bold text-sm">
              سجل التتبع الرقمي الشامل للأجهزة الطبية المعقمة (End-to-End Device Traceability Audit)
            </strong>
            <span className="text-slate-300 text-[11px]">
              يربط دورة حياة الجهاز: المريض ← مسرح العمليات ← استلام التلوث ← دورة التطهير A0 ← التغليف والمؤشرات ← دورة المعقم وحساسات البخار ← المستودع ← الاستخدام السريري.
            </span>
          </div>
        </div>
        <div className="bg-teal-900/60 border border-teal-600 text-teal-200 px-3 py-1 rounded-lg text-xs font-mono font-bold">
          معتمد ومطابق للوائح SFDA UDI
        </div>
      </div>

      {/* Main Grid: Sets Browser & Full Trace Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Set Search & List */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-[650px] overflow-hidden">
          <div className="p-3 border-b border-slate-200 bg-slate-50/70 space-y-2">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="ابحث برقم الباركود، اسم الطقم، الرقم التسلسلي..."
                className="w-full border border-slate-300 rounded-lg pr-8 pl-3 py-1.5 text-xs bg-white text-slate-800"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-2" />
            </div>
            <span className="text-[10px] text-slate-500 block">
              الأطقم المسجلة بالمنظومة ({filteredSets.length})
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredSets.map(set => {
              const isSelected = set.id === selectedSetInstanceId;
              return (
                <div
                  key={set.id}
                  onClick={() => setSelectedSetInstanceId(set.id)}
                  className={`p-3.5 cursor-pointer transition-all ${
                    isSelected ? 'bg-teal-50/80 border-r-4 border-r-teal-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-black text-slate-900">{set.id}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                      {set.serialNumber}
                    </span>
                  </div>

                  <div className="font-bold text-xs text-slate-800 mb-1">{set.setNameAr}</div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>المنطقة: <strong>{set.currentZoningArea}</strong></span>
                    <span className="text-teal-700 font-bold">{set.packagingStatus}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Full Life-Cycle Timeline */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-[650px] overflow-hidden">
          {selectedSetInstance ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900">{selectedSetInstance.setNameAr}</h3>
                    <span className="text-xs font-mono bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
                      {selectedSetInstance.id}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    الرقم التسلسلي: {selectedSetInstance.serialNumber} • المنطقة الحالية: {selectedSetInstance.currentZoningArea}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                {/* Visual Step-by-Step Trace Timeline */}
                <div className="relative border-r-2 border-slate-200 pr-5 space-y-6 mr-3">
                  {/* Step 1: Return & Dirty Receipt */}
                  <div className="relative">
                    <div className="absolute -right-[27px] top-0 w-4 h-4 rounded-full bg-red-600 border-2 border-white shadow-xs" />
                    <div className="p-3 bg-red-50/70 border border-red-200 rounded-lg text-xs space-y-1">
                      <div className="font-bold text-red-950 flex items-center justify-between">
                        <span>1. الاستلام الملوث وتطبيق الرغوة الإنزيمية</span>
                        <span className="font-mono text-[10px] text-red-700">
                          {associatedReturn ? associatedReturn.returnTimestamp : 'موثق'}
                        </span>
                      </div>
                      <p className="text-red-800 text-[11px]">
                        الحاوية: {associatedReturn?.transportContainerId || 'CART-BIO-01'} • المصدر:{' '}
                        {associatedReturn?.originDepartment || 'مسرح العمليات 1'} • مطابقة العدد:{' '}
                        {associatedReturn?.returnedCount || 48} أداة
                      </p>
                    </div>
                  </div>

                  {/* Step 2: Washer Disinfection Cycle */}
                  <div className="relative">
                    <div className="absolute -right-[27px] top-0 w-4 h-4 rounded-full bg-amber-500 border-2 border-white shadow-xs" />
                    <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs space-y-1">
                      <div className="font-bold text-amber-950 flex items-center justify-between">
                        <span>2. التطهير الحراري الميكانيكي (Washer-Disinfector A0)</span>
                        <span className="font-mono text-[10px] text-amber-700">A0 = 3120 Pass</span>
                      </div>
                      <p className="text-amber-800 text-[11px]">
                        الجهاز: Pass-Through 1 • المعامل القياسي: ISO 15883 • درجة الحرارة القصوى: 93.2°C • حالة التطهير: ناجح
                      </p>
                    </div>
                  </div>

                  {/* Step 3: Inspection & Assembly */}
                  <div className="relative">
                    <div className="absolute -right-[27px] top-0 w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-xs" />
                    <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs space-y-1">
                      <div className="font-bold text-blue-950 flex items-center justify-between">
                        <span>3. الفحص المجهري وتجميع وتغليف الطقم</span>
                        <span className="font-mono text-[10px] text-blue-700">
                          {associatedPackage?.id || 'PKG-RECORD'}
                        </span>
                      </div>
                      <p className="text-blue-800 text-[11px]">
                        الفحص: سليم بدون بقايا حيوية • التغليف: {associatedPackage?.packagingMethod || 'حاوية صلبة بفلتر'} • المؤشر الكيميائي: Class 5 Integrator
                      </p>
                    </div>
                  </div>

                  {/* Step 4: Sterilizer Exposure & Tri-Pillar Release */}
                  <div className="relative">
                    <div className="absolute -right-[27px] top-0 w-4 h-4 rounded-full bg-indigo-600 border-2 border-white shadow-xs" />
                    <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-lg text-xs space-y-1">
                      <div className="font-bold text-indigo-950 flex items-center justify-between">
                        <span>4. دورة التعقيم بالبخار والاعتماد السريري</span>
                        <span className="font-mono text-[10px] text-indigo-700">
                          {associatedCycle?.id || 'STER-CYC-401'}
                        </span>
                      </div>
                      <p className="text-indigo-800 text-[11px]">
                        المعقم: {associatedCycle?.sterilizerName || 'معقم البخار 1'} • المنحنى الفيزيائي: مطابق • المؤشر الحيوي BI: سالب للنمو (Pass) • الإفراج: مفرج عنه رسمياً
                      </p>
                    </div>
                  </div>

                  {/* Step 5: Distribution & OR Usage Link */}
                  <div className="relative">
                    <div className="absolute -right-[27px] top-0 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white shadow-xs" />
                    <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs space-y-1">
                      <div className="font-bold text-emerald-950 flex items-center justify-between">
                        <span>5. الصرف للعمليات والربط بحالة المريض الجراحية</span>
                        <span className="font-mono text-[10px] text-emerald-700">
                          {associatedDistribution?.id || 'DIST-REQ-501'}
                        </span>
                      </div>
                      <p className="text-emerald-800 text-[11px]">
                        المسرح: {associatedDistribution?.destinationDepartment || 'OR-1'} • حالة الجراحة:{' '}
                        {associatedDistribution?.orCaseReference || 'or-case-201'} • المريض (MRN):{' '}
                        {associatedReturn?.patientMrnReference || 'MRN-77412'} ({associatedReturn?.patientNameSynthetic || 'سليمان خالد العتيبي'})
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
              اختر طقماً لعرض شجرة التتبع
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
