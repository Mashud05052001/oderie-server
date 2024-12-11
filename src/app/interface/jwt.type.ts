import { UserRole, UserStatus } from "@prisma/client";

export type TJwtPayload = {
  name: string;
  email: string;
  role: UserRole;
  profilePicture: string;
};

export type TExtendedUserData = TJwtPayload & {
  password: string;
  status: UserStatus;
  userId: string;
  vendorId: string | null;
};
