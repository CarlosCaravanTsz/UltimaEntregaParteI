import { Router} from "express";
import ProductManager from "../dao/manager/product.manager.js";
import productModel from '../dao/models/product.model.js'


const router = Router();
const productManager = new ProductManager();


// Landing Page OK
router.get('/', (req, res) => {
    res.render('index', {});
});

// Products Catalog OK
router.get('/products', async (req, res) => {
    const page = parseInt(req.query?.page || 1);
    const limit = parseInt(req.query?.limit || 10);
    const pre_query = {
        name: req.query?.name ,
        code: req.query?.code ,
        stock: req.query?.stock ? {$gt: 0} : 0,
        category: req.query?.category,
        price: req.query?.price,
    };
  
    const query = {};

    for (let key in pre_query) {
        if (pre_query[key]) query[key] = pre_query[key];
    };

    const result = await productModel.paginate(query, {
      page,
      limit,
      sort: req.query?.order == "on" ? { price: -1 } : { price: 1 },
      lean: true,
    });

    result.prevLink = result.hasPrevPage
      ? `/products?page=${result.prevPage}&limit=${limit}`
      : "";

    result.nextLink = result.hasNextPage
      ? `/products?page=${result.nextPage}&limit=${limit}`
    : "";
  

    //res.render("products_catalog", { products });
    res.render("products_catalog", result);
});


// Edit Product Catalog OK
router.get('/edit-products', async (req, res) => {
    const products = await productModel.find().lean();
    res.render('edit_products', { products })
});



export default router
