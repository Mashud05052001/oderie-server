import nodemailer from "nodemailer";
import config from "../config";
import httpStatus from "http-status";
import AppError from "../errors/AppError";

const sendEmail = async (
  to: string,
  html: string,
  priority: "high" | "low" | "normal" = "normal",
  replyTo: string = "oderie@support.com",
  subject: string = "User password change mail"
) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587, // development
    // port: 465,  // production
    secure: config.node_env === "production",
    auth: {
      user: config.sender_email,
      pass: config.sender_app_password,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `Oderie ${config.sender_email}`,
      to,
      subject,
      text: "Reset your password withen 10 minutes",
      priority,
      replyTo,
      html,
    });
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.log("Error catch in sending email! ", error);
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Some issue occurs in sending email. Please try again"
    );
  }
};

export const EmailHelper = {
  sendEmail,
};
