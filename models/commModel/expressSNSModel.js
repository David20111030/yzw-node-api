import mongoose from 'mongoose';
import config from 'config-lite';
import Common from '../../utils/common.js';
import expressSNS from '../../dataInit/expressSNSData';

const expressSNSSchema = new mongoose.Schema({
    uuid:{type:String,required:[true,"uuid 不要为空"]},
    courlername:String,
    code:String,
    deleted: { type: Number, default: config.deleted.nodel },
    created_at: { type: Date, default: Date.now() }
});

const expressSNSData = mongoose.model('expressSNSData',expressSNSSchema);

expressSNSData.findOne((err,data)=>{
    if(!data){
        expressSNS.forEach(item=>{
            item.uuid = Common.GUID();
            expressSNSData.create(item);
        });
    }
});


export default expressSNSData;