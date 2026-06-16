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

export interface AreaInspectionRecord {
  areaId: string;
  areaName: string;
  emptySeats: number;
  hasBag: boolean;
  hasBottle: boolean;
  hasCoat: boolean;
  hasOther: boolean;
  otherDesc: string;
  confirmTime: Date;
}

export type HandoverStatus = 'pending' | 'handed_over' | 'in_class' | 'on_leave';

export interface RollcallRecord {
  childId: string;
  status: HandoverStatus;
  updateTime: Date;
}

export type InspectionStatus = 'idle' | 'selecting_class' | 'inspecting' | 'warning' | 'completed';

export type VehicleStatus = 'driving' | 'stopped' | 'inspection_done' | 'all_done';

export interface TripInfo {
  tripId: string;
  plateNumber: string;
  routeName: string;
  driverName: string;
  escortName: string;
  startTime: Date;
}

export interface HistoryRecord {
  tripId: string;
  tripInfo: TripInfo;
  selectedClasses: string[];
  inspectionRecords: AreaInspectionRecord[];
  rollcallRecords: RollcallRecord[];
  reviewerName: string;
  signatureData: string | null;
  reviewTime: Date;
  unresolvedCount: number;
  unresolvedDetails: string;
}

export interface AppState {
  vehicleStatus: VehicleStatus;
  currentTime: Date;
  selectedClasses: string[];
  inspectionAreas: InspectionArea[];
  inspectionStatus: InspectionStatus;
  currentAreaIndex: number;
  rollcallRecords: RollcallRecord[];
  areaInspectionRecords: AreaInspectionRecord[];
  reviewerName: string;
  signatureData: string | null;
  reviewCompleted: boolean;
  reviewTime: Date | null;
  currentTrip: TripInfo;
  historyRecords: HistoryRecord[];
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
