import mongoose from 'mongoose';
import config from 'config-lite';

const consumeSchema = new mongoose.Schema({
    uuid:{type:String,required:[true,"uuid 是必须的"]},
    customer_uuid:String,
    count:Number,
    order_code:String,
    deleted: { type: Number, default: config.deleted.nodel },
	created_at: { type: Date, default: Date.now() }
});

const integralConsumeModel = mongoose.model('Integralconsumes',consumeSchema);

export default integralConsumeModel;