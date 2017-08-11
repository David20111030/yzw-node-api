import mongoose from 'mongoose';
import config from 'config-lite';

const integralScema = new mongoose.Schema({
    uuid:{type:String,required: [true, "uuid 是必须的"]},
    customer_uuid:String,
    count:Number,
    desc:String,
    deleted: { type: Number, default: config.deleted.nodel },
	created_at: { type: Date, default: Date.now() }
});

const integralModel = mongoose.model('Integrals',integralScema);

export default integralModel;