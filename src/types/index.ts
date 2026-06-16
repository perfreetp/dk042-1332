export interface ClassInfo {
  id: string;
  name: string;
  color: string;
}

export interface Child {
  id: string;
  name: string;
  avatar: string;
  classId: string;
}

export interface InspectionArea {
  id: string;
  name: string;
  icon: string;
  emptySeats: number;
  hasBag: boolean;
  hasBottle: boolean;
  hasCoat: boolean;
  hasOther: boolean;
  otherDesc: string;
  confirmed: boolean;
}

export type HandoverStatus = 'pending' | 'handed_over' | 'in_class' | 'on_leave';

export interface RollcallRecord {
  childId: string;
  status: HandoverStatus;
  updateTime: Date;
}

export type InspectionStatus = 'idle' | 'selecting_class' | 'inspecting' | 'warning' | 'completed';

export type VehicleStatus = 'driving' | 'stopped' | 'inspection_done' | 'all_done';

export interface AppState {
  vehicleStatus: VehicleStatus;
  currentTime: Date;
  selectedClasses: string[];
  inspectionAreas: InspectionArea[];
  inspectionStatus: InspectionStatus;
  currentAreaIndex: number;
  rollcallRecords: RollcallRecord[];
  reviewerName: string;
  signatureData: string | null;
  reviewCompleted: boolean;
  reviewTime: Date | null;
}

export interface AppActions {
  setVehicleStatus: (status: VehicleStatus) => void;
  updateTime: () => void;
  toggleClass: (classId: string) => void;
  clearSelectedClasses: () => void;
  setCurrentAreaIndex: (index: number) => void;
  updateAreaEmptySeats: (areaId: string, count: number) => void;
  toggleAreaItem: (areaId: string, item: 'hasBag' | 'hasBottle' | 'hasCoat' | 'hasOther') => void;
  setAreaOtherDesc: (areaId: string, desc: string) => void;
  confirmArea: (areaId: string) => void;
  setInspectionStatus: (status: InspectionStatus) => void;
  resetInspection: () => void;
  setChildStatus: (childId: string, status: HandoverStatus) => void;
  resetRollcall: () => void;
  setReviewerName: (name: string) => void;
  setSignatureData: (data: string | null) => void;
  completeReview: () => void;
  resetAll: () => void;
}
