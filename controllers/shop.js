const Product = require("../models/product");
const Order = require("../models/order");

exports.getProducts = (req, res, next) => {
  Product.findAll()
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
      });
    })
    .catch((err) => {
      console.error("Error fetching products:", err);
      res.status(500).render("error/500", {
        pageTitle: "Error",
        path: "/500",
        errorMessage: "Error fetching products.",
      });
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findByPk(prodId)
    .then((product) => {
      if (!product) {
        return res.status(404).render("error/404", {
          pageTitle: "Product Not Found",
          path: "/404",
          errorMessage: "Product not found.",
        });
      }
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
      });
    })
    .catch((err) => {
      console.error("Error fetching product details:", err);
      res.status(500).render("error/500", {
        pageTitle: "Error",
        path: "/500",
        errorMessage: "Error fetching product details.",
      });
    });
};

exports.getIndex = (req, res, next) => {
  Product.findAll()
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
      });
    })
    .catch((err) => {
      console.error("Error fetching products for index:", err);
      res.status(500).render("error/500", {
        pageTitle: "Error",
        path: "/500",
        errorMessage: "Error fetching products.",
      });
    });
};

// exports.getCart = (req, res, next) => {
//   req.user
//     .populate("cart.items.productId")
//     .execPopulate()
//     .then((user) => {
//       const products = user.cart.items;
//       res.render("shop/cart", {
//         path: "/cart",
//         pageTitle: "Your Cart",
//         products: products,
//       });
//     })
//     .catch((err) => console.log(err));
// };

exports.getCart = (req, res, next) => {
  req.user
    .getCart()
    .then((products) => {
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products,
      });
    })
    .catch((err) => {
      console.error("Error fetching cart:", err);
      res.status(500).render("error/500", {
        pageTitle: "Error",
        path: "/500",
        errorMessage: "Error fetching cart.",
      });
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findByPk(prodId)
    .then((product) => {
      if (!product) {
        req.flash("error", "Product not found.");
        return res.redirect("/products");
      }
      return req.user.addToCart(product);
    })
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => {
      console.error("Error adding product to cart:", err);
      res.status(500).render("error/500", {
        pageTitle: "Error",
        path: "/500",
        errorMessage: "Error adding product to cart.",
      });
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => {
      console.error("Error removing product from cart:", err);
      res.status(500).render("error/500", {
        pageTitle: "Error",
        path: "/500",
        errorMessage: "Error removing product from cart.",
      });
    });
};

exports.postOrder = (req, res, next) => {
  let fetchedCartProducts;
  req.user
    .getCart()
    .then((products) => {
      fetchedCartProducts = products;
      return Order.create({
        userId: req.user.id,
        userEmail: req.user.email,
        items: products.map((p) => ({
          productId: p.id,
          quantity: p.cartItem.quantity,
        })),
      });
    })
    .then(() => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch((err) => {
      console.error("Error creating order:", err);
      res.status(500).render("error/500", {
        pageTitle: "Error",
        path: "/500",
        errorMessage: "Error creating order.",
      });
    });
};

// exports.postOrder = (req, res, next) => {
//   req.user
//     .populate("cart.items.productId")
//     .execPopulate()
//     .then((user) => {
//       const products = user.cart.items.map((i) => {
//         return { quantity: i.quantity, product: { ...i.productId._doc } };
//       });
//       const order = new Order({
//         user: {
//           email: req.user.email,
//           userId: req.user,
//         },
//         products: products,
//       });
//       return order.save();
//     })
//     .then((result) => {
//       return req.user.clearCart();
//     })
//     .then(() => {
//       res.redirect("/orders");
//     })
//     .catch((err) => console.log(err));
// };

exports.getOrders = (req, res, next) => {
  Order.findAll({ where: { userId: req.user.id }, include: ["products"] })
    .then((orders) => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders,
      });
    })
    .catch((err) => {
      console.error("Error fetching orders:", err);
      res.status(500).render("error/500", {
        pageTitle: "Error",
        path: "/500",
        errorMessage: "Error fetching orders.",
      });
    });
};
