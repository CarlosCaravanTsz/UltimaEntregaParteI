// Libraries and external sources
import express, { urlencoded } from 'express';
import handlebars from 'express-handlebars';
import { Server } from 'socket.io';
import mongoose from 'mongoose';

import cartRouter from "./router/cart.router.js";
import chatRouter from "./router/chat.router.js";
import viewsRouter from "./router/views.router.js";

import __dirname from "./utils.js";


import ProductManager from "./dao/manager/product.manager.js";
import productModel from './dao/models/product.model.js'

const PORT = process.env.PORT || 8080;
const app = express();

app.engine('handlebars', handlebars.engine());
app.set('views', __dirname + '/views');
app.set('view engine', 'handlebars');
app.use('/static', express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.use("/", viewsRouter);
app.use("/api/carts", cartRouter);
app.use("/chat", chatRouter);


const httpServer = app.listen(PORT, () =>
    console.log(`Listening on port ${PORT}...`)
);

const URL = "mongodb+srv://carloscara28:DnERG59KflAo9jen@carlosbackenddb.44mn6xw.mongodb.net/?retryWrites=true&w=majority";


function add_id(array) {
    return array.length ? array.length+1 : 1
}

mongoose
    .connect(URL, { dbName: "ecommerce" })
    .then(() => console.log("Connected to e-commerce DB..."))
    .then(() => {

        const io = new Server(httpServer);

        io.on("connection", (socket) => {
            socket.on("operation", async (data) => {

                const { operation } = data;
                delete data.operation;
            //console.log("PRODUCTO RECIBIDO TESTING: ", data);

                if (operation == "add") {

                    data.status = true;

                    let products = await productModel.find().lean();

                    data.id= add_id(products);

                    console.log('Product to create: ', data);
                    await productModel.create(data);

                    products = await productModel.find().lean();

                    socket.emit("reload-table", products);

                } else if (operation == "update") {

                    const filter = { id: data.id };
                    const obj = await productModel.findOneAndUpdate(filter, data);
                    console.log('UPDATED PRODUCT: ', obj);
                    const products = await productModel.find().lean();
                    socket.emit("reload-table", products);

                } else if (operation == "delete") {

                    const filter = { id: data.id };
                    const obj = await productModel.findOneAndDelete(
                      filter,
                      data
                    );
                    console.log("DELETED PRODUCT: ", obj);
                    const products = await productModel.find().lean();
                    socket.emit("reload-table", products);

                } else {
                    console.log({ status: "ERROR: Operacion no encontrada" });
                }
            });
        });

    });


