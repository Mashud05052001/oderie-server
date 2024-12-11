// import config from "../config";
// import { userRoles } from "../modules/user/user.constant";
// import { User } from "../modules/user/user.model";

// export const seed = async () => {
//   try {
//     const admin = await User.findOne({
//       role: userRoles.admin,
//       email: config.admin_email,
//     }).select("_id email");
//     if (!admin) {
//       console.log("Seeding started...");
//       await User.create({
//         name: config.admin_name,
//         email: config.admin_email,
//         role: userRoles.admin,
//         password: config.admin_password,
//         profilePicture: config.admin_profile_picture,
//         coverPicture: config.admin_cover_picture,
//         isVerified: true,
//       });
//       console.log("Admin created successfully...");
//       console.log("Seeding completed...");
//     }
//   } catch (error) {
//     console.log("Error in seeding", error);
//   }
// };
