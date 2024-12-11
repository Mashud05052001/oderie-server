import { JwtPayload } from "jsonwebtoken";
import { TExtendedUserData } from "./jwt.type";

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload;
      extendedUserData: TExtendedUserData;
    }
  }
}
