import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";
import { TJwtPayload } from "../interface/jwt.type";

const createJwtToken = (
  payload: TJwtPayload,
  secretCode: string,
  expiresIn: string
) => {
  return jwt.sign(payload, secretCode, { expiresIn });
};

const createJwtAccessToken = (
  payload: TJwtPayload,
  expiresIn = config.jwt_access_expires_in
) => {
  return jwt.sign(payload, config.jwt_access_secret as string, {
    expiresIn,
  });
};

const createJwtRefreshToken = (payload: TJwtPayload) => {
  return jwt.sign(payload, config.jwt_refresh_secret as string, {
    expiresIn: config.jwt_refresh_expires_in,
  });
};

const verifyAccessToken = (token: string) => {
  return jwt.verify(token, config.jwt_access_secret as string) as JwtPayload;
};

const verifyRefrestToken = (token: string) => {
  return jwt.verify(token, config.jwt_refresh_secret as string) as JwtPayload;
};

const isJwtIssueBeforePasswordChange = function (
  jwtIssuedTime: number,
  passwordChangedDate: Date
) {
  const passwordChangedTime = passwordChangedDate.getTime() / 1000;
  return jwtIssuedTime < passwordChangedTime;
};

export const jwtHelper = {
  createJwtToken,
  createJwtAccessToken,
  createJwtRefreshToken,
  verifyAccessToken,
  verifyRefrestToken,
  isJwtIssueBeforePasswordChange,
};
