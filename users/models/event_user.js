"use strict";
module.exports = (sequelize, DataTypes) => {
  const user_events = sequelize.define("user_events", {
    event_id: DataTypes.BIGINT,
    user_id: DataTypes.BIGINT,
  });

  user_events.associate = function (models) {
    user_events.belongsTo(models.users, {
      foreignKey: "id",
      as: "user",
      onDelete: "CASCASDE",
      onUpdate: "CASECADE",
    });

    user_events.belongsTo(models.events, {
      foreignKey: "id",
      as: "event",
      onDelete: "CASCASDE",
      onUpdate: "CASECADE",
    });
  };
  return user_events;
};
