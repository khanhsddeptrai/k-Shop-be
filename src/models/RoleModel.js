const mongoose = require('mongoose');

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
module.exports = Role;