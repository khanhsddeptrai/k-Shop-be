import { createNewUser, loginUser } from "../services/userService.js";

const createUser = async (req, res) => {
    try {
        const { name, email, password, confirmPassword, phone } = req.body;
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const checkEmail = emailRegex.test(email);

        if (!name || !email || !password || !confirmPassword || !phone) {
            return res.status(200).json({
                status: "ERR",
                message: "Vui lòng nhập đầy đủ thông tin"
            })
        } else if (!checkEmail) {
            return res.status(200).json({
                status: "ERR",
                message: "Email không hợp lệ"
            })
        } else if (password !== confirmPassword) {
            return res.status(200).json({
                status: "ERR",
                message: "Mật khẩu không khớp"
            })
        }

        const data = await createNewUser(req.body);
        return res.status(200).json(data)

    } catch (error) {
        return res.status(404).json({
            message: error
        })
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const checkEmail = emailRegex.test(email);

        if (!email || !password) {
            return res.status(200).json({
                status: "ERR",
                message: "Vui lòng nhập đầy đủ thông tin"
            })
        } else if (!checkEmail) {
            return res.status(200).json({
                status: "ERR",
                message: "Email không hợp lệ"
            })
        }

        const respone = await loginUser(req.body);
        return res.status(200).json(respone)

    } catch (error) {
        return res.status(404).json({
            message: error
        })
    }
}

export default { createUser, login };