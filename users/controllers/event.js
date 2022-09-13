const constants = require("../config/constants");
const models = require("../models");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const createEvent = async (req, res) => {
  try {
    let createObject = {
      event_name: req.body.event_name,
      user_id: req.userData.id,
    };
    let event = await models.events.create(createObject);
    let createObject1 = {
      user_id: req.userData.id,
      event_id: event.id,
    };
    let event_user = await models.user_events.create(createObject1);

    res.json({
      status: constants.success_code,
      message: "successfully created",
      data: event,
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

const getEventList = async (req, res) => {
  try {
    let updatedUserData = await models.user_events.findAll({
      where: {
        user_id: req.userData.id,
      },
      include: ["event"],
    });
    // console.log('updateUserData :>> ', updatedUserData);
    if (!req.body.search_text) {
      let result = await models.events.findAndCountAll({
        order: [["createdAt", "DESC"]],
        offset: parseInt(req.body.skip),
        limit: parseInt(req.body.limit),
        where: {
          user_id: req.userData.id,
        },
        include: [
          {
            model: models.user_events,
            as: "users",
            // where: { user_id: req.userData.id },
          },
        ],
        distinct: true,
      });

      console.log("result :>> ", result);

      res.json({
        status: constants.success_code,
        message: "successfully listed",
        data: result.rows,
        total: result.count,
      });

      return;
    }
    //with search result
    let searchResult = await models.user_events.findAndCountAll({
      where: {
        user_id: req.userData.id,
      },
      include: [
        {
          model: models.events,
          as: "event",
          where: {
            event_name: {
              [Op.iLike]: `%${req.body.search_text}%`,
            },
          },
        },
      ],

      order: [["createdAt", "DESC"]],
      offset: parseInt(req.body.skip),
      limit: parseInt(req.body.limit),
    });
    res.json({
      status: constants.success_code,
      message: "successfully listed",
      data: searchResult.rows,
      total: searchResult.count,
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

const updateEvent = async (req, res) => {
  try {
    const updateObject = await models.events.update(
      {
        event_name: req.body.event_name,
      },
      { where: { user_id: req.userData.id, id: req.params.id } }
    );

    res.json({
      status: constants.success_code,
      message: "successfully updated",
      data: updateObject,
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

module.exports = {
  createEvent,
  getEventList,
  updateEvent,
};
