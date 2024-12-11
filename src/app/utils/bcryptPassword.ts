import bcrypt from "bcrypt";
import config from "../config";

const createHashedPassword = async (password: string) => {
  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds)
  );
  return hashedPassword;
};

const compareHashedPasswordWithPlainText = async (
  plainText: string,
  hashedPassword: string
) => {
  const result = await bcrypt.compare(plainText, hashedPassword);
  return result;
};

export const bcryptHelper = {
  createHashedPassword,
  compareHashedPasswordWithPlainText,
};
