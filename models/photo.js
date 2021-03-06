const mongoose = require("mongoose");
const Schema   = mongoose.Schema;

const photoSchema = new Schema({
	imgName: String,
	imgPath: String,
	owner: Schema.Types.ObjectId,
	caption: String,
	avatar: Boolean
}, {
	timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

const Photo = mongoose.model("Photo", photoSchema);
module.exports = Photo;