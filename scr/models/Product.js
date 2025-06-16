import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import User from "./User.js";

const Product = sequelize.define("Product", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: { type: DataTypes.UUID, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  category: { type: DataTypes.ENUM("Fruta", "Verdura", "Legume"), allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  image: { type: DataTypes.STRING, allowNull: false }
}, {
  timestamps: true,
});

Product.belongsTo(User, { foreignKey: 'userId' });

export default Product;
