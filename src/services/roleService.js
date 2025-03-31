import Role from "../models/RoleModel.js";

const getAll = async () => {
    try {
        const roles = await Role.find()
        if (roles) {
            return {
                status: "success",
                message: "Lấy danh sách quyền thành công",
                data: roles
            };
        }
    } catch (error) {
        console.log(error);
    }
}


const update = async (id, data) => {
    try {
        const checkRole = await Role.findOne({
            _id: id
        })
        if (checkRole === null) {
            return {
                status: "ERR",
                message: "Không tìm thấy quyền này",
            }
        }
        const updatedRole = await Role.findByIdAndUpdate(id, data, { new: true })
        return {
            status: "success",
            message: "Cập nhật quyền thành công",
            data: updatedRole
        }
    } catch (error) {
        console.log(error);
    }
}

export default {
    update, getAll

};