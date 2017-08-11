import mongoose from 'mongoose'
import config from 'config-lite';
import Common from '../../utils/common.js';

import bannerData from '../../dataInit/bannerData';

const Schema = mongoose.Schema;
const bannerSchema = new Schema({
	uuid: { type: String, default: "", required: [true, "uuid 是必须的"] },
	image_url: String,
	link_url: String,
	type: { type: Number, default: config.bannerType.indexBanner },
	deleted: { type: Number, default: config.deleted.nodel },
	created_at: { type: Date, default: Date.now() }
});

const Banner = mongoose.model('Banner', bannerSchema);

Banner.findOne((err, data) => {
	if (!data) {
		bannerData.forEach(item => {
			item.uuid = Common.GUID();
			Banner.create(item);
		})
	}
})

export default Banner