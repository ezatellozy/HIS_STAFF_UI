import React from 'react';
import {
  Clock,
  RefreshCw,
  Sparkles,
  Layers,
  Hospital
} from 'lucide-react';
import { ClinicalWorkArea } from '../../../types/clinicalWorkspace';

interface MyWorkTopContextBarProps {
  activePersona: 'doctor' | 'nurse' | 'pharmacist' | 'supervisor';
  onChangePersona: (persona: 'doctor' | 'nurse' | 'pharmacist' | 'supervisor') => void;
  selectedWorkArea: ClinicalWorkArea | 'all';
  onChangeWorkArea: (area: ClinicalWorkArea | 'all') => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  activeStaffName: string;
}

export const MyWorkTopContextBar: React.FC<MyWorkTopContextBarProps> = ({
  activePersona,
  onChangePersona,
  selectedWorkArea,
  onChangeWorkArea,
  onRefresh,
  isRefreshing,
  activeStaffName
}) => {
  return (
    <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-md">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Left / Identity Section */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 shrink-0 shadow-inner">
            <Hospital className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-white">
                مهامي السريرية وسير العمل (My Work & Operational Queues)
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-950 text-teal-300 border border-teal-800">
                واجهة تشغيلية موحدة • Operational Projection
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              عرض المهام والإجراءات السريرية التي تتطلب تدخلك أو تدخل الفريق عبر كافة أقسام المستشفى
            </p>
          </div>
        </div>

        {/* Right / Shift & Sync State */}
        <div className="flex items-center gap-2.5 flex-wrap self-stretch sm:self-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-300">
            <Clock className="w-3.5 h-3.5 text-teal-400" />
            <span>المناوبة الصباحية 07:00 - 15:00</span>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
            title="تحديث قائمة المهام التشغيلية"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-teal-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>تحديث</span>
          </button>
        </div>
      </div>

      {/* Persona & Scope Context Row */}
      <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        {/* Active Persona Switcher (UX Perspective, not real auth) */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-400 font-bold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>المنظور المهني (Persona):</span>
          </span>
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={() => onChangePersona('doctor')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                activePersona === 'doctor'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              طبيب معالج / استشاري
            </button>
            <button
              type="button"
              onClick={() => onChangePersona('nurse')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                activePersona === 'nurse'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              تمريض سريري
            </button>
            <button
              type="button"
              onClick={() => onChangePersona('pharmacist')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                activePersona === 'pharmacist'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              صيدلي إكلينيكي
            </button>
            <button
              type="button"
              onClick={() => onChangePersona('supervisor')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                activePersona === 'supervisor'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              مشرف القسم
            </button>
          </div>
        </div>

        {/* Work Area / Scope Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-400 font-bold flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>نطاق القسم (Scope):</span>
          </span>
          <select
            value={selectedWorkArea}
            onChange={e => onChangeWorkArea(e.target.value as any)}
            className="bg-slate-800 text-slate-200 border border-slate-700 px-3 py-1 rounded-xl font-bold text-xs focus:ring-1 focus:ring-teal-500 cursor-pointer"
          >
            <option value="all">كافة أرجاء المستشفى (Hospital-Wide)</option>
            <option value="opd">العيادات الخارجية (OPD)</option>
            <option value="er">قسم الطوارئ والحوادث (ER)</option>
            <option value="icu">العناية المركزة (ICU)</option>
            <option value="ipd">أجنحة التنويم (Inpatient Wards)</option>
            <option value="or">غرف العمليات (OR)</option>
          </select>
          <div className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            المستخدم: <strong className="text-white">{activeStaffName}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
