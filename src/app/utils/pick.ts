import { capitalizeEveryWord } from "../shared/capitalize";

const pick = <T, K extends keyof T>(obj: T, keys: K[]): Partial<T> => {
  const finalObj: Partial<T> = {};
  for (const key of keys) {
    if (obj && Object.keys(obj).includes(key as string) && obj[key] !== "") {
      finalObj[key] = obj[key];
    }
  }
  return finalObj;
};

export const pickIncludeObject = <T>(
  allIncludes: (keyof T)[],
  includeString: string
): Record<keyof T, boolean> | undefined => {
  if (!includeString) return undefined;

  const providedIncludes: (keyof T)[] = includeString
    ?.split(",")
    .map((item) => capitalizeEveryWord(item)) as (keyof T)[];
  const validIncludes = providedIncludes.filter((include) =>
    allIncludes.includes(include)
  );
  const includeObject = validIncludes.reduce((acc, include) => {
    acc[include] = true;
    return acc;
  }, {} as Record<keyof T, boolean>);
  return includeObject;
};

/* USE CASE
const allProductIncludes : (keyof Prisma.ProductInclude)[] = ['Category','Coupon', 'Order', 'Review', 'Vendor']
const includeString = "Category,Coupon";
const includeObject = pickIncludeObject<Prisma.ProductInclude>(allProductIncludes, includeString);
*/

export default pick;
