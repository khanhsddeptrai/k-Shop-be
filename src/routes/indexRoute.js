import userRouter from "./userRoute.js";
import productRouter from './productRoute.js'
import categoryRouter from './categoryRoute.js'

const routes = (app) => {
    app.use('/api/user', userRouter);
    app.use('/api/product', productRouter);
    app.use('/api/category', categoryRouter);
}

export default routes;