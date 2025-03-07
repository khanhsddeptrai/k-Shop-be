import User from '../models/UserModel.js';
import Role from '../models/RoleModel.js';
import bcrypt from 'bcrypt';

import { genneralAccessToken } from './jwtService.js';

const createUser = async (inputUser) => {
    const { name, email, password, confirmPassword, phone } = inputUser;
    try {
        const checkUserExist = await User.findOne({ email });
        if (checkUserExist !== null) {
            return {
                status: "ERR",
                message: "Email đã tồn tại"
            }
        }

        const userRole = await Role.findOne({ name: 'user' });
        if (!userRole) {
            return {
                status: "ERR",
                message: "Role 'user' không tồn tại trong hệ thống"
            };
        }

        const hash = bcrypt.hashSync(password, 10);

        const newUser = await User.create({
            name,
            email,
            password: hash,
            phone,
            role: userRole._id
        });

        if (newUser) {
            return {
                status: "OK",
                message: "Tạo tài khoản thành công",
                data: newUser
            }
        }

    } catch (error) {
        console.log(error);
    }
}

const loginUser = async (inputUser) => {
    const { email, password } = inputUser;
    try {
        const checkUser = await User.findOne({ email: email }).populate('role');
        if (checkUser === null) {
            return {
                status: "ERR",
                message: "Không tìm thấy người dùng"
            }
        }
        const comparePassword = bcrypt.compareSync(password, checkUser.password);

        if (!comparePassword) {
            return {
                status: "failed",
                message: "Email hoặc mật khẩu không đúng"
            }

        }
        const access_token = await genneralAccessToken({
            id: checkUser.id,
            role: checkUser.role.name
        })
        console.log("access_token", access_token);
        return {
            status: "success",
            message: "Đăng nhập thành công",
            access_token: access_token
        }

    } catch (error) {
        console.log(error);
    }
}

const updateUser = async (id, dataUser) => {
    try {
        const checkUser = await User.findOne({
            _id: id
        })
        if (checkUser === null) {
            return {
                status: "Lỗi",
                message: "Không tìm thấy người dùng",
            }
        }

        const updatedUser = await User.findByIdAndUpdate(id, dataUser, { new: true })
        console.log("updateed user: ", updatedUser)

        return {
            status: "Thành công",
            message: "Cập nhật thông tin người dùng thành công",
            data: updatedUser
        }

    } catch (error) {
        console.log(error);
    }
}

const deleteAUser = async (id, dataUser) => {
    try {
        const checkUser = await User.findOne({
            _id: id
        })
        if (checkUser === null) {
            return {
                status: "Lỗi",
                message: "Không tìm thấy người dùng",
            }
        }
        await User.findByIdAndDelete(id)
        return {
            status: "Thành công",
            message: "Xóa người dùng thành công",
        }

    } catch (error) {
        console.log(error);
    }
}

const getAll = async () => {
    try {
        const listUser = await User.find();
        if (listUser === null) {
            return {
                status: "ERR",
                message: "Không có người dùng"
            };
        }
        return {
            status: "Thành công!",
            message: "Lấy danh sách người dùng thành công",
            data: listUser
        }
    } catch (error) {
        console.log(error);
    }
}

const getDetail = async (id) => {
    try {
        const user = await User.findOne({
            _id: id
        })
        if (user === null) {
            return {
                status: "Lỗi",
                message: "Không tìm thấy người dùng",
            }
        }
        return {
            status: "Thành công",
            message: "Lấy thông tin người dùng thành công",
            data: user
        }

    } catch (error) {
        console.log(error);
    }
}

export default { createUser, loginUser, updateUser, deleteAUser, getAll, getDetail };