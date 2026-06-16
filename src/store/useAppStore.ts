import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, AppActions, HandoverStatus, VehicleStatus, AreaInspectionRecord, HistoryRecord } from '@/types';
import { mockInspectionAreas, mockChildren, createDefaultTrip, generateTripId, mockClasses } from '@/data/mockData';

const initialRollcallRecords = mockChildren.map((child) => ({
  childId: child.id,
  status: 'pending' as HandoverStatus,
  updateTime: new Date(),
}));

export const useAppStore = create<AppState & AppActions>()(
  persist(
    (set) => ({
      vehicleStatus: 'stopped',
      currentTime: new Date(),
      selectedClasses: [],
      inspectionAreas: JSON.parse(JSON.stringify(mockInspectionAreas)),
      inspectionStatus: 'selecting_class',
      currentAreaIndex: 0,
      rollcallRecords: JSON.parse(JSON.stringify(initialRollcallRecords)),
      areaInspectionRecords: [],
      reviewerName: '',
      signatureData: null,
      reviewCompleted: false,
      reviewTime: null,
      currentTrip: createDefaultTrip(),
      historyRecords: [],

      setVehicleStatus: (status: VehicleStatus) => set({ vehicleStatus: status }),
      updateTime: () => set({ currentTime: new Date() }),

      toggleClass: (classId: string) =>
        set((state) => ({
          selectedClasses: state.selectedClasses.includes(classId)
            ? state.selectedClasses.filter((id) => id !== classId)
            : [...state.selectedClasses, classId],
        })),

      clearSelectedClasses: () => set({ selectedClasses: [] }),

      setCurrentAreaIndex: (index: number) => set({ currentAreaIndex: index }),

      updateAreaEmptySeats: (areaId: string, count: number) =>
        set((state) => ({
          inspectionAreas: state.inspectionAreas.map((area) =>
            area.id === areaId ? { ...area, emptySeats: count } : area
          ),
        })),

      toggleAreaItem: (areaId: string, item: 'hasBag' | 'hasBottle' | 'hasCoat' | 'hasOther') =>
        set((state) => ({
          inspectionAreas: state.inspectionAreas.map((area) =>
            area.id === areaId ? { ...area, [item]: !area[item] } : area
          ),
        })),

      setAreaOtherDesc: (areaId: string, desc: string) =>
        set((state) => ({
          inspectionAreas: state.inspectionAreas.map((area) =>
            area.id === areaId ? { ...area, otherDesc: desc } : area
          ),
        })),

      confirmArea: (areaId: string) =>
        set((state) => {
          const area = state.inspectionAreas.find((a) => a.id === areaId);
          if (!area) return state;
          const record: AreaInspectionRecord = {
            areaId: area.id,
            areaName: area.name,
            emptySeats: area.emptySeats,
            hasBag: area.hasBag,
            hasBottle: area.hasBottle,
            hasCoat: area.hasCoat,
            hasOther: area.hasOther,
            otherDesc: area.otherDesc,
            confirmTime: new Date(),
          };
          const updatedRecords = state.areaInspectionRecords.filter((r) => r.areaId !== areaId);
          updatedRecords.push(record);
          const updatedAreas = state.inspectionAreas.map((a) =>
            a.id === areaId ? { ...a, confirmed: true } : a
          );
          const allConfirmed = updatedAreas.every((a) => a.confirmed);
          const currentIdx = updatedAreas.findIndex((a) => a.id === areaId);
          return {
            inspectionAreas: updatedAreas,
            areaInspectionRecords: updatedRecords,
            currentAreaIndex: allConfirmed ? state.currentAreaIndex : Math.min(currentIdx + 1, updatedAreas.length - 1),
            inspectionStatus: allConfirmed ? 'completed' : 'inspecting',
          };
        }),

      setInspectionStatus: (status) => set({ inspectionStatus: status }),

      resetInspection: () =>
        set({
          inspectionAreas: JSON.parse(JSON.stringify(mockInspectionAreas)),
          inspectionStatus: 'selecting_class',
          currentAreaIndex: 0,
          selectedClasses: [],
          areaInspectionRecords: [],
        }),

      setChildStatus: (childId: string, status: HandoverStatus) =>
        set((state) => ({
          rollcallRecords: state.rollcallRecords.map((record) =>
            record.childId === childId
              ? { ...record, status, updateTime: new Date() }
              : record
          ),
        })),

      resetRollcall: () =>
        set({
          rollcallRecords: JSON.parse(JSON.stringify(initialRollcallRecords)),
        }),

      setReviewerName: (name: string) => set({ reviewerName: name }),
      setSignatureData: (data: string | null) => set({ signatureData: data }),

      completeReview: () =>
        set((state) => {
          const pendingChildren = mockChildren.filter((c) => {
            const record = state.rollcallRecords.find((r) => r.childId === c.id);
            return record && record.status === 'pending';
          });
          const unresolvedDetails = pendingChildren.length > 0
            ? pendingChildren
                .slice(0, 5)
                .map((c) => {
                  const cls = mockClasses.find((mc) => mc.id === c.classId);
                  return `${cls?.name || ''}·${c.name}`;
                })
                .join('、') + (pendingChildren.length > 5 ? ` 等${pendingChildren.length}人` : '')
            : '';
          const history: HistoryRecord = {
            tripId: state.currentTrip.tripId,
            tripInfo: state.currentTrip,
            selectedClasses: state.selectedClasses,
            inspectionRecords: JSON.parse(JSON.stringify(state.areaInspectionRecords)),
            rollcallRecords: JSON.parse(JSON.stringify(state.rollcallRecords)),
            reviewerName: state.reviewerName,
            signatureData: state.signatureData,
            reviewTime: new Date(),
            unresolvedCount: pendingChildren.length,
            unresolvedDetails,
          };
          const newHistory = [history, ...state.historyRecords].slice(0, 20);
          return {
            reviewCompleted: true,
            reviewTime: new Date(),
            vehicleStatus: 'all_done',
            historyRecords: newHistory,
          };
        }),

      resetAll: () =>
        set((state) => ({
          vehicleStatus: 'stopped',
          selectedClasses: [],
          inspectionAreas: JSON.parse(JSON.stringify(mockInspectionAreas)),
          inspectionStatus: 'selecting_class',
          currentAreaIndex: 0,
          rollcallRecords: JSON.parse(JSON.stringify(initialRollcallRecords)),
          areaInspectionRecords: [],
          reviewerName: '',
          signatureData: null,
          reviewCompleted: false,
          reviewTime: null,
          currentTrip: {
            ...createDefaultTrip(),
            tripId: generateTripId(),
            startTime: new Date(),
          },
        })),
    }),
    {
      name: 'bus-inspection-storage',
      partialize: (state) => ({
        vehicleStatus: state.vehicleStatus,
        selectedClasses: state.selectedClasses,
        inspectionAreas: state.inspectionAreas,
        inspectionStatus: state.inspectionStatus,
        currentAreaIndex: state.currentAreaIndex,
        rollcallRecords: state.rollcallRecords,
        areaInspectionRecords: state.areaInspectionRecords,
        reviewerName: state.reviewerName,
        signatureData: state.signatureData,
        reviewCompleted: state.reviewCompleted,
        reviewTime: state.reviewTime,
        currentTrip: state.currentTrip,
        historyRecords: state.historyRecords,
      }),
    }
  )
);
