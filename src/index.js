const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

app.get('/', (req, res) => {
    return res.send('Hello World!');
});

mongoose.connect(`mongodb+srv://ndkhanh2101362:${process.env.MONGOOSE_DB}@k-shop.jr0oq.mongodb.net/`)
    .then(() => {
        console.log('Connected to MongoDB succeesfully');
    })
    .catch((error) => {
        console.log(error);
    });


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
