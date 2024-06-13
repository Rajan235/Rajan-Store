const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
  });
};

exports.postAddProduct = (req, res, next) => {
  const { title, imageUrl, price, description } = req.body;
  const userId = req.user.id; // assuming req.user contains the user information
  Product.create({
    title,
    price,
    description,
    imageUrl,
    userId,
  })
    .then((result) => {
      console.log("Created Product");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
    });
};

// exports.postAddProduct = (req, res, next) => {
//   const title = req.body.title;
//   const imageUrl = req.body.imageUrl;
//   const price = req.body.price;
//   const description = req.body.description;
//   const product = new Product({
//     title: title,
//     price: price,
//     description: description,
//     imageUrl: imageUrl,
//     userId: req.user
//   });
//   product
//     .save()
//     .then(result => {
//       // console.log(result);
//       console.log('Created Product');
//       res.redirect('/admin/products');
//     })
//     .catch(err => {
//       console.log(err);
//     });
// };

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;

  Product.findByPk(prodId)
    .then((product) => {
      if (!product) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product,
      });
    })
    .catch((err) => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;
  // const { productId, title, price, imageUrl, description } = req.body;
  Product.findByPk(prodId)
    .then((product) => {
      if (!product) {
        return res.redirect("/admin/products");
      }
      if (product.userId.toString() !== req.user.id.toString()) {
        return res.redirect("/"); // Ensure that the user can only edit their own products
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      product.imageUrl = updatedImageUrl;
      return product.save().then((result) => {
        console.log("UPDATED PRODUCT!");
        res.redirect("/admin/products");
      });
    })

    .catch((err) => console.log(err));
};

exports.getProducts = (req, res, next) => {
  Product.findAll({ where: { userId: req.user.id } })
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
      });
    })
    .catch((err) => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.destroy({ where: { id: prodId, userId: req.user.id } }) // Ensure that the user can only delete their own products
    .then(() => {
      console.log("DESTROYED PRODUCT");
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err));
};
