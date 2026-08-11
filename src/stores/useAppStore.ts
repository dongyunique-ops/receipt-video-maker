import { create } from 'zustand';
import type { AppState, PhotoItem, ReceiptData, MenuItem } from '../types';

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

interface AppActions {
  addPhoto: (photo: PhotoItem) => void;
  removePhoto: (id: string) => void;
  updatePhoto: (id: string, updates: Partial<PhotoItem>) => void;
  selectPhoto: (id: string | null) => void;
  updateReceipt: (updates: Partial<ReceiptData>) => void;
  addMenuItem: (item: MenuItem) => void;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  removeMenuItem: (id: string) => void;
  setRecording: (isRecording: boolean) => void;
}

export const useAppStore = create<AppState & AppActions>((set) => ({
  photos: [],
  receipt: defaultReceipt,
  selectedPhotoId: null,
  isRecording: false,

  addPhoto: (photo) =>
    set((state) => ({ photos: [...state.photos, photo] })),

  removePhoto: (id) =>
    set((state) => ({
      photos: state.photos.filter((p) => p.id !== id),
      selectedPhotoId: state.selectedPhotoId === id ? null : state.selectedPhotoId,
    })),

  updatePhoto: (id, updates) =>
    set((state) => ({
      photos: state.photos.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),

  selectPhoto: (id) => set({ selectedPhotoId: id }),

  updateReceipt: (updates) =>
    set((state) => ({ receipt: { ...state.receipt, ...updates } })),

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

  setRecording: (isRecording) => set({ isRecording }),
}));
