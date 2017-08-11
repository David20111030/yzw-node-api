import config from 'config-lite';
import _Common from '../../utils/common';
var request = require('request');

import SystemAddressData from '../../models/commModel/systemAddressDataModel';
import ExpressSNSData from '../../models/commModel/expressSNSModel';
import orderModel from '../../models/orderModel/orderModel';

class Common {

    constructor() {
        this.getExpressListInfo = this.getExpressListInfo.bind(this);
    }

    /**
     * 获取城市的列表  省 市 区/县
     */
    async getSysAddressData(req, res, next) {
        try {
            //如果获取所有的省份 parentcode="p"
            const { parentcode } = JSON.parse(req.query.data);
            if (parentcode) {
                let sysAddressDta = new Array();
                if (parentcode.toLowerCase() == "p") {
                    sysAddressDta = await SystemAddressData.find({
                        parentcode: null,
                        deleted: config.deleted.nodel
                    });
                }
                else {
                    sysAddressDta = await SystemAddressData.find({
                        parentcode: parentcode,
                        deleted: config.deleted.nodel
                    });
                }
                res.send(req.app.locals.ReturnData(sysAddressDta));
            }
            else {
                res.send(req.app.locals.ReturnData('', 1, '参数错误'));
            }
        } catch (error) {
            console.log('获取城市的列表失败', error);
            res.send(req.app.locals.ReturnData('', 1, '获取城市的列表失败' + error));
        }
    }

    /**
     * 跟踪物流信息 POST
     */
    async getExpressListInfo(req, res, next) {
        try {
            const { customeruuid, ordercode } = req.body.data;
            if (customeruuid && ordercode) {
                const orderData = await orderModel.findOne({
                    customer_uuid: customeruuid,
                    code: ordercode,
                    deleted: config.deleted.nodel
                });
                if (orderData && orderData.logisticscode && orderData.logistics_nnc) {
                    if (orderData.state == config.payState.completed || orderData.state == config.payState.pending_evaluation) {

                        const requestData = encodeURI(JSON.stringify({
                            ShipperCode: orderData.logistics_nnc,//物流编码
                            LogisticCode: orderData.logisticscode//物流单号
                        }));

                        let md5Sign = _Common.md5(JSON.stringify({
                            ShipperCode: orderData.logistics_nnc,
                            LogisticCode: orderData.logisticscode
                        }) + config.expressData.ExpressAppKey);

                        const dataSign = encodeURI(new Buffer(md5Sign.toLowerCase()).toString('base64'));

                        this.postData({
                            url: config.expressData.ReqURL,
                            data: {
                                RequestType: "1002",
                                DataSign: dataSign,
                                RequestData: requestData,
                                EBusinessID: config.expressData.EBusinessID,
                                DataType: "2"
                            },
                            callback: function (data) {
                                if (data.Success == true) {
                                    let returndata = {
                                        data:data.Traces.reverse()
                                    }
                                    res.send(req.app.locals.ReturnData(returndata));
                                }
                                else {
                                    res.send(req.app.locals.ReturnData('', 1, '跟踪物流信息失败'));
                                }
                            }
                        });

                    }
                    else {
                        res.send(req.app.locals.ReturnData('', 1, '跟踪物流信息失败'));
                    }
                }
                else {
                    res.send(req.app.locals.ReturnData('', 1, '跟踪物流信息失败'));
                }
            }
            else {
                res.send(req.app.locals.ReturnData('', 1, '参数错误'));
            }
        } catch (error) {
            console.log('跟踪物流信息失败', error);
            res.send(req.app.locals.ReturnData('', 1, '跟踪物流信息失败' + error));
        }
    }

    postData(parameters) {
        request({
            url: parameters.url,
            method: 'POST',
            json: true,
            headers: {
                "content-type": "application/x-www-form-urlencoded",
            },
            form: parameters.data
        }, function (error, response, data) {
            if (!error && response.statusCode == 200) {
                parameters.callback(data);
            }
            else {
                parameters.callback(error);
            }
        });
    }

}

export default new Common();