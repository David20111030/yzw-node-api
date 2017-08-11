import mongoose from 'mongoose';
import config from 'config-lite';

const smsSchema = new mongoose.Schema({
    uuid: { type: String, default: "", required: [true, "uuid 是必须的"] },
    phone:Number,
    code:Number,
    invalidtime:{ type: Date, required: [true, "uuid 是必须的"]},
    deleted: { type: Number, default: config.deleted.nodel },
	created_at: { type: Date, default: Date.now() }
});

const Sms = mongoose.model('smscodes',smsSchema);

export default Sms;