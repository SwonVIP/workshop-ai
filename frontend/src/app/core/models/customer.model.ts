export interface RegisterRequest {
  email: string;
  password: string;
  orderId: number;
}

export interface CustomerResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  street: string;
  apartment: string;
  city: string;
  postalCode: string;
}

export interface IdentifyRequest {
  email: string;
  password: string;
}
