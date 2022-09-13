const constants = require("../config/constants");

const models = require("../models");
const { where } = require("sequelize");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const userInvite = async (req, res) => {
  try {
    let user = await models.users.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (!user) {
      throw "Invalid email";
    }
    console.log("user :>> ", user);
    let event = await models.events.findOne({
      where: {
        id: req.body.event_id,
      },
    });
    if (!event) {
      throw "Invalid id";
    }
    console.log("event :>> ", event);

    let userExits = await models.user_events.findOne({
      where: {
        user_id: user.id,
        event_id: req.body.event_id,
      },
    });
    console.log("userExits :>> ", userExits);
    if (userExits) {
      throw "Already invited";
    }
    if (req.userData.id == event.user_id) {
      let createObject = {
        user_id: user.id,
        event_id: req.body.event_id,
      };
      let event_user = await models.user_events.create(createObject);
      console.log(event_user);
      res.json({
        status: constants.success_code,
        message: "successfully created",
        data: event_user,
      });
    }
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

const userDetail = async (req, res) => {
  try {
    // console.log("start");
    if (!req.body.search_text) {
      let result = await models.user_events.findAll({
        // order: [["createdAt", "DESC"]],
        // offset: parseInt(req.body.skip),
        // limit: parseInt(req.body.limit),
        where: {
          user_id: req.userData.id,
        },
        include: [
          {
            model: models.events,
            as: "event",
            // where: { user_id: req.userData.id },
          },
        ],
        distinct: true,
      });

      //   console.log("result :>> ", result);

      res.json({
        status: constants.success_code,
        message: "successfully listed",
        data: result,
      });

      return;
    }
    //with search result
    // let searchResult = await models.user_events.findAndCountAll({
    //   where: {
    //     user_id: req.userData.id,
    //   },
    //   include: [
    //     {
    //       model: models.events,
    //       as: "event",
    //       where: {
    //         event_name: {
    //           [Op.ilike]: `%${req.body.search_text}%`,
    //         },
    //       },
    //     },
    //   ],

    //   order: [["createdAt", "DESC"]],
    //   offset: parseInt(req.body.skip),
    //   limit: parseInt(req.body.limit),
    // });
    // res.json({
    //   status: constants.success_code,
    //   message: "successfully listed",
    //   data: searchResult.rows,
    //   total: searchResult.count,
    // });

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
module.exports = {
  userInvite,
  userDetail,
};
