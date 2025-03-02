import { createNewUser } from "../services/userService.js";

const createUser = async (req, res) => {
    try {
        console.log(req.body);
        const data = await createNewUser(req.body);
        return res.status(200).json(data)
    } catch (error) {
        return res.status(404).json({
            message: error
        })
    }
}

export default { createUser };