import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { TCategory } from "./category.interface";
import { prisma } from "../../config";
import { capitalizeEveryWord } from "../../shared/capitalize";
import { TImageFile } from "../../interface/image.interface";

const createCategory = async (payload: TCategory, file: TImageFile) => {
  const prevCategories = await prisma.category.findFirst({
    where: {
      name: {
        equals: payload.name,
        mode: "insensitive",
      },
    },
  });
  const modifiedName = capitalizeEveryWord(payload?.name);
  if (prevCategories) {
    if (prevCategories.isDeleted) {
      const result = await prisma.category.update({
        where: { id: prevCategories.id },
        data: { isDeleted: false },
      });
      return result;
    }
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `${payload.name} category is already exist`
    );
  }
  const result = await prisma.category.create({
    data: { name: modifiedName, icon: file.path },
  });
  return result;
};

const getAllCategories = async () => {
  const result = await prisma.category.findMany({});
  return result;
};

const updateCategory = async (
  id: string,
  payload: TCategory,
  file: TImageFile | undefined
) => {
  const prevCategory = await prisma.category.findUnique({
    where: {
      id,
    },
  });
  if (!prevCategory) {
    throw new AppError(httpStatus.NOT_FOUND, "This category is not found");
  }

  if (file) {
    const modifiedName = capitalizeEveryWord(payload?.name);
    const result = await prisma.category.update({
      where: { id },
      data: { name: modifiedName, icon: file.path },
    });
    return result;
  }

  const result = await prisma.category.update({
    where: { id },
    data: { name: payload.name },
  });
  return result;
};

const deleteCategory = async (id: string) => {
  await prisma.category.update({ where: { id }, data: { isDeleted: true } });
  return "Category Deleted successfully";
};

const deleteAllCategories = async () => {
  await prisma.category.updateMany({ data: { isDeleted: true } });
  return "All categories deleted successfully";
};

export const CategoryService = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
  deleteAllCategories,
};
