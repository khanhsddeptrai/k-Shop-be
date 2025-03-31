import roleService from "../services/roleService.js";

const getAllRole = async (req, res) => {
    try {
        const respone = await roleService.getAll();
        return res.status(200).json(respone)
    } catch (error) {
        return res.status(404).json({
            message: error
        })
    }
}

const updateRole = async (req, res) => {
    try {
        const roleId = req.params.id;
        const data = req.body;
        if (!roleId) {
            return res.status(200).json({
                status: "ERR",
                message: "Không tìm thấy nhóm người dùng này"
            })
        }
        const respone = await roleService.update(roleId, data)
        return res.status(200).json({
            status: respone.status,
            message: respone.message,
            data: respone.data
        })
    } catch (error) {
        return res.status(404).json({
            message: error
        })
    }
}


export default {
    getAllRole, updateRole
};