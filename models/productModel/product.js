import mongoose from 'mongoose';
import config from 'config-lite';
import Common from '../../utils/common.js';

import productData from '../../dataInit/productData';
import proAttrData from '../../dataInit/proAttrData';
import proAttrValData from '../../dataInit/proAttrValData';

const Schema = new mongoose.Schema({
    uuid: { type: String, default: "", required: [true, "uuid 是必须的"] },
    pro_name: String,
    pro_price: Number, //现价
    pro_orgprice: Number, //原价
    pro_stoce: Number, //库存
    pro_sale: Number, //已出售多少
    pro_freight: Number, //邮费
    pro_ico: String,
    pro_img: String,
    pro_imginfo: { type: Array, default: [] },
    pro_videourl: String,
    pro_info: { type: Array, default: [] },
    deleted: { type: Number, default: config.deleted.nodel },
    created_at: { type: Date, default: Date.now() }
});
const Product = mongoose.model("Products", Schema);
Product.findOne((err, data) => {
    if (!data) {
        productData.forEach(item => {
            item.uuid = Common.GUID();
            Product.create(item);
        })
    }
});


const AttrAchema = new mongoose.Schema({
    uuid: { type: String, default: "", required: [true, "uuid 是必须的"] },
    attr_name: String,
    deleted: { type: Number, default: config.deleted.nodel },
    created_at: { type: Date, default: Date.now() }
});
const Attr_D = mongoose.model("Productattrs", AttrAchema);
Attr_D.findOne((err, data) => {
    if (!data) {
        proAttrData.forEach(item => {
            item.uuid = Common.GUID();
            Attr_D.create(item);
        });
    }
});

const AttrVaule = new mongoose.Schema({
    uuid: { type: String, default: "", required: [true, "uuid 是必须的"] },
    pro_uuid: String,
    attr_uuid: String,
    attr_obj: Object,
    deleted: { type: Number, default: config.deleted.nodel },
    created_at: { type: Date, default: Date.now() }
});
const AttrVal = mongoose.model("Attrvaules", AttrVaule);
AttrVal.findOne((err, data) => {
    if (!data) {
        proAttrValData.forEach(item => {
            item.uuid = Common.GUID();
            AttrVal.create(item);
        });
    }
});

export { Product, Attr_D, AttrVal };