import { useMemo, useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import {
  ArrowLeft,
  ClipboardCheck,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Eraser,
  Home,
  RefreshCw,
  FileCheck,
  Clock,
  User,
  X,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { mockClasses, mockChildren } from '@/data/mockData';

export default function Review() {
  const navigate = useNavigate();
  const sigCanvasRef = useRef<SignatureCanvas>(null);
  const [reviewerName, setReviewerNameInput] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const {
    inspectionAreas,
    rollcallRecords,
    selectedClasses,
    signatureData,
    reviewCompleted,
    reviewTime,
    currentTime,
    setSignatureData,
    setReviewerName: storeSetReviewerName,
    completeReview,
    resetAll,
  } = useAppStore();

  useEffect(() => {
    if (signatureData && sigCanvasRef.current) {
      sigCanvasRef.current.fromDataURL(signatureData);
    }
  }, [signatureData]);

  const inspectionStats = useMemo(() => {
    const confirmed = inspectionAreas.filter((a) => a.confirmed).length;
    const total = inspectionAreas.length;
    const hasLeftover = inspectionAreas.some(
      (a) => a.hasBag || a.hasBottle || a.hasCoat || a.hasOther
    );
    const leftoverCount = inspectionAreas.reduce(
      (sum, a) => sum + (a.hasBag || a.hasBottle || a.hasCoat || a.hasOther ? 1 : 0),
      0
    );
    return { confirmed, total, percent: Math.round((confirmed / total) * 100), hasLeftover, leftoverCount };
  }, [inspectionAreas]);

  const rollcallStats = useMemo(() => {
    const completed = rollcallRecords.filter((r) => r.status !== 'pending').length;
    const pending = rollcallRecords.filter((r) => r.status === 'pending').length;
    const total = rollcallRecords.length;
    const handedOver = rollcallRecords.filter((r) => r.status === 'handed_over').length;
    const inClass = rollcallRecords.filter((r) => r.status === 'in_class').length;
    const onLeave = rollcallRecords.filter((r) => r.status === 'on_leave').length;
    return { completed, pending, total, percent: Math.round((completed / total) * 100), handedOver, inClass, onLeave };
  }, [rollcallRecords]);

  const overallPercent = Math.round((inspectionStats.percent + rollcallStats.percent) / 2);
  const canReview = inspectionStats.confirmed === inspectionStats.total;
  const hasSignature = signatureData && signatureData.length > 0;
  const canComplete = canReview && hasSignature && reviewerName.trim().length > 0;

  const handleClearSignature = () => {
    if (sigCanvasRef.current) {
      sigCanvasRef.current.clear();
      setSignatureData(null);
    }
  };

  const handleEndSignature = () => {
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      const dataUrl = sigCanvasRef.current.toDataURL('image/png');
      setSignatureData(dataUrl);
    }
  };

  const handleConfirmRelease = () => {
    storeSetReviewerName(reviewerName);
    completeReview();
    setShowConfirmDialog(false);
  };

  const selectedClassNames = selectedClasses
    .map((id) => mockClasses.find((c) => c.id === id)?.name)
    .filter(Boolean);

  const pendingChildren = mockChildren.filter(
    (c) => rollcallRecords.find((r) => r.childId === c.id)?.status === 'pending'
  );

  const unconfirmedAreas = inspectionAreas.filter((a) => !a.confirmed);

  const timeStr = currentTime.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (reviewCompleted) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-success-50 to-primary-50">
        <div className="card-base max-w-2xl w-full p-12 text-center">
          <div className="w-40 h-40 mx-auto rounded-full bg-gradient-to-br from-success-400 to-success-600 flex items-center justify-center shadow-2xl mb-8">
            <ShieldCheck size={100} className="text-white" />
          </div>
          <h1 className="text-5xl font-black text-gray-800 mb-4">已放行通过！</h1>
          <p className="text-2xl text-gray-500 mb-10">本车已完成清车检查并签名确认</p>

          <div className="grid grid-cols-2 gap-6 mb-10">
            <div className="p-6 bg-white rounded-3xl shadow-inner">
              <p className="text-lg text-gray-500 mb-2 flex items-center gap-2">
                <User size={20} />
                复核人
              </p>
              <p className="text-3xl font-black text-gray-800">
                {reviewerName || '保安/园长'}
              </p>
            </div>
            <div className="p-6 bg-white rounded-3xl shadow-inner">
              <p className="text-lg text-gray-500 mb-2 flex items-center gap-2">
                <Clock size={20} />
                放行时间
              </p>
              <p className="text-3xl font-black text-gray-800 tabular-nums">
                {reviewTime?.toLocaleString('zh-CN') || currentTime.toLocaleString('zh-CN')}
              </p>
            </div>
          </div>

          {signatureData && (
            <div className="p-6 bg-gray-50 rounded-3xl mb-10">
              <p className="text-lg text-gray-500 mb-4">签名确认</p>
              <img src={signatureData} alt="签名" className="mx-auto h-32" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/')}
              className="btn-secondary"
            >
              <div className="flex items-center justify-center gap-2">
                <Home size={24} />
                返回首页
              </div>
            </button>
            <button
              onClick={() => {
                resetAll();
                setReviewerNameInput('');
                handleClearSignature();
              }}
              className="btn-primary"
            >
              <div className="flex items-center justify-center gap-2">
                <RefreshCw size={24} />
                开启新一轮检查
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="px-8 py-5 bg-gradient-to-r from-success-500 to-success-700 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors backdrop-blur-sm"
            >
              <ArrowLeft size={28} />
            </button>
            <div>
              <h1 className="text-3xl font-black">园门口复核</h1>
              <p className="text-lg opacity-90 mt-1">保安/值班园长审核签名放行</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/20 px-6 py-3 rounded-2xl">
            <Clock size={28} />
            <span className="text-3xl font-black tabular-nums">{timeStr}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-3 gap-8 mb-8">
            <div className="card-base text-center">
              <div className="relative w-40 h-40 mx-auto mb-4">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" stroke="#E5E7EB" strokeWidth="8" fill="none" />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="url(#inspectionGradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${(inspectionStats.percent / 100) * 264} 264`}
                  />
                  <defs>
                    <linearGradient id="inspectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FF8C33" />
                      <stop offset="100%" stopColor="#FF6B35" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-5xl font-black text-primary-600">{inspectionStats.percent}%</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1 flex items-center justify-center gap-2">
                <ClipboardCheck size={28} className="text-primary-500" />
                离车检查
              </h3>
              <p className="text-lg text-gray-500">
                已确认 {inspectionStats.confirmed}/{inspectionStats.total} 区域
              </p>
              {inspectionStats.confirmed === inspectionStats.total && (
                <div className="mt-3 flex items-center justify-center gap-2 text-success-600 text-xl font-bold">
                  <CheckCircle2 size={24} />
                  已完成
                </div>
              )}
            </div>

            <div className="card-base text-center">
              <div className="relative w-40 h-40 mx-auto mb-4">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" stroke="#E5E7EB" strokeWidth="8" fill="none" />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="url(#rollcallGradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${(rollcallStats.percent / 100) * 264} 264`}
                  />
                  <defs>
                    <linearGradient id="rollcallGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#365A8E" />
                      <stop offset="100%" stopColor="#1E3A5F" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-5xl font-black text-secondary-600">{rollcallStats.percent}%</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1 flex items-center justify-center gap-2">
                <Users size={28} className="text-secondary-500" />
                儿童点名
              </h3>
              <p className="text-lg text-gray-500">
                已完成 {rollcallStats.completed}/{rollcallStats.total} 人
              </p>
              {rollcallStats.pending === 0 && (
                <div className="mt-3 flex items-center justify-center gap-2 text-success-600 text-xl font-bold">
                  <CheckCircle2 size={24} />
                  全部交接
                </div>
              )}
            </div>

            <div className={`card-base text-center ${overallPercent === 100 ? 'ring-4 ring-success-300 bg-success-50' : ''}`}>
              <div className="relative w-40 h-40 mx-auto mb-4">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" stroke="#E5E7EB" strokeWidth="8" fill="none" />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="url(#overallGradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${(overallPercent / 100) * 264} 264`}
                  />
                  <defs>
                    <linearGradient id="overallGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1AC476" />
                      <stop offset="100%" stopColor="#00A862" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-5xl font-black text-success-600">{overallPercent}%</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1 flex items-center justify-center gap-2">
                <ShieldCheck size={28} className="text-success-500" />
                整体完成度
              </h3>
              <p className="text-lg text-gray-500">
                {selectedClassNames.length > 0 ? selectedClassNames.join('、') : '请选择班级'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="card-base">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <ClipboardCheck size={28} className="text-primary-500" />
                离车检查详情
              </h3>

              {unconfirmedAreas.length > 0 && (
                <div className="mb-4 p-4 bg-danger-50 border-l-4 border-danger-500 rounded-2xl">
                  <div className="flex items-center gap-2 text-danger-700 font-bold text-lg">
                    <AlertTriangle size={24} />
                    以下区域尚未检查确认：
                  </div>
                  <p className="mt-2 text-danger-600">
                    {unconfirmedAreas.map((a) => a.name).join('、')}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {inspectionAreas.map((area) => (
                  <div
                    key={area.id}
                    className={`p-4 rounded-2xl border-2 flex items-center justify-between ${
                      area.confirmed
                        ? 'bg-success-50 border-success-300'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {area.confirmed ? (
                        <div className="w-10 h-10 rounded-xl bg-success-500 text-white flex items-center justify-center">
                          <CheckCircle2 size={24} />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-gray-300 text-white flex items-center justify-center">
                          <Clock size={20} />
                        </div>
                      )}
                      <div>
                        <p className="text-xl font-bold text-gray-800">{area.name}</p>
                        <p className="text-sm text-gray-500">
                          空座 {area.emptySeats} 个
                          {area.hasBag && ' · 书包'}
                          {area.hasBottle && ' · 水杯'}
                          {area.hasCoat && ' · 外套'}
                          {area.hasOther && ` · ${area.otherDesc || '其他物品'}`}
                        </p>
                      </div>
                    </div>
                    <span className={`text-lg font-bold ${area.confirmed ? 'text-success-600' : 'text-gray-400'}`}>
                      {area.confirmed ? '已确认' : '待检查'}
                    </span>
                  </div>
                ))}
              </div>

              {inspectionStats.leftoverCount > 0 && (
                <div className="mt-4 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-2xl">
                  <p className="text-amber-700 font-bold text-lg">
                    ⚠️ 发现 {inspectionStats.leftoverCount} 处遗留物品，请确认已妥善处理
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-8">
              <div className="card-base">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Users size={28} className="text-secondary-500" />
                  儿童交接情况
                </h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="p-4 bg-success-50 rounded-2xl text-center">
                    <p className="text-sm text-gray-500 mb-1">已交家长</p>
                    <p className="text-3xl font-black text-success-600">{rollcallStats.handedOver}</p>
                  </div>
                  <div className="p-4 bg-secondary-50 rounded-2xl text-center">
                    <p className="text-sm text-gray-500 mb-1">已进班</p>
                    <p className="text-3xl font-black text-secondary-600">{rollcallStats.inClass}</p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-2xl text-center">
                    <p className="text-sm text-gray-500 mb-1">临时请假</p>
                    <p className="text-3xl font-black text-amber-600">{rollcallStats.onLeave}</p>
                  </div>
                </div>

                {pendingChildren.length > 0 && (
                  <div className="p-4 bg-danger-50 rounded-2xl border-2 border-danger-200">
                    <p className="text-danger-700 font-bold text-lg mb-2 flex items-center gap-2">
                      <AlertTriangle size={22} />
                      还有 {pendingChildren.length} 名儿童未完成交接：
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {pendingChildren.map((c) => (
                        <span
                          key={c.id}
                          className="px-3 py-1 bg-white rounded-full text-danger-600 font-bold"
                        >
                          {c.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="card-base">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FileCheck size={28} className="text-success-500" />
                  复核人签名
                </h3>

                <div className="mb-4">
                  <label className="text-lg font-bold text-gray-700 mb-2 block">复核人姓名</label>
                  <input
                    type="text"
                    value={reviewerName}
                    onChange={(e) => setReviewerNameInput(e.target.value)}
                    placeholder="请输入保安或值班园长姓名"
                    className="w-full px-6 py-4 text-xl rounded-2xl border-2 border-gray-200 focus:border-success-400 outline-none focus:ring-4 focus:ring-success-100"
                  />
                </div>

                <div className="mb-4">
                  <label className="text-lg font-bold text-gray-700 mb-2 block">手写签名</label>
                  <div className="relative bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 overflow-hidden">
                    <SignatureCanvas
                      ref={sigCanvasRef}
                      penColor="#1E3A5F"
                      onEnd={handleEndSignature}
                      canvasProps={{
                        className: 'w-full',
                        style: { height: '180px', width: '100%', touchAction: 'none' },
                      }}
                    />
                    {(!signatureData || signatureData.length === 0) && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <p className="text-2xl text-gray-400 font-medium">请在此区域手写签名</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={handleClearSignature}
                      className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gray-100 text-gray-600 font-bold text-lg hover:bg-gray-200 transition-colors"
                    >
                      <Eraser size={22} />
                      清除签名
                    </button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => navigate('/')}
                    className="flex-1 btn-secondary"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <ArrowLeft size={22} />
                      返回
                    </div>
                  </button>
                  <button
                    onClick={() => canComplete && setShowConfirmDialog(true)}
                    disabled={!canComplete}
                    className={`flex-1 btn-success disabled:opacity-50 disabled:cursor-not-allowed ${
                      !canComplete ? 'cursor-not-allowed' : ''
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <ShieldCheck size={24} />
                      确认放行
                    </div>
                  </button>
                </div>

                {!canReview && (
                  <p className="mt-4 text-center text-danger-600 font-bold">
                    ⚠️ 请先完成全部离车检查区域
                  </p>
                )}
                {canReview && (!hasSignature || !reviewerName.trim()) && (
                  <p className="mt-4 text-center text-amber-600 font-bold">
                    ⚠️ 请填写复核人姓名并手写签名
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-10 max-w-lg w-full mx-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-success-400 to-success-600 flex items-center justify-center mb-6 shadow-xl">
                <ShieldCheck size={56} className="text-white" />
              </div>
              <h2 className="text-4xl font-black text-gray-800 mb-3">确认放行本车？</h2>
              <p className="text-xl text-gray-500">确认后将完成本次安全检查闭环</p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 mb-8 space-y-3">
              <div className="flex justify-between">
                <span className="text-lg text-gray-500">离车检查</span>
                <span className="text-lg font-bold text-success-600">{inspectionStats.confirmed}/{inspectionStats.total} 区域已确认</span>
              </div>
              <div className="flex justify-between">
                <span className="text-lg text-gray-500">儿童交接</span>
                <span className="text-lg font-bold text-success-600">{rollcallStats.completed}/{rollcallStats.total} 人已完成</span>
              </div>
              <div className="flex justify-between">
                <span className="text-lg text-gray-500">复核人</span>
                <span className="text-lg font-bold text-gray-800">{reviewerName}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 btn-secondary"
              >
                <div className="flex items-center justify-center gap-2">
                  <X size={22} />
                  取消
                </div>
              </button>
              <button
                onClick={handleConfirmRelease}
                className="flex-1 btn-success"
              >
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle2 size={24} />
                  确认放行
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
