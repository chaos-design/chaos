export const getNonce = (len = 32) => {
  let text = "";

  const CODE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < len; i++) {
    text += CODE.charAt(Math.floor(Math.random() * CODE.length));
  }

  return text;
};
