const { DataTypes, Model } = require("sequelize");
const sequelize = require("../util/database");
const User = require("./user");

class Cart extends Model {}

Cart.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "Cart",
    tableName: "Carts",
  }
);

Cart.belongsTo(User, { foreignKey: "userId" });
User.hasOne(Cart, { foreignKey: "userId" });

module.exports = Cart;
