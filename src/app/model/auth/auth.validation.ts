import { z } from "zod";
import { UserRolesArray } from "./auth.constant";

const registerValidationSchema = z.object({
  body: z
    .object({
      name: z.string({
        required_error: "User name is required",
        invalid_type_error: "User name must be a string",
      }),
      email: z
        .string({ required_error: "User email is required" })
        .email({ message: "Provide a valid email" }),
      password: z.string({
        required_error: "User password is required",
        invalid_type_error: "User password must be a string",
      }),
      role: z
        .enum(["CUSTOMER", "VENDOR"] as [string, ...string[]], {
          required_error: "User role is required",
          invalid_type_error: "User role must be either 'CUSTOMER' or 'VENDOR'",
        })
        .default("CUSTOMER"),
      phone: z.string({ required_error: "Phone number is required" }),
      address: z.string({ required_error: "Address is required" }),
      description: z.string().optional(),
    })
    .refine((data) => data.role !== "VENDOR" || !!data.description, {
      message: "*Description is required for vendors",
      path: ["description"],
    }),
});

const loginValidationSchema = z.object({
  body: z
    .object({
      email: z
        .string({ required_error: "User email is required" })
        .email({ message: "Provide a valid email" }),
      password: z
        .string({
          required_error: "User password is required",
          invalid_type_error: "User password must be string",
        })
        .optional(),
      authLoginData: z
        .object({
          provider: z.enum(["google", "github"]),
          name: z.string(),
          img: z.string(),
        })
        .optional(),
    })
    .refine(
      (data) => {
        const isPasswordProvided = Boolean(data.password);
        const isAuthLoginDataProvided = Boolean(data.authLoginData);
        return isPasswordProvided !== isAuthLoginDataProvided;
      },
      {
        message:
          "Either password or authLoginData must be provided, but not both.",
        path: ["body"],
      }
    ),
});

const changePasswordValidationSchema = z.object({
  body: z.object({
    oldPassword: z.string({
      required_error: "Old password is required",
      invalid_type_error: "Old password must be string",
    }),
    newPassword: z.string({
      required_error: "New password is required",
      invalid_type_error: "New password must be string",
    }),
  }),
});

const accessTokenValidationSchema = z.object({
  cookies: z.object({
    refreshToken: z.string({
      required_error: "Refresh Token is required",
    }),
  }),
});

const forgetPasswordValidationSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: "User email is required" })
      .email({ message: "Provide a valid email" }),
  }),
});

const checkResetCodeValidationSchema = z.object({
  body: z.object({
    code: z.string().length(6, "Reset code must be exactly 6 digits."),
    email: z
      .string({ required_error: "User email is required" })
      .email({ message: "Provide a valid email" }),
  }),
});

const resetPasswordValidationSchema = z.object({
  body: z.object({
    code: z.string().length(6, "Reset code must be exactly 6 digits."),
    email: z
      .string({ required_error: "User email is required" })
      .email({ message: "Provide a valid email" }),
    password: z.string({
      required_error: "User password is required",
      invalid_type_error: "User password must be string",
    }),
  }),
});

const sendEmailValidationSchem = z.object({
  body: z.object({
    userName: z
      .string()
      .min(3, { message: "*Name must be at least 3 characters" }),
    userEmail: z
      .string()
      .email("Invalid email format")
      .nonempty("User email is required"),
    sendToEmail: z
      .string()
      .email("Invalid email format")
      .nonempty("Recipient email is required"),
    message: z
      .string()
      .min(3, { message: "*Message must be at least 5 characters" }),
  }),
});

export const AuthValidation = {
  registerValidationSchema,
  loginValidationSchema,
  changePasswordValidationSchema,
  accessTokenValidationSchema,
  forgetPasswordValidationSchema,
  checkResetCodeValidationSchema,
  resetPasswordValidationSchema,
  sendEmailValidationSchem,
};
