import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import routes from './routes/indexRoute.js';
import Product from './models/ProductModel.js';
import { computeTfIdfVector } from './services/productService.js';

const app = express();
const port = process.env.PORT || 8080;

app.use(cors({
    origin: 'http://localhost:3000', // URL frontend
    credentials: true
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));
app.use(cookieParser());
app.use(bodyParser.json());


routes(app);

app.get('/', (req, res) => {
    return res.send('Hello World!');
});

mongoose.connect(`${process.env.MONGOOSE_DB}`)
    .then(() => {
        console.log('Connected to MongoDB succeesfully');
    })
    .catch((error) => {
        console.log(error);
    });
// const updateExistingProducts = async () => {
//     const products = await Product.find().lean();
//     for (const product of products) {
//         const text = `${product.name} ${product.description || ''}`.toLowerCase();
//         const allOtherProducts = await Product.find({ _id: { $ne: product._id } }).lean();
//         const tfidfVector = await computeTfIdfVector(text, allOtherProducts);
//         await Product.updateOne({ _id: product._id }, { tfidfVector });
//     }
//     console.log("Updated TF-IDF vectors for existing products");
// };
// updateExistingProducts()
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
