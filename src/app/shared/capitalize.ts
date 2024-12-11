export const capitalizeEveryWord = (sentence: string) => {
  return sentence?.includes(" ")
    ? sentence
        ?.split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : sentence.charAt(0).toUpperCase() + sentence.slice(1);
};

export const calipalizeFirstCharacterOnly = (sentence: string) => {
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
};
