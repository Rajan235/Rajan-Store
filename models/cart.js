const { DataTypes, Model } = require("sequelize");
const sequelize = require("../util/database");

class Cart extends Model {
  // static associate(models) {
  //   this.belongsTo(models.User, { foreignKey: "userId", onDelete: "CASCADE" });
  //   this.hasMany(models.CartItem, {
  //     foreignKey: "cartId",
  //     onDelete: "CASCADE",
  //   });
  // }
}

Cart.init(
  {
    id: {
      // type: DataTypes.UUID,
      // primaryKey: true,
      // defaultValue: DataTypes.UUIDV4,
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
  },
  {
    sequelize,
    modelName: "Cart",
    tableName: "Carts",
  }
);

module.exports = Cart;
