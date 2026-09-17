import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  ExternalLink,
  Printer,
  HelpCircle,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  FlaskConical
} from 'lucide-react';
import { IncomingLabOrder, LabOrderPriority, LabSection } from '../../types/laboratoryOps';

interface IncomingOrdersViewProps {
  orders: IncomingLabOrder[];
  onPreviewOrder: (order: IncomingLabOrder) => void;
  onDeepLinkAxis6: (patientId: string) => void;
  onInitiateCollection: (orderId: string) => void;
  onRequestClarification: (orderId: string, note: string) => void;
}

export const IncomingOrdersView: React.FC<IncomingOrdersViewProps> = ({
  orders,
  onPreviewOrder,
  onDeepLinkAxis6,
  onInitiateCollection,
  onRequestClarification
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sectionFilter, setSectionFilter] = useState<string>('all');
  const [clarifyingOrderId, setClarifyingOrderId] = useState<string | null>(null);
  const [clarificationText, setClarificationText] = useState('');

  const filteredOrders = orders.filter(o => {
    const matchesSearch =
      o.patientName.includes(searchTerm) ||
      o.mrn.includes(searchTerm) ||
      o.orderNumber.includes(searchTerm) ||
      o.clinicalIndication.includes(searchTerm);

    const matchesPriority = priorityFilter === 'all' || o.priority === priorityFilter;
    const matchesSection = sectionFilter === 'all' || o.targetSection === sectionFilter;

    return matchesSearch && matchesPriority && matchesSection;
  });

  const handleClarifySubmit = (orderId: string) => {
    if (!clarificationText) return;
    onRequestClarification(orderId, clarificationText);
    setClarifyingOrderId(null);
    setClarificationText('');
  };

  return (
    <div className="space-y-4 text-right font-['Cairo',sans-serif]">
      {/* Top Description & Invariant */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            <h2 className="text-base font-black text-slate-900">
              سجل واستقبال الطلبات السريرية المخبرية (Clinical Order Intake)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            رؤية الطلبات الواردة من الطوارئ والعيادات والتنويم • <strong>محدد الحوكمة:</strong> المختبر لا يعدل طلب الطبيب اعتباطياً، بل يطلب استيضاحاً أو يوثق متطلبات السحب.
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="بحث بالمريض أو الـ MRN أو رقم الطلب..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs w-56 text-right focus:ring-2 focus:ring-teal-500"
          />

          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
          >
            <option value="all">كافة الأولويات</option>
            <option value="stat">STAT (طارئ فوري)</option>
            <option value="urgent">Urgent (مستعجل)</option>
            <option value="routine">Routine (روتيني)</option>
          </select>

          <select
            value={sectionFilter}
            onChange={e => setSectionFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
          >
            <option value="all">كافة الأقسام المخبرية</option>
            <option value="chemistry">الكيمياء السريرية</option>
            <option value="hematology">أمراض الدم</option>
            <option value="microbiology">الأحياء الدقيقة</option>
            <option value="pathology">علم الأمراض</option>
            <option value="send_out">المختبرات المرجعية</option>
          </select>
        </div>
      </div>

      {/* Orders List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-xs text-right">
          <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
            <tr>
              <th className="p-3">رقم الطلب والمريض</th>
              <th className="p-3">القسم الطالب والطبيب</th>
              <th className="p-3">الأولوية</th>
              <th className="p-3">الباقات والفحوصات المطلوبة</th>
              <th className="p-3">متطلبات سحب العينات</th>
              <th className="p-3">الحالة</th>
              <th className="p-3 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400">
                  لا توجد طلبات مخبرية مطابقة لمعايير البحث
                </td>
              </tr>
            ) : (
              filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3">
                    <div className="font-bold text-slate-900 text-sm">{order.patientName}</div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-0.5">
                      <span>{order.mrn}</span>
                      <span>•</span>
                      <span className="text-teal-700">{order.orderNumber}</span>
                    </div>
                    {order.bedLocation && (
                      <span className="text-[10px] text-slate-400 block mt-0.5">الموقع: {order.bedLocation}</span>
                    )}
                  </td>

                  <td className="p-3">
                    <div className="font-bold text-slate-800">{order.orderingDoctor}</div>
                    <div className="text-[11px] text-slate-500">{order.orderingService}</div>
                    <div className="text-[10px] text-slate-400">{order.orderDateTime}</div>
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-2.5 py-1 rounded-lg font-bold text-[10px] inline-block ${
                        order.priority === 'stat'
                          ? 'bg-red-100 text-red-800 border border-red-200 animate-pulse'
                          : order.priority === 'urgent'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {order.priority.toUpperCase()}
                    </span>
                  </td>

                  <td className="p-3 max-w-xs">
                    <div className="space-y-1">
                      {order.testPanelsRequested.map((panel, idx) => (
                        <div key={idx} className="font-bold text-slate-800 text-xs flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block" />
                          <span>{panel}</span>
                        </div>
                      ))}
                      <p className="text-[11px] text-slate-500 line-clamp-1 italic mt-1">
                        الداعي السريري: {order.clinicalIndication}
                      </p>
                    </div>
                  </td>

                  <td className="p-3 text-[11px] text-slate-600 max-w-xs">
                    <span className="bg-slate-100 p-1.5 rounded-lg block border border-slate-200/60 leading-relaxed">
                      {order.collectionRequirements}
                    </span>
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        order.status === 'in_process'
                          ? 'bg-blue-100 text-blue-800'
                          : order.status === 'collection_pending'
                          ? 'bg-amber-100 text-amber-800'
                          : order.status === 'clarification_required'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {order.status}
                    </span>
                    {order.clarificationNote && (
                      <span className="text-[10px] text-purple-700 block mt-1 font-bold">
                        استيضاح: {order.clarificationNote}
                      </span>
                    )}
                  </td>

                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onPreviewOrder(order)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                        title="معاينة تفاصيل الطلب"
                      >
                        <FileText className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDeepLinkAxis6(order.patientId)}
                        className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 cursor-pointer border border-blue-200"
                        title="فتح طلب الطبيب الأصلي في المحور 6 (Axis 6)"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onInitiateCollection(order.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                      >
                        <FlaskConical className="w-3.5 h-3.5" />
                        <span>بدء السحب</span>
                      </button>

                      <button
                        onClick={() => setClarifyingOrderId(order.id)}
                        className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 cursor-pointer border border-amber-200"
                        title="طلب استيضاح سريري من الطبيب المعالج"
                      >
                        <HelpCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Clarification Modal Dialog if active */}
      {clarifyingOrderId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-5 space-y-4 text-right">
            <h3 className="text-sm font-black text-slate-900">طلب استيضاح سريري من الطبيب المعالج</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              وفقاً لقواعد الحوكمة، لا يمكن للمختبر إلغاء أو تعديل نوع الفحص دون توثيق الاستيضاح من الطبيب الطالب.
            </p>
            <textarea
              rows={3}
              value={clarificationText}
              onChange={e => setClarificationText(e.target.value)}
              placeholder="اكتب استفسار المختبر الفني (مثال: هل المريض يتناول دواء يؤثر على الفحص، أو طلب تصحيح الباقة؟)..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setClarifyingOrderId(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleClarifySubmit(clarifyingOrderId)}
                disabled={!clarificationText}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold disabled:opacity-50 cursor-pointer"
              >
                إرسال الاستيضاح وتحديث حالة الطلب
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
