import { create } from 'zustand';
import type { AppState, AppActions, HandoverStatus, VehicleStatus } from '@/types';
import { mockInspectionAreas, mockChildren } from '@/data/mockData';

const initialRollcallRecords = mockChildren.map((child) => ({
  childId: child.id,
  status: 'pending' as HandoverStatus,
  updateTime: new Date(),
}));

export const useAppStore = create<AppState & AppActions>((set) => ({
  vehicleStatus: 'stopped',
  currentTime: new Date(),
  selectedClasses: [],
  inspectionAreas: JSON.parse(JSON.stringify(mockInspectionAreas)),
  inspectionStatus: 'selecting_class',
  currentAreaIndex: 0,
  rollcallRecords: JSON.parse(JSON.stringify(initialRollcallRecords)),
  reviewerName: '',
  signatureData: null,
  reviewCompleted: false,
  reviewTime: null,

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
      const updatedAreas = state.inspectionAreas.map((area) =>
        area.id === areaId ? { ...area, confirmed: true } : area
      );
      const allConfirmed = updatedAreas.every((a) => a.confirmed);
      const currentIdx = updatedAreas.findIndex((a) => a.id === areaId);
      return {
        inspectionAreas: updatedAreas,
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
    set({
      reviewCompleted: true,
      reviewTime: new Date(),
      vehicleStatus: 'all_done',
    }),

  resetAll: () =>
    set({
      vehicleStatus: 'stopped',
      selectedClasses: [],
      inspectionAreas: JSON.parse(JSON.stringify(mockInspectionAreas)),
      inspectionStatus: 'selecting_class',
      currentAreaIndex: 0,
      rollcallRecords: JSON.parse(JSON.stringify(initialRollcallRecords)),
      reviewerName: '',
      signatureData: null,
      reviewCompleted: false,
      reviewTime: null,
    }),
}));
