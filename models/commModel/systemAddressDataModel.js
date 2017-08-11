import mongoose from 'mongoose';
import config from 'config-lite';
import Common from '../../utils/common.js';
import systemAddress from '../../dataInit/systemAddressDta';

const addressDataSchema = new mongoose.Schema({
    uuid:{type:String,required:[true,"uuid 不要为空"]},
    code:String,
    parentcode:String,
    name:String,
    deleted: { type: Number, default: config.deleted.nodel },
    created_at: { type: Date, default: Date.now() }
});

const systemAddressData = mongoose.model('systemaddressdata',addressDataSchema);

systemAddressData.findOne((err,data)=>{
    if(!data){
        systemAddress.forEach(item=>{
            item.uuid = Common.GUID();
            systemAddressData.create(item);
        });
    }
});


export default systemAddressData;