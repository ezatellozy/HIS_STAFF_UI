import React, { useState } from 'react';
import {
  Building,
  FileText,
  Phone,
  Mail,
  Clock,
  Coins,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Layers,
  X
} from 'lucide-react';
import {
  VendorServiceContract,
  BiomedicalOpsState
} from '../../../types/biomedicalOps';

interface VendorContractsWorkspaceProps {
  state: BiomedicalOpsState;
  onAddContract: (contract: VendorServiceContract) => void;
  onAddAuditLog: (action: string, entityId: string, description: string) => void;
}

export const VendorContractsWorkspace: React.FC<VendorContractsWorkspaceProps> = ({
  state,
  onAddContract,
  onAddAuditLog
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showNewContractModal, setShowNewContractModal] = useState<boolean>(false);

  // New Contract form state
  const [vendorName, setVendorName] = useState<string>('');
  const [vendorEmail, setVendorEmail] = useState<string>('');
  const [vendorPhone, setVendorPhone] = useState<string>('');
  const [contractType, setContractType] = useState<VendorServiceContract['contractType']>('comprehensive_parts_labor');
  const [annualValue, setAnnualValue] = useState<number>(350000);
  const [slaHours, setSlaHours] = useState<number>(2);

  const filteredContracts = state.vendorContracts.filter(c => {
    const matchesSearch =
      !searchQuery ||
      c.contractNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.vendorName.includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleCreateContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName.trim()) return;

    const newContractNumber = `SLA-2026-VND-${Math.floor(100 + Math.random() * 900)}`;
    const todayStr = new Date().toISOString().split('T')[0];
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 2);

    const newContract: VendorServiceContract = {
      id: `cnt-${Date.now()}`,
      contractNumber: newContractNumber,
      vendorName,
      vendorContactEmail: vendorEmail || 'support@vendor.sa',
      vendorPhone: vendorPhone || '+966-11-000-0000',
      contractType,
      startDate: todayStr,
      endDate: nextYear.toISOString().split('T')[0],
      annualValueSar: annualValue,
      slaResponseHours: slaHours,
      slaPolicyMode: 'CONFIGURED_SLA',
      coveredAssetIds: [state.assets[0]?.id || 'asset-vent-01'],
      status: 'active'
    };

    onAddContract(newContract);
    onAddAuditLog(
      'VENDOR_CONTRACT_REGISTERED',
      newContract.id,
      `تسجيل وتفعيل عقد الصيانة المعتمد ${newContract.contractNumber} مع شركة ${newContract.vendorName} بقيمة ${newContract.annualValueSar} ريال سعودي سنوياً.`
    );

    setShowNewContractModal(false);
    setVendorName('');
  };

  const getContractTypeLabel = (type: VendorServiceContract['contractType']) => {
    switch (type) {
      case 'comprehensive_parts_labor':
        return 'شامل قطع الغيار وأجور الأيدي العاملة';
      case 'labor_only':
        return 'أجور الأيدي العاملة فقط (قطع الغيار مفصولة)';
      case 'ppm_preventive_only':
        return 'زيارات الصيانة الوقائية والمعايرة فقط';
      case 'on_call_t_m':
        return 'عند الطلب بحسب الوقت والمواد (T&M)';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              عقود الصيانة واتفاقيات مستوى الخدمة مع الوكلاء (Vendor Contracts & SLAs)
            </h2>
            <p className="text-xs text-slate-500">
              أزمنة الاستجابة والقيم المالية نماذج تعاقدية توضيحية (ILLUSTRATIVE_CONTRACT_CONFIGURATION) — بدون ترحيل قيود محاسبية أو ذمم مالية
            </p>
          </div>

          <button
            onClick={() => setShowNewContractModal(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل عقد صيانة جديد (New SLA)</span>
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="بحث برقم العقد، اسم الوكيل..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-slate-800 focus:bg-white focus:outline-hidden focus:border-teal-500"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:bg-white focus:outline-hidden cursor-pointer"
            >
              <option value="all">كافة حالات العقود</option>
              <option value="active">عقود سارية المفعول (Active)</option>
              <option value="expiring_soon">تنتهي خلال 90 يوماً (Expiring Soon)</option>
              <option value="expired">عقود منتهية (Expired)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contracts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContracts.map(contract => {
          const isExpiring = contract.status === 'expiring_soon';
          return (
            <div
              key={contract.id}
              className={`bg-white rounded-2xl p-4 border transition-all text-xs space-y-3 shadow-xs ${
                isExpiring ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                  {contract.contractNumber}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    contract.status === 'active'
                      ? 'bg-emerald-100 text-emerald-800'
                      : contract.status === 'expiring_soon'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {contract.status === 'active'
                    ? 'ساري المفعول'
                    : contract.status === 'expiring_soon'
                    ? 'يستحق التجديد قريباً'
                    : 'منتهي الصلاحية'}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm leading-snug">{contract.vendorName}</h3>
                <p className="text-[11px] text-teal-700 font-semibold mt-0.5">
                  {getContractTypeLabel(contract.contractType)}
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-[11px]">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-slate-500 block">زمن الاستجابة المعتمد (SLA):</span>
                    <span className="text-[9px] text-slate-400 font-mono">ILLUSTRATIVE_CONTRACT_CONFIGURATION</span>
                  </div>
                  <span className="font-bold text-slate-800 flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    {contract.slaResponseHours} ساعات
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">القيمة السنوية:</span>
                  <span className="font-mono font-bold text-slate-900">{contract.annualValueSar.toLocaleString()} ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">سريان العقد:</span>
                  <span className="font-mono text-slate-700">{contract.startDate} إلى {contract.endDate}</span>
                </div>
              </div>

              <div className="space-y-1 text-[11px] text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-mono">{contract.vendorContactEmail}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-mono">{contract.vendorPhone}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-semibold">
                  الأصول المغطاة: {contract.coveredAssetIds.length} أجهزة
                </span>
                <span className="text-teal-600 font-bold">معتمد نظامياً</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Contract Modal */}
      {showNewContractModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden text-right" dir="rtl">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-sm">تسجيل عقد صيانة جديد (New Service Contract)</h3>
              </div>
              <button onClick={() => setShowNewContractModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateContract} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="text-slate-700 block font-semibold mb-1">اسم الوكيل / الشركة المعتمدة:</label>
                <input
                  type="text"
                  placeholder="مثال: شركة الرعاية الطبية المتقدمة..."
                  value={vendorName}
                  onChange={e => setVendorName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="text-slate-700 block font-semibold mb-1">نوع التغطية والتعاقد:</label>
                <select
                  value={contractType}
                  onChange={e => setContractType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                >
                  <option value="comprehensive_parts_labor">شامل قطع الغيار وأجور اليد العاملة (Comprehensive)</option>
                  <option value="labor_only">أجور الأيدي العاملة فقط (Labor Only)</option>
                  <option value="ppm_preventive_only">صيانة وقائية دورية فقط (PPM Only)</option>
                  <option value="on_call_t_m">عند الطلب بحسب الوقت والمواد (Time & Material)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block font-semibold mb-1">القيمة السنوية (SAR):</label>
                  <input
                    type="number"
                    value={annualValue}
                    onChange={e => setAnnualValue(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block font-semibold mb-1">زمن الاستجابة SLA (ساعات):</label>
                  <input
                    type="number"
                    value={slaHours}
                    onChange={e => setSlaHours(parseInt(e.target.value) || 2)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block font-semibold mb-1">البريد الإلكتروني للوكيل:</label>
                  <input
                    type="email"
                    value={vendorEmail}
                    onChange={e => setVendorEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block font-semibold mb-1">هاتف الطوارئ 24/7:</label>
                  <input
                    type="text"
                    value={vendorPhone}
                    onChange={e => setVendorPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-2 rounded-xl cursor-pointer shadow-xs transition-colors"
                >
                  اعتماد وحفظ العقد
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewContractModal(false)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-4 py-2 rounded-xl cursor-pointer transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
