import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    imageProfile: { type: DataTypes.STRING, defaultValue: "" },
    username: { type: DataTypes.STRING, allowNull: false },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM("agricultor", "consumidor"), allowNull: false },
    propertyName: { type: DataTypes.STRING, allowNull: true },
    cityName: { type: DataTypes.STRING, allowNull: false },
    stateName: { type: DataTypes.STRING, allowNull: false },
    phoneNumber: { type: DataTypes.STRING, allowNull: false },
  },
  {
    timestamps: true,
  }
);

export default User;
