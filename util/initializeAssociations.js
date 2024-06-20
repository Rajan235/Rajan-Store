const initializeAssociations = (sequelize) => {
  const { User, Product, Order, OrderItem, Cart, CartItem } = sequelize.models;
  //it is for admin to create products
  User.hasMany(Product, {
    foreignKey: { name: "userId", allowNull: false },
    onDelete: "CASCADE",
  });
  Product.belongsTo(User, {
    foreignKey: { name: "userId", allowNull: false },
  });

  User.hasMany(Order, {
    foreignKey: { name: "userId", allowNull: false },
    onDelete: "CASCADE",
  });
  Order.belongsTo(User, {
    foreignKey: { name: "userId", allowNull: false },
  });

  Order.belongsToMany(Product, {
    through: OrderItem, // Added the `through` option
    foreignKey: { name: "orderId", allowNull: false },
    onDelete: "CASCADE",
  });
  Product.belongsToMany(Order, {
    through: OrderItem, // Added the `through` option
    foreignKey: { name: "productId", allowNull: false },
    onDelete: "CASCADE",
  });

  CartItem.belongsTo(Cart, {
    foreignKey: { name: "cartId", allowNull: false },
    onDelete: "CASCADE",
  });
  CartItem.belongsTo(Product, {
    foreignKey: { name: "productId", allowNull: false },
    onDelete: "CASCADE",
  });
  Cart.hasMany(CartItem, {
    foreignKey: { name: "cartId", allowNull: false },
    onDelete: "CASCADE",
  });
  Product.hasMany(CartItem, {
    foreignKey: { name: "productId", allowNull: false },
    onDelete: "CASCADE",
  });

  Cart.belongsTo(User, {
    foreignKey: { name: "userId", allowNull: false },
    onDelete: "CASCADE",
  });
  User.hasOne(Cart, {
    foreignKey: { name: "userId", allowNull: false },
    onDelete: "CASCADE",
  });
};

module.exports = initializeAssociations;
