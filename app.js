const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const csrf = require("csurf");
const flash = require("connect-flash");

const errorController = require("./controllers/error");
const sequelize = require("./util/database");
const User = require("./models/user");
const Product = require("./models/product");
const Order = require("./models/order");
const OrderItem = require("./models/order-item");

// const MONGODB_URI =
//   "mongodb+srv://maximilian:9u4biljMQc4jjqbe@cluster0-ntrwp.mongodb.net/shop";

const app = express();

const store = new SequelizeStore({
  db: sequelize,
});
// const store = new MongoDBStore({
//   uri: MONGODB_URI,
//   collection: "sessions",
// });
const csrfProtection = csrf();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findByPk(req.session.user.id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      throw new Error(err);
    });
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get("/500", errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
  // res.status(error.httpStatusCode).render(...);
  // res.redirect('/500');
  res.status(500).render("500", {
    pageTitle: "Error!",
    path: "/500",
    isAuthenticated: req.session.isLoggedIn,
  });
});

// mongoose
//   .connect(MONGODB_URI)
//   .then((result) => {
//     app.listen(3000);
//   })
//   .catch((err) => {
//     console.log(err);
//   });

//define relation ships
// User.hasMany(Product, { onDelete: "CASCADE" });
// Product.belongsTo(User);

// User.hasMany(Order, { onDelete: "CASCADE" });
// Order.belongsTo(User);

// Order.belongsToMany(Product, { through: OrderItem });
// Product.belongsToMany(Order, { through: OrderItem });

// OrderItem.belongsTo(Order, { foreignKey: "orderId" });
// Order.hasMany(OrderItem);
// 1;

// OrderItem.belongsTo(Product, { foreignKey: "productId" });
// Product.hasMany(OrderItem);

User.hasMany(Product, { foreignKey: "userId", onDelete: "CASCADE" });
Product.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Order, { foreignKey: "userId", onDelete: "CASCADE" });
Order.belongsTo(User, { foreignKey: "userId" });

Order.belongsToMany(Product, { through: OrderItem });
Product.belongsToMany(Order, { through: OrderItem });
// sequelize
//   .sync()
//   //.sync({ force: true })
//   .then((result) => {
//     // Optionally create a default user if necessary
//     // return User.findByPk(1);
//   })
//   .then((user) => {
//     if (!user) {
//       return User.create({ email: "test@test.com", password: "test" });
//     }
//     return user;
//   })
//   .then((user) => {
//     app.listen(3000);
//   })
//   .catch((err) => {
//     console.log(err);
//   });
// sequelize
//   .sync({ force: true })
//   .then(() => User.sync({ force: true }))
//   .catch((err) => {
//     console.error("Error syncing User model:", err);
//   })
//   .then(() => Product.sync({ force: true }))
//   .catch((err) => {
//     console.error("Error syncing Product model:", err);
//   })
//   .then(() => Order.sync({ force: true }))
//   .catch((err) => {
//     console.error("Error syncing Order model:", err);
//   })
//   .then(() => OrderItem.sync({ force: true }))
//   .catch((err) => {
//     console.error("Error syncing OrderItem model:", err);
//   })
//   .then(() => {
//     // Start the server after the models are synced
//     app.listen(3000);
//   })
//   .catch((err) => {
//     console.error("Error during sync process:", err);
//   });

sequelize
  .sync({ force: true }) // Use force:true only during development to reset tables
  .then(() => {
    // Optionally create a default user if necessary
    return User.findByPk(1);
  })
  .then((user) => {
    if (!user) {
      return User.create({ email: "test@test.com", password: "test" });
    }
    return user;
  })
  .then((user) => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
