const mongoose = require("mongoose");
const Schema   = mongoose.Schema;

const photoSchema = new Schema({
	URL: String,
	owner: String,
	date: String,
}, {
	timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

const Photo = mongoose.model("Photo", photoSchema);
module.exports = Photo;