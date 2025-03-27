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
                console.log(user)
                const access_token = await genneralAccessToken({
                    id: user.id,
                    role: user.role.name
                });
                resolve({
                    status: "ok",
                    message: "success",
                    access_token: access_token
                })
            });

        } catch (error) {
            reject(error)
        }
    })
    // try {
    //     const user = await new Promise((resolve, reject) => {
    //         jwt.verify(token, process.env.REFRESH_TOKEN, (err, decoded) => {
    //             if (err) reject(err);
    //             else resolve(decoded);
    //         });
    //     });

    //     const { payload } = user;
    //     const access_token = await genneralAccessToken({
    //         id: payload.id,
    //         role: payload.role.name
    //     });
    //     console.log("accesstoken: ", access_token);
    //     return {
    //         status: "Thành công",
    //         message: "ok",
    //         access_token: access_token
    //     };
    // } catch (error) {
    //     console.log(error);
    // }
};