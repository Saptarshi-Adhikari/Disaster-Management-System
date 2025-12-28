import { User } from "firebase/auth";

// The only phone number authorized for Admin access
const ADMIN_PHONE = "+917029786817";

export const checkIsAdmin = (user: User | null): boolean => {
  if (!user) return false;
  // Firebase usually formats numbers with the country code
  return user.phoneNumber === ADMIN_PHONE || user.phoneNumber === "7029786817";
};