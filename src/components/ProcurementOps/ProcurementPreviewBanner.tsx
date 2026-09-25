import React from 'react';
import { AlertCircle, Building2, UserCog, Sparkles } from 'lucide-react';
import { ProcurementBranchId } from '../../types/procurementOps';

interface ProcurementPreviewBannerProps {
  currentBranch: ProcurementBranchId;
  onChangeBranch: (branch: ProcurementBranchId) => void;
  activeRole: string;
  onChangeRole: (role: string) => void;
  onSelectScenario: (scenarioId: string) => void;
  selectedScenarioId: string;
}

export const ProcurementPreviewBanner: React.FC<ProcurementPreviewBannerProps> = ({
  currentBranch,
  onChangeBranch,
  activeRole,
  onChangeRole,
  onSelectScenario,
  selectedScenarioId
}) => {
  return (
    <div className="bg-slate-900 border-b border-indigo-500/30 text-slate-200 px-4 py-2.5 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        
        {/* Synthetic Prototype Disclaimer */}
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-indigo-500/20 text-indigo-400 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-indigo-300">
                معاينة تصميمية لمشتريات المستشفى - نموذج محاكاة تجريبي
              </span>
              <span className="px-1.5 py-0.5 rounded-sm bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] font-mono">
                SYNTHETIC PROTOTYPE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Synthetic Procurement Design Preview — No real purchase commitments, budget bookings, or external transmissions.
            </p>
          </div>
        </div>

        {/* Controls: Branch Context & Simulated Role & Scenario Launcher */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-start md:justify-end">
          
          {/* Branch Context */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] text-slate-400">الفرع:</span>
            <select
              value={currentBranch}
              onChange={(e) => onChangeBranch(e.target.value as ProcurementBranchId)}
              className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none cursor-pointer"
            >
              <option value="main_hospital" className="bg-slate-900 text-slate-200">المستشفى التخصصي الرئيسي (Main)</option>
              <option value="suburban_clinic_branch" className="bg-slate-900 text-slate-200">مجمع العيادات الخارجية (Branch)</option>
              <option value="all" className="bg-slate-900 text-slate-200">كافة الفروع والمراكز (All Branches)</option>
            </select>
          </div>

          {/* Simulated Acting Role */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
            <UserCog className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[11px] text-slate-400">الدور التمثيلي:</span>
            <select
              value={activeRole}
              onChange={(e) => onChangeRole(e.target.value)}
              className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none cursor-pointer"
            >
              <option value="procurement_specialist" className="bg-slate-900 text-slate-200">أخصائي مشتريات (Buyer)</option>
              <option value="procurement_manager" className="bg-slate-900 text-slate-200">مدير إدارة المشتريات (Manager)</option>
              <option value="department_head" className="bg-slate-900 text-slate-200">رئيس القسم الطالب (Dept Head)</option>
              <option value="cfo_executive" className="bg-slate-900 text-slate-200">المدير المالي والتنفيذي (CFO)</option>
            </select>
          </div>

          {/* Audit Scenario Quick Nav */}
          <div className="flex items-center gap-1.5 bg-indigo-950/60 px-2.5 py-1 rounded-md border border-indigo-800/50">
            <span className="text-[11px] text-indigo-300 font-bold">سيناريو التدقيق:</span>
            <select
              value={selectedScenarioId}
              onChange={(e) => onSelectScenario(e.target.value)}
              className="bg-transparent text-indigo-200 text-xs font-medium focus:outline-none cursor-pointer max-w-[190px]"
            >
              <option value="" className="bg-slate-900 text-slate-300">-- اختر سيناريو (PROC01-30) --</option>
              <option value="PROC01" className="bg-slate-900 text-slate-300">PROC01 Routine PR</option>
              <option value="PROC02" className="bg-slate-900 text-slate-300">PROC02 Urgent PR</option>
              <option value="PROC03" className="bg-slate-900 text-slate-300">PROC03 Internal Stock Available</option>
              <option value="PROC04" className="bg-slate-900 text-slate-300">PROC04 Non-Catalog Request</option>
              <option value="PROC05" className="bg-slate-900 text-slate-300">PROC05 PR Awaiting Approval</option>
              <option value="PROC06" className="bg-slate-900 text-slate-300">PROC06 PR Returned for Revision</option>
              <option value="PROC07" className="bg-slate-900 text-slate-300">PROC07 PR Consolidation</option>
              <option value="PROC08" className="bg-slate-900 text-slate-300">PROC08 PR Split to Suppliers</option>
              <option value="PROC09" className="bg-slate-900 text-slate-300">PROC09 Supplier Not Qualified</option>
              <option value="PROC10" className="bg-slate-900 text-slate-300">PROC10 Supplier Expired</option>
              <option value="PROC11" className="bg-slate-900 text-slate-300">PROC11 RFQ & Invitations</option>
              <option value="PROC12" className="bg-slate-900 text-slate-300">PROC12 RFQ Sent Unconfirmed</option>
              <option value="PROC13" className="bg-slate-900 text-slate-300">PROC13 Quote Incomplete</option>
              <option value="PROC14" className="bg-slate-900 text-slate-300">PROC14 Different UOMs</option>
              <option value="PROC15" className="bg-slate-900 text-slate-300">PROC15 Different Currencies</option>
              <option value="PROC16" className="bg-slate-900 text-slate-300">PROC16 Tech Evaluation Pending</option>
              <option value="PROC17" className="bg-slate-900 text-slate-300">PROC17 Documented Award</option>
              <option value="PROC18" className="bg-slate-900 text-slate-300">PROC18 Emergency Exception</option>
              <option value="PROC19" className="bg-slate-900 text-slate-300">PROC19 PO Approved Not Sent</option>
              <option value="PROC20" className="bg-slate-900 text-slate-300">PROC20 PO Sent Not Acked</option>
              <option value="PROC21" className="bg-slate-900 text-slate-300">PROC21 Supplier Change Delivery</option>
              <option value="PROC22" className="bg-slate-900 text-slate-300">PROC22 PO Partially Shipped</option>
              <option value="PROC23" className="bg-slate-900 text-slate-300">PROC23 PO Partially Received</option>
              <option value="PROC24" className="bg-slate-900 text-slate-300">PROC24 QA Rejected Goods</option>
              <option value="PROC25" className="bg-slate-900 text-slate-300">PROC25 PO Amendment</option>
              <option value="PROC26" className="bg-slate-900 text-slate-300">PROC26 Supplier Claim Pending</option>
              <option value="PROC27" className="bg-slate-900 text-slate-300">PROC27 Multi-Branch Context</option>
              <option value="PROC28" className="bg-slate-900 text-slate-300">PROC28 Stale / Unavailable Data</option>
              <option value="PROC29" className="bg-slate-900 text-slate-300">PROC29 Synthetic Banner</option>
              <option value="PROC30" className="bg-slate-900 text-slate-300">PROC30 Module Boundaries</option>
            </select>
          </div>

        </div>

      </div>
    </div>
  );
};
