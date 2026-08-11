import { create } from 'zustand';
import type {
  AppState,
  PhotoItem,
  ReceiptData,
  MenuItem,
  ReceiptTransform,
  CanvasState,
  SelectedElement,
  Transform,
  ShadowConfig,
} from '../types';

const defaultReceipt: ReceiptData = {
  title: '[배달] 주 문 서',
  deliveryAddress: '자양동',
  customerRequest: '제발 벨 누르지 말고 문 앞에 놓고 가주세요. 겨우 재웠어요. (수저포크 0)',
  riderRequest: '없음',
  menuItems: [
    {
      id: '1',
      name: '[신메뉴]프리미엄한우육회폭',
      quantity: 1,
      price: 13900,
    },
    {
      id: '2',
      name: '탄비빔밥 (할인행사)',
      quantity: 0,
      price: 0,
      isPromo: true,
      promoLabel: '- 2.지뷰공감 육회초밥2P',
    },
    {
      id: '3',
      name: '',
      quantity: 1,
      price: 0,
      isPromo: true,
      promoLabel: '- 2.지뷰공감 육회초밥2P',
    },
  ],
  deliveryFee: 0,
  subtotal: 15900,
  discount: 2000,
  total: 13900,
  chargedAmount: 0,
  discountLabel: '[배민클럽] 5500원 할인',
};

const defaultReceiptTransform: ReceiptTransform = {
  x: 1300,
  y: 200,
  scale: 1,
  rotation: 0,
  width: 320,
};

const defaultCanvas: CanvasState = {
  width: 1920,
  height: 1080,
  background: null,
  backgroundColor: '#f5f5f0',
};

interface AppActions {
  // Photo actions
  addPhoto: (photo: PhotoItem) => void;
  removePhoto: (id: string) => void;
  updatePhotoTransform: (id: string, transform: Partial<Transform>) => void;
  updatePhotoShadow: (id: string, shadow: Partial<ShadowConfig>) => void;
  updatePhotoBorder: (id: string, updates: { borderWidth?: number; borderColor?: string }) => void;

  // Selection
  selectElement: (element: SelectedElement) => void;

  // Receipt actions
  updateReceipt: (updates: Partial<ReceiptData>) => void;
  updateReceiptTransform: (updates: Partial<ReceiptTransform>) => void;
  addMenuItem: (item: MenuItem) => void;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  removeMenuItem: (id: string) => void;

  // Canvas actions
  setBackground: (bg: string | null) => void;
  setBackgroundColor: (color: string) => void;

  // Recording
  setRecording: (isRecording: boolean) => void;
}

export const useAppStore = create<AppState & AppActions>((set) => ({
  canvas: defaultCanvas,
  photos: [],
  receipt: defaultReceipt,
  receiptTransform: defaultReceiptTransform,
  selectedElement: null,
  isRecording: false,

  addPhoto: (photo) =>
    set((state) => ({ photos: [...state.photos, photo] })),

  removePhoto: (id) =>
    set((state) => ({
      photos: state.photos.filter((p) => p.id !== id),
      selectedElement:
        state.selectedElement?.type === 'photo' && state.selectedElement.id === id
          ? null
          : state.selectedElement,
    })),

  updatePhotoTransform: (id, transform) =>
    set((state) => ({
      photos: state.photos.map((p) =>
        p.id === id ? { ...p, transform: { ...p.transform, ...transform } } : p
      ),
    })),

  updatePhotoShadow: (id, shadow) =>
    set((state) => ({
      photos: state.photos.map((p) =>
        p.id === id ? { ...p, shadow: { ...p.shadow, ...shadow } } : p
      ),
    })),

  updatePhotoBorder: (id, updates) =>
    set((state) => ({
      photos: state.photos.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),

  selectElement: (element) => set({ selectedElement: element }),

  updateReceipt: (updates) =>
    set((state) => ({ receipt: { ...state.receipt, ...updates } })),

  updateReceiptTransform: (updates) =>
    set((state) => ({
      receiptTransform: { ...state.receiptTransform, ...updates },
    })),

  addMenuItem: (item) =>
    set((state) => ({
      receipt: {
        ...state.receipt,
        menuItems: [...state.receipt.menuItems, item],
      },
    })),

  updateMenuItem: (id, updates) =>
    set((state) => ({
      receipt: {
        ...state.receipt,
        menuItems: state.receipt.menuItems.map((item) =>
          item.id === id ? { ...item, ...updates } : item
        ),
      },
    })),

  removeMenuItem: (id) =>
    set((state) => ({
      receipt: {
        ...state.receipt,
        menuItems: state.receipt.menuItems.filter((item) => item.id !== id),
      },
    })),

  setBackground: (bg) =>
    set((state) => ({ canvas: { ...state.canvas, background: bg } })),

  setBackgroundColor: (color) =>
    set((state) => ({ canvas: { ...state.canvas, backgroundColor: color } })),

  setRecording: (isRecording) => set({ isRecording }),
}));
