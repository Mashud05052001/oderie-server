import { UserRole } from "@prisma/client";
import config, { prisma } from "../config";
import { bcryptHelper } from "../utils/bcryptPassword";

const defaultSeeding = async () => {
  const admin_email = config.admin_email as string;
  const isExist = await prisma.user.findUnique({
    where: { email: admin_email, role: "ADMIN", status: "ACTIVE" },
  });
  if (!isExist) {
    const hashedPassword = await bcryptHelper.createHashedPassword(
      config.admin_password as string
    );
    const adminUserData = {
      email: admin_email,
      password: hashedPassword,
      role: "ADMIN" as UserRole,
    };
    const adminProfileData = {
      email: admin_email,
      phone: config.admin_mobile_number as string,
      name: config.admin_name as string,
      img: config.admin_profile_photo as string,
    };
    await prisma.$transaction(async (tsx) => {
      await tsx.user.create({ data: adminUserData });
      await tsx.profile.create({ data: adminProfileData });
    });
  }
};

export default defaultSeeding;
