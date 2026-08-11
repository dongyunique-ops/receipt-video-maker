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

export interface Transform {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export interface ShadowConfig {
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
}

export interface PhotoItem {
  id: string;
  src: string;
  transform: Transform;
  shadow: ShadowConfig;
  borderWidth: number;
  borderColor: string;
  width: number;
  height: number;
}

export interface ReceiptTransform extends Transform {
  width: number;
}

export interface CanvasState {
  width: number;
  height: number;
  background: string | null; // null = solid color, string = image data URL
  backgroundColor: string;
}

export type SelectedElement =
  | { type: 'photo'; id: string }
  | { type: 'receipt' }
  | null;

export interface AppState {
  canvas: CanvasState;
  photos: PhotoItem[];
  receipt: ReceiptData;
  receiptTransform: ReceiptTransform;
  selectedElement: SelectedElement;
  isRecording: boolean;
}
