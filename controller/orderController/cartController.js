import config from 'config-lite';
import Common from '../../utils/common';

import cartModel from '../../models/orderModel/cartModel';
import { Product } from '../../models/productModel/product';

class Cart {

    constructor() {
        this.addCart = this.addCart.bind(this);
        this.selectedCart = this.selectedCart.bind(this);
        this.delCart = this.delCart.bind(this);
        this.cartList = this.cartList.bind(this);
    }

    /**
     * 加入购物车 POST
     */
    async addCart(req, res, next) {
        try {
            //specifications 数组类型 [{name:"颜色",vaule:"红色"}] {"customeruuid":"12ea1d90776311e7a245b74d37e9fab0","prouuid":"1bbe3f22773e11e7a3e7b379abfbee65","count":1,"specifications":[{"name":"颜色","vaule":"红色"}]}
            let { customeruuid, prouuid, count, specifications } = req.body.data;

            if (customeruuid && prouuid && count && specifications && Number(count) && specifications.constructor == Array) {
                //判断此商品客户是否已经加入购物车了
                
                let specifiArr = new Array();
                specifications.forEach(function (item) {
                    specifiArr.push({ "$elemMatch": item })
                });

                const cartPro = await cartModel.findOne({ deleted: config.deleted.nodel, customer_uuid: customeruuid, pro_uuid: prouuid, specifications: { "$all": specifiArr } });

                if (cartPro) {//说明已经存在此产品了
                    let newCount = cartPro.count + parseInt(count);

                    const updateCartCount = await cartModel.update({ uuid: cartPro.uuid }, {
                        $set: { count: newCount }
                    });
                    if (updateCartCount.ok == 1) {
                        res.send(req.app.locals.ReturnData('已加入购物车'));
                    }
                    else {
                        res.send(req.app.locals.ReturnData('', 1, '加入购物车失败'));
                    }
                }
                else {
                    //添加到购物车
                    const cartProData = {
                        uuid: Common.GUID(),
                        customer_uuid: customeruuid,
                        pro_uuid: prouuid,
                        count: count,
                        specifications: specifications
                    };
                    const addCartPro = await cartModel.create(cartProData);
                    if (addCartPro) {
                        res.send(req.app.locals.ReturnData('已加入购物车'));
                    }
                    else {
                        res.send(req.app.locals.ReturnData('', 1, '加入购物车失败'));
                    }
                }
            }
            else {
                res.send(req.app.locals.ReturnData('', 1, '参数错误'));
            }
        } catch (error) {
            console.log('加入购物车失败', error);
            res.send(req.app.locals.ReturnData('', 1, '加入购物车失败' + error));
        }
    }

    /**
     * 修改购物车选中或不选中
     */
    async selectedCart(req, res, next) {
        try {
            //如果cart_uuid 可以为空 ，customeruuid 必须有值 cart_uuid为空代表跟户用户uuid全部操作 isselected是bool类型
            const { cart_uuid, isselected, customeruuid } = req.body.data;

            if (cart_uuid && typeof (isselected) == "boolean") {
                const updateCartselected = await cartModel.update({ uuid: cart_uuid }, {
                    $set: { is_selected: isselected }
                });
                if (updateCartselected.ok == 1) {
                    const returnDataObj = await this.selectCartList(customeruuid);
                    delete returnDataObj.data;
                    res.send(req.app.locals.ReturnData(returnDataObj));
                }
            }
            else if (customeruuid && typeof (isselected) == "boolean") {
                const cartListData = await cartModel.find({ customer_uuid: customeruuid, deleted: config.deleted.nodel });
                if (cartListData) {
                    await Promise.all(cartListData.map(async function (items) {
                        await cartModel.update({ uuid: items.uuid }, {
                            $set: { is_selected: isselected }
                        });
                    }));
                    const returnDataObj = await this.selectCartList(customeruuid);
                    delete returnDataObj.data;
                    res.send(req.app.locals.ReturnData(returnDataObj));
                }
                else {
                    const returnDataObj = await this.selectCartList(customeruuid);
                    delete returnDataObj.data;
                    res.send(req.app.locals.ReturnData(returnDataObj));
                }
            }
            else {
                res.send(req.app.locals.ReturnData('', 1, '参数错误'));
            }
        } catch (error) {
            console.log('修改失败', error);
            res.send(req.app.locals.ReturnData('', 1, '修改失败' + error));
        }
    }

    /**
     * 删除购物车某个产品
     */
    async delCart(req, res, next) {
        try {
            const { cartuuid, customeruuid } = req.body.data;
            if (cartuuid) {
                const cartDel = await cartModel.update({ uuid: cartuuid }, {
                    $set: { deleted: config.deleted.del }
                });
                if (cartDel.ok == 1) {
                    const returnDataObj = await this.selectCartList(customeruuid);
                    delete returnDataObj.data;
                    res.send(req.app.locals.ReturnData(returnDataObj));
                }
                else {
                    res.send(req.app.locals.ReturnData('', 1, '删除购物车失败'));
                }
            }
            else {
                res.send(req.app.locals.ReturnData('', 1, '参数错误'));
            }
        } catch (error) {
            console.log('删除购物车失败', error);
            res.send(req.app.locals.ReturnData('', 1, '删除购物车失败' + error));
        }
    }

    /**
     * 查询购物车列表
     */
    async cartList(req, res, next) {
        try {
            const { customeruuid } = JSON.parse(req.query.data);
            if (customeruuid) {
                const returnDataObj = await this.selectCartList(customeruuid);
                res.send(req.app.locals.ReturnData(returnDataObj));
            }
            else {
                res.send(req.app.locals.ReturnData('', 1, '参数错误'));
            }
        } catch (error) {
            console.log('删除购物车失败', error);
            res.send(req.app.locals.ReturnData('', 1, '删除购物车失败' + error));
        }
    }

    /**
     * 获取购物车列表  ------[不对外]-----------
     */
    async selectCartList(customeruuid) {
        try {
            if (customeruuid) {
                const cartListData = await cartModel.find({ customer_uuid: customeruuid, deleted: config.deleted.nodel });

                const returnDataArr = new Array();
                let countAll = 0;
                let priceAll = 0; //包含邮费
                await Promise.all(cartListData.map(async function (items) {
                    const proData = await Product.findOne({ uuid: items.pro_uuid, deleted: config.deleted.nodel });
                    if (proData) {
                        const newCartData = {
                            uuid: items.uuid,
                            pro_uuid: items.pro_uuid,
                            pro_name: proData.pro_name,
                            pro_price: proData.pro_price,
                            pro_ico: proData.pro_ico,
                            pro_freight: proData.pro_freight * items.count,
                            count: items.count,
                            is_selected: items.is_selected
                        };
                        if (items.is_selected == true) {
                            countAll = countAll + items.count;
                            priceAll = priceAll + (proData.pro_freight * items.count) + (proData.pro_price * items.count);
                        }
                        returnDataArr.push(newCartData);
                    }
                }));
                const returnDataObj = {
                    countAll: countAll,
                    priceAll: priceAll,
                    data: returnDataArr
                }
                return returnDataObj;
            }
            else {
                return {
                    countAll: 0,
                    priceAll: 0,
                    data: new Array()
                };
            }
        } catch (error) {
            return {
                countAll: 0,
                priceAll: 0,
                data: new Array()
            };
        }
    }

}

export default new Cart();