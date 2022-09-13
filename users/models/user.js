"use strict";
module.exports = (sequelize, DataTypes) => {
  const users = sequelize.define(
    "users",
    {
      first_name: DataTypes.STRING,
      last_name: DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      password: DataTypes.TEXT,
    },
    {
      indexes: [
        {
          unique: true,
          fields: ["email"],
        },
      ],
    }
  );

  users.associate = function (models) {
    users.hasMany(models.events, {
      foreignKey: "user_id",
      as: "event",
    });
    users.hasMany(models.user_events, {
      foreignKey: "user_id",
      as: "events",
    });
  };
  return users;
};
