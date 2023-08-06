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
    const queryParams = req.query?.query || '';
    const query = {};
    if (queryParams) {
        const field = queryParams.split(',')[0];
        let value = queryParams.split(",")[1];

        if (!isNaN(parseInt(value))) value = parseInt(value)
        query[field] = value
    }
    
    console.log(query);

    if (query) {
        const products = await productModel.paginate(query, {
            page,
            limit,
            lean: true
        });
        console.log("products", products["docs"]);
        let pr = products['docs']
        res.render("products_catalog", { pr });
    } else {
        const products = await productModel.find().lean();
        console.log('products', products);
        res.render("products_catalog", { products });

    }

});


// Edit Product Catalog OK
router.get('/edit-products', async (req, res) => {
    const products = await productModel.find().lean();
    res.render('edit_products', { products })
});



export default router
