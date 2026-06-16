import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CarFront,
  Armchair,
  Footprints,
  Search,
  Backpack,
  GlassWater,
  Shirt,
  Package,
  CheckCircle2,
  Plus,
  Minus,
  AlertOctagon,
  Volume2,
  Check,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { mockClasses } from '@/data/mockData';
import { useSpeech } from '@/hooks/useSpeech';

import type { LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  CarFront,
  Armchair,
  Footprints,
  Search,
};

const itemConfig = [
  { key: 'hasBag', label: '书包', icon: Backpack, color: 'from-amber-400 to-amber-600' },
  { key: 'hasBottle', label: '水杯', icon: GlassWater, color: 'from-blue-400 to-blue-600' },
  { key: 'hasCoat', label: '外套', icon: Shirt, color: 'from-purple-400 to-purple-600' },
  { key: 'hasOther', label: '其他', icon: Package, color: 'from-gray-400 to-gray-600' },
] as const;

export default function Inspection() {
  const navigate = useNavigate();
  const { speak, speakRepeated, stop } = useSpeech();
  const {
    selectedClasses,
    inspectionAreas,
    currentAreaIndex,
    inspectionStatus,
    toggleClass,
    clearSelectedClasses,
    setCurrentAreaIndex,
    updateAreaEmptySeats,
    toggleAreaItem,
    setAreaOtherDesc,
    confirmArea,
    setInspectionStatus,
    resetInspection,
    setVehicleStatus,
  } = useAppStore();

  const [showWarning, setShowWarning] = useState(false);

  const currentArea = inspectionAreas[currentAreaIndex];
  const confirmedCount = inspectionAreas.filter((a) => a.confirmed).length;
  const totalAreas = inspectionAreas.length;
  const progressPercent = Math.round((confirmedCount / totalAreas) * 100);
  const allConfirmed = confirmedCount === totalAreas;

  useEffect(() => {
    if (inspectionStatus === 'selecting_class') return;
    const unconfirmed = inspectionAreas.filter((a) => !a.confirmed);
    if (unconfirmed.length > 0) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
      stop();
    }
  }, [inspectionAreas, inspectionStatus, stop]);

  useEffect(() => {
    if (showWarning && !allConfirmed && inspectionStatus !== 'selecting_class') {
      const cleanup = speakRepeated('请继续检查，还有区域未确认', 4000);
      return cleanup;
    }
  }, [showWarning, allConfirmed, inspectionStatus, speakRepeated]);

  const startInspection = () => {
    if (selectedClasses.length === 0) {
      speak('请先选择本趟应下车班级');
      return;
    }
    setInspectionStatus('inspecting');
    setShowWarning(true);
    speak(`开始检查，当前区域${currentArea.name}`);
  };

  const handleConfirmArea = () => {
    confirmArea(currentArea.id);
    const nextIdx = Math.min(currentAreaIndex + 1, totalAreas - 1);
    if (currentAreaIndex < totalAreas - 1) {
      speak(`${currentArea.name}已确认，请检查${inspectionAreas[nextIdx].name}`);
    } else {
      speak('所有区域检查完成');
      setInspectionStatus('completed');
      setVehicleStatus('inspection_done');
    }
  };

  const ClassSelectionView = () => (
    <div className="flex-1 flex flex-col">
      <div className="px-8 py-6">
        <h2 className="text-3xl font-black text-gray-800 mb-2">第一步：选择本趟应下车班级</h2>
        <p className="text-xl text-gray-500">请点击选择所有乘坐本趟校车的班级（可多选）</p>
      </div>
      <div className="flex-1 px-8 pb-8 overflow-auto">
        <div className="grid grid-cols-3 gap-6">
          {mockClasses.map((cls) => {
            const selected = selectedClasses.includes(cls.id);
            return (
              <button
                key={cls.id}
                onClick={() => toggleClass(cls.id)}
                className={`relative p-8 rounded-3xl border-4 transition-all duration-200 shadow-lg ${
                  selected
                    ? 'border-primary-500 bg-primary-50 scale-[1.02]'
                    : 'border-gray-200 bg-white hover:border-primary-300 hover:bg-primary-50/50'
                }`}
              >
                <div
                  className="w-24 h-24 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-md"
                  style={{ backgroundColor: cls.color }}
                >
                  <span className="text-4xl font-black text-white">
                    {cls.name.slice(0, 2)}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-800 text-center">{cls.name}</p>
                {selected && (
                  <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center shadow-lg">
                    <Check size={28} className="text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div className="px-8 py-6 bg-white border-t-2 border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <p className="text-xl font-bold text-gray-600">
              已选择 <span className="text-primary-600 text-3xl">{selectedClasses.length}</span> 个班级
            </p>
            {selectedClasses.length > 0 && (
              <button
                onClick={clearSelectedClasses}
                className="px-6 py-3 rounded-2xl bg-gray-100 text-gray-600 font-bold text-lg hover:bg-gray-200 transition-colors"
              >
                清空选择
              </button>
            )}
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/')}
              className="btn-secondary px-10"
            >
              <div className="flex items-center gap-2">
              <ArrowLeft size={24} />
              返回首页
            </div>
            </button>
            <button
              onClick={startInspection}
              disabled={selectedClasses.length === 0}
              className={`btn-primary px-12 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex items-center gap-2">
              开始检查
              <ArrowRight size={24} />
            </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const InspectionView = () => {
    const AreaIcon = iconMap[currentArea.icon] || Search;

    return (
      <div className="flex-1 flex flex-col">
        <div className="px-8 py-4 bg-white border-b-2 border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/')}
              className="btn-secondary px-6 py-3 text-lg"
            >
              <div className="flex items-center gap-2">
                <ArrowLeft size={24} />
                返回
              </div>
            </button>
            <div className="flex items-center gap-3">
              <Volume2 size={32} className="text-primary-500 animate-pulse" />
              <div className="text-2xl font-bold text-gray-700">
                进度：{confirmedCount}/{totalAreas}</div>
              <button
                onClick={resetInspection}
                className="px-6 py-3 rounded-2xl bg-gray-100 text-gray-600 font-bold text-lg hover:bg-gray-200"
              >
                  重新开始
                </button>
            </div>
          </div>
          <div className="w-full h-5 bg-gray-200 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-72 bg-slate-50 border-r-2 border-gray-100 p-6 overflow-auto">
            <h3 className="text-xl font-bold text-gray-700 mb-4">检查区域</h3>
            <div className="space-y-3">
              {inspectionAreas.map((area, idx) => {
                const Icon = iconMap[area.icon] || Search;
                const isActive = idx === currentAreaIndex;
                const isDone = area.confirmed;
                return (
                  <button
                    key={area.id}
                    onClick={() => setCurrentAreaIndex(idx)}
                    className={`w-full p-5 rounded-2xl flex items-center gap-4 transition-all ${
                      isActive
                        ? 'bg-primary-500 text-white shadow-lg scale-[1.02]'
                        : isDone
                        ? 'bg-success-100 text-success-700 border-2 border-success-300'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    isActive ? 'bg-white/20' : isDone ? 'bg-success-500' : 'bg-gray-100'
                  }`}>
                      {isDone && !isActive ? (
                        <CheckCircle2 size={32} className="text-white" />
                      ) : (
                        <Icon size={28} className={isActive ? 'text-white' : 'text-gray-500'} />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className={`text-xl font-bold ${isActive ? 'text-white' : ''}`}>{area.name}</p>
                      <p className={`text-sm ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
                        第{idx + 1}步
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 p-8 overflow-auto">
            <div className="max-w-3xl mx-auto">
              <div className="card-base mb-8">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-xl">
                    <AreaIcon size={64} className="text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-500 mb-1">
                      第 {currentAreaIndex + 1} / {totalAreas} 区域
                    </p>
                    <h2 className="text-5xl font-black text-gray-800">{currentArea.name}</h2>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-700 mb-4">请录入空座数量</h3>
                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => updateAreaEmptySeats(currentArea.id, Math.max(0, currentArea.emptySeats - 1))}
                      className="w-20 h-20 rounded-3xl bg-gradient-to-br from-gray-300 to-gray-500 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                    >
                      <Minus size={40} />
                    </button>
                    <div className="flex-1 text-center">
                      <span className="text-8xl font-black tabular-nums text-primary-600">{currentArea.emptySeats}</span>
                      <span className="text-2xl font-bold text-gray-500 ml-2">个空座</span>
                    </div>
                    <button
                      onClick={() => updateAreaEmptySeats(currentArea.id, currentArea.emptySeats + 1)}
                      className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                    >
                      <Plus size={40} />
                    </button>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-700 mb-4">是否有遗留物？</h3>
                  <div className="grid grid-cols-4 gap-4">
                    {itemConfig.map((item) => {
                      const selected = currentArea[item.key as keyof typeof currentArea] as boolean;
                      const ItemIcon = item.icon;
                      return (
                        <button
                          key={item.key}
                          onClick={() => toggleAreaItem(currentArea.id, item.key)}
                          className={`p-6 rounded-3xl border-4 transition-all ${
                            selected
                              ? `border-transparent bg-gradient-to-br ${item.color} text-white shadow-xl scale-[1.02]`
                              : 'border-gray-200 bg-white hover:border-gray-300 text-gray-600'
                          }`}
                        >
                          <ItemIcon size={48} className="mx-auto mb-2" />
                          <p className="text-xl font-bold">{item.label}</p>
                          {selected && (
                            <div className="mt-2 flex items-center justify-center gap-1">
                              <Check size={20} />
                              <span className="text-sm">已标记</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {currentArea.hasOther && (
                  <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-700 mb-3">其他遗留物描述</h3>
                  <input
                    type="text"
                    value={currentArea.otherDesc}
                    onChange={(e) => setAreaOtherDesc(currentArea.id, e.target.value)}
                    placeholder="请描述发现的其他物品..."
                    className="w-full px-6 py-4 text-xl rounded-2xl border-2 border-gray-200 focus:border-primary-400 outline-none focus:ring-4 focus:ring-primary-100"
                  />
                </div>
                )}

                <button
                  onClick={handleConfirmArea}
                  disabled={currentArea.confirmed}
                  className={`w-full btn-success text-2xl py-6 ${
                    currentArea.confirmed ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="flex items-center justify-center gap-3">
                    <CheckCircle2 size={32} />
                    {currentArea.confirmed ? '已确认' : '确认本区域检查完成'}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CompletedView = () => (
    <div className="flex-1 flex items-center justify-center">
      <div className="card-base text-center max-w-2xl p-12">
        <div className="w-40 h-40 mx-auto rounded-full bg-gradient-to-br from-success-400 to-success-600 flex items-center justify-center shadow-2xl mb-8">
          <CheckCircle2 size={100} className="text-white" />
        </div>
        <h2 className="text-5xl font-black text-gray-800 mb-4">离车检查完成！</h2>
        <p className="text-2xl text-gray-500 mb-8">所有区域已检查完毕，共确认 {totalAreas} 个区域</p>
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="p-6 bg-primary-50 rounded-3xl">
            <p className="text-lg text-gray-500 mb-2">空座总数</p>
            <p className="text-5xl font-black text-primary-600">
              {inspectionAreas.reduce((sum, a) => sum + a.emptySeats, 0)}
            </p>
          </div>
          <div className="p-6 bg-danger-50 rounded-3xl">
            <p className="text-lg text-gray-500 mb-2">发现遗留物</p>
            <p className="text-5xl font-black text-danger-600">
              {inspectionAreas.reduce((sum, a) => sum + (a.hasBag || a.hasBottle || a.hasCoat || a.hasOther ? 1 : 0), 0)}
            </p>
          </div>
        </div>
        <div className="flex gap-4 justify-center">
          <button onClick={() => navigate('/')} className="btn-secondary px-10">
            <div className="flex items-center gap-2">
              <ArrowLeft size={24} />
              返回首页
            </div>
          </button>
          <button onClick={() => navigate('/rollcall')} className="btn-primary px-10">
            <div className="flex items-center gap-2">
              前往儿童点名
              <ArrowRight size={24} />
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      {inspectionStatus === 'selecting_class' && <ClassSelectionView />}
      {inspectionStatus !== 'selecting_class' && inspectionStatus !== 'completed' && <InspectionView />}
      {inspectionStatus === 'completed' && <CompletedView />}

      {showWarning && !allConfirmed && inspectionStatus !== 'selecting_class' && inspectionStatus !== 'completed' && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-gradient-to-r from-danger-500 to-danger-700 text-white px-12 py-6 rounded-3xl shadow-2xl animate-flash">
          <div className="flex items-center gap-4">
            <AlertOctagon size={48} className="animate-bounce-slow" />
            <div>
              <p className="text-3xl font-black">请继续检查！</p>
              <p className="text-xl opacity-90">
                还有 {totalAreas - confirmedCount} 个区域未确认</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
