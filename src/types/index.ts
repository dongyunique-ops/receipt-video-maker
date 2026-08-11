export interface MenuItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  isPromo?: boolean;
  promoLabel?: string;
}

export interface ReceiptData {
  title: string;
  deliveryAddress: string;
  customerRequest: string;
  riderRequest: string;
  menuItems: MenuItem[];
  deliveryFee: number;
  subtotal: number;
  discount: number;
  total: number;
  chargedAmount: number;
  discountLabel: string;
}

export interface PhotoItem {
  id: string;
  src: string;
  scale: number;
  x: number;
  y: number;
}

export interface AppState {
  photos: PhotoItem[];
  receipt: ReceiptData;
  selectedPhotoId: string | null;
  isRecording: boolean;
}
