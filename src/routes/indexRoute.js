import userRouter from "./userRoute.js";
import productRouter from './productRoute.js'
import categoryRouter from './categoryRoute.js'
import roleRouter from './roleRoute.js'

const routes = (app) => {
    app.use('/api/user', userRouter);
    app.use('/api/product', productRouter);
    app.use('/api/category', categoryRouter);
    app.use('/api/role', roleRouter);
}

export default routes;