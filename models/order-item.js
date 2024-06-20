const { DataTypes, Model } = require("sequelize");
const sequelize = require("../util/database");

class OrderItem extends Model {
  // static associate(models) {
  //   this.belongsTo(models.Order, {
  //     foreignKey: "orderId",
  //     onDelete: "CASCADE",
  //   });
  //   this.belongsTo(models.Product, {
  //     foreignKey: "productId",
  //     onDelete: "CASCADE",
  //   });
  // }
}

OrderItem.init(
  {
    id: {
      // type: DataTypes.UUID,
      // primaryKey: true,
      // defaultValue: DataTypes.UUIDV4,
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0,
      },
    },
  },
  {
    sequelize,
    modelName: "OrderItem",
    tableName: "OrderItems",
  }
);

module.exports = OrderItem;
