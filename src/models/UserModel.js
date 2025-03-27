import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        phone: {
            type: String
        },
        role: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Role',

        },
        avatar: {
            type: String
        },
        access_token: {
            type: String,

        },
        refresh_token: {
            type: String,

        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model('User', UserSchema);
export default User;