import mongoose from 'mongoose';
import config from 'config-lite';

const addressSchema = new mongoose.Schema({
    uuid: { type: String, required: [true, "uuid 不能为空"] },
    customer_uuid: String,
    name:String,
    phone:Number,
    province_code: String,
    city_code: String,
    region_code: String,
    desc_address: String,
    deleted: { type: Number, default: config.deleted.nodel },
    created_at: { type: Date, default: Date.now() }
});

const addressModel = mongoose.model('Address', addressSchema);

export default addressModel;