import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import routes from './routes/indexRoute.js';

const app = express();
const port = process.env.PORT || 8080;

app.use(cors({
    origin: 'http://localhost:3000',
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

// const reindexTfIdfVectors = async () => {
//     try {
//         const BATCH_SIZE = 100;
//         let skip = 0;
//         while (true) {
//             const allProducts = await Product.find().lean().skip(skip).limit(BATCH_SIZE);
//             if (!allProducts.length) break;

//             for (const product of allProducts) {
//                 const text = `${product.name} ${product.description || ''}`.toLowerCase();
//                 if (text.trim().length < 3) {
//                     console.warn(`Skipping product ${product.name}: text too short`);
//                     continue;
//                 }
//                 const otherProducts = allProducts.filter(p => p._id.toString() !== product._id.toString());
//                 const tfidfVector = await computeTfIdfVector(text, otherProducts);
//                 await Product.updateOne({ _id: product._id }, { tfidfVector });
//                 console.log(`Updated TF-IDF vector for product ${product.name}`);
//             }
//             skip += BATCH_SIZE;
//         }
//         console.log("Reindexed TF-IDF vectors for all products");
//     } catch (error) {
//         console.error("Error reindexing TF-IDF vectors:", error);
//     }
// };
// await reindexTfIdfVectors()

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
