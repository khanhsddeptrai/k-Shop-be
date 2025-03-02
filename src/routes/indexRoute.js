import router from "./userRoute.js";

const routes = (app) => {
    app.use('/api/user', router);
}

export default routes;