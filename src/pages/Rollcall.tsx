import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  UserCheck,
  School,
  CalendarClock,
  Clock,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  User,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { mockChildren, mockClasses } from '@/data/mockData';
import type { HandoverStatus } from '@/types';
import type { LucideIcon } from 'lucide-react';

const statusConfig: Record<HandoverStatus, {
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: LucideIcon;
}> = {
  pending: {
    label: '待交接',
    color: 'text-gray-500',
    bg: 'bg-gray-100',
    border: 'border-gray-300',
    icon: Clock,
  },
  handed_over: {
    label: '已交家长',
    color: 'text-success-600',
    bg: 'bg-success-50',
    border: 'border-success-400',
    icon: UserCheck,
  },
  in_class: {
    label: '已进班',
    color: 'text-secondary-600',
    bg: 'bg-secondary-50',
    border: 'border-secondary-400',
    icon: School,
  },
  on_leave: {
    label: '临时请假',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-400',
    icon: CalendarClock,
  },
};

export default function Rollcall() {
  const navigate = useNavigate();
  const { rollcallRecords, setChildStatus, resetRollcall, selectedClasses } = useAppStore();
  const [activeClassId, setActiveClassId] = useState<string>('all');
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [pendingExpanded, setPendingExpanded] = useState(true);

  const stats = useMemo(() => {
    const total = rollcallRecords.length;
    const handedOver = rollcallRecords.filter((r) => r.status === 'handed_over').length;
    const inClass = rollcallRecords.filter((r) => r.status === 'in_class').length;
    const onLeave = rollcallRecords.filter((r) => r.status === 'on_leave').length;
    const pending = rollcallRecords.filter((r) => r.status === 'pending').length;
    const completed = total - pending;
    return { total, handedOver, inClass, onLeave, pending, completed, percent: Math.round((completed / total) * 100) };
  }, [rollcallRecords]);

  const pendingChildren = useMemo(() => {
    return mockChildren.filter((c) => {
      const record = rollcallRecords.find((r) => r.childId === c.id);
      const matchesClass = activeClassId === 'all' || c.classId === activeClassId;
      return record?.status === 'pending' && matchesClass;
    });
  }, [rollcallRecords, activeClassId]);

  const filteredChildren = useMemo(() => {
    if (activeClassId === 'all') return mockChildren;
    return mockChildren.filter((c) => c.classId === activeClassId);
  }, [activeClassId]);

  const handleSelectStatus = (childId: string, status: HandoverStatus) => {
    setChildStatus(childId, status);
    setSelectedChild(null);
  };

  const selectedChildData = selectedChild ? mockChildren.find((c) => c.id === selectedChild) : null;
  const selectedRecord = selectedChild ? rollcallRecords.find((r) => r.childId === selectedChild) : null;

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="px-8 py-5 bg-gradient-to-r from-secondary-500 to-secondary-700 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors backdrop-blur-sm"
            >
              <ArrowLeft size={28} />
            </button>
            <div>
              <h1 className="text-3xl font-black">儿童点名核对</h1>
              <p className="text-lg opacity-90 mt-1">快速标记儿童交接状态</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-4xl font-black tabular-nums">{stats.completed}/{stats.total}</p>
                <p className="text-sm opacity-80">已完成</p>
              </div>
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-2xl font-bold">{stats.percent}%</span>
              </div>
            </div>
            <button
              onClick={resetRollcall}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/20 hover:bg-white/30 transition-colors font-bold text-lg"
            >
              <RefreshCw size={24} />
              重置
            </button>
          </div>
        </div>
      </div>

      {pendingChildren.length > 0 && (
        <div className="px-8 py-4 bg-gradient-to-r from-danger-50 to-amber-50 border-b-2 border-danger-200">
          <button
            onClick={() => setPendingExpanded(!pendingExpanded)}
            className="w-full flex items-center justify-between mb-2"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-danger-500 text-white flex items-center justify-center animate-pulse">
                <AlertCircle size={28} />
              </div>
              <div className="text-left">
                <h3 className="text-2xl font-black text-danger-700">
                  尚未完成交接（{pendingChildren.length}人）
                </h3>
                <p className="text-lg text-danger-600">点击{pendingExpanded ? '收起' : '展开'}查看全部名单</p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-danger-100 flex items-center justify-center">
              {pendingExpanded ? <ChevronUp size={24} className="text-danger-600" /> : <ChevronDown size={24} className="text-danger-600" />}
            </div>
          </button>
          {pendingExpanded && (
            <div className="flex gap-4 overflow-x-auto scrollbar-thin pb-2">
              {pendingChildren.map((child) => {
                const cls = mockClasses.find((c) => c.id === child.classId);
                return (
                  <button
                    key={child.id}
                    onClick={() => setSelectedChild(child.id)}
                    className="flex-shrink-0 p-4 rounded-3xl bg-white border-2 border-danger-300 hover:border-danger-500 hover:shadow-lg transition-all shadow"
                  >
                    <div className="relative">
                      <img
                        src={child.avatar}
                        alt={child.name}
                        className="w-20 h-20 rounded-full border-4 border-danger-200 bg-gray-100"
                      />
                      <div
                        className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full text-white text-xs font-bold flex items-center justify-center shadow"
                        style={{ backgroundColor: cls?.color || '#888' }}
                      >
                        {cls?.name.slice(0, 2) || ''}
                      </div>
                    </div>
                    <p className="text-xl font-bold text-center mt-2 text-gray-800">{child.name}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="px-8 py-4 bg-white border-b-2 border-gray-100">
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-thin pb-1">
          <button
            onClick={() => setActiveClassId('all')}
            className={`flex-shrink-0 px-8 py-3 rounded-2xl font-bold text-xl transition-all ${
              activeClassId === 'all'
                ? 'bg-secondary-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            全部班级
          </button>
          {mockClasses.map((cls) => {
            const classChildren = mockChildren.filter((c) => c.classId === cls.id);
            const classPending = classChildren.filter(
              (c) => rollcallRecords.find((r) => r.childId === c.id)?.status === 'pending'
            ).length;
            return (
              <button
                key={cls.id}
                onClick={() => setActiveClassId(cls.id)}
                className={`flex-shrink-0 px-8 py-3 rounded-2xl font-bold text-xl transition-all flex items-center gap-2 ${
                  activeClassId === cls.id
                    ? 'text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                style={activeClassId === cls.id ? { backgroundColor: cls.color } : {}}
              >
                <span
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: cls.color }}
                />
                {cls.name}
                <span className={`text-sm ${activeClassId === cls.id ? 'text-white/80' : 'text-gray-400'}`}>
                  ({classPending > 0 ? `待${classPending}/` : ''}{classChildren.length})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 px-8 py-6 overflow-auto">
        <div className="grid grid-cols-5 gap-6">
          {filteredChildren.map((child) => {
            const record = rollcallRecords.find((r) => r.childId === child.id);
            const status = record?.status || 'pending';
            const cfg = statusConfig[status];
            const cls = mockClasses.find((c) => c.id === child.classId);
            const StatusIcon = cfg.icon;
            const isSelected = selectedChild === child.id;

            return (
              <button
                key={child.id}
                onClick={() => setSelectedChild(child.id)}
                className={`card-base p-6 text-left transition-all hover:scale-[1.02] border-4 ${
                  status === 'pending'
                    ? 'border-transparent'
                    : cfg.border
                } ${
                  isSelected ? 'ring-4 ring-primary-400 scale-[1.02]' : ''
                } ${cfg.bg}`}
              >
                <div className="relative mb-4">
                  <img
                    src={child.avatar}
                    alt={child.name}
                    className={`w-full aspect-square rounded-3xl bg-gray-100 object-cover ${
                      status !== 'pending' ? 'ring-4' : ''
                    }`}
                    style={status !== 'pending' ? { boxShadow: `inset 0 0 0 4px ${cls?.color || '#888'}` } : {}}
                  />
                  <div
                    className={`absolute -top-2 -right-2 w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                      status === 'pending' ? 'bg-gray-400' : ''
                    }`}
                    style={status !== 'pending' ? { backgroundColor: cls?.color || '#888' } : {}}
                  >
                    {status === 'pending' ? (
                      <Clock size={24} className="text-white" />
                    ) : (
                      <StatusIcon size={24} className="text-white" />
                    )}
                  </div>
                </div>
                <h3 className="text-2xl font-black text-gray-800 mb-1">{child.name}</h3>
                <div className="flex items-center justify-between">
                  <span
                    className="px-3 py-1 rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: cls?.color || '#888' }}
                  >
                    {cls?.name}
                  </span>
                  <span className={`text-lg font-bold ${cfg.color}`}>
                    {cfg.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-8 py-5 bg-white border-t-2 border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex gap-6">
            {[
              { key: 'handed_over', count: stats.handedOver },
              { key: 'in_class', count: stats.inClass },
              { key: 'on_leave', count: stats.onLeave },
              { key: 'pending', count: stats.pending },
            ].map(({ key, count }) => {
              const cfg = statusConfig[key as HandoverStatus];
              const StatusIcon = cfg.icon;
              return (
                <div key={key} className="flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center`}>
                    <StatusIcon size={20} className={cfg.color} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{cfg.label}</p>
                    <p className={`text-2xl font-black tabular-nums ${cfg.color}`}>{count}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <button
            onClick={() => navigate('/review')}
            className="btn-primary px-10"
          >
            <div className="flex items-center gap-2">
              前往园门口复核
              <ArrowRight size={24} />
            </div>
          </button>
        </div>
      </div>

      {selectedChildData && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50" onClick={() => setSelectedChild(null)}>
          <div
            className="w-full max-w-4xl bg-white rounded-t-[32px] shadow-2xl p-8 animate-bounce-slow"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'slideUp 0.3s ease-out' }}
          >
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-6">
                <img
                  src={selectedChildData.avatar}
                  alt={selectedChildData.name}
                  className="w-28 h-28 rounded-3xl bg-gray-100 shadow-lg"
                />
                <div>
                  <h2 className="text-4xl font-black text-gray-800">{selectedChildData.name}</h2>
                  <p className="text-xl text-gray-500 mt-1">
                    {mockClasses.find((c) => c.id === selectedChildData.classId)?.name}
                  </p>
                  <p className="text-lg text-gray-400 mt-2">
                    当前状态：<span className={`font-bold ${statusConfig[selectedRecord?.status || 'pending'].color}`}>
                      {statusConfig[selectedRecord?.status || 'pending'].label}
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedChild(null)}
                className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X size={28} className="text-gray-600" />
              </button>
            </div>

            <h3 className="text-2xl font-bold text-gray-700 mb-4">请选择交接状态：</h3>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { key: 'handed_over', label: '已交给家长', icon: UserCheck, gradient: 'from-success-400 to-success-600' },
                { key: 'in_class', label: '已进班', icon: School, gradient: 'from-secondary-400 to-secondary-600' },
                { key: 'on_leave', label: '临时请假', icon: CalendarClock, gradient: 'from-amber-400 to-amber-600' },
              ].map(({ key, label, icon: Icon, gradient }) => (
                <button
                  key={key}
                  onClick={() => handleSelectStatus(selectedChildData.id, key as HandoverStatus)}
                  className={`p-8 rounded-3xl bg-gradient-to-br ${gradient} text-white shadow-lg hover:scale-[1.02] active:scale-95 transition-all`}
                >
                  <Icon size={56} className="mx-auto mb-3" />
                  <p className="text-2xl font-black">{label}</p>
                </button>
              ))}
            </div>

            <div className="flex gap-4 justify-end">
              <button
                onClick={() => handleSelectStatus(selectedChildData.id, 'pending')}
                className="px-10 py-4 rounded-2xl bg-gray-100 text-gray-600 font-bold text-xl hover:bg-gray-200 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <User size={24} />
                  设为待交接
                </div>
              </button>
              <button
                onClick={() => setSelectedChild(null)}
                className="px-10 py-4 rounded-2xl bg-gray-100 text-gray-600 font-bold text-xl hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {stats.pending === 0 && (
        <div className="fixed top-6 right-6 bg-gradient-to-r from-success-500 to-success-700 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce-slow">
          <CheckCircle2 size={36} />
          <div>
            <p className="text-xl font-black">全部儿童已完成交接！</p>
            <p className="text-sm opacity-90">可前往园门口进行复核</p>
          </div>
        </div>
      )}
    </div>
  );
}
