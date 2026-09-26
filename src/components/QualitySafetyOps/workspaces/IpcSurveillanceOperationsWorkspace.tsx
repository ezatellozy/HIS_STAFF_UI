import React, { useState } from 'react';
import {
  HaiSurveillanceCase,
  OutbreakClusterRecord,
  DeviceSurveillanceDenominator,
  HaiType,
  IsolationPrecautionType,
  QpsPersona,
  QpsActivityLog
} from '../../../types/qualitySafetyOps';
import { calculateDeviceAssociatedRate } from '../../../utils/qualitySafetyEngine';
import {
  ShieldAlert,
  Bug,
  Activity,
  Layers,
  Search,
  Filter,
  Users,
  Building,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Info,
  ChevronRight,
  TrendingUp,
  FileText
} from 'lucide-react';

interface Props {
  haiCases: HaiSurveillanceCase[];
  setHaiCases: React.Dispatch<React.SetStateAction<HaiSurveillanceCase[]>>;
  clusters: OutbreakClusterRecord[];
  deviceDenominators: DeviceSurveillanceDenominator[];
  activePersona: QpsPersona;
  onAddActivityLog: (log: QpsActivityLog) => void;
}

export const IpcSurveillanceOperationsWorkspace: React.FC<Props> = ({
  haiCases,
  setHaiCases,
  clusters,
  deviceDenominators,
  activePersona,
  onAddActivityLog
}) => {
  const [subView, setSubView] = useState<'surveillance' | 'precautions' | 'clusters'>('surveillance');
  const [selectedCaseId, setSelectedCaseId] = useState<string>(haiCases[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [wardFilter, setWardFilter] = useState<string>('all');

  const selectedCase = haiCases.find(c => c.id === selectedCaseId) || haiCases[0];

  const filteredCases = haiCases.filter(c => {
    const matchesSearch =
      c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.patientMrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.organism.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'all' || c.haiType === typeFilter;
    const matchesWard = wardFilter === 'all' || c.wardDepartment.includes(wardFilter);

    return matchesSearch && matchesType && matchesWard;
  });

  const getHaiBadge = (type: HaiType) => {
    switch (type) {
      case 'clabsi':
        return { label: 'خمج دم القسطرة (CLABSI)', color: 'bg-red-100 text-red-800 border-red-200' };
      case 'cauti':
        return { label: 'التهاب قسطرة البول (CAUTI)', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'vap':
        return { label: 'التهاب رئة التنفس (VAP)', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'ssi':
        return { label: 'عدوى موضع الجراحة (SSI)', color: 'bg-orange-100 text-orange-800 border-orange-200' };
      case 'mdro_colonization_infection':
      default:
        return { label: 'ميكروبات مقاومة (MDRO)', color: 'bg-rose-100 text-rose-800 border-rose-200' };
    }
  };

  const getIsolationBadge = (iso: IsolationPrecautionType) => {
    switch (iso) {
      case 'airborne':
        return 'bg-blue-600 text-white font-bold';
      case 'contact':
        return 'bg-amber-600 text-white font-bold';
      case 'droplet':
        return 'bg-teal-600 text-white font-bold';
      case 'protective':
        return 'bg-purple-600 text-white font-bold';
      case 'standard':
      default:
        return 'bg-slate-200 text-slate-700';
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Subview Navigation */}
      <div className="bg-white rounded-3xl border border-slate-200 p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubView('surveillance')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              subView === 'surveillance'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Bug className="w-3.5 h-3.5" />
            <span>ترصد عدوى المنشآت الصحية (HAI Surveillance)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900/40 text-white font-mono">
              {haiCases.length}
            </span>
          </button>

          <button
            onClick={() => setSubView('precautions')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              subView === 'precautions'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>احتياطات العزل الطبي (Transmission Precautions)</span>
          </button>

          <button
            onClick={() => setSubView('clusters')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              subView === 'clusters'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>الاستقصاء الوبائي والعناقيد (Outbreak Cluster Review)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-600 text-white font-mono">
              {clusters.length}
            </span>
          </button>
        </div>

        <div className="text-[11px] text-slate-400 font-bold hidden sm:block">
          معايير CDC/NHSN والمديرية العامة لمكافحة العدوى (GDIPC)
        </div>
      </div>

      {/* 2. Device-Days Rates Overview Row */}
      {subView === 'surveillance' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {deviceDenominators.map(den => (
            <div key={den.unitId} className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">{den.unitName}</span>
                <span className="text-[10px] text-slate-400 font-mono">{den.period}</span>
              </div>

              <div className="grid grid-cols-3 gap-1.5 text-center text-xs pt-1">
                <div className="p-2 rounded-xl bg-red-50/60 border border-red-200">
                  <div className="text-[9px] text-red-600 font-bold">CLABSI / 1000</div>
                  <div className={`font-black text-red-700 font-mono ${typeof den.clabsiRatePer1000 === 'number' ? 'text-base' : 'text-[10px] mt-1'}`}>
                    {typeof den.clabsiRatePer1000 === 'number' ? den.clabsiRatePer1000.toFixed(2) : 'غير قابل للحساب (0 يوم)'}
                  </div>
                  <div className="text-[9px] text-slate-400">{den.centralLineDays} يوم خط</div>
                </div>
                <div className="p-2 rounded-xl bg-amber-50/60 border border-amber-200">
                  <div className="text-[9px] text-amber-600 font-bold">CAUTI / 1000</div>
                  <div className={`font-black text-amber-700 font-mono ${typeof den.cautiRatePer1000 === 'number' ? 'text-base' : 'text-[10px] mt-1'}`}>
                    {typeof den.cautiRatePer1000 === 'number' ? den.cautiRatePer1000.toFixed(2) : 'غير قابل للحساب (0 يوم)'}
                  </div>
                  <div className="text-[9px] text-slate-400">{den.urinaryCatheterDays} يوم بول</div>
                </div>
                <div className="p-2 rounded-xl bg-purple-50/60 border border-purple-200">
                  <div className="text-[9px] text-purple-600 font-bold">VAP / 1000</div>
                  <div className={`font-black text-purple-700 font-mono ${typeof den.vapRatePer1000 === 'number' ? 'text-base' : 'text-[10px] mt-1'}`}>
                    {typeof den.vapRatePer1000 === 'number' ? den.vapRatePer1000.toFixed(2) : 'غير قابل للحساب (0 يوم)'}
                  </div>
                  <div className="text-[9px] text-slate-400">{den.ventilatorDays} يوم تنفس</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. SUBVIEW: Surveillance Cases List & Detail */}
      {subView === 'surveillance' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column (5 Cols): Cases List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="bg-white rounded-3xl border border-slate-200 p-3.5 shadow-xs">
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 absolute right-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="بحث بالمريض، رقم الملف، نوع العدوى..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-3 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-1 text-[11px] pb-2 border-b border-slate-100">
                <button
                  onClick={() => setTypeFilter('all')}
                  className={`px-2 py-0.5 rounded-lg font-bold cursor-pointer transition-all ${
                    typeFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  الكل
                </button>
                <button
                  onClick={() => setTypeFilter('clabsi')}
                  className={`px-2 py-0.5 rounded-lg font-bold cursor-pointer transition-all ${
                    typeFilter === 'clabsi' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700'
                  }`}
                >
                  CLABSI
                </button>
                <button
                  onClick={() => setTypeFilter('cauti')}
                  className={`px-2 py-0.5 rounded-lg font-bold cursor-pointer transition-all ${
                    typeFilter === 'cauti' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  CAUTI
                </button>
                <button
                  onClick={() => setTypeFilter('vap')}
                  className={`px-2 py-0.5 rounded-lg font-bold cursor-pointer transition-all ${
                    typeFilter === 'vap' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-700'
                  }`}
                >
                  VAP
                </button>
              </div>

              {/* Case List */}
              <div className="space-y-2 mt-2 max-h-[500px] overflow-y-auto pr-1">
                {filteredCases.map(c => {
                  const isSelected = c.id === selectedCase?.id;
                  const haiInfo = getHaiBadge(c.haiType);

                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCaseId(c.id)}
                      className={`p-3 rounded-2xl border text-right transition-all cursor-pointer ${
                        isSelected
                          ? 'border-teal-500 bg-teal-50/40 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-slate-900">{c.caseNumber}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${haiInfo.color}`}>
                            {haiInfo.label}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${getIsolationBadge(c.assignedIsolation)}`}>
                          عزل: {c.assignedIsolation === 'contact' ? 'تلامس' : c.assignedIsolation === 'airborne' ? 'هوائي' : 'قياسي'}
                        </span>
                      </div>

                      <div className="text-xs font-bold text-slate-800 line-clamp-1 mt-1">
                        {c.patientName} ({c.patientMrn}) • {c.wardDepartment}
                      </div>

                      <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between font-mono">
                        <span className="text-teal-700 font-bold">{c.organism.name}</span>
                        <span>{c.eventDate}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column (7 Cols): Selected Case Detail */}
          <div className="lg:col-span-7">
            {selectedCase ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-black text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                        {selectedCase.caseNumber}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getHaiBadge(selectedCase.haiType).color}`}>
                        {getHaiBadge(selectedCase.haiType).label}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-xs ${getIsolationBadge(selectedCase.assignedIsolation)}`}>
                        عزل: {selectedCase.assignedIsolation}
                      </span>
                    </div>
                    <h2 className="text-sm font-bold text-slate-900 mt-1.5">
                      المريض: {selectedCase.patientName} ({selectedCase.patientMrn}) • {selectedCase.wardDepartment} ({selectedCase.bedNumber})
                    </h2>
                  </div>

                  <span className="text-xs text-slate-500 font-bold">
                    الحالة: <strong className="text-teal-700">{selectedCase.status === 'confirmed_hai' ? 'عدوى مؤكدة معيارياً' : selectedCase.status}</strong>
                  </span>
                </div>

                {/* Device & Infection Timeline Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold">الجهاز المرتبط:</div>
                    <div className="font-semibold text-slate-800">
                      {selectedCase.devicePresent ? `${selectedCase.deviceType} (${selectedCase.deviceDaysAtEvent} أيام)` : 'لا يوجد جهاز'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold">تاريخ وقوع الحدث:</div>
                    <div className="font-semibold text-slate-800">{selectedCase.eventDate}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold">مصدر العينة المخبرية:</div>
                    <div className="font-semibold text-slate-800">{selectedCase.specimenSource}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold">استشاري مكافحة العدوى:</div>
                    <div className="font-semibold text-slate-800">{selectedCase.confirmedBy}</div>
                  </div>
                </div>

                {/* NHSN Surveillance Criteria Checklist */}
                <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200 text-xs space-y-1.5">
                  <div className="font-bold text-teal-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    <span>مطابقة المعايير الوطنية والدولية للترصد (CDC/NHSN Criteria):</span>
                  </div>
                  <p className="text-teal-800 text-[11px] leading-relaxed">
                    {selectedCase.nhsnCriteriaSummary}
                  </p>
                </div>

                {/* Microorganism & Resistance Phenotype */}
                <div className="p-3.5 rounded-2xl border border-rose-200 bg-rose-50/40 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-rose-900 flex items-center gap-1.5">
                      <Bug className="w-4 h-4 text-rose-600" />
                      <span>الميكروب المعزول ونمط المقاومة (Microorganism & Resistance):</span>
                    </div>
                    {selectedCase.organism.mdroClassification !== 'None' && (
                      <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-red-600 text-white">
                        {selectedCase.organism.mdroClassification}
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-bold text-rose-950 font-mono">
                    {selectedCase.organism.name}
                  </div>
                  <div className="text-[11px] text-slate-700 bg-white p-2.5 rounded-xl border border-rose-200/60 leading-relaxed">
                    <strong>النمط الجيني والظاهري للمقاومة:</strong> {selectedCase.organism.resistancePhenotype}
                  </div>
                </div>

                {/* Source investigation & antibiotic stewardship */}
                <div className="space-y-1.5 text-xs">
                  <div className="font-bold text-slate-800">العلاج الدوائي وترشيد المضادات الحيوية:</div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-mono text-[11px]">
                    {selectedCase.antiMicrobialTherapy}
                  </div>
                  <div className="text-[11px] text-slate-600 pt-1">
                    <strong>نتائج استقصاء المصدر:</strong> {selectedCase.sourceInvestigationNotes}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
                يرجى اختيار حالة ترصد للاطلاع على التفاصيل
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. SUBVIEW: Outbreak & Cluster Review */}
      {subView === 'clusters' && (
        <div className="space-y-3">
          {clusters.map(cluster => (
            <div
              key={cluster.id}
              className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-lg border border-rose-200">
                    {cluster.clusterCode}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">{cluster.titleAr}</h3>
                </div>
                <span className="text-xs font-bold text-rose-700 bg-rose-100 px-3 py-1 rounded-full border border-rose-300">
                  {cluster.status === 'contained_monitoring' ? 'عنقود تحت الاحتواء والمراقبة المستمرة' : cluster.status}
                </span>
              </div>

              {/* Cluster Meta */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div>
                  <div className="text-[10px] text-slate-400">الميكروب المرتبط:</div>
                  <div className="font-bold text-slate-800">{cluster.organismName}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">الوحدة المتأثرة:</div>
                  <div className="font-bold text-slate-800">{cluster.locationUnit}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">إجمالي الحالات المرتبطة:</div>
                  <div className="font-bold text-rose-700 font-mono text-sm">{cluster.totalCasesLinked} حالات</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">معدل الهجوم الوبائي (Attack Rate):</div>
                  <div className="font-bold text-slate-800 font-mono text-sm">{cluster.attackRatePercent}%</div>
                </div>
              </div>

              {/* Synthetic Epidemic Curve */}
              <div className="space-y-2">
                <div className="font-bold text-xs text-slate-800 flex items-center justify-between">
                  <span>المنحنى الوبائي للعنقود (Epidemic Curve):</span>
                  <span className="text-[10px] text-slate-400">توزيع الحالات بحسب تاريخ ظهور الأعراض</span>
                </div>
                <div className="flex items-end gap-3 h-24 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  {cluster.epidemicCurve.map((p, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[9px] font-bold text-rose-600 font-mono">{p.newCases}</span>
                      <div
                        className="w-full bg-rose-500 rounded-t-md transition-all"
                        style={{ height: `${p.newCases * 30}px` }}
                      />
                      <span className="text-[9px] text-slate-500 font-mono">{p.date.split('-')[2]} سيب</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Containment Bundle Actions */}
              <div className="space-y-1.5 text-xs">
                <div className="font-bold text-slate-800">حزمة إجراءات الاحتواء والتطهير المطبقة:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {cluster.containmentActions.map((action, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2.5 rounded-xl bg-teal-50/50 border border-teal-200 text-teal-900 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. SUBVIEW: Transmission Precautions Directory */}
      {subView === 'precautions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white rounded-3xl border border-amber-200 p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-md font-bold text-xs bg-amber-600 text-white">
                عزل التلامس (Contact)
              </span>
              <span className="text-[10px] text-amber-700 font-bold">أصفر</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">
              مخصص لحالات MDRO، المطثية العسيرة C. diff، والجروح الصديدية. ارتداء القفازات والمريول قبل دخول الغرفة، ومعدات قياس خاصة للمريض.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-teal-200 p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-md font-bold text-xs bg-teal-600 text-white">
                عزل الرذاذ (Droplet)
              </span>
              <span className="text-[10px] text-teal-700 font-bold">أخضر/تركواز</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">
              مخصص للإنفلونزا، السعال الديكي، والتهاب السحايا النيسيري. قناع جراحي وحماية العينين عند الاقتراب لمسافة أقل من مترين.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-blue-200 p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-md font-bold text-xs bg-blue-600 text-white">
                عزل الهواء (Airborne)
              </span>
              <span className="text-[10px] text-blue-700 font-bold">أزرق</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">
              مخصص للدرن الرئوي النشط والحصبة. غرفة ضغط سلبي (AIIR) مع فلترة HEPA وارتداء كمام التنفس المعياري N95.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-purple-200 p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-md font-bold text-xs bg-purple-600 text-white">
                البيئة الوقائية (Protective)
              </span>
              <span className="text-[10px] text-purple-700 font-bold">بنفسجي</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">
              مخصص لمرضى نقص المناعة الشديد وزراعة النخاع. غرفة ضغط إيجابي لحماية المريض من الميكروبات البيئية والفطرية.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
