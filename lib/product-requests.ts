export const PRODUCT_REQUEST_STATUSES = ["new", "contacted", "closed"] as const;
export type ProductRequestStatus = (typeof PRODUCT_REQUEST_STATUSES)[number];
