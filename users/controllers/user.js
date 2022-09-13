const constants = require("../config/constants");
const bcrypt = require("bcryptjs");
const token = require("../config/secret");
const jwt = require("jsonwebtoken");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const models = require("../models");

const registerUser = async (req, res) => {
  console.log("registerUser function start");
  try {
    if (
      !req.body.first_name ||
      !req.body.email ||
      !req.body.password ||
      !req.body.last_name
    ) {
      throw "Please provide all Data";
    }

    let existUserData = await models.users.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (existUserData) {
      throw "User with this email is already registered with us";
    }

    let secret = token();
    var hashedPassword = await bcrypt.hash(req.body.password, 8);

    let createObject = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      password: hashedPassword,
    };

    let user = await models.users.create(createObject);

    let updatedUserData = await models.users.findOne({
      where: {
        id: user.id,
      },
    });

    let authToken = jwt.sign({ id: user.id, role: "Users" }, secret, {
      expiresIn: 86400, // expires in 24 hours
    });
    console.log("authToken printed here", authToken);

    res.json({
      status: constants.success_code,
      message: "successfully created",
      data: updatedUserData,
      authToken: authToken,
    });

    return;
  } catch (error) {
    console.log("error :>> ", error);
    res.status(500).json({
      status: constants.server_error_code,
      message:
        typeof error === "string"
          ? error
          : typeof error.message === "string"
          ? error.message
          : constants.server_error,
    });
    return;
  }
};
const login = async (req, res) => {
  console.log("login function start");
  try {
    if (!req.body.email || !req.body.password) {
      throw "Please provide all Data";
    }

    let user = await models.users.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (!user) {
      throw "Invalid email";
    }

    var isEqual = await bcrypt.compare(req.body.password, user.password);
    console.log("!!!!!!!!!!after compare", isEqual);

    if (!isEqual) {
      throw "Invalid password";
    }

    let updatedUserData = await models.users.findOne({
      where: {
        id: user.id,
      },
    });

    let secret = token();
    let authToken = jwt.sign({ id: user.id, role: "User" }, secret, {
      expiresIn: 86400, // expires in 24 hours
    });

    console.log("!!!!!!!!all process completed", updatedUserData, authToken);

    res.json({
      status: constants.success_code,
      message: "successfully Logged in",
      data: updatedUserData,
      authToken: authToken,
    });

    return;
  } catch (error) {
    console.log("!!!!!!!!error printed here", error);
    res.status(500).json({
      status: constants.server_error_code,
      message:
        typeof error === "string"
          ? error
          : typeof error.message === "string"
          ? error.message
          : constants.server_error,
    });

    return;
  }
};

// const changePassword = async (req, res) => {
//         try {
//           const { oldPassword, newPassword } = req.body;
//           const userCheck = await models.users.findAll({
//             where: {
//               email: req.body.email,
//             },
//           });
//           if (!userCheck) {
//                 throw  `User doesn't exists!`;
//             };

//         const passwordMatch = await bcrypt.compare(
//             oldPassword,
//             userCheck[0].password
//           );
//           if (!passwordMatch){
//             throw "Invalid password";
//         }
//           if (oldPassword === newPassword) {
//                  throw  "Old and new passwords must not be same. Please try different password";
//             }

//           const hashedPassword = await bcrypt.hash(newPassword, 10);
//           await models.users.update({
//             where: {
//               email: req.body.email,
//             },
//             data: {
//               password: hashedPassword,
//             },
//           });
//           return  res.json({
//             status: constants.success_code,
//             message: "successfully change password",
//             data: userCheck,

//           });
//         } catch (error) {
//             console.log("!!!!!!!!error printed here", error);
//             res.status(500).json({
//               status: constants.server_error_code,
//               message:
//                 typeof error === "string"
//                   ? error
//                   : typeof error.message === "string"
//                   ? error.message
//                   : constants.server_error,
//             });

//             return;
//           }
//       };

const changePassword = async (req, res) => {
  try {
    if (!req.body.password) {
      throw "Please provide password";
    }

    let updateObject = {};

    updateObject.password = await bcrypt.hash(req.body.password, 8);
    console.log("updateObject :>> ", updateObject);
    console.log("req.userData.id :>> ", req.userData.id);
    let editUserData = await models.users.update(updateObject, {
      where: {
        id: req.userData.id,
      },
    });
    console.log("editUserData :>> ", editUserData);
    res.json({
      status: constants.success_code,
      message: "password change Successfully",
    });
  } catch (error) {
    console.log("error :>> ", error);
    res.status(500).json({
      status: constants.server_error_code,
      message:
        typeof error === "string"
          ? error
          : typeof error.message === "string"
          ? error.message
          : constants.server_error,
    });
    return;
  }
};

const resetPassword = async (req, res) => {
  try {
    let userPass = await models.users.findOne({
      where: {
        email: req.body.email,
      },
    });
    if (!userPass) {
      throw "invalid email";
    }

    let reset = {
      passwordReset: true,
      id: userPass.id,
    };
    let secret = token();
    let resetKey = jwt.sign(reset, secret, {
      expiresIn: 86400, // expires in 24 hours
    });

    res.json({
      status: constants.success_code,
      message: "password resetKey",
      resetKey: resetKey,
    });
  } catch (error) {
    console.log("error :>> ", error);
    res.status(500).json({
      status: constants.server_error_code,
      message:
        typeof error === "string"
          ? error
          : typeof error.message === "string"
          ? error.message
          : constants.server_error,
    });
    return;
  }
};
const updatePassword = async (req, res) => {
  try {
    let secret = token();

    const tokenData = await jwt.decode(req.body.passwordReset, secret);
    console.log("tokenData :>> ", tokenData);
    if (tokenData.passwordReset) {
      let userFind = await models.users.findOne({
        where: {
          id: tokenData.id,
        },
      });
      if (!userFind) {
        throw "user not found";
      }
      let updateObject = {};

      updateObject.password = await bcrypt.hash(req.body.password, 8);
      let editUserData = await models.users.update(updateObject, {
        where: {
          id: tokenData.id,
        },
      });
      return res.json({
        status: 200,
        message: "change sucessfully",
      });
    } else {
      return res.json({
        status: "error",
        message: "unthorized",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: constants.server_error_code,
      message:
        typeof error === "string"
          ? error
          : typeof error.message === "string"
          ? error.message
          : constants.server_error,
    });

    return;
  }
};
// const filterUser = async (req, res) => {
//   // console.log("filterUser function start", req.body, req.params);
//   console.log("hello");
//   try {
//     if (req.body.search_text == "") {
//       let result = await models.users.findAndCountAll({
//         order: [["createdAt", "DESC"]],
//         offset: parseInt(req.params.skip),
//         limit: parseInt(req.params.limit),
//       });

//       res.json({
//         status: constants.success_code,
//         message: "successfully listed",
//         data: result.rows,
//         total: result.count,
//       });

//       return;
//     }
//     console.log("hello");
//     //with search result
//     let searchResult = await models.users.findAndCountAll({
//       where: {
//         //   [Op.and]: [
//         // {
//         [Op.or]: [
//           {
//             first_name: {
//               [Op.like]: `%${req.body.search_text}%`,
//             },
//           },
//           {
//             last_name: {
//               [Op.like]: `%${req.body.search_text}%`,
//             },
//           },
//           {
//             email: {
//               [Op.like]: `%${req.body.search_text}%`,
//             },
//           },
//         ],
//         // },
//         //   ],
//       },
//       order: [["createdAt", "DESC"]],
//       offset: parseInt(req.params.skip),
//       limit: parseInt(req.params.limit),
//     });

//     res.json({
//       status: constants.success_code,
//       message: "successfully listed",
//       data: searchResult.rows,
//       total: searchResult.count,
//     });

//     return;
//   } catch (error) {
//     res.status(500).json({
//       status: constants.server_error_code,
//       message:
//         typeof error === "string"
//           ? error
//           : typeof error.message === "string"
//           ? error.message
//           : constants.server_error,
//     });

//     return;
//   }
// };

const listUsers = async (req, res) => {
  console.log("hello");
  try {
    let result = await models.users.findAndCountAll({
      order: [["createdAt", "DESC"]],
      offset: parseInt(req.body.skip),
      limit: parseInt(req.body.limit),
    });
    // console.log("result :>> ", result);
    res.json({
      status: constants.success_code,
      message: "successfully listed",
      data: result.rows,
      total: result.count,
    });
    return;
  } catch (error) {
    res.status(500).json({
      status: constants.server_error_code,
      message:
        typeof error === "string"
          ? error
          : typeof error.message === "string"
          ? error.message
          : constants.server_error,
    });

    return;
  }
};
module.exports = {
  registerUser,
  login,
  changePassword,
  listUsers,
  //   filterUser,
  resetPassword,
  updatePassword,
};
