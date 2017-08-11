import mongoose from 'mongoose';
import config from 'config-lite';

const orderSchema = new mongoose.Schema({
    uuid: { type: String, required: [true, "uuid 不能为空"] },
    code: String,
    customer_uuid: String,
    state: String,
    price: Number, //总计 不包含邮费
    integral: Number, //积分
    payment: Number, // 实际支付 包含邮费
    freight: Number, //邮费
    name: String,
    phone: Number,
    address: String,
    logisticscode: { type: String, default: "" }, //物流编号
    logisticsname: { type: String, default: "" }, //物流名称
    logistics_nnc: { type: String, default: "" }, //物流接口查询码
    paytype: { type: String, default: config.payType.weixin }, //支付方式 默认是微信支付
    paycode: { type: String, default: "" }, //支付成功后 第三方的Code
    deleted: { type: Number, default: config.deleted.nodel },
    created_at: { type: Date, default: Date.now() }
});

const orderModel = mongoose.model('order', orderSchema);

export default orderModel;