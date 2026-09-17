import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  Activity,
  Plus,
  ArrowRight,
  Filter,
  Check
} from 'lucide-react';
import {
  ModalityDeviceRoom,
  IncomingImagingRequest,
  ImagingAppointment,
  ImagingModality,
  SchedulingWorkflowType
} from '../../types/radiologyOps';

interface ImagingSchedulingWorkspaceProps {
  rooms: ModalityDeviceRoom[];
  unscheduledRequests: IncomingImagingRequest[];
  onConfirmSchedule: (requestId: string, roomId: string, date: string, time: string, duration: number) => void;
  onSelectModality: (modality: ImagingModality) => void;
}

export const ImagingSchedulingWorkspace: React.FC<ImagingSchedulingWorkspaceProps> = ({
  rooms,
  unscheduledRequests,
  onConfirmSchedule,
  onSelectModality
}) => {
  const [selectedRoomId, setSelectedRoomId] = useState<string>(rooms[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-13');
  const [selectedRequest, setSelectedRequest] = useState<IncomingImagingRequest | null>(null);
  const [scheduledSuccessMsg, setScheduledSuccessMsg] = useState<string | null>(null);

  const selectedRoom = rooms.find(r => r.id === selectedRoomId) || rooms[0];

  // Mock available time slots for the room
  const mockSlots = [
    { time: '08:30', status: 'booked', patientName: 'سعيد العتيبي', exam: 'CT Head' },
    { time: '09:00', status: 'booked', patientName: 'منى عبد الله', exam: 'CT Chest' },
    { time: '09:30', status: 'available' },
    { time: '10:00', status: 'available' },
    { time: '10:30', status: 'booked', patientName: 'سارة إبراهيم', exam: 'CT Abdomen' },
    { time: '11:00', status: 'available' },
    { time: '11:30', status: 'available' },
    { time: '12:00', status: 'maintenance', note: 'تعقيم روتيني للموداليتي' },
    { time: '12:30', status: 'available' },
    { time: '13:00', status: 'booked', patientName: 'طارق كامل', exam: 'CT Pelvis' },
    { time: '13:30', status: 'available' },
    { time: '14:00', status: 'available' },
    { time: '14:30', status: 'available' },
    { time: '15:00', status: 'available' }
  ];

  const handleBookSlot = (time: string) => {
    if (!selectedRequest) return;
    onConfirmSchedule(selectedRequest.id, selectedRoom.id, selectedDate, time, 30);
    setScheduledSuccessMsg(`تم حجز الموعد بنجاح للمريض (${selectedRequest.patientName}) في ${selectedRoom.code} الساعة ${time}`);
    setSelectedRequest(null);
    setTimeout(() => setScheduledSuccessMsg(null), 5000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Notification Banner */}
      {scheduledSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{scheduledSuccessMsg}</span>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 4 cols: Unscheduled Requests Queue */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                طلبات غير مجدولة (Unscheduled Queue)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                اختر مريضاً لتسكينه في جدول المواعيد
              </p>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-100 text-amber-800">
              {unscheduledRequests.length} بانتظار الحجز
            </span>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {unscheduledRequests.length === 0 ? (
              <div className="text-xs text-slate-400 text-center py-8">
                لا توجد طلبات غير مجدولة في الوقت الحالي.
              </div>
            ) : (
              unscheduledRequests.map(req => {
                const isSelected = selectedRequest?.id === req.id;
                return (
                  <div
                    key={req.id}
                    onClick={() => setSelectedRequest(req)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50/50 shadow-xs ring-1 ring-teal-500'
                        : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">
                        {req.patientName}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500">
                        {req.mrn}
                      </span>
                    </div>

                    <div className="text-xs text-teal-800 font-medium line-clamp-1">
                      {req.examNameAr}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                      <span className="font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100">
                        {req.modality}
                      </span>
                      <span className="text-slate-600">{req.originLocation.split('-')[0]}</span>
                      <span className={`font-bold ${req.priority === 'stat' ? 'text-rose-600' : 'text-slate-500'}`}>
                        {req.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 8 cols: Room Schedule & Slot Grid */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
          {/* Room Selector & Date Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-700">غرفة الفحص:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {rooms.map(room => (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoomId(room.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedRoomId === room.id
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {room.code}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-mono text-slate-700 bg-slate-50"
              />
            </div>
          </div>

          {/* Active Room Metadata Strip */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
            <div>
              <span className="font-bold text-slate-900">{selectedRoom.nameAr}</span>
              <span className="text-slate-500 mr-2 font-mono text-[11px]">({selectedRoom.location})</span>
            </div>
            <div className="text-[11px] text-slate-600">
              مدة الفحص الافتراضية: <strong className="font-mono text-slate-900">30 دقيقة</strong> • النوع:{' '}
              <span className="font-bold text-teal-700">{selectedRoom.modality}</span>
            </div>
          </div>

          {/* Selected Request Booking Helper Strip */}
          {selectedRequest ? (
            <div className="bg-teal-50 border border-teal-300 p-3.5 rounded-xl text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="font-bold text-teal-950 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-teal-600" />
                  <span>المريض المحدد للتسكين: {selectedRequest.patientName}</span>
                </div>
                <div className="text-teal-800 text-[11px]">
                  الفحص: {selectedRequest.examNameAr} • الأولوية: {selectedRequest.priority.toUpperCase()}
                </div>
              </div>
              <div className="text-teal-900 font-bold text-[11px] bg-white px-2.5 py-1 rounded-lg border border-teal-200">
                اختر خانة وقت متاحة أدناه للحجز
              </div>
            </div>
          ) : (
            <div className="bg-amber-50/70 border border-amber-200 p-3 rounded-xl text-xs text-amber-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>قم باختيار طلب من القائمة الجانبية (يمين) أولاً ليتم تسكينه في الخانات المتاحة.</span>
            </div>
          )}

          {/* Slots Grid */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 mb-2">
              جدول خانات الفحص ليوم {selectedDate}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {mockSlots.map((slot, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-xs transition-all ${
                    slot.status === 'available'
                      ? 'border-emerald-200 bg-emerald-50/30 hover:bg-emerald-50 hover:border-emerald-400'
                      : slot.status === 'booked'
                      ? 'border-slate-200 bg-slate-50 text-slate-600'
                      : 'border-purple-200 bg-purple-50/40 text-purple-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono font-bold text-slate-900">{slot.time}</span>
                    </div>
                    {slot.status === 'available' && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        متاح
                      </span>
                    )}
                    {slot.status === 'booked' && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                        محجوز
                      </span>
                    )}
                    {slot.status === 'maintenance' && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                        صيانة
                      </span>
                    )}
                  </div>

                  {slot.status === 'available' && (
                    <button
                      disabled={!selectedRequest}
                      onClick={() => handleBookSlot(slot.time)}
                      className={`w-full py-1.5 rounded-lg font-bold text-[11px] transition-all flex items-center justify-center gap-1 ${
                        selectedRequest
                          ? 'bg-teal-600 hover:bg-teal-700 text-white cursor-pointer shadow-2xs'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>تسكين في هذه الخانة</span>
                    </button>
                  )}

                  {slot.status === 'booked' && (
                    <div className="space-y-0.5 text-[11px]">
                      <div className="font-semibold text-slate-800 truncate">{slot.patientName}</div>
                      <div className="text-[10px] text-slate-500 truncate">{slot.exam}</div>
                    </div>
                  )}

                  {slot.status === 'maintenance' && (
                    <div className="text-[10px] text-purple-700 font-medium">
                      {slot.note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
