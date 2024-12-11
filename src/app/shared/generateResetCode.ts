export const generateRandomCode = (length = 6) => {
  const randomChars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * randomChars.length);
    code += randomChars[randomIndex];
  }

  return code;
};
