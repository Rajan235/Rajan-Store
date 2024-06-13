const { DataTypes, Model } = require("sequelize");
const sequelize = require("../util/database");

class Order extends Model {}

Order.init(
  {
    products: {
      type: DataTypes.ARRAY(DataTypes.JSONB),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
        notEmpty: true,
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "Order",
    tableName: "Orders",
  }
);

module.exports = Order;
