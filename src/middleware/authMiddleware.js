import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    const token = req.headers.token.split(" ")[1]
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

export { authMiddleware }