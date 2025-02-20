var mongoose = require('mongoose')


var Schema = new mongoose.Schema()
Schema.item = {
   itemName: { type: String },
   item_id: { type: Number },
    subCategoryName: { type: Number },
    itemStock: { type: Number },
    itemLimitLevel: { type: Number },
    itemPrice: { type: Number },
    sortNo: { type: Number },
    approvalStatus: { type: Boolean },
    isOffer: { type: Boolean },
    tax: { type: Number },
    itemCartLimit: { type: Number },
    itemStatus: { type: Boolean, default: true },
    itemImage: { type: String }, // Store file path
}
module.exports = Schema