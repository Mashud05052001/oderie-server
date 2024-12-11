export type TCouponCreate = {
  code?: string;
  expiryDate: Date;
  percentage: number;
  productIds: string[];
};
