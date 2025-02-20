var mongoose = require('mongoose')



var config_Item_Schema = require('../Schema/itemSchema')



const item = mongoose.model('item', config_Item_Schema.item, 'item')

module.exports = {
    item
}