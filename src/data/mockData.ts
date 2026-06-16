import type { ClassInfo, Child, InspectionArea } from '@/types';

export const mockClasses: ClassInfo[] = [
  { id: 'c1', name: '小班一班', color: '#FF6B6B' },
  { id: 'c2', name: '小班二班', color: '#4ECDC4' },
  { id: 'c3', name: '中班一班', color: '#45B7D1' },
  { id: 'c4', name: '中班二班', color: '#96CEB4' },
  { id: 'c5', name: '大班一班', color: '#FFEAA7' },
  { id: 'c6', name: '大班二班', color: '#DDA0DD' },
];

export const mockInspectionAreas: InspectionArea[] = [
  { id: 'a1', name: '车头区域', icon: 'CarFront', emptySeats: 0, hasBag: false, hasBottle: false, hasCoat: false, hasOther: false, otherDesc: '', confirmed: false },
  { id: 'a2', name: '前排座椅', icon: 'Armchair', emptySeats: 0, hasBag: false, hasBottle: false, hasCoat: false, hasOther: false, otherDesc: '', confirmed: false },
  { id: 'a3', name: '中排座椅', icon: 'Armchair', emptySeats: 0, hasBag: false, hasBottle: false, hasCoat: false, hasOther: false, otherDesc: '', confirmed: false },
  { id: 'a4', name: '后排座椅', icon: 'Armchair', emptySeats: 0, hasBag: false, hasBottle: false, hasCoat: false, hasOther: false, otherDesc: '', confirmed: false },
  { id: 'a5', name: '过道区域', icon: 'Footprints', emptySeats: 0, hasBag: false, hasBottle: false, hasCoat: false, hasOther: false, otherDesc: '', confirmed: false },
  { id: 'a6', name: '座椅缝隙', icon: 'Search', emptySeats: 0, hasBag: false, hasBottle: false, hasCoat: false, hasOther: false, otherDesc: '', confirmed: false },
];

const childNames = [
  '小明', '小红', '小华', '小丽', '小强', '小芳',
  '小军', '小燕', '小龙', '小凤', '小虎', '小英',
  '小杰', '小敏', '小伟', '小雪', '小峰', '小婷',
  '小辉', '小娟', '小磊', '小娜', '小鹏', '小蓉',
];

function generateAvatar(name: string): string {
  const colors = ['FF6B6B', '4ECDC4', '45B7D1', '96CEB4', 'FFEAA7', 'DDA0DD', '87CEEB', 'FFA07A'];
  const color = colors[name.charCodeAt(0) % colors.length];
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}&backgroundColor=${color}`;
}

export const mockChildren: Child[] = childNames.map((name, index) => ({
  id: `k${index + 1}`,
  name,
  avatar: generateAvatar(name),
  classId: mockClasses[index % mockClasses.length].id,
}));
