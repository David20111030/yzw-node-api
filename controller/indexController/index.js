import config from 'config-lite';
import Common from '../../utils/common';
import bannerModel from '../../models/commModel/banner';
import { Product } from '../../models/productModel/product';


class Index {
    constructor() {
        this.getBanner = this.getBanner.bind(this);
        this.getIndexProductList = this.getIndexProductList.bind(this);
    }

    /**
     * 获取首页banner
     */
    async getBanner(req, res, next) {
        try {
            const bannerList = await bannerModel.find({ deleted: config.deleted.nodel, type: config.bannerType.indexBanner });

            res.send(req.app.locals.ReturnData(bannerList));
        } catch (error) {
            console.log('获取首页banner失败', error);
            res.send(req.app.locals.ReturnData('', 1, '获取首页banner失败' + error));
        }
    }

    /**
     * 获取首页的产品列表
     */
    async getIndexProductList(req, res, next) {
        try {
            //data 是一个JSON字符串
            const data = req.query.data;
            
            let { page_index } = JSON.parse(data);
            if (!page_index || !Number(page_index)) {
                page_index = 1;
            }
            const ProductCount = await Product.find({ deleted: config.deleted.nodel }).count();
            const PageAll = Math.ceil(ProductCount / config.pageDocument);

            let ProductList = null;
            if (page_index <= PageAll) {
                ProductList = await Product.find({ deleted: config.deleted.nodel }).sort({ 'created_at': -1 }).skip(Common.skipNumber(parseInt(page_index))).limit(config.pageDocument);
            }


            const PruductJson = {
                pagecount: PageAll, //总页数
                pageindex: parseInt(page_index), //当前页
                data: ProductList //当前页的数据
            }

            res.send(req.app.locals.ReturnData(PruductJson));

        } catch (error) {
            console.log('获取产品列表失败', error);
            res.send(req.app.locals.ReturnData('', 1, '获取产品列表失败' + error));
        }
    }

}

export default new Index();