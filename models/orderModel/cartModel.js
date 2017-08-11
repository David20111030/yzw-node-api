import mongoose from 'mongoose';
import config from 'config-lite';

const cartSchema = new mongoose.Schema({
    uuid: { type: String, required: [true, "uuid 不能为空"] },
    customer_uuid: String,
    pro_uuid: String,
    count: Number,
    specifications: { type: Array, default: [] }, //产品规格
    is_selected: { type: Boolean, default: true }, //是否选择
    is_order:{ type: Boolean, default: false }, //是否下单
    deleted: { type: Number, default: config.deleted.nodel },
    created_at: { type: Date, default: Date.now() }
});

const cartModel = mongoose.model('Cart', cartSchema);

export default cartModel;