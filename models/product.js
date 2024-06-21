const { DataTypes, Model } = require("sequelize");
const sequelize = require("../util/database");

class Product extends Model {
  // static associate(models) {
  //   this.belongsTo(models.User, { foreignKey: "userId", onDelete: "CASCADE" });
  //   this.belongsToMany(models.Order, {
  //     through: models.OrderItem,
  //     foreignKey: "productId",
  //     onDelete: "CASCADE",
  //   });
  //   this.hasMany(models.CartItem, {
  //     foreignKey: "productId",
  //     onDelete: "CASCADE",
  //   });
  // }
}

Product.init(
  {
    id: {
      // type: DataTypes.UUID,
      // primaryKey: true,
      // defaultValue: DataTypes.UUIDV4,
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0,
      },
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // stock: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   defaultValue: 0,
    // },
    // category: {
    //   type: DataTypes.STRING,
    //   allowNull: false,
    // },
  },
  {
    sequelize,
    modelName: "Product",
    tableName: "Products",
  }
);

module.exports = Product;

// const Product = sequelize.define("Product", {
//   title: {
//     type: Sequelize.STRING,
//     allowNull: false,
//   },
//   price: {
//     type: Sequelize.FLOAT,
//     allowNull: false,
//   },
//   description: {
//     type: Sequelize.STRING,
//     allowNull: false,
//   },
//   imageUrl: {
//     type: Sequelize.STRING,
//     allowNull: false,
//   },
//   userId: {
//     type: Sequelize.INTEGER,
//     allowNull: false,
//     references: {
//       model: "Users",
//       key: "id",
//     },
//   },
// });

// module.exports = Product;
