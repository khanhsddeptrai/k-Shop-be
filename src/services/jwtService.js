import jwt from 'jsonwebtoken';

export const genneralAccessToken = (payload) => {
    // console.log("payload", payload);
    const accessToken = jwt.sign({ ...payload }, process.env.ACCESS_TOKEN, { expiresIn: '3600s' });
    return accessToken;
}

export const genneralRefreshToken = (payload) => {
    // console.log("payload", payload);
    const refresh_token = jwt.sign({ ...payload }, process.env.REFRESH_TOKEN, { expiresIn: '365d' });
    return refresh_token;
}

export const refreshTokenJwtService = (token) => {
    return new Promise(async (resolve, reject) => {
        try {
            jwt.verify(token, process.env.REFRESH_TOKEN, async (err, user) => {
                if (err)
                    resolve({
                        status: "ERROR",
                        message: 'The authentication'
                    })
                const access_token = await genneralAccessToken({
                    id: user.id,
                    role: user.role
                });
                resolve({
                    status: "success",
                    message: "success",
                    access_token: access_token
                })
            });

        } catch (error) {
            reject(error)
        }
    })
};