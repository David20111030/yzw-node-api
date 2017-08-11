import config from 'config-lite';
import Common from '../../utils/common';
import addressModel from '../../models/accountModel/addressModel';
import systemAddressData from '../../models/commModel/systemAddressDataModel';

class Address {

    constructor() {
        this.addAddress = this.addAddress.bind(this);
        this.getAddressInfo = this.getAddressInfo.bind(this);
        this.getAddressList = this.getAddressList.bind(this);
    }

    /**
     * 添加收货地址 POST
     */
    async addAddress(req, res, next) {
        try {
            //data 是一个JSON字符串
            let { customeruuid, provincecode, citycode, regioncode, descaddress, name, phone } = req.body.data;

            if (customeruuid && provincecode && citycode && regioncode && descaddress && name && phone && Number(phone)) {
                const addressObj = {
                    uuid: Common.GUID(),
                    customer_uuid: customeruuid,
                    province_code: provincecode,
                    city_code: citycode,
                    region_code: regioncode,
                    desc_address: descaddress,
                    name: name,
                    phone: phone
                }
                const addressData = await addressModel.create(addressObj);
                if (addressData) {

                    const addAddressData = {
                        uuid: addressData.uuid,
                        province_name: await this.getSysAddressName(addressData.province_code),
                        city_name: await this.getSysAddressName(addressData.city_code),
                        region_name: await this.getSysAddressName(addressData.region_code),
                        desc_address: addressData.desc_address,
                        name: addressData.name,
                        phone: addressData.phone
                    }

                    res.send(req.app.locals.ReturnData(addAddressData));
                }
                else {
                    res.send(req.app.locals.ReturnData('', 1, '添加收货地址失败'));
                }
            }
            else {
                res.send(req.app.locals.ReturnData('', 1, '参数错误'));
            }
        } catch (error) {
            console.log('添加收货地址失败', error);
            res.send(req.app.locals.ReturnData('', 1, '添加收货地址失败' + error));
        }
    }

    /**
      *删除收货地址 POST
     */
    async delAddress(req, res, next) {
        try {
            //data 是一个JSON字符串
            let { address_uuid } = req.body.data;

            if (address_uuid) {
                const delAddress = await addressModel.update({ uuid: address_uuid }, {
                    $set: { deleted: config.deleted.del }
                });
                if (delAddress.ok == 1) {
                    res.send(req.app.locals.ReturnData("地址删除成功"));
                }
                else {
                    res.send(req.app.locals.ReturnData('', 1, '删除收货地址失败'));
                }
            }
            else {
                res.send(req.app.locals.ReturnData('', 1, '参数错误'));
            }
        } catch (error) {
            console.log('删除收货地址失败', error);
            res.send(req.app.locals.ReturnData('', 1, '删除收货地址失败' + error));
        }
    }

    /**
     * 修改地址 POST
     */
    async updateAddress(req, res, next) {
        try {
            //data 是一个JSON字符串
            let { addressuuid, provincecode, citycode, regioncode, descaddress, name, phone } = req.body.data;

            if (addressuuid && provincecode && citycode && regioncode && descaddress && name && phone && Number(phone)) {
                const updateAddressData = await addressModel.update({ uuid: addressuuid }, {
                    $set: {
                        name: name,
                        phone: phone,
                        province_code: provincecode,
                        city_code: citycode,
                        region_code: regioncode,
                        desc_address: descaddress
                    }
                });

                if (updateAddressData.ok == 1) {
                    res.send(req.app.locals.ReturnData("地址修改成功"));
                }
                else {
                    res.send(req.app.locals.ReturnData('', 1, '地址修改错误'));
                }
            }
            else {
                res.send(req.app.locals.ReturnData('', 1, '参数错误'));
            }
        } catch (error) {
            console.log('修改收货地址失败', error);
            res.send(req.app.locals.ReturnData('', 1, '修改收货地址失败' + error));
        }
    }

    /**
     * 根据uuid获取地址信息
     */
    async getAddressInfo(req, res, next) {
        try {
            //data 是一个JSON字符串
            let data = req.query.data;
            let { address_uuid } = JSON.parse(data);
            if (address_uuid) {
                const addressInfoData = await addressModel.findOne({ uuid: address_uuid });
                if (addressInfoData) {
                    const province_name = await this.getSysAddressName(addressInfoData.province_code);
                    const city_name = await this.getSysAddressName(addressInfoData.city_code);
                    const region_name = await this.getSysAddressName(addressInfoData.region_code);
                    const returnAddressData = {
                        province_code: addressInfoData.province_code,
                        province_name: province_name,
                        city_code: addressInfoData.city_code,
                        city_name: city_name,
                        region_code: addressInfoData.region_code,
                        region_name: region_name,
                        desc_address: addressInfoData.desc_address,
                        all_address: province_name + city_name + region_name + addressInfoData.desc_address,
                        name: addressInfoData.name,
                        phone: addressInfoData.phone
                    }
                    res.send(req.app.locals.ReturnData(returnAddressData));
                }
                else {
                    res.send(req.app.locals.ReturnData('', 1, '获取地址详情失败'));
                }
            }
            else {
                res.send(req.app.locals.ReturnData('', 1, '参数错误'));
            }
        } catch (error) {
            console.log('根据uuid获取地址信息失败', error);
            res.send(req.app.locals.ReturnData('', 1, '根据uuid获取地址信息失败' + error));
        }
    }

    /**
     * 获取地址列表
     */
    async getAddressList(req, res, next) {
        try {
            //data 是一个JSON字符串
            let data = req.query.data;
            let { customer_uuid } = JSON.parse(data);

            if (customer_uuid) {
                const addressList = await addressModel.find({ customer_uuid: customer_uuid, deleted: config.deleted.nodel });

                let addressListArr = new Array();

                if (addressList.length > 0) {
                    let that = this;
                    //Es6 异步函数 并且并发执行 相对来说要比for快很多 
                    await Promise.all(addressList.map(async function (items) {
                        const province_name = await that.getSysAddressName(items.province_code);
                        const city_name = await that.getSysAddressName(items.city_code);
                        const region_name = await that.getSysAddressName(items.region_code);
                        const returnAddressData = {
                            uuid: items.uuid,
                            province_code: items.province_code,
                            province_name: province_name,
                            city_code: items.city_code,
                            city_name: city_name,
                            region_code: items.region_code,
                            region_name: region_name,
                            desc_address: items.desc_address,
                            all_address: province_name + city_name + region_name + items.desc_address,
                            name: items.name,
                            phone: items.phone
                        }
                        addressListArr.push(returnAddressData);
                    }));

                    res.send(req.app.locals.ReturnData(addressListArr));
                }
                else {
                    res.send(req.app.locals.ReturnData(addressListArr));
                }
            }
            else {
                res.send(req.app.locals.ReturnData('', 1, '参数错误'));
            }
        } catch (error) {
            console.log('获取地址列表', error);
            res.send(req.app.locals.ReturnData('', 1, '获取地址列表' + error));
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

}

export default new Address();