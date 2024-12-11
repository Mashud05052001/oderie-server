export const calculateRange = (field: string) => {
  const obj = field?.split(",").reduce((obj, item) => {
    const [key, value] = item.split(":");
    const numberValue = Number(value);
    if (["gt", "gte", "lt", "lte"].includes(key) && !isNaN(numberValue)) {
      obj[key] = numberValue;
    }
    return obj;
  }, {} as Record<string, number>);
  return obj;
};
