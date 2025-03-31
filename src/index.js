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


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
