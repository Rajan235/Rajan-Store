const { DataTypes, Model } = require("sequelize");
const sequelize = require("../util/database");

class OrderItem extends Model {}

OrderItem.init(
  {
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // productId: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    // },
    // orderId: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    // },
  },
  {
    sequelize,
    modelName: "OrderItem",
    tableName: "OrderItems",
  }
);

module.exports = OrderItem;
