const { DataTypes, Model } = require("sequelize");
const sequelize = require("../util/database");

const Product = require("./product");
const Order = require("./order");
const OrderItem = require("./order-item");
const Cart = require("./cart");
const CartItem = require("./cart-item");

class User extends Model {
  // static associate(models) {
  //   this.hasMany(models.Product, { foreignKey: "userId", onDelete: "CASCADE" });
  //   this.hasMany(models.Order, { foreignKey: "userId", onDelete: "CASCADE" });
  //   this.hasOne(models.Cart, { foreignKey: "userId", onDelete: "CASCADE" });
  // }
  // async validatePassword(password) {
  //   return bcrypt.compare(password, this.password);
  // }
  async getCart() {
    const user = await User.findByPk(this.id, {
      include: [
        {
          model: Cart,
          include: [
            {
              model: CartItem,
              include: [Product],
            },
          ],
        },
      ],
    });

    return user.Cart || null; // Return the user's cart or null if not found
  }
  async removeFromCart(productId) {
    const cart = await this.getCart();
    if (!cart) {
      const error = new Error("Cart not found");
      error.statusCode = 404;
      throw error;
    }

    const cartItem = await CartItem.findOne({
      where: { cartId: cart.id, productId: productId },
    });

    if (!cartItem) {
      const error = new Error("Cart item not found");
      error.statusCode = 404;
      throw error;
    }

    await cartItem.destroy();
  }
}

User.init(
  {
    id: {
      // type: DataTypes.UUID,
      // primaryKey: true,
      // defaultValue: DataTypes.UUIDV4,
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    // name: {
    //   type: DataTypes.STRING,
    //   allowNull: false,
    // },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // role: {
    //   type: DataTypes.ENUM('user', 'admin'),
    //   defaultValue: 'user',
    // },
    // isVerified: {
    //   type: DataTypes.BOOLEAN,
    //   defaultValue: false,
    // },
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
    // hooks: {
    //   beforeSave: async (user) => {
    //     if (user.changed('password')) {
    //       user.password = await bcrypt.hash(user.password, 10);
    //     }
    //   },
    // },
  }
);

module.exports = User;

// class User extends Model {
//   // // async getCart() {
//   // //   const cart = await Cart.findOne({
//   // //     where: { userId: this.id },
//   // //     include: {
//   // //       model: CartItem,
//   // //       include: Product,
//   // //     },
//   // //   });

//   // //   if (!cart) {
//   // //     return [];
//   // //   }

//   // //   return cart.CartItems.map((item) => ({
//   // //     ...item.Product.dataValues,
//   // //     cartItem: { quantity: item.quantity, productId: item.productId },
//   // //   }));
//   // // }

//   // // async addToCart(product) {
//   // //   const [cart, created] = await Cart.findOrCreate({
//   // //     where: { userId: this.id },
//   // //   });

//   // //   const [cartItem, itemCreated] = await CartItem.findOrCreate({
//   // //     where: { cartId: cart.id, productId: product.id },
//   // //     defaults: { quantity: 1 },
//   // //   });

//   // //   if (!itemCreated) {
//   // //     cartItem.quantity += 1;
//   // //     await cartItem.save();
//   // //   }

//   // //   return this.getCart();
//   // // }

//   // // async removeFromCart(productId) {
//   // //   const cart = await Cart.findOne({
//   // //     where: { userId: this.id },
//   // //   });

//   // //   if (!cart) {
//   // //     return;
//   // //   }

//   // //   const cartItem = await CartItem.findOne({
//   // //     where: { cartId: cart.id, productId },
//   // //   });

//   // //   if (!cartItem) {
//   // //     return;
//   // //   }

//   // //   await cartItem.destroy();
//   // //   return this.getCart();
//   // // }

//   // // async clearCart() {
//   // //   const cart = await Cart.findOne({
//   // //     where: { userId: this.id },
//   // //   });

//   // //   if (!cart) {
//   // //     return;
//   // //   }

//   // //   await CartItem.destroy({
//   // //     where: { cartId: cart.id },
//   // //   });

//   // //   return this.getCart();
//   // }
//   // // // async getCart() {
//   // // //   const cartProducts = await Product.findAll({
//   // // //     where: {
//   // // //       id: this.cart.items.map((item) => item.productId),
//   // // //     },
//   // // //   });

//   // // //   return cartProducts.map((product) => {
//   // // //     return {
//   // // //       ...product.dataValues,
//   // // //       cartItem: this.cart.items.find((item) => item.productId === product.id),
//   // // //     };
//   // // //   });
//   // // // }

//   // // async getCart() {
//   // //   const cartProductIds = this.cart.items.map((item) => item.productId);
//   // //   console.log("Cart product IDs:", cartProductIds); // Debugging statement
//   // //   const cartProducts = await Product.findAll({
//   // //     where: {
//   // //       id: {
//   // //         [Op.in]: cartProductIds,
//   // //       },
//   // //     },
//   // //   });

//   // //   console.log("Cart products from DB:", cartProducts); // Debugging statement
//   // //   return cartProducts.map((product) => {
//   // //     return {
//   // //       ...product.dataValues,
//   // //       cartItem: this.cart.items.find((item) => item.productId === product.id),
//   // //     };
//   // //   });
//   // // }

//   // // async addToCart(product) {
//   // //   const t = await sequelize.transaction();
//   // //   try {
//   // //     const cartProductIndex = this.cart.items.findIndex(
//   // //       (item) => item.productId === product.id
//   // //     );

//   // //     let newQuantity = 1;
//   // //     const updatedCartItems = [...this.cart.items];

//   // //     if (cartProductIndex >= 0) {
//   // //       newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//   // //       updatedCartItems[cartProductIndex].quantity = newQuantity;
//   // //     } else {
//   // //       updatedCartItems.push({
//   // //         productId: product.id,
//   // //         quantity: newQuantity,
//   // //       });
//   // //     }

//   // //     this.cart = { items: updatedCartItems };

//   // //     console.log("Before save:", this.cart);
//   // //     await this.save({ transaction: t });
//   // //     console.log("After save:", this.cart);

//   // //     await t.commit();

//   // //     const updatedCart = await this.getCart(); // Ensure the promise resolves
//   // //     console.log("Updated cart:", updatedCart); // Log the updated cart
//   // //     return updatedCart;
//   // //   } catch (error) {
//   // //     await t.rollback();
//   // //     console.error("Error while adding to cart:", error);
//   // //     throw new Error(`Unable to add product to cart: ${error.message}`);
//   // //   }
//   // // }

//   // // async removeFromCart(productId) {
//   // //   const updatedCartItems = this.cart.items.filter((item) => {
//   // //     return item.productId !== productId; // Changed to match product IDs correctly
//   // //   });

//   // //   this.cart = { items: updatedCartItems };
//   // //   return this.save();
//   // // }

//   // // async clearCart() {
//   // //   this.cart = { items: [] };
//   // //   return this.save();
//   // // }
// }

// // User.init(
// //   {
// //     email: {
// //       type: DataTypes.STRING,
// //       allowNull: false,
// //       validate: {
// //         isEmail: true,
// //         notEmpty: true,
// //       },
// //     },
// //     password: {
// //       type: DataTypes.STRING,
// //       allowNull: false,
// //     },
// //     // cart: {
// //     //   type: DataTypes.JSONB,
// //     //   defaultValue: { items: [] },
// //     //   allowNull: false,
// //     // },
// //     resetToken: {
// //       type: DataTypes.STRING,
// //     },
// //     resetTokenExpiration: {
// //       type: DataTypes.DATE,
// //     },
// //   },
// //   {
// //     sequelize,
// //     modelName: "User",
// //     tableName: "Users",
// //   }
// // );
