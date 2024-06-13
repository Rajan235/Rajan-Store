const { DataTypes, Model } = require("sequelize");
const sequelize = require("../util/database");
const Product = require("./product");

class User extends Model {
  // async getCart() {
  //   const cartProducts = await Product.findAll({
  //     where: {
  //       id: this.cart.items.map((item) => item.productId),
  //     },
  //   });

  //   return cartProducts.map((product) => {
  //     return {
  //       ...product.dataValues,
  //       cartItem: this.cart.items.find((item) => item.productId === product.id),
  //     };
  //   });
  // }

  async getCart() {
    const cartProductIds = this.cart.items.map((item) => item.productId);
    const cartProducts = await Product.findAll({
      where: {
        id: {
          [Op.in]: cartProductIds,
        },
      },
    });

    return cartProducts.map((product) => {
      return {
        ...product.dataValues,
        cartItem: this.cart.items.find((item) => item.productId === product.id),
      };
    });
  }

  async addToCart(product) {
    const cartProductIndex = this.cart.items.findIndex((cp) => {
      return cp.productId === product.id; // Changed to match product IDs correctly
    });
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];

    if (cartProductIndex >= 0) {
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
      updatedCartItems.push({
        productId: product.id,
        quantity: newQuantity,
      });
    }

    this.cart = { items: updatedCartItems };
    return this.save();
  }

  async removeFromCart(productId) {
    const updatedCartItems = this.cart.items.filter((item) => {
      return item.productId !== productId; // Changed to match product IDs correctly
    });

    this.cart = { items: updatedCartItems };
    return this.save();
  }

  async clearCart() {
    this.cart = { items: [] };
    return this.save();
  }
}

User.init(
  {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
        notEmpty: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cart: {
      type: DataTypes.JSONB,
      defaultValue: { items: [] },
      allowNull: false,
    },
    resetToken: {
      type: DataTypes.STRING,
    },
    resetTokenExpiration: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "Users",
  }
);

module.exports = User;
