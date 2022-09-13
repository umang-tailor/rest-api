"use strict";

const User = require("./user");

module.exports = (sequelize, DataTypes) => {
  const events = sequelize.define("events", {
    event_name: DataTypes.STRING,
    user_id: DataTypes.BIGINT,
  });

  events.associate = function (models) {
    events.belongsTo(models.users, {
      foreignKey: "id",
      as: "user",
      onDelete: "CASCASDE",
      onUpdate: "CASECADE",
    });

    events.hasMany(models.user_events, {
      foreignKey: "event_id",
      as: "users",
    });
  };
  return events;
};
