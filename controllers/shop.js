const fs = require("fs");
const path = require("path");
const stripe = require("stripe")("sk_test_Flc1Upp19T0q8ZgmKGDVJUI400j9emUSTr");
const PDFDocument = require("pdfkit");

const Product = require("../models/product");
const Order = require("../models/order");
const User = require("../models/user"); // Added User model import
const { Op } = require("sequelize"); // Added Sequelize Op import
const ITEMS_PER_PAGE = 3;

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

exports.getCart = (req, res, next) => {
  req.user
    .getCart() // Using custom getCart method from User model
    .then((products) => {
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  let fetchedCart;
  req.user
    .getCart() // Using custom getCart method from User model
    .then((cart) => {
      fetchedCart = cart;
      return Product.findByPk(prodId); // Changed findById() to findByPk()
    })
    .then((product) => {
      return req.user.addToCart(product); // Using custom addToCart method from User model
    })
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err);
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
    .getCart() // Using custom getCart method from User model
    .then((cartProducts) => {
      products = cartProducts;
      total = 0;
      products.forEach((p) => {
        total += p.cartItem.quantity * p.price;
      });

      return stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: products.map((p) => {
          return {
            name: p.title,
            description: p.description,
            amount: p.price * 100,
            currency: "usd",
            quantity: p.cartItem.quantity,
          };
        }),
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
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCheckoutSuccess = (req, res, next) => {
  req.user
    .getCart() // Using custom getCart method from User model
    .then((products) => {
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
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postOrder = (req, res, next) => {
  req.user
    .getCart() // Using custom getCart method from User model
    .then((products) => {
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
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getOrders = (req, res, next) => {
  Order.findAll({ where: { userId: req.user.id }, include: ["products"] }) // Used Sequelize's findAll with include
    .then((orders) => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findByPk(orderId, { include: ["products"] })
    .then((order) => {
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
      order.products.forEach((prod) => {
        totalPrice += prod.orderItem.quantity * prod.price;
        pdfDoc
          .fontSize(14)
          .text(`${prod.title} - ${prod.orderItem.quantity} x $${prod.price}`);
      });
      pdfDoc.text("----------------------------------------------------");
      pdfDoc.fontSize(20).text(`Total Price: $${totalPrice.toFixed(2)}`);
      pdfDoc.text("----------------------------------------------------");
      pdfDoc.fontSize(14).text("Thank you for your purchase!");

      pdfDoc.end();
    })
    .catch((err) => next(err));
};
