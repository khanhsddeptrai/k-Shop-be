import userRouter from "./userRoute.js";
import productRouter from './productRoute.js'
import categoryRouter from './categoryRoute.js'
import roleRouter from './roleRoute.js'
import stockImportRouter from './stockImportRoute.js'
import orderRoute from './orderRoute.js'
import voucherRoute from './voucherRoute.js'

const routes = (app) => {
    app.use('/api/user', userRouter);
    app.use('/api/product', productRouter);
    app.use('/api/category', categoryRouter);
    app.use('/api/role', roleRouter);
    app.use('/api/stock-import', stockImportRouter);
    app.use('/api/order', orderRoute);
    app.use('/api/voucher', voucherRoute);
}

export default routes;