import React, { useState } from 'react';
import {
  Warehouse,
  Search,
  Filter,
  ShieldAlert,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  RefreshCw,
  Building2,
  Calendar,
  AlertCircle,
  HelpCircle,
  X
} from 'lucide-react';
import {
  PhysicalStockBalance,
  StorageLocation,
  ItemMasterRecord
} from '../../types/supplyChainOps';
import { getEffectiveDate } from '../../utils/mockClock';

interface StockVisibilityLedgerViewProps {
  stockBalances: PhysicalStockBalance[];
  locations: StorageLocation[];
  catalogItems: ItemMasterRecord[];
  onOpenScenarioModal?: () => void;
}

export const StockVisibilityLedgerView: React.FC<StockVisibilityLedgerViewProps> = ({
  stockBalances,
  locations,
  catalogItems,
  onOpenScenarioModal
}) => {
  const [selectedLocationId, setSelectedLocationId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterBucket, setFilterBucket] = useState<'all' | 'quarantined' | 'expiring' | 'stale'>('all');
  const [showFormulaModal, setShowFormulaModal] = useState<boolean>(false);

  // Map item details by id
  const itemMap = new Map<string, ItemMasterRecord>(catalogItems.map(i => [i.id, i]));
  const locationMap = new Map<string, StorageLocation>(locations.map(l => [l.id, l]));

  const filteredBalances = stockBalances.filter(bal => {
    const item = itemMap.get(bal.itemId);
    const location = locationMap.get(bal.locationId);

    const matchesLocation =
      selectedLocationId === 'all' || bal.locationId === selectedLocationId;

    const matchesSearch =
      !searchQuery ||
      (item && (
        item.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase())
      )) ||
      (bal.lotNumber && bal.lotNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    let matchesBucket = true;
    if (filterBucket === 'quarantined') matchesBucket = bal.quarantined > 0;
    if (filterBucket === 'expiring') {
      if (!bal.expiryDate) matchesBucket = false;
      else {
        const exp = new Date(bal.expiryDate);
        const now = getEffectiveDate();
        const diffDays = (exp.getTime() - now.getTime()) / (1000 * 3600 * 24);
        matchesBucket = diffDays <= 60; // Expiring in <= 60 days
      }
    }
    if (filterBucket === 'stale') matchesBucket = bal.quantityStatus === 'stale';

    return matchesLocation && matchesSearch && matchesBucket;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Header & Bucket Architecture Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Warehouse className="w-5 h-5 text-amber-400" />
            <span>سجل الأرصدة والمواقع التخزينية (Stock Visibility & Locations Ledger)</span>
          </h2>
          <p className="text-xs text-slate-400">
            تتبع دقيق ومفصل للمخزون الفيزيائي عبر المستودعات، الرصيف، والأجنحة السريرية بدلالة الأوعية المنفصلة كلياً.
          </p>
        </div>

        <button
          onClick={() => setShowFormulaModal(true)}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 self-start md:self-auto"
        >
          <HelpCircle className="w-3.5 h-3.5 text-teal-400" />
          <span>معادلة الأوعية الفيزيائية المستقلة (Bucket Logic)</span>
        </button>
      </div>

      {/* Filter and Location Selector Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="بحث باسم المستلزم، الكود، أو رقم التشغيلة (Lot)..."
            className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder:text-slate-500 text-xs font-medium focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
          />
        </div>

        {/* Location Dropdown */}
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
          <select
            value={selectedLocationId}
            onChange={e => setSelectedLocationId(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-medium focus:border-amber-500 transition-all cursor-pointer"
          >
            <option value="all">كافة المواقع والمستودعات والأجنحة</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>
                {loc.facilityNameAr} — {loc.warehouseNameAr} ({loc.shelfBin})
              </option>
            ))}
          </select>
        </div>

        {/* Quick Bucket Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setFilterBucket('all')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              filterBucket === 'all'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            الكل
          </button>
          <button
            onClick={() => setFilterBucket('quarantined')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
              filterBucket === 'quarantined'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-slate-900 text-red-400 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>المحجور (Quarantined)</span>
          </button>
          <button
            onClick={() => setFilterBucket('expiring')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
              filterBucket === 'expiring'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-900 text-amber-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>قريب الانتهاء (FEFO)</span>
          </button>
          <button
            onClick={() => setFilterBucket('stale')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
              filterBucket === 'stale'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-900 text-purple-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>بيانات قديمة (سيناريو I28)</span>
          </button>
        </div>
      </div>

      {/* Stock Ledger Master Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 text-[11px] font-bold border-b border-slate-800">
              <tr>
                <th className="p-3.5">الصنف والمواصفات</th>
                <th className="p-3.5">الموقع والتخزين</th>
                <th className="p-3.5">التشغيلة والصلاحية</th>
                <th className="p-3.5 text-center bg-slate-900/40">الرصيد الفعلي (On-Hand)</th>
                <th className="p-3.5 text-center text-red-300">المحجور والتالف</th>
                <th className="p-3.5 text-center text-blue-300">المحجوز والمجهز</th>
                <th className="p-3.5 text-center bg-teal-950/40 text-teal-300 font-extrabold">المتاح الفعلي للصرف (Available)</th>
                <th className="p-3.5">حالة الاتصال والبيانات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredBalances.map(bal => {
                const item = itemMap.get(bal.itemId);
                const loc = locationMap.get(bal.locationId);

                const isNearExpiry = bal.expiryDate && new Date(bal.expiryDate).getTime() - getEffectiveDate().getTime() < 30 * 86400000;
                const isQuarantined = bal.quarantined > 0;
                const isStale = bal.quantityStatus === 'stale';

                return (
                  <tr
                    key={bal.id}
                    className={`hover:bg-slate-800/50 transition-colors ${
                      isQuarantined ? 'bg-red-950/15' : ''
                    }`}
                  >
                    <td className="p-3.5 max-w-xs">
                      <div className="font-mono text-xs font-bold text-amber-400">
                        {item?.code || bal.itemId}
                      </div>
                      <div className="font-bold text-white text-xs mt-0.5">
                        {item?.nameAr || 'مستلزم طبي'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                        {item?.nameEn}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="font-bold text-slate-200">
                        {loc?.facilityNameAr || 'المستشفى الرئيسي'}
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        {loc?.warehouseNameAr}
                      </div>
                      <div className="text-teal-400 font-mono text-[10px] mt-0.5">
                        📍 {loc?.zone} &bull; {loc?.shelfBin}
                      </div>
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      <div className="font-mono text-xs font-bold text-slate-200">
                        {bal.lotNumber || 'غير مقيد بتشغيلة'}
                      </div>
                      {bal.expiryDate && (
                        <div className={`text-[11px] font-mono mt-0.5 flex items-center gap-1 ${
                          isNearExpiry ? 'text-amber-400 font-bold animate-pulse' : 'text-slate-400'
                        }`}>
                          <Calendar className="w-3 h-3" />
                          <span>انتهاء: {bal.expiryDate}</span>
                          {isNearExpiry && (
                            <span className="text-[9px] bg-amber-950 text-amber-300 border border-amber-800 px-1 rounded">
                              أولوية FEFO
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Physical On-Hand */}
                    <td className="p-3.5 text-center font-mono font-bold text-sm text-white bg-slate-900/30">
                      {bal.physicalOnHand !== undefined && bal.physicalOnHand !== null && !isNaN(bal.physicalOnHand) ? (
                        bal.physicalOnHand
                      ) : (
                        <span className="text-amber-400 font-bold text-xs bg-amber-950/70 px-1.5 py-0.5 rounded border border-amber-800 font-sans">
                          غير محدد (Unknown)
                        </span>
                      )}
                    </td>

                    {/* Quarantined & Damaged */}
                    <td className="p-3.5 text-center font-mono text-xs text-red-400 whitespace-nowrap">
                      {bal.quarantined > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 font-bold">
                          <Lock className="w-3 h-3" />
                          <span>{bal.quarantined} محجور</span>
                        </span>
                      ) : (
                        <span className="text-slate-600">0</span>
                      )}
                    </td>

                    {/* Reserved & Picked */}
                    <td className="p-3.5 text-center font-mono text-xs text-blue-300 whitespace-nowrap">
                      {(bal.reservedCommitted > 0 || bal.pickedStaged > 0) ? (
                        <div className="space-y-0.5 text-[10px]">
                          {bal.reservedCommitted > 0 && (
                            <div>محجوز للطلب: {bal.reservedCommitted}</div>
                          )}
                          {bal.pickedStaged > 0 && (
                            <div className="text-amber-300">مجهز بالرصيف: {bal.pickedStaged}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-600">0</span>
                      )}
                    </td>

                    {/* Available for Picking */}
                    <td className="p-3.5 text-center font-mono font-extrabold text-base text-teal-300 bg-teal-950/30">
                      {bal.availableForPicking !== undefined && bal.availableForPicking !== null && !isNaN(bal.availableForPicking) ? (
                        Math.max(0, bal.availableForPicking)
                      ) : (
                        <span className="text-amber-400 font-bold text-xs bg-amber-950/70 px-1.5 py-0.5 rounded border border-amber-800 font-sans">
                          غير محدد (Unknown)
                        </span>
                      )}
                    </td>

                    {/* Freshness / Telemetry */}
                    <td className="p-3.5 whitespace-nowrap">
                      {isStale ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-bold">
                            <AlertCircle className="w-3 h-3" />
                            <span>بيانات قديمة (Stale)</span>
                          </span>
                          <div className="text-[10px] text-purple-300/80 font-mono">
                            {bal.lastUpdatedTimestamp}
                          </div>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-400 font-mono">
                          <div className="text-emerald-400 text-[10px] font-bold">● محاكاة آنية (Simulated Telemetry)</div>
                          <div>{bal.lastUpdatedTimestamp}</div>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formula & Bucket Logic Modal */}
      {showFormulaModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <Layers className="w-5 h-5 text-teal-400" />
                <span>المعادلة المعتمدة لحساب الرصيد المتاح (Mutually Exclusive Buckets)</span>
              </div>
              <button
                onClick={() => setShowFormulaModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono space-y-2 text-slate-200">
              <div className="text-teal-400 font-bold text-sm">
                Available = PhysicalOnHand - (Quarantined + Damaged + Expired + PickedStaged + ReservedCommitted + PendingInspection)
              </div>
              <p className="text-slate-400 text-xs font-sans mt-2 leading-relaxed">
                الرصيد المتاح للصرف يتم حسابه بدقة باستبعاد كافة الأوعية المعزولة أو الملتزم بها، بحيث لا يمكن صرف أو تجهيز أي وحدة محجورة أو تالفة أو مجهزة لطلب مسبق تحت أي ظرف.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700">
                <div className="text-red-400 font-bold">الحجر (Quarantined):</div>
                <div className="text-slate-300 text-[11px]">ممنوع من الصرف لسلامة المرضى أو لعدم اجتياز الفحص.</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700">
                <div className="text-amber-400 font-bold">المجهز (Picked/Staged):</div>
                <div className="text-slate-300 text-[11px]">سُحب من الرف ويتواجد في رصيف التحميل بانتظار الناقل.</div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowFormulaModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
