const { DataTypes, Model } = require("sequelize");
const sequelize = require("../util/database");

class Order extends Model {
  // static associate(models) {
  //   this.belongsTo(models.User, { foreignKey: "userId", onDelete: "CASCADE" });
  //   this.belongsToMany(models.Product, {
  //     through: models.OrderItem,
  //     foreignKey: "orderId",
  //     onDelete: "CASCADE",
  //   });
  // }
}

Order.init(
  {
    id: {
      // type: DataTypes.UUID,
      // primaryKey: true,
      // defaultValue: DataTypes.UUIDV4,
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0,
      },
    },
    // status: {
    //   type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
    //   defaultValue: 'pending',
    // },
    // shippingAddress: {
    //   type: DataTypes.JSON,
    //   allowNull: false,
    // },
    // billingAddress: {
    //   type: DataTypes.JSON,
    //   allowNull: false,
    // },
    // paymentMethod: {
    //   type: DataTypes.STRING,
    //   allowNull: false,
    // },
  },
  {
    sequelize,
    modelName: "Order",
    tableName: "Orders",
  }
);

module.exports = Order;
