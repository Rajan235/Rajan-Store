const { DataTypes, Model } = require("sequelize");
const sequelize = require("../util/database");
const Cart = require("./cart");
const Product = require("./product");

class CartItem extends Model {}

CartItem.init(
  {
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    cartId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Cart,
        key: "id",
      },
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Product,
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "CartItem",
    tableName: "CartItems",
  }
);

CartItem.belongsTo(Cart, { foreignKey: "cartId" });
CartItem.belongsTo(Product, { foreignKey: "productId" });
Cart.hasMany(CartItem, { foreignKey: "cartId" });
Product.hasMany(CartItem, { foreignKey: "productId" });

module.exports = CartItem;
