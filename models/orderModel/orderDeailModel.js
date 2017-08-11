import mongoose from 'mongoose';
import config from 'config-lite';

const orderDeailSchema = new mongoose.Schema({
    uuid: { type: String, required: [true, "uuid 不能为空"] },
    order_code: String, //订单表的 code
    customer_uuid: String,
    pro_uuid:String, //产品 uuid
    pro_name:String, //产品标题
    pro_icon:String, //产品小图标
    price: Number, //价格 不包含运费
    count:Number,
    specifications: { type: Array, default: [] }, //规格
    payment: Number, // 应支付金额 包含邮费 (count*price)+(freight*count)
    freight: Number, //邮费 数量*单件邮费
    deleted: { type: Number, default: config.deleted.nodel },
    created_at: { type: Date, default: Date.now() }
});

const orderDeailModel = mongoose.model('orderdeail', orderDeailSchema);

export default orderDeailModel;