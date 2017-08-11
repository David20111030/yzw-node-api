import config from 'config-lite';
import Common from '../../utils/common';

import orderModel from '../../models/orderModel/orderModel';
import orderDeailModel from '../../models/orderModel/orderDeailModel';

import addressModel from '../../models/accountModel/addressModel';
import systemAddressData from '../../models/commModel/systemAddressDataModel';

import cartModel from '../../models/orderModel/cartModel';
import { Product } from '../../models/productModel/product';

import integralModel from '../../models/integralModel/integralGetModel';
import integralConsumeModel from '../../models/integralModel/integralConsumeModel';

class Order {

    constructor() {
        this.setOrder = this.setOrder.bind(this);
        this.getOrderCofim = this.getOrderCofim.bind(this);
    }

    /**
     * 提交订单 POST
     */
    async setOrder(req, res, next) {
        try {
            //isintegral Bool类型 是否使用积分抵用
            const { customeruuid, addressuuid, isintegral } = req.body.data;
            if (customeruuid && addressuuid && typeof (isintegral) == "boolean") {
                //获取购物车所有选中的产品列表并返回自己所需要的对象 如果没有没数据 则为空数组
                const cartListData = await cartModel.find({ customer_uuid: customeruuid, deleted: config.deleted.nodel, is_selected: true });


                //获取地址信息
                const addressInfoData = await addressModel.findOne({ uuid: addressuuid });
                if (cartListData.length > 0 && addressInfoData) {
                    const ORDER_CODE = Common.orderCode();//主订单编号

                    //处理地址信息
                    let addressReturnData = {
                        uuid: addressInfoData.uuid,
                        province_code: addressInfoData.province_code,
                        province_name: await this.getSysAddressName(addressInfoData.province_code),
                        city_code: addressInfoData.city_code,
                        city_name: await this.getSysAddressName(addressInfoData.city_code),
                        region_code: addressInfoData.region_code,
                        region_name: await this.getSysAddressName(addressInfoData.region_code),
                        desc_address: addressInfoData.desc_address,
                        name: addressInfoData.name,
                        phone: addressInfoData.phone
                    }

                    //处理产品信息
                    let countAll = 0;
                    let freightAll = 0;//总邮费
                    let priceAll = 0; //包含邮费
                    await Promise.all(cartListData.map(async function (items) {
                        const proData = await Product.findOne({ uuid: items.pro_uuid, deleted: config.deleted.nodel });
                        if (proData) {
                            const newOrderDeail = {
                                uuid: Common.GUID(),
                                order_code: ORDER_CODE,
                                customer_uuid: customeruuid,
                                pro_uuid: items.pro_uuid,
                                pro_name: proData.pro_name,
                                price: proData.pro_price,
                                pro_icon: proData.pro_ico,
                                payment: (proData.pro_price * items.count) + (proData.pro_freight * items.count),
                                freight: proData.pro_freight * items.count,
                                count: items.count,
                                specifications: items.specifications
                            };
                            if (items.is_selected == true) {
                                countAll = countAll + items.count;
                                freightAll = freightAll + (proData.pro_freight * items.count);
                                priceAll = priceAll + (proData.pro_freight * items.count) + (proData.pro_price * items.count);
                            }
                            /*********写入子订单 *********/
                            await orderDeailModel.create(newOrderDeail);

                            //去除购物车 响应的产品
                            await cartModel.update({ uuid: items.uuid }, {
                                $set: { deleted: config.deleted.del, is_order: true }
                            });
                        }
                    }));

                    //处理积分信息
                    let must_integral = 0;//应该抵用的积分
                    if (isintegral == true) {
                        //查询获得积分的总和
                        const integral = await integralModel.aggregate
                            ([
                                { $match: { deleted: config.deleted.nodel, customer_uuid: customeruuid } },
                                { $group: { _id: "$customer_uuid", num_tutorial: { $sum: "$count" } } }
                            ]);
                        let integralCount = 0; //获得积分的总数
                        if (integral.length > 0) {
                            integralCount = integral[0].num_tutorial;
                        }
                        //查询消费积分的总和
                        const integralConsume = await integralConsumeModel.aggregate
                            ([
                                { $match: { deleted: config.deleted.nodel, customer_uuid: customeruuid } },
                                { $group: { _id: "$customer_uuid", num_tutorial: { $sum: "$count" } } }
                            ]);
                        let ConsumeCount = 0; //消费积分的总和
                        if (integralConsume.length > 0) {
                            ConsumeCount = integralConsume[0].num_tutorial;
                        }
                        let surplusIntegralCount = integralCount - ConsumeCount; //剩余可抵用积分
                        if (surplusIntegralCount > 0) {
                            if ((surplusIntegralCount - priceAll) >= 0) {
                                must_integral = priceAll;
                            }
                            else {
                                must_integral = surplusIntegralCount;
                            }
                        }
                        else {
                            must_integral = 0;
                        }

                    }

                    //判断使用积分后 订单站台可以直接改为 待发货 状态
                    let payState = config.payState.pendin_Payment;//默认待付款
                    if (priceAll - must_integral == 0) {
                        payState = config.payState.already_Paid;//改为已付款
                    }
                    /*******开始 写入主订单 *******/

                    const newOrderData = {
                        uuid: Common.GUID(),
                        code: ORDER_CODE,
                        customer_uuid: customeruuid,
                        state: payState,
                        price: priceAll - freightAll,
                        integral: must_integral,
                        payment: priceAll - must_integral,
                        freight: freightAll,
                        name: addressReturnData.name,
                        phone: addressReturnData.phone,
                        address: addressReturnData.province_name + addressReturnData.city_name + addressReturnData.region_name + addressReturnData.desc_address,
                    };

                    const createOrderData = await orderModel.create(newOrderData);
                    if (createOrderData) {
                        //添加消费积分
                        if (must_integral > 0) {
                            await this.setIntegralConsume(must_integral, customeruuid, ORDER_CODE);
                        }

                        const returnOrderObj = {
                            order_code: ORDER_CODE,
                            payment: newOrderData.payment,
                            state: newOrderData.state
                        };
                        res.send(req.app.locals.ReturnData(returnOrderObj));
                    }
                    else {
                        res.send(req.app.locals.ReturnData('', 1, '订单提交失败'));
                    }
                }
                else {
                    res.send(req.app.locals.ReturnData('', 1, '提交的数据异常'));
                }
            }
            else {
                res.send(req.app.locals.ReturnData('', 1, '参数错误'));
            }
        } catch (error) {
            console.log('获取提交订单页信息失败', error);
            res.send(req.app.locals.ReturnData('', 1, '获取提交订单页信息失败' + error));
        }
    }

    /**
     * 获取提交订单页 信息 POST
     */
    async getOrderCofim(req, res, next) {
        try {
            const { customeruuid } = req.body.data;


            if (customeruuid) {
                //获取用户地址 并且转为需要的对象格式  如果没有地址 则为null
                const addressData = await addressModel.findOne({
                    customer_uuid: customeruuid,
                    deleted: config.deleted.nodel
                });
                let addressReturnData = null;
                if (addressData) {
                    addressReturnData = {
                        uuid: addressData.uuid,
                        province_code: addressData.province_code,
                        province_name: await this.getSysAddressName(addressData.province_code),
                        city_code: addressData.city_code,
                        city_name: await this.getSysAddressName(addressData.city_code),
                        region_code: addressData.region_code,
                        region_name: await this.getSysAddressName(addressData.region_code),
                        desc_address: addressData.desc_address,
                        name: addressData.name,
                        phone: addressData.phone
                    }
                }

                //获取购物车所有选中的产品列表并返回自己所需要的对象 如果没有没数据 则为空数组
                const cartListData = await cartModel.find({ customer_uuid: customeruuid, deleted: config.deleted.nodel, is_selected: true });
                const returnDataArr = new Array();
                let countAll = 0;
                let priceAll = 0; //包含邮费
                let freightAll = 0;//总运费
                await Promise.all(cartListData.map(async function (items) {
                    const proData = await Product.findOne({ uuid: items.pro_uuid, deleted: config.deleted.nodel });
                    if (proData) {
                        const newCartData = {
                            uuid: items.uuid,
                            pro_uuid: items.pro_uuid,
                            pro_name: proData.pro_name,
                            pro_price: proData.pro_price,
                            pro_ico: proData.pro_ico,
                            pro_freight: proData.pro_freight,
                            count: items.count,
                            is_selected: items.is_selected
                        };
                        if (items.is_selected == true) {
                            countAll = countAll + items.count;
                            priceAll = priceAll + (proData.pro_freight * items.count) + (proData.pro_price * items.count);
                            freightAll = freightAll + (proData.pro_freight * items.count);
                        }
                        returnDataArr.push(newCartData);
                    }
                }));
                const returnCartDataObj = {
                    countAll: countAll,
                    priceAll: priceAll,
                    freightAll: freightAll,
                    data: returnDataArr
                }

                /**************查询用户的可抵用积分情况 **************/
                //查询获得积分的总和
                const integral = await integralModel.aggregate
                    ([
                        { $match: { deleted: config.deleted.nodel, customer_uuid: customeruuid } },
                        { $group: { _id: "$customer_uuid", num_tutorial: { $sum: "$count" } } }
                    ]);
                let integralCount = 0; //获得积分的总数
                if (integral.length > 0) {
                    integralCount = integral[0].num_tutorial;
                }
                //查询消费积分的总和
                const integralConsume = await integralConsumeModel.aggregate
                    ([
                        { $match: { deleted: config.deleted.nodel, customer_uuid: customeruuid } },
                        { $group: { _id: "$customer_uuid", num_tutorial: { $sum: "$count" } } }
                    ]);
                let ConsumeCount = 0; //消费积分的总和
                if (integralConsume.length > 0) {
                    ConsumeCount = integralConsume[0].num_tutorial;
                }
                let surplusIntegralCount = integralCount - ConsumeCount; //剩余可抵用积分

                const returnOrderCofimData = {
                    address: addressReturnData,
                    prolist: returnCartDataObj,
                    surplusintegralcount: surplusIntegralCount
                }

                res.send(req.app.locals.ReturnData(returnOrderCofimData));
            }
            else {
                res.send(req.app.locals.ReturnData('', 1, '参数错误'));
            }
        } catch (error) {
            console.log('获取提交订单页信息失败', error);
            res.send(req.app.locals.ReturnData('', 1, '获取提交订单页信息失败' + error));
        }
    }

    /**
     * 获取订单列表 分页 POST
     */
    async getOrderList(req, res, next) {
        try {
            //orderstate 参考config  如果全部 orderstate = all
            const { pageindex, customeruuid, orderstate } = req.body.data;
            if (!pageindex || !Number(pageindex)) {
                pageindex = 1;
            }
            if (pageindex && customeruuid && orderstate) {
                let orderCount = 0;
                if (orderstate == "all") {//全部订单
                    orderCount = await orderModel.find({ customer_uuid: customeruuid, deleted: config.deleted.nodel }).count();
                }
                else {//根据状态查
                    orderCount = await orderModel.find({ customer_uuid: customeruuid, state: orderstate, deleted: config.deleted.nodel }).count();
                }
                const PageAll = Math.ceil(orderCount / config.pageDocument);//总页数

                let OrderList = null;
                if (pageindex <= PageAll) {
                    if (orderstate == "all") {
                        OrderList = await orderModel.find({ deleted: config.deleted.nodel, customer_uuid: customeruuid }).sort({ 'created_at': -1 }).skip(Common.skipNumber(parseInt(pageindex))).limit(config.pageDocument);
                    }
                    else {
                        OrderList = await orderModel.find({ deleted: config.deleted.nodel, customer_uuid: customeruuid, state: orderstate }).sort({ 'created_at': -1 }).skip(Common.skipNumber(parseInt(pageindex))).limit(config.pageDocument);
                    }
                }
                //根据主订单 查询子订单  重新组成返回去的数据
                let orderReturnData = new Array();
                if (OrderList != null) {
                    await Promise.all(OrderList.map(async function (item) {
                        const orderDeails = await orderDeailModel.find({ order_code: item.code, deleted: config.deleted.nodel });

                        let orderDeailArr = new Array();
                        let countall = 0;//产品总数
                        await Promise.all(orderDeails.map(async function (items) {
                            const orderDailData = {
                                pro_uuid: items.pro_uuid,
                                pro_name: items.pro_name,
                                pro_icon: items.pro_icon,
                                price: items.price,
                                count: items.count,
                                specifications: items.specifications
                            };
                            countall = countall + items.count;
                            orderDeailArr.push(orderDailData)
                        }));

                        const orderDataoObj = {
                            code: item.code,
                            state: item.state,
                            statename: config.payState.payStateWri(item.state),
                            priceOr: item.price + item.freight,
                            integral: item.integral,
                            payment: item.payment,
                            countall: countall,
                            productlist: orderDeailArr
                        };
                        orderReturnData.push(orderDataoObj);
                    }));
                }
                res.send(req.app.locals.ReturnData({
                    pagecount: PageAll, //总页数
                    pageindex: parseInt(pageindex), //当前页
                    data: orderReturnData //当前页的数据
                }));
            }
            else {
                res.send(req.app.locals.ReturnData('', 1, '参数错误'));
            }
        } catch (error) {
            console.log('获取订单列表失败', error);
            res.send(req.app.locals.ReturnData('', 1, '获取订单列表失败' + error));
        }
    }

    /**
     * 获取订单详情 POST
     */
    async getOrderInfo(req, res, next) {
        try {
            const { customeruuid, ordercode } = req.body.data;
            if (customeruuid && ordercode) {
                const orderData = await orderModel.findOne({
                    customer_uuid: customeruuid,
                    code: ordercode,
                    deleted: config.deleted.nodel
                });
                if (orderData) {
                    const orderDeails = await orderDeailModel.find({ order_code: orderData.code, deleted: config.deleted.nodel });

                    let orderDeailArr = new Array();
                    let countall = 0;//产品总数
                    await Promise.all(orderDeails.map(async function (items) {
                        const orderDailData = {
                            pro_uuid: items.pro_uuid,
                            pro_name: items.pro_name,
                            pro_icon: items.pro_icon,
                            price: items.price,
                            count: items.count,
                            specifications: items.specifications
                        };
                        countall = countall + items.count;
                        orderDeailArr.push(orderDailData)
                    }));

                    const orderDataoObj = {
                        code: orderData.code,
                        state: orderData.state,
                        statename: config.payState.payStateWri(orderData.state),
                        priceOr: orderData.price + orderData.freight,
                        integral: orderData.integral,
                        payment: orderData.payment,
                        countall: countall,
                        create_time: Common.ISO_Time(orderData.created_at),
                        name: orderData.name,
                        phone: orderData.phone,
                        address: orderData.address,
                        logisticsname: orderData.logisticsname,
                        productlist: orderDeailArr
                    };

                    res.send(req.app.locals.ReturnData(orderDataoObj));

                }
                else {
                    res.send(req.app.locals.ReturnData('', 1, '获取订单详情失败'));
                }
            }
            else {
                res.send(req.app.locals.ReturnData('', 1, '参数错误'));
            }
        } catch (error) {
            console.log('获取订单详情失败', error);
            res.send(req.app.locals.ReturnData('', 1, '获取订单详情失败' + error));
        }
    }

    /**
     * 根据Code获取 地址 省市区名称  ------[不对外]-----------
     */
    async getSysAddressName(code) {
        try {
            if (code) {
                const addressName = await systemAddressData.findOne({
                    code: code, deleted: config.deleted.nodel
                });
                if (addressName) {
                    return addressName.name;
                }
                else {
                    return "";
                }
            }
            else {
                return "";
            }
        } catch (error) {
            return "";
        }
    }

    /**
     * 添加消费积分  ------[不对外]-----------
     */
    async setIntegralConsume(count, customeruuid, ordercode) {
        try {
            if (count && customeruuid && ordercode) {
                const integralConsumeData = integralConsumeModel.create({
                    uuid: Common.GUID(),
                    customer_uuid: customeruuid,
                    count: count,
                    order_code: ordercode
                });
            }
        } catch (error) {

        }
    }

}

export default new Order();