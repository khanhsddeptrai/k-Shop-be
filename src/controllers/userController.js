import userService from "../services/userService.js";
import { refreshTokenJwtService } from "../services/jwtService.js";

const create = async (req, res) => {
    try {
        const { name, email, password, confirmPassword, phone, avatar } = req.body;
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const checkEmail = emailRegex.test(email);

        if (!name || !email || !password || !confirmPassword || !phone) {
            return res.status(400).json({
                status: "ERR",
                message: "Vui lòng nhập đầy đủ thông tin"
            })
        } else if (!checkEmail) {
            return res.status(400).json({
                status: "ERR",
                message: "Email không hợp lệ"
            })
        } else if (password !== confirmPassword) {
            return res.status(400).json({
                status: "ERR",
                message: "Mật khẩu không khớp"
            })
        }

        const data = await userService.createUser(req.body);
        return res.status(201).json(data)

    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

const signup = async (req, res) => {
    try {
        const { email, password, confirmPassword } = req.body;
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const checkEmail = emailRegex.test(email);

        if (!email || !password || !confirmPassword) {
            return res.status(400).json({
                status: "ERR",
                message: "Vui lòng nhập đầy đủ thông tin"
            })
        } else if (!checkEmail) {
            return res.status(400).json({
                status: "ERR",
                message: "Email không hợp lệ"
            })
        } else if (password !== confirmPassword) {
            return res.status(400).json({
                status: "ERR",
                message: "Mật khẩu không khớp"
            })
        }
        const data = await userService.signupUser(req.body);
        return res.status(201).json(data)

    } catch (error) {
        return res.status(500).json({
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
            return res.status(400).json({
                status: "ERR",
                message: "Email không hợp lệ"
            })
        }

        const respone = await userService.loginUser(req.body);
        const { refresh_token, ...newRespone } = respone
        res.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict'
        })

        return res.status(200).json(newRespone)

    } catch (error) {
        return res.status(500).json({
            message: error
        })
    }
}

const update = async (req, res) => {
    try {
        const userId = req.params.id;
        const data = req.body;
        if (!userId) {
            return res.status(400).json({
                status: "Lỗi!",
                message: "Không tìm thấy thông tin người dùng"
            })
        }
        const respone = await userService.updateUser(userId, data)
        return res.status(200).json({
            status: respone.status,
            message: respone.message,
            data: respone.data
        })
    } catch (error) {
        return res.status(500).json({
            message: error
        })
    }
}

const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        if (!userId) {
            return res.status(400).json({
                status: "Lỗi!",
                message: "Không tìm thấy thông tin người dùng"
            })
        }
        const respone = await userService.deleteAUser(userId)
        return res.status(200).json({
            status: respone.status,
            message: respone.message,
        })
    } catch (error) {
        return res.status(500).json({
            message: error
        })
    }
}

const getAllUser = async (req, res) => {
    try {
        const respone = await userService.getAll()
        return res.status(200).json({
            status: respone.status,
            message: respone.message,
            data: respone.data
        })

    } catch (error) {
        return res.status(500).json({
            message: error
        })
    }
}

const getDetailUser = async (req, res) => {
    try {
        const userId = req.params.id;
        if (!userId) {
            return res.status(400).json({
                status: "Lỗi!",
                message: "Không tìm thấy thông tin người dùng"
            })
        }
        const respone = await userService.getDetail(userId)
        return res.status(200).json({
            status: respone.status,
            message: respone.message,
            data: respone.data
        })
    } catch (error) {
        return res.status(500).json({
            message: error
        })
    }
}

const refreshToken = async (req, res) => {
    // console.log("aaa")
    try {
        const token = req.cookies.refresh_token;
        if (!token) {
            return res.status(200).json({
                status: "Lỗi!",
                message: "The token is required"
            })
        }
        const respone = await refreshTokenJwtService(token)
        return res.status(200).json(respone)
    } catch (error) {
        return res.status(404).json({
            message: error
        })
    }
}

const logout = async (req, res) => {
    try {
        res.clearCookie('refresh_token');
        return res.status(200).json({
            status: "success",
            message: "Đăng xuất thành công"
        })
    } catch (error) {
        return res.status(404).json({
            message: error
        })
    }
}

export default {
    create, login, update, deleteUser, getAllUser, getDetailUser,
    refreshToken, signup, logout

};