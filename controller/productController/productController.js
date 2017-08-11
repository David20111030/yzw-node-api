import config from 'config-lite';
import Common from '../../utils/common';

import { AttrVal, Product } from '../../models/productModel/product';

class Products {

    /**
     * 获取产品详情
     */
    async getProductInfo(req, res, next) {
        try {
            //data 是一个JSON字符串
            const data = req.query.data;
            let { proid } = JSON.parse(data);
            if (proid) {
                const ProductInfo = await Product.findOne({ uuid: proid, deleted: config.deleted.nodel });
                res.send(req.app.locals.ReturnData(ProductInfo));
            }
            else {
                res.send(req.app.locals.ReturnData('', 1, '参数错误'));
            }
        } catch (error) {
            console.log('获取产品详情失败', error);
            res.send(req.app.locals.ReturnData('', 1, '获取产品详情失败' + error));
        }
    }

    /**
     * 获取产品选择属性
     */
    async getProductAttr(req, res, next) {
        try {
            //data 是一个JSON字符串
            const data = req.query.data;

            let { proid } = JSON.parse(data);
            if (proid) {
                const ProductAttr = await AttrVal.find({ pro_uuid: proid, deleted: config.deleted.nodel });
                res.send(req.app.locals.ReturnData(ProductAttr));
            }
            else {
                res.send(req.app.locals.ReturnData('', 1, '参数错误'));
            }
        } catch (error) {
            console.log('获取产品属性失败', error);
            res.send(req.app.locals.ReturnData('', 1, '获取产品属性失败' + error));
        }
    }

    /**
     * 获取产品列表 分页
     */
    async getProductList(req, res, next) {
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

    /**
     * 获取新品列表 分页
     */
    async getProductNewList(req, res, next) {
        try {
            //data 是一个JSON字符串
            const data = req.query.data;            

            let { page_index } = JSON.parse(data);
            let dateTime = new Date();

            if (!page_index || !Number(page_index)) {
                page_index = 1;
            }
            const ProductCount = await Product.find({ deleted: config.deleted.nodel }).count();
            const PageAll = Math.ceil(ProductCount / config.pageDocument);

            let ProductList = null;
            if (page_index <= PageAll) {
                ProductList = await Product.find({
                    deleted: config.deleted.nodel, created_at: {
                        $gte: new Date(dateTime.setDate(dateTime.getDay() - config.newRurnDay)).toISOString()
                    }
                }).sort({ 'created_at': -1 }).skip(Common.skipNumber(parseInt(page_index))).limit(config.pageDocument);
            }

            const PruductJson = {
                pagecount: PageAll, //总页数
                pageindex: parseInt(page_index), //当前页
                data: ProductList //当前页的数据
            }

            res.send(req.app.locals.ReturnData(PruductJson));

        } catch (error) {
            console.log('获取新产品列表失败', error);
            res.send(req.app.locals.ReturnData('', 1, '获取新产品列表失败' + error));
        }
    }

}

export default new Products();