const fs = require("fs");
const path = require("path");
const stripe = require("stripe")("sk_test_Flc1Upp19T0q8ZgmKGDVJUI400j9emUSTr");
const PDFDocument = require("pdfkit");

const User = require("../models/user");
const Product = require("../models/product");
const Order = require("../models/order");
const OrderItem = require("../models/order-item");
const Cart = require("../models/cart");
const CartItem = require("../models/cart-item");

const { Op } = require("sequelize"); // Added Sequelize Op import
const ITEMS_PER_PAGE = 3;

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product.count() // Changed countDocuments() to count()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.findAll({
        offset: (page - 1) * ITEMS_PER_PAGE,
        limit: ITEMS_PER_PAGE,
      }); // Used Sequelize's findAll with offset and limit
    })
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product.count() // Changed countDocuments() to count()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.findAll({
        offset: (page - 1) * ITEMS_PER_PAGE,
        limit: ITEMS_PER_PAGE,
      }); // Used Sequelize's findAll with offset and limit
    })
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "Products",
        path: "/products",
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findByPk(prodId) // Changed findById() to findByPk()
    .then((product) => {
      //console.log(product);
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .getCart()
    .then((cart) => {
      //console.log("this is fetched cart::", cart);
      if (!cart) {
        return res.render("shop/cart", {
          pageTitle: "Your Cart",
          path: "/cart",
          products: [],
        });
      }
      // console.log("cart items of fetched cart::", cart.CartItems.Product);
      // cart.CartItems.forEach((cartItem) => {
      //   console.log("Product:", cartItem.Product); // Accessing directly
      //   console.log("Product DataValues:", cartItem.Product.dataValues); // Accessing dataValues of Product
      // });
      const cartItems = cart.CartItems || [];
      const products = cartItems.map((item) => ({
        ...item.Product.dataValues,
        quantity: item.quantity,
      }));
      //console.log("products products given products ::::", products);

      res.render("shop/cart", {
        pageTitle: "Your Cart",
        path: "/cart",
        products: products,
      });
    })
    .catch((err) => {
      console.error("Error in postCart:", err);
      const error = new Error("An error occurred while adding to cart.");
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  let fetchedCart;
  let newQuantity = 1;

  Product.findByPk(prodId)
    .then((product) => {
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      return req.user
        .getCart()
        .then((cart) => {
          if (!cart) {
            return req.user.createCart();
          }
          return cart;
        })
        .then((cart) => {
          fetchedCart = cart;
          return fetchedCart.getCartItems({ where: { productId: prodId } });
        })
        .then(([cartItem]) => {
          if (cartItem) {
            newQuantity = cartItem.quantity + 1;
            return cartItem.update({ quantity: newQuantity });
          }
          return fetchedCart.createCartItem({
            productId: prodId,
            quantity: newQuantity,
          });
        })
        .then(() => {
          res.redirect("/cart");
        })
        .catch((err) => {
          console.error("Error in postCart:", err);
          const error = new Error("An error occurred while adding to cart.");
          error.httpStatusCode = 500;
          return next(error);
        });
    })
    .catch((err) => {
      console.error("Error in postCart:", err);
      const error = new Error("An error occurred while finding the product.");
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId) // Using custom removeFromCart method from User model
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCheckout = (req, res, next) => {
  let products;
  let total = 0;
  req.user
    .getCart({ include: ["products"] }) // Using custom getCart method from User model
    .then((cartProducts) => {
      if (!cartProducts) {
        return res.redirect("/cart");
      }
      products = cartProducts.products;
      total = 0;
      products.forEach((p) => {
        total += p.cartItem.quantity * p.price;
      });

      return stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: products.map((p) => ({
          name: p.title,
          description: p.description,
          amount: p.price * 100,
          currency: "usd",
          quantity: p.cartItem.quantity,
        })),
        success_url:
          req.protocol + "://" + req.get("host") + "/checkout/success",
        cancel_url: req.protocol + "://" + req.get("host") + "/checkout/cancel",
      });
    })
    .then((session) => {
      res.render("shop/checkout", {
        path: "/checkout",
        pageTitle: "Checkout",
        products: products,
        totalSum: total,
        sessionId: session.id,
      });
    })
    .catch((err) => {
      console.error("Error in getCheckout:", err);
      const error = new Error("Failed to process checkout");
      error.statusCode = 500;
      return next(error);
    });
};

exports.getCheckoutSuccess = (req, res, next) => {
  let products;

  req.user
    .getCart({ include: ["products"] }) // Using custom getCart method from User model
    .then((cartProducts) => {
      if (!cartProducts) {
        return res.redirect("/cart");
      }

      products = cartProducts.products;
      return Order.create({
        userId: req.user.id,
        products: products.map((p) => ({
          productId: p.id,
          quantity: p.cartItem.quantity,
        })),
      });
    })
    .then(() => {
      return req.user.clearCart(); // Using custom clearCart method from User model
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch((err) => {
      console.error("Error in getCheckoutSuccess:", err);
      const error = new Error("Failed to complete order");
      error.statusCode = 500;
      return next(error);
    });
};

exports.postOrder = (req, res, next) => {
  const user = req.user;
  let fetchedCart;
  let orderTotal = 0;

  user
    .getCart()
    .then((cart) => {
      if (!cart) {
        throw new Error("Cart not found");
      }
      fetchedCart = cart;
      return cart.getCartItems({ include: [Product] });
    })
    .then((cartItems) => {
      // Log cart items for debugging
      // console.log(
      //   "cart items log hogi:::::",
      //   JSON.stringify(cartItems, null, 2)
      // );

      if (!cartItems || cartItems.length === 0) {
        throw new Error("No items in the cart");
      }
      orderTotal = cartItems.reduce((sum, item) => {
        if (!item.Product || item.Product.price == null) {
          throw new Error(`Product not found for CartItem with ID ${item.id}`);
        }
        return sum + item.quantity * item.Product.price;
      }, 0);
      // console.log("order total pese dedo::::::", orderTotal);
      // ok chal reha
      return Order.create({
        userId: user.id,
        total: orderTotal,
      });
    })
    .then((order) => {
      //console.log("aha mera order hai:::", order);
      //ok report
      //console.log("fetched cart hai ehe:::::", fetchedCart);

      const orderItemPromises = fetchedCart.CartItems.map((item) => {
        return OrderItem.create({
          orderId: order.id,
          productId: item.Product.id,
          quantity: item.quantity,
          price: item.Product.price,
          cartId: fetchedCart.id,
        });
      });
      return Promise.all(orderItemPromises);
    })
    .then(() => {
      return CartItem.destroy({ where: { cartId: fetchedCart.id } }); // Delete all CartItems associated with this cart
    })
    .then(() => {
      // Clear the association in the Cart model
      return fetchedCart.setCartItems([]);
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch((err) => {
      console.error("Error in postOrder:", err);
      let errorMessage = "Failed to create order";
      if (err.name === "SequelizeValidationError") {
        errorMessage = "Error clearing cart items";
      }
      const error = new Error(errorMessage);
      error.statusCode = 500;
      next(error);
    });
};

exports.getOrders = (req, res, next) => {
  Order.findAll({
    where: { userId: req.user.id },
    include: [
      {
        model: Product,
        through: {
          model: OrderItem,
          attributes: ["quantity", "price"], // Include OrderItem attributes if needed
        },
      },
    ], // Corrected to use an array of include objects
  }) // Used Sequelize's findAll with include
    .then((orders) => {
      //console.log("Orders retrieved:", orders); //working
      if (!orders) {
        orders = []; // Ensure orders is an empty array if no orders are found
      }
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders,
      });
    })
    .catch((err) => {
      console.error("Error in getOrders:", err);
      const error = new Error("Failed to fetch orders");
      error.statusCode = 500;
      return next(error);
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findByPk(orderId, {
    include: [
      {
        model: Product,
        through: OrderItem,
      },
    ],
  })
    .then((order) => {
      //console.log("yeh mera order hai::::::", order);
      if (!order) {
        return next(new Error("No order found."));
      }
      if (order.userId.toString() !== req.user.id.toString()) {
        return next(new Error("Unauthorized"));
      }

      const invoiceName = "invoice-" + orderId + ".pdf";
      const invoicePath = path.join("data", "invoices", invoiceName);

      const pdfDoc = new PDFDocument();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'inline; filename="' + invoiceName + '"'
      );
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text("Invoice", {
        underline: true,
      });
      pdfDoc.text("----------------------------------------------------");
      pdfDoc.fontSize(14).text(`Order ID: ${orderId}`);
      pdfDoc.text(`Date: ${new Date().toLocaleDateString()}`);
      pdfDoc.text(`Customer: ${req.user.email}`);
      pdfDoc.text("----------------------------------------------------");
      let totalPrice = 0;

      order.Products.forEach((prod) => {
        totalPrice += prod.OrderItem.quantity * prod.price;
        pdfDoc
          .fontSize(14)
          .text(`${prod.title} - ${prod.OrderItem.quantity} x $${prod.price}`);
      });
      pdfDoc.text("----------------------------------------------------");
      pdfDoc.fontSize(20).text(`Total Price: $${totalPrice}`);
      pdfDoc.text("----------------------------------------------------");
      pdfDoc.fontSize(14).text("Thank you for your purchase!");

      pdfDoc.end();
    })
    .catch((err) => next(err));
};
