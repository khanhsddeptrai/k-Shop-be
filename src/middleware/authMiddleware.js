import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    let token = req.headers.token;
    if (!token || !token.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "No token provided or invalid format",
            status: "error"
        });
    }
    token = req.headers.token.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, user) {
        if (err) {
            return res.status(404).json({
                message: "The authentication",
                status: "error"
            })
        }
        const { payload } = user
        console.log(payload)
        if (payload.role === "admin") {
            next()
        } else {
            return res.status(404).json({
                message: "The authentication",
                status: "error"
            })
        }
    })
}

const authUserMiddleware = (req, res, next) => {
    let token = req.headers.token;
    if (!token || !token.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "No token provided or invalid format",
            status: "error"
        });
    }
    token = req.headers.token.split(" ")[1];
    const userId = req.params.id
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, user) {
        if (err) {
            return res.status(404).json({
                message: "The authentication",
                status: "error"
            })
        }
        const { payload } = user
        console.log(payload)
        if (payload?.role === "admin" || payload?.id === userId) {
            next()
        } else {
            return res.status(404).json({
                message: "The authentication",
                status: "error"
            })
        }
    })
}


export { authMiddleware, authUserMiddleware }