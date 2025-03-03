import User from '../models/UserModel.js';
import bcrypt from 'bcrypt';

const createNewUser = async (inputUser) => {
    const { name, email, password, confirmPassword, phone } = inputUser;
    try {
        const checkUserExist = await User.findOne({ email });
        if (checkUserExist !== null) {
            return {
                status: "ERR",
                message: "Email đã tồn tại"
            }
        }
        const hash = bcrypt.hashSync(password, 10);

        const newUser = await User.create({
            name,
            email,
            password: hash,
            phone
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
        const checkUser = await User.findOne({ email: email });
        if (checkUser === null) {
            return {
                status: "ERR",
                message: "Không tìm thấy người dùng"
            }
        }
        const comparePassword = bcrypt.compareSync(password, checkUser.password);
        console.log(comparePassword);
        if (!comparePassword) {
            return {
                status: "failed",
                message: "Email hoặc mật khẩu không đúng"
            }

        } else {
            return {
                status: "success",
                message: "Đăng nhập thành công",
                data: checkUser
            }
        }

    } catch (error) {
        console.log(error);
    }
}


export { createNewUser, loginUser };