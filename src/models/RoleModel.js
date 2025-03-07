import mongoose from "mongoose";

const RoleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        description: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

const Role = mongoose.model('Role', RoleSchema);
export default Role;