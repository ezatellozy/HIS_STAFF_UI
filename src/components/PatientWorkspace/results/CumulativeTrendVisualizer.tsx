import React, { useState } from 'react';
import {
  TrendingUp,
  X,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Info,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { CumulativeTrendSeries, CumulativeTrendDataPoint } from '../../../types/clinicalResults';

interface CumulativeTrendVisualizerProps {
  seriesList: CumulativeTrendSeries[];
  initialSelectedCode?: string;
  onClose: () => void;
}

export const CumulativeTrendVisualizer: React.FC<CumulativeTrendVisualizerProps> = ({
  seriesList,
  initialSelectedCode,
  onClose
}) => {
  const [selectedCode, setSelectedCode] = useState<string>(
    initialSelectedCode || seriesList[0]?.analyteCode || ''
  );

  const activeSeries = seriesList.find(s => s.analyteCode === selectedCode) || seriesList[0];

  if (!activeSeries) {
    return null;
  }

  // Calculate SVG chart bounds
  const values = activeSeries.points.map(p => p.value);
  const minVal = Math.min(
    ...values,
    activeSeries.normalRangeLow,
    activeSeries.criticalRangeLow ?? activeSeries.normalRangeLow
  );
  const maxVal = Math.max(
    ...values,
    activeSeries.normalRangeHigh,
    activeSeries.criticalRangeHigh ?? activeSeries.normalRangeHigh
  );

  const padding = (maxVal - minVal) * 0.15 || 1;
  const yMin = Math.max(0, minVal - padding);
  const yMax = maxVal + padding;

  const chartWidth = 540;
  const chartHeight = 220;
  const margin = { top: 20, right: 30, bottom: 40, left: 45 };
  const innerWidth = chartWidth - margin.left - margin.right;
  const innerHeight = chartHeight - margin.top - margin.bottom;

  const getX = (index: number, total: number) => {
    if (total <= 1) return margin.left + innerWidth / 2;
    return margin.left + (index / (total - 1)) * innerWidth;
  };

  const getY = (val: number) => {
    if (yMax === yMin) return margin.top + innerHeight / 2;
    const norm = (val - yMin) / (yMax - yMin);
    return margin.top + innerHeight - norm * innerHeight;
  };

  // Normal band Y coordinates
  const normalYHigh = getY(Math.min(yMax, activeSeries.normalRangeHigh));
  const normalYLow = getY(Math.max(yMin, activeSeries.normalRangeLow));
  const normalBandHeight = Math.max(2, normalYLow - normalYHigh);

  // Path string for SVG line
  const pathD = activeSeries.points
    .map((p, idx) => {
      const x = getX(idx, activeSeries.points.length);
      const y = getY(p.value);
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  // Latest vs previous delta
  const pts = activeSeries.points;
  const latestPt = pts[pts.length - 1];
  const prevPt = pts.length > 1 ? pts[pts.length - 2] : null;
  const deltaVal = prevPt ? Number((latestPt.value - prevPt.value).toFixed(2)) : 0;
  const deltaPercent = prevPt && prevPt.value !== 0 ? Math.round((deltaVal / prevPt.value) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-teal-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-teal-300">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">
                  المسار التراكمي الزمني (Longitudinal Trend Comparison)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-200 border border-teal-400/30">
                  FHIR Observation Trend
                </span>
              </div>
              <p className="text-xs text-teal-200/80">
                مقارنة نتائج التحليل عبر الزمن مع نطاق المعدل الطبيعي والقيم الحرجة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Analyte Selector Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-500 ml-1">اختر الفحص:</span>
            {seriesList.map(s => {
              const isSel = s.analyteCode === activeSeries.analyteCode;
              return (
                <button
                  key={s.analyteCode}
                  onClick={() => setSelectedCode(s.analyteCode)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSel
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {s.analyteNameAr}
                </button>
              );
            })}
          </div>

          {/* Key Metrics Header */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <span className="text-[10px] text-slate-500 block font-semibold">أحدث قراءة (Latest)</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-black font-mono text-slate-900">{latestPt?.displayValue}</span>
                <span className="text-xs font-bold text-slate-500">{activeSeries.unit}</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">{latestPt?.timeLabel}</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <span className="text-[10px] text-slate-500 block font-semibold">التغير عن السابق (Delta)</span>
              <div className="flex items-center gap-1 mt-0.5">
                {deltaVal > 0 ? (
                  <ArrowUpRight className="w-4 h-4 text-rose-600 shrink-0" />
                ) : deltaVal < 0 ? (
                  <ArrowDownRight className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : null}
                <span className={`text-base font-black font-mono ${deltaVal > 0 ? 'text-rose-600' : deltaVal < 0 ? 'text-emerald-600' : 'text-slate-700'}`}>
                  {deltaVal > 0 ? `+${deltaVal}` : deltaVal} {activeSeries.unit}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                {deltaPercent > 0 ? `+${deltaPercent}% ارتفاع` : `${deltaPercent}%`}
              </span>
            </div>

            <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200">
              <span className="text-[10px] text-emerald-800 block font-semibold">المعدل الطبيعي (Normal)</span>
              <div className="text-sm font-black font-mono text-emerald-950 mt-0.5">
                {activeSeries.normalRangeLow} - {activeSeries.normalRangeHigh}
              </div>
              <span className="text-[10px] text-emerald-700 block mt-0.5">{activeSeries.unit}</span>
            </div>

            <div className="bg-rose-50/70 p-3 rounded-2xl border border-rose-200">
              <span className="text-[10px] text-rose-800 block font-semibold">العتبة الحرجة (Critical)</span>
              <div className="text-sm font-black font-mono text-rose-950 mt-0.5">
                {activeSeries.criticalRangeHigh ? `> ${activeSeries.criticalRangeHigh}` : 'محددة بالسياسة'}
              </div>
              <span className="text-[10px] text-rose-700 block mt-0.5">تستلزم إبلاغ فوري STAT</span>
            </div>
          </div>

          {/* SVG Trend Chart */}
          <div className="bg-slate-900 rounded-2xl p-4 text-white">
            <div className="flex items-center justify-between mb-2 text-xs">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
                <span>{activeSeries.analyteName} ({activeSeries.analyteCode})</span>
              </span>
              <div className="flex items-center gap-3 text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2 bg-emerald-500/30 border border-emerald-400/50 rounded-xs" />
                  <span>النطاق الطبيعي</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>قيمة حرجة</span>
                </span>
              </div>
            </div>

            <div className="w-full overflow-x-auto">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-48 select-none">
                {/* Background Grid */}
                <line
                  x1={margin.left}
                  y1={margin.top}
                  x2={chartWidth - margin.right}
                  y2={margin.top}
                  stroke="#334155"
                  strokeDasharray="3 3"
                />
                <line
                  x1={margin.left}
                  y1={margin.top + innerHeight / 2}
                  x2={chartWidth - margin.right}
                  y2={margin.top + innerHeight / 2}
                  stroke="#334155"
                  strokeDasharray="3 3"
                />
                <line
                  x1={margin.left}
                  y1={margin.top + innerHeight}
                  x2={chartWidth - margin.right}
                  y2={margin.top + innerHeight}
                  stroke="#475569"
                />

                {/* Normal Reference Band */}
                <rect
                  x={margin.left}
                  y={normalYHigh}
                  width={innerWidth}
                  height={normalBandHeight}
                  fill="#10b981"
                  fillOpacity="0.15"
                />

                {/* Critical High Line if applicable */}
                {activeSeries.criticalRangeHigh && (
                  <line
                    x1={margin.left}
                    y1={getY(activeSeries.criticalRangeHigh)}
                    x2={chartWidth - margin.right}
                    y2={getY(activeSeries.criticalRangeHigh)}
                    stroke="#f43f5e"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                )}

                {/* Connecting Trend Line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="#2dd4bf"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data Points */}
                {activeSeries.points.map((pt, idx) => {
                  const cx = getX(idx, activeSeries.points.length);
                  const cy = getY(pt.value);
                  const isCrit = pt.flag === 'critical_high' || pt.flag === 'critical_low';

                  return (
                    <g key={idx} className="group cursor-pointer">
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isCrit ? 6 : 4.5}
                        fill={isCrit ? '#f43f5e' : '#2dd4bf'}
                        stroke="#0f172a"
                        strokeWidth="2"
                      />
                      {/* Value Label */}
                      <text
                        x={cx}
                        y={cy - 10}
                        textAnchor="middle"
                        fill={isCrit ? '#fda4af' : '#99f6e4'}
                        fontSize="11"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {pt.displayValue}
                      </text>
                      {/* Time Label */}
                      <text
                        x={cx}
                        y={margin.top + innerHeight + 18}
                        textAnchor="middle"
                        fill="#94a3b8"
                        fontSize="9"
                      >
                        {pt.timestamp.split(' ')[1] || pt.timeLabel}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Longitudinal Tabular Comparison */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 font-bold text-xs text-slate-800 flex items-center justify-between">
              <span>السجل الزمني الرقمي للعينات (Specimen Log & History)</span>
              <span className="text-[11px] text-slate-500 font-normal">عدد القراءات المسجلة: {activeSeries.points.length}</span>
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              {activeSeries.points.map((pt, idx) => {
                const isCrit = pt.flag === 'critical_high' || pt.flag === 'critical_low';
                return (
                  <div key={idx} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${isCrit ? 'bg-rose-500 animate-ping' : 'bg-teal-500'}`} />
                      <div>
                        <strong className="text-slate-900 block">{pt.timeLabel}</strong>
                        <span className="text-[10px] text-slate-400 font-mono">{pt.timestamp}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {pt.orderRef && (
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[10px] border border-blue-200">
                          {pt.orderRef}
                        </span>
                      )}
                      <div className="text-left font-mono">
                        <span className={`font-black text-sm ${isCrit ? 'text-rose-600 font-extrabold' : 'text-slate-900'}`}>
                          {pt.displayValue}
                        </span>
                        <span className="text-[10px] text-slate-500 mr-1">{activeSeries.unit}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isCrit
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : pt.flag === 'high'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isCrit ? 'حرج CRITICAL' : pt.flag === 'high' ? 'مرتفع HIGH' : 'طبيعي NORMAL'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            تم استخراج البيانات وفق معيار تمثيل النتائج التراكمية (Cumulative Lab Flowsheet)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-800 transition-colors cursor-pointer"
          >
            إغلاق النافذة
          </button>
        </div>
      </div>
    </div>
  );
};
