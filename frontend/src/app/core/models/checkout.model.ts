export interface DeliverySlot {
  id: number;
  date: string;
  dayLabel: string;
  startTime: string;
  endTime: string;
  price: number;
}

export interface CouponResponse {
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_DELIVERY';
  value: number;
  description: string;
}

export interface CreateOrderRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  postalCode: string;
  deliveryInstructions?: string;
  deliverySlotId: number;
  couponCode?: string;
}

export interface OrderResponse {
  id: number;
  orderNumber: string;
  status: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  postalCode: string;
  deliveryInstructions?: string;
  deliverySlot: DeliverySlot;
  items: OrderItemResponse[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  couponCode?: string;
  total: number;
  createdAt: string;
}

export interface OrderItemResponse {
  productName: string;
  imageUrl?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}
