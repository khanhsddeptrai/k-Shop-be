import jwt from 'jsonwebtoken';

export const genneralAccessToken = (payload) => {
    console.log("payload", payload);
    const accessToken = jwt.sign({ payload }, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
    return accessToken;
}

export const genneralRefreshToken = (payload) => {
    console.log("payload", payload);
    const refresh_token = jwt.sign({ payload }, process.env.REFRESH_TOKEN, { expiresIn: '365d' });
    return refresh_token;
}
