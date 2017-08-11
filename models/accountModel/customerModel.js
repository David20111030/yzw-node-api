import mongoose from 'mongoose';
import config from 'config-lite';
import Common from '../../utils/common.js';

const CustomerSchema = new mongoose.Schema({
    uuid: { type: String, default: "", required: [true, "uuid 是必须的"] },
    phone: Number,
    password: String,
    nickname: { type: String, default: Common.randomName() },
    name: { type: String, default: '' },
    sex: { type: Number, default: 0 },
    photo: { type: String, default: '' },
    birthday: { type: String, default: '1990-01-02' },
    deleted: { type: Number, default: config.deleted.nodel },
    created_at: { type: Date, default: Date.now() }
});
const Customer = mongoose.model('Customers', CustomerSchema);

export default Customer;
