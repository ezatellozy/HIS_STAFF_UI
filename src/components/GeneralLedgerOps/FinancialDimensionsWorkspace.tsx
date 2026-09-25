import React, { useState } from 'react';
import { 
  Building2, 
  Layers, 
  Compass, 
  FolderKanban, 
  ShieldCheck, 
  AlertCircle, 
  Info, 
  CheckCircle2, 
  Plus,
  GitBranch,
  Filter
} from 'lucide-react';
import { 
  GeneralLedgerState, 
  FinancialDimensionValue, 
  DimensionCombinationRule 
} from '../../types/generalLedger';

interface FinancialDimensionsWorkspaceProps {
  glState: GeneralLedgerState;
}

export const FinancialDimensionsWorkspace: React.FC<FinancialDimensionsWorkspaceProps> = ({
  glState
}) => {
  const [activeTab, setActiveTab] = useState<'branches' | 'departments' | 'costCenters' | 'projects' | 'rules'>('branches');

  const { branches, departments, costCenters, projects, combinationRules } = glState.dimensions;

  return (
    <div id="financial-dimensions-workspace" className="space-y-6">
      
      {/* Workspace Header */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-400" />
          <h2 className="text-base font-bold text-white">
            الأبعاد المالية وقواعد التوزيع (Financial Dimensions & Segment Rules)
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          هيكل تحليلي رباعي الأبعاد (الفروع، الأقسام، مراكز التكلفة، والمشاريع الرأسمالية) مفصول بالكامل عن الحسابات الرئيسية لتمكين التقارير القطاعية دون تضخيم الدليل المحاسبي.
        </p>

        {/* Architectural Principles Box */}
        <div className="mt-3 p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/30 text-indigo-200 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-white">
              مبدأ الاستقلالية المحاسبية للأبعاد (GL07 & GL28):
            </span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              الفروع والمراكز هنا تمثل <b>أبعاداً محاسبية مالية</b> تتبع كياناً قانونياً واحداً، وهي مستقلة تماماً عن صلاحيات دخول المستخدمين والمجموعات الأمنية (Staff Roles / Security Groups)، مما يسمح للمحاسب المختص بتقييد حركات تخص أي فرع أو مركز تكلفة وفقاً للتفويض المالي.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar bg-slate-900/80 p-2 rounded-xl border border-slate-800 text-xs">
        <button
          onClick={() => setActiveTab('branches')}
          className={`px-3 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'branches' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>الفروع والمنشآت ({branches.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('departments')}
          className={`px-3 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'departments' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>الأقسام التشغيلية ({departments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('costCenters')}
          className={`px-3 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'costCenters' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>مراكز التكلفة والربحية ({costCenters.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className={`px-3 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'projects' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FolderKanban className="w-3.5 h-3.5" />
          <span>المشاريع والأصول الرأسمالية ({projects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={`px-3 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'rules' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>قواعد التحقق والتوافق ({combinationRules.length})</span>
        </button>
      </div>

      {/* Tab Contents */}
      
      {/* 1. Branches */}
      {activeTab === 'branches' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">فروع المستشفى والعيادات التابعة</h3>
              <p className="text-xs text-slate-400">تستخدم لتحديد الموقع الجغرافي للعمليات وإصدار القوائم المالية الموحدة والقطاعية</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {branches.map(b => (
              <div key={b.code} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-purple-400 text-xs">{b.code}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800">
                    نشط
                  </span>
                </div>
                <div className="text-white font-bold text-sm">{b.nameAr}</div>
                <div className="text-slate-400 text-xs font-sans">{b.nameEn}</div>
                {b.descriptionAr && (
                  <p className="text-slate-400 text-[11px] pt-1 border-t border-slate-800/80">
                    {b.descriptionAr}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Departments */}
      {activeTab === 'departments' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">الأقسام الطبية والإدارية (Department Dimensions)</h3>
            <p className="text-xs text-slate-400">أبعاد تنظيمية لتوجيه تكاليف وإيرادات الأقسام السريرية والإسنادية</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {departments.map(d => (
              <div key={d.code} className="bg-slate-950 border border-slate-800 p-3.5 rounded-lg space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-400">{d.code}</span>
                  <span className="text-[10px] text-slate-500">مستوى 1</span>
                </div>
                <div className="text-white font-bold text-xs">{d.nameAr}</div>
                <div className="text-slate-400 text-[11px] font-sans">{d.nameEn}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Cost Centers */}
      {activeTab === 'costCenters' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">مراكز التكلفة التحليلية (Cost Centers)</h3>
            <p className="text-xs text-slate-400">مراكز تجميع المصروفات المباشرة وغير المباشرة وفقاً لمعايير محاسبة التكاليف الصحية</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">رمز مركز التكلفة</th>
                  <th className="py-2.5 px-3">اسم المركز (عربي)</th>
                  <th className="py-2.5 px-3">الاسم بالإنجليزية</th>
                  <th className="py-2.5 px-3">القسم المرتبط</th>
                  <th className="py-2.5 px-3">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {costCenters.map(cc => (
                  <tr key={cc.code} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-bold text-purple-400">{cc.code}</td>
                    <td className="py-2.5 px-3 font-sans text-white font-medium">{cc.nameAr}</td>
                    <td className="py-2.5 px-3 font-sans text-slate-400">{cc.nameEn}</td>
                    <td className="py-2.5 px-3 font-sans text-slate-300">{cc.parentDepartmentCode || 'عام'}</td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800">
                        نشط
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Projects */}
      {activeTab === 'projects' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">المشاريع والأصول الرأسمالية (Capital Projects Dimension)</h3>
            <p className="text-xs text-slate-400">تتبع المشاريع الرأسمالية والتوسعات تحت التنفيذ وعقود التجهيزات الطبية الكبرى</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map(p => (
              <div key={p.code} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-amber-400 text-xs">{p.code}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-blue-950 text-blue-300 border border-blue-800">
                    مشروع رأسمالي نشط
                  </span>
                </div>
                <div className="text-white font-bold text-sm">{p.nameAr}</div>
                <div className="text-slate-400 text-xs font-sans">{p.nameEn}</div>
                {p.descriptionAr && (
                  <p className="text-slate-400 text-[11px] pt-2 border-t border-slate-800">
                    {p.descriptionAr}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Dimension Combination Rules */}
      {activeTab === 'rules' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">قواعد التحقق والتوافق المحاسبي للأبعاد (Combination Rules)</h3>
            <p className="text-xs text-slate-400">قواعد برمجية صارمة تمنع ترحيل أي قيد يخالف متطلبات مراكز التكلفة أو الأقسام الإلزامية</p>
          </div>

          <div className="space-y-3">
            {combinationRules.map(rule => (
              <div key={rule.ruleId} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{rule.nameAr}</span>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {rule.ruleId}
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs">{rule.descriptionAr}</p>
                  
                  <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-slate-400">
                    <span>الحسابات المستهدفة: <b className="text-white font-mono">{rule.accountCodePattern}</b></span>
                    <span>مركز التكلفة: <b className={rule.requireCostCenter ? 'text-emerald-400' : 'text-slate-500'}>{rule.requireCostCenter ? 'إلزامي' : 'اختياري'}</b></span>
                    <span>القسم: <b className={rule.requireDepartment ? 'text-emerald-400' : 'text-slate-500'}>{rule.requireDepartment ? 'إلزامي' : 'اختياري'}</b></span>
                    <span>الفرع: <b className={rule.requireBranch ? 'text-emerald-400' : 'text-slate-500'}>{rule.requireBranch ? 'إلزامي' : 'اختياري'}</b></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
