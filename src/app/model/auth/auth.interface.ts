import { UserRole } from "@prisma/client";

export type TRegisterUser = {
  email: string;
  password: string;
  name: string;
  role: UserRole;
};

export type TLoginUser = {
  email: string;
  password?: string;
  authLoginData?: {
    provider: "google" | "github";
    name: string;
    img: string;
  };
};

export type TChangePassword = {
  oldPassword: string;
  newPassword: string;
};

export type TForgetPassword = {
  email: string;
};

export type TCheckResetCode = {
  email: string;
  code: string;
};

export type TResetPassword = {
  email: string;
  code: string;
  password: string;
};

export type TSendContactEmail = {
  userName: string;
  userEmail: string;
  message: string;
  sendToEmail: string;
};
