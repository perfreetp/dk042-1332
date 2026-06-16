import { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardCheck,
  Users,
  ShieldCheck,
  Car,
  AlertTriangle,
  CheckCircle2,
  CircleDot,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export default function Home() {
  const navigate = useNavigate();
  const {
    vehicleStatus,
    currentTime,
    inspectionAreas,
    rollcallRecords,
    reviewCompleted,
    inspectionStatus,
    updateTime,
  } = useAppStore();

  const hasAutoNavigated = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => updateTime(), 1000);
    return () => clearInterval(timer);
  }, [updateTime]);

  useEffect(() => {
    if (vehicleStatus === 'stopped' && inspectionStatus === 'selecting_class' && !reviewCompleted && !hasAutoNavigated.current) {
      hasAutoNavigated.current = true;
      const timer = setTimeout(() => navigate('/inspection', { replace: true }), 300);
      return () => clearTimeout(timer);
    }
  }, [vehicleStatus, inspectionStatus, reviewCompleted, navigate]);

  const inspectionProgress = useMemo(() => {
    const confirmed = inspectionAreas.filter((a) => a.confirmed).length;
    return { confirmed, total: inspectionAreas.length, percent: Math.round((confirmed / inspectionAreas.length) * 100) };
  }, [inspectionAreas]);

  const rollcallProgress = useMemo(() => {
    const done = rollcallRecords.filter((r) => r.status !== 'pending').length;
    return { done, total: rollcallRecords.length, percent: Math.round((done / rollcallRecords.length) * 100) };
  }, [rollcallRecords]);

  const statusConfig = {
    driving: { label: '行驶中', color: 'bg-blue-500', icon: Car, text: '车辆行驶中' },
    stopped: { label: '熄火待检', color: 'bg-primary-500', icon: AlertTriangle, text: '车辆已熄火，请开始检查' },
    inspection_done: { label: '检查完成', color: 'bg-secondary-500', icon: CheckCircle2, text: '离车检查已完成' },
    all_done: { label: '全部完成', color: 'bg-success-500', icon: ShieldCheck, text: '已完成安全检查并放行' },
  };

  const status = statusConfig[vehicleStatus];
  const StatusIcon = status.icon;

  const timeStr = currentTime.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const dateStr = currentTime.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      <div className={`${status.color} text-white px-8 py-5 shadow-lg`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <StatusIcon size={40} />
            </div>
            <div>
              <div className="text-2xl font-bold flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full bg-white animate-pulse" />
                {status.label}
              </div>
              <div className="text-lg opacity-90 mt-1">{status.text}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-5xl font-black tracking-wider tabular-nums">
              {timeStr}
            </div>
            <div className="text-lg opacity-90 mt-1">{dateStr}</div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-black text-secondary-600 mb-8 flex items-center gap-3">
            <ShieldCheck size={48} className="text-primary-500" />
            校车儿童安全巡检系统
          </h1>

          <div className="grid grid-cols-3 gap-8 mb-10">
            <button
              onClick={() => navigate('/inspection')}
              className={`card-base group hover:scale-[1.02] transition-all duration-300 text-left border-4 ${
                vehicleStatus === 'stopped' && !reviewCompleted
                  ? 'border-primary-400 ring-2 ring-primary-200'
                  : 'border-transparent hover:border-primary-300'
              }`}
            >
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center mb-6 shadow-lg group-hover:shadow-primary-300/50 transition-shadow relative">
                <ClipboardCheck size={48} className="text-white" />
                {vehicleStatus === 'stopped' && !reviewCompleted && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-danger-500 animate-pulse" />
                )}
              </div>
              <h2 className="text-3xl font-black text-gray-800 mb-2">离车检查</h2>
              <p className="text-lg text-gray-500 mb-4">按区域巡检空座和遗留物</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-500"
                    style={{ width: `${inspectionProgress.percent}%` }}
                  />
                </div>
                <span className="text-xl font-bold text-primary-600">
                  {inspectionProgress.confirmed}/{inspectionProgress.total}
                </span>
              </div>
              {inspectionProgress.percent === 100 ? (
                <div className="mt-4 flex items-center gap-2 text-success-600 text-lg font-bold">
                  <CheckCircle2 size={24} />
                  检查完成
                </div>
              ) : inspectionStatus === 'inspecting' ? (
                <div className="mt-4 flex items-center gap-2 text-primary-600 text-lg font-bold">
                  <ArrowRight size={20} className="animate-pulse" />
                  正在检查中 · {inspectionAreas.find((a) => !a.confirmed)?.name || ''}
                </div>
              ) : vehicleStatus === 'stopped' && !reviewCompleted ? (
                <div className="mt-4 flex items-center gap-2 text-danger-600 text-lg font-bold animate-pulse">
                  <AlertTriangle size={20} />
                  等待开始检查
                </div>
              ) : null}
            </button>

            <button
              onClick={() => navigate('/rollcall')}
              className={`card-base group hover:scale-[1.02] transition-all duration-300 text-left border-4 ${
                inspectionProgress.percent === 100 && rollcallProgress.percent < 100
                  ? 'border-secondary-400 ring-2 ring-secondary-200'
                  : 'border-transparent hover:border-secondary-300'
              }`}
            >
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-secondary-400 to-secondary-600 flex items-center justify-center mb-6 shadow-lg group-hover:shadow-secondary-300/50 transition-shadow relative">
                <Users size={48} className="text-white" />
                {inspectionProgress.percent === 100 && rollcallProgress.percent < 100 && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-danger-500 animate-pulse" />
                )}
              </div>
              <h2 className="text-3xl font-black text-gray-800 mb-2">儿童点名</h2>
              <p className="text-lg text-gray-500 mb-4">核对儿童交接状态</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-secondary-400 to-secondary-600 rounded-full transition-all duration-500"
                    style={{ width: `${rollcallProgress.percent}%` }}
                  />
                </div>
                <span className="text-xl font-bold text-secondary-600">
                  {rollcallProgress.done}/{rollcallProgress.total}
                </span>
              </div>
              {rollcallProgress.percent === 100 ? (
                <div className="mt-4 flex items-center gap-2 text-success-600 text-lg font-bold">
                  <CheckCircle2 size={24} />
                  全部交接完成
                </div>
              ) : inspectionProgress.percent === 100 && rollcallProgress.percent < 100 ? (
                <div className="mt-4 flex items-center gap-2 text-secondary-600 text-lg font-bold">
                  <ArrowRight size={20} className="animate-pulse" />
                  待交接 {rollcallProgress.total - rollcallProgress.done} 人
                </div>
              ) : null}
            </button>

            <button
              onClick={() => navigate('/review')}
              className={`card-base group hover:scale-[1.02] transition-all duration-300 text-left border-4 border-transparent hover:border-success-300 ${
                reviewCompleted ? 'ring-4 ring-success-300 bg-success-50' : ''
              }`}
            >
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-success-400 to-success-600 flex items-center justify-center mb-6 shadow-lg group-hover:shadow-success-300/50 transition-shadow">
                <ShieldCheck size={48} className="text-white" />
              </div>
              <h2 className="text-3xl font-black text-gray-800 mb-2">园门口复核</h2>
              <p className="text-lg text-gray-500 mb-4">保安/园长签名放行</p>
              <div className="flex items-center gap-2">
                {reviewCompleted ? (
                  <div className="flex items-center gap-2 text-success-600 text-xl font-bold">
                    <CheckCircle2 size={28} />
                    已放行
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-400 text-lg font-medium">
                    <CircleDot size={24} />
                    等待复核
                  </div>
                )}
              </div>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="card-base">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Clock size={28} className="text-primary-500" />
                操作流程指引
              </h3>
              <div className="space-y-4">
                {[
                  { step: 1, text: '车辆熄火后，点击【离车检查】选择班级' },
                  { step: 2, text: '按屏幕提示从车头走到车尾，依次检查每个区域' },
                  { step: 3, text: '录入空座数量，确认是否有书包、水杯等遗留物' },
                  { step: 4, text: '完成离车检查后，进入【儿童点名】核对交接' },
                  { step: 5, text: '到达园门口后，保安/园长【复核签名】放行' },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white font-bold text-xl flex items-center justify-center flex-shrink-0 shadow">
                      {item.step}
                    </div>
                    <p className="text-xl text-gray-700 leading-relaxed pt-1">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-base bg-gradient-to-br from-secondary-50 to-primary-50">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <AlertTriangle size={28} className="text-danger-500" />
                安全提示
              </h3>
              <div className="space-y-3">
                <div className="p-4 bg-white rounded-2xl border-l-4 border-danger-500">
                  <p className="text-lg font-bold text-danger-700">⚠️ 重点检查区域</p>
                  <p className="text-base text-gray-600 mt-1">后排座椅、过道、座椅缝隙是儿童滞留高发区，请务必仔细检查！</p>
                </div>
                <div className="p-4 bg-white rounded-2xl border-l-4 border-primary-500">
                  <p className="text-lg font-bold text-primary-700">🔔 语音提示</p>
                  <p className="text-base text-gray-600 mt-1">未完成检查时系统会持续语音提醒，请保持平板音量开启。</p>
                </div>
                <div className="p-4 bg-white rounded-2xl border-l-4 border-secondary-500">
                  <p className="text-lg font-bold text-secondary-700">📝 全程记录</p>
                  <p className="text-base text-gray-600 mt-1">所有操作均自动记录，形成完整安全闭环。</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
