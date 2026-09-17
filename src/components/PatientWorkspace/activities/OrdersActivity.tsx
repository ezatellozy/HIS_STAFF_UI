import React, { useState } from 'react';
import {
  Layers,
  Pill,
  FlaskConical,
  Camera,
  Stethoscope,
  Send,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';
import { Patient } from '../../../types/his';
import {
  ClinicalOrderItem,
  ClinicalRequestItem,
  RequestFulfillmentStatus,
  RequestStatus
} from '../../../types/clinicalOrdersRequests';
import {
  INITIAL_CLINICAL_ORDERS,
  INITIAL_CLINICAL_REQUESTS
} from '../../../data/mockOrdersRequestsData';
import { OrdersListView } from '../orders/OrdersListView';
import { RequestsListView } from '../orders/RequestsListView';
import { MedicationOrderComposer } from '../orders/MedicationOrderComposer';
import { LabOrderComposer } from '../orders/LabOrderComposer';
import { ImagingOrderComposer } from '../orders/ImagingOrderComposer';
import { ProcedureOrderComposer } from '../orders/ProcedureOrderComposer';
import { ClinicalRequestComposer } from '../orders/ClinicalRequestComposer';
import { OrderSetReviewer } from '../orders/OrderSetReviewer';
import { OrderActionModal } from '../orders/OrderActionModal';
import { useHis } from '../../../context/HisContext';

interface OrdersActivityProps {
  patient: Patient;
}

type MainTab = 'orders' | 'requests' | 'order_sets';
type ActiveComposer = 'none' | 'medication' | 'lab' | 'imaging' | 'procedure' | 'request' | 'order_set';

export const OrdersActivity: React.FC<OrdersActivityProps> = ({ patient }) => {
  const { playChime } = useHis();

  // Primary State
  const [activeTab, setActiveTab] = useState<MainTab>('orders');
  const [orders, setOrders] = useState<ClinicalOrderItem[]>(INITIAL_CLINICAL_ORDERS);
  const [requests, setRequests] = useState<ClinicalRequestItem[]>(INITIAL_CLINICAL_REQUESTS);

  // Active Composer State
  const [activeComposer, setActiveComposer] = useState<ActiveComposer>('none');

  // Action Modal State for Orders
  const [actionModalConfig, setActionModalConfig] = useState<{
    order: ClinicalOrderItem;
    action: 'discontinue' | 'hold' | 'resume';
  } | null>(null);

  // Save new single order
  const handleSaveOrder = (newOrder: ClinicalOrderItem) => {
    setOrders(prev => [newOrder, ...prev]);
    setActiveComposer('none');
  };

  // Save batch orders from order set
  const handleApplyBatchOrders = (newOrders: ClinicalOrderItem[]) => {
    setOrders(prev => [...newOrders, ...prev]);
    setActiveComposer('none');
    setActiveTab('orders');
  };

  // Save new clinical request
  const handleSaveRequest = (newRequest: ClinicalRequestItem) => {
    setRequests(prev => [newRequest, ...prev]);
    setActiveComposer('none');
    setActiveTab('requests');
  };

  // Handle Order Action (Hold / Resume / Discontinue)
  const handleConfirmOrderAction = (
    orderId: string,
    action: 'discontinue' | 'hold' | 'resume',
    reason: string
  ) => {
    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          const newStatus = action === 'discontinue' ? 'discontinued' : action === 'hold' ? 'on_hold' : 'active';
          return {
            ...ord,
            status: newStatus,
            statusHistory: [
              {
                status: newStatus,
                timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
                changedBy: 'د. طارق المنشاوي',
                reason
              },
              ...ord.statusHistory
            ]
          };
        }
        return ord;
      })
    );
  };

  // Handle Request Fulfillment Update
  const handleUpdateFulfillment = (
    requestId: string,
    newFulfillment: RequestFulfillmentStatus,
    newRequestStatus?: RequestStatus
  ) => {
    setRequests(prev =>
      prev.map(req => {
        if (req.id === requestId) {
          return {
            ...req,
            fulfillmentStatus: newFulfillment,
            requestStatus: newRequestStatus || req.requestStatus,
            resultingNoteId: newFulfillment === 'completed' ? 'NOTE-2026-CONS-042' : req.resultingNoteId
          };
        }
        return req;
      })
    );
  };

  // Handle Cancel Request
  const handleCancelRequest = (requestId: string, reason: string) => {
    setRequests(prev =>
      prev.map(req => {
        if (req.id === requestId) {
          return {
            ...req,
            requestStatus: 'cancelled'
          };
        }
        return req;
      })
    );
    playChime('alert');
  };

  const activeOrdersCount = orders.filter(o => o.status === 'active').length;
  const activeRequestsCount = requests.filter(r => r.requestStatus === 'active').length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Tab Navigation Strip */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-slate-900">
                  منظومة الأوامر والطلبات السريرية (CPOE & Clinical Requests Workspace)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                  Axis 6 Baseline
                </span>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                <span>الأوامر النشطة: <strong className="text-teal-700">{activeOrdersCount}</strong></span>
                <span>•</span>
                <span>الطلبات والتحويلات: <strong className="text-purple-700">{activeRequestsCount}</strong></span>
                <span>•</span>
                <span>تكامل CDSS: <strong className="text-slate-800">مفعل (Allergies, eGFR, Contraindications)</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Launch Composer Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              onClick={() => setActiveComposer('medication')}
              className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold border border-teal-200 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Pill className="w-3.5 h-3.5" />
              <span>أمر دواء</span>
            </button>

            <button
              onClick={() => setActiveComposer('lab')}
              className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold border border-blue-200 transition-colors cursor-pointer flex items-center gap-1"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>تحليل مخبري</span>
            </button>

            <button
              onClick={() => setActiveComposer('imaging')}
              className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold border border-purple-200 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>تصوير أشعة</span>
            </button>

            <button
              onClick={() => setActiveComposer('procedure')}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>إجراء سريري</span>
            </button>

            <button
              onClick={() => setActiveComposer('request')}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5" />
              <span>طلب استشارة / خدمة</span>
            </button>

            <button
              onClick={() => setActiveComposer('order_set')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>حزم الأوامر (Bundles)</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-t border-slate-100 pt-3 text-xs">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>الأوامر السريرية الإلكترونية (CPOE Orders - {orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-xl font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'requests'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>الطلبات السريرية والتحويلات (Clinical Requests - {requests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('order_sets')}
            className={`px-4 py-2 rounded-xl font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'order_sets'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>حزم وبروتوكولات الرعاية (Order Sets & Bundles)</span>
          </button>
        </div>
      </div>

      {/* Active Dedicated Workspace Composer */}
      {activeComposer === 'medication' && (
        <div className="animate-in slide-in-from-top-4 duration-200">
          <MedicationOrderComposer
            patient={patient}
            onClose={() => setActiveComposer('none')}
            onSaveOrder={handleSaveOrder}
          />
        </div>
      )}

      {activeComposer === 'lab' && (
        <div className="animate-in slide-in-from-top-4 duration-200">
          <LabOrderComposer
            patient={patient}
            onClose={() => setActiveComposer('none')}
            onSaveOrder={handleSaveOrder}
          />
        </div>
      )}

      {activeComposer === 'imaging' && (
        <div className="animate-in slide-in-from-top-4 duration-200">
          <ImagingOrderComposer
            patient={patient}
            onClose={() => setActiveComposer('none')}
            onSaveOrder={handleSaveOrder}
          />
        </div>
      )}

      {activeComposer === 'procedure' && (
        <div className="animate-in slide-in-from-top-4 duration-200">
          <ProcedureOrderComposer
            patient={patient}
            onClose={() => setActiveComposer('none')}
            onSaveOrder={handleSaveOrder}
          />
        </div>
      )}

      {activeComposer === 'request' && (
        <div className="animate-in slide-in-from-top-4 duration-200">
          <ClinicalRequestComposer
            patient={patient}
            onClose={() => setActiveComposer('none')}
            onSaveRequest={handleSaveRequest}
          />
        </div>
      )}

      {activeComposer === 'order_set' && (
        <div className="animate-in slide-in-from-top-4 duration-200">
          <OrderSetReviewer
            patient={patient}
            onClose={() => setActiveComposer('none')}
            onApplyBatchOrders={handleApplyBatchOrders}
          />
        </div>
      )}

      {/* Content depending on Active Tab */}
      {activeTab === 'orders' && (
        <OrdersListView
          orders={orders}
          onOpenOrderAction={(order, action) => setActionModalConfig({ order, action })}
          onViewOrderDetails={order => {}}
        />
      )}

      {activeTab === 'requests' && (
        <RequestsListView
          requests={requests}
          onUpdateFulfillment={handleUpdateFulfillment}
          onCancelRequest={handleCancelRequest}
          onOpenNewRequest={() => setActiveComposer('request')}
        />
      )}

      {activeTab === 'order_sets' && (
        <OrderSetReviewer
          patient={patient}
          onClose={() => setActiveTab('orders')}
          onApplyBatchOrders={handleApplyBatchOrders}
        />
      )}

      {/* Order Action Modal (Hold / Resume / Discontinue) */}
      {actionModalConfig && (
        <OrderActionModal
          order={actionModalConfig.order}
          action={actionModalConfig.action}
          onClose={() => setActionModalConfig(null)}
          onConfirm={handleConfirmOrderAction}
        />
      )}
    </div>
  );
};
