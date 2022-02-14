const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categories = mongoose.model(
    "categories",
    new Schema({
        title: { type: String},
        is_active: { type: Boolean, default: true },
        is_deleted: { type: Boolean, default: false },
    })
);

module.exports = categories;