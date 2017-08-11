import config from 'config-lite';
import Common from '../../utils/common';
import Customer from '../../models/accountModel/customerModel';
import Sms from '../../models/commModel/smsCodeModel';
import integralModel from '../../models/integralModel/integralGetModel';
import integralConsumeModel from '../../models/integralModel/integralConsumeModel';

class Customers {

    /**
     * 登陆 POST
     */
    async Login(req, res, next) {
        try {

            let { username, password } = req.body.data;

            if (username && password) {
                const customer = await Customer.findOne({ phone: username, password: Common.md5(password), deleted: config.deleted.nodel });
                if (customer) {
                    res.send(req.app.locals.ReturnData(customer));
                }
                else {
                    res.send(req.app.locals.ReturnData('', 1, '此用户不存在'));
                }
            }
            else {
                res.send(req.app.locals.ReturnData('', 1, '参数错误'));
            }
        } catch (error) {
            console.log('登录失败', error);
            res.send(req.app.locals.ReturnData('', 1, '登录失败' + error));
        }
    }

    /**
     * 获取验证码 POST
     */
    async getSmsCode(req, res, next) {
        try {
            //data 是一个JSON字符串
            let { phone } = req.body.data;
            let dateTime = new Date();
            if (phone) {
                //查询3个小时之内获取的短信个数
                const smsCount = await Sms.find({ phone: phone, invalidtime: { $lte: dateTime.toISOString(), $gte: dateTime.setHours(dateTime.getHours() - 3) } }).count();
                if (smsCount <= config.smsCount) {
                    dateTime = new Date();
                    let code = Math.floor(Math.random() * 10000);
                    const newCode = {
                        uuid: Common.GUID(),
                        phone,
                        code: code,
                        invalidtime: dateTime.setMinutes(dateTime.getMinutes() + 20)
                    };
                    const result = await Sms.create(newCode);
                    if (result) {
                        res.send(req.app.locals.ReturnData(code));
                    }
                    else {
                        res.send(req.app.locals.ReturnData('', 1, '获取验证码失败'));
                    }
                }
                else {
                    res.send(req.app.locals.ReturnData('', 1, '获取的太频繁了'));
                }
            }
            else {
                res.send(req.app.locals.ReturnData('', 1, '参数错误'));
            }
        } catch (error) {
            console.log('获取验证码失败', error);
            res.send(req.app.locals.ReturnData('', 1, '获取验证码失败' + error));
        }
    }

    /**
     * 用户注册 POST
     */
    async Register(req, res, next) {
        try {
            //data 是一个JSON字符串
            let { username, password, photo, nickname, smscode } = req.body.data;
            let dateTime = new Date();

            if (!nickname) { nickname = Common.randomName(); }//随机一个昵称
            if (!photo) { photo = "http://s.iyouzhuang.com/upload/user/photo/2017/03/17/20170317182124.jpg"; }

            if (username && password && smscode) {
                //查询验证码 是否正确
                const CodeData = await Sms.findOne({ phone: username, invalidtime: { $gte: dateTime.toISOString() } }).sort({ "invalidtime": -1 });
                console.log(CodeData);
                if (CodeData) {
                    if (CodeData.code == smscode) {
                        const customer = await Customer.create({ uuid: Common.GUID(), password: Common.md5(password), phone: username, photo: photo, nickname: nickname });
                        if (customer) {
                            //设置验证码过期
                            dateTime = new Date();
                            await Sms.update({ phone: username, code: smscode }, { $set: { invalidtime: dateTime.setMinutes(dateTime.getMinutes() - 50) } }).sort({ "invalidtime": -1 });

                            res.send(req.app.locals.ReturnData(customer));
                        }
                        else {
                            res.send(req.app.locals.ReturnData('', 1, '注册失败'));
                        }
                    }
                    else {
                        res.send(req.app.locals.ReturnData('', 1, '验证码不正确'));
                    }
                }
                else {
                    res.send(req.app.locals.ReturnData('', 1, '验证码不正确'));
                }
            }
            else {
                res.send(req.app.locals.ReturnData('', 1, '参数错误'));
            }
        } catch (error) {
            console.log('注册失败', error);
            res.send(req.app.locals.ReturnData('', 1, '注册失败' + error));
        }
    }

    /**
     * 找回密码
     */
    async backPassword(req, res, next) {
        try {
            //data 是一个JSON字符串
            let { username, smscode, password } = req.body.data
            let dateTime = new Date();

            if (username && smscode && password) {
                //查询验证码 是否正确
                const CodeData = await Sms.findOne({ phone: username, invalidtime: { $gte: dateTime.toISOString() } }).sort({ "invalidtime": -1 });
                if (CodeData) {
                    dateTime = new Date();
                    if (CodeData.code == smscode) {
                        const customerData = Customer.findOne({ phone: username, deleted: config.deleted.nodel });
                        if (customerData) {
                            const result = await Customer.update({ phone: username }, { $set: { password: Common.md5(password) } });
                            if (result.ok == 1) {
                                //设置验证码过期
                                await Sms.update({ phone: username, code: smscode }, { $set: { invalidtime: dateTime.setMinutes(dateTime.getMinutes() - 50) } }).sort({ "invalidtime": -1 });

                                res.send(req.app.locals.ReturnData("密码修改成功"));
                            }
                            else {
                                res.send(req.app.locals.ReturnData('', 1, '找回密码失败'));
                            }
                        }
                        else {
                            res.send(req.app.locals.ReturnData('', 1, '此手机号未注册'));
                        }
                    }
                    else {
                        res.send(req.app.locals.ReturnData('', 1, '验证码错误'));
                    }
                }
                else {
                    res.send(req.app.locals.ReturnData('', 1, '验证码错误'));
                }
            }
            else {
                res.send(req.app.locals.ReturnData('', 1, '参数错误'));
            }
        } catch (error) {
            console.log('找回密码失败', error);
            res.send(req.app.locals.ReturnData('', 1, '找回密码失败' + error));
        }
    }

    /**
     * 获得积分
     */
    async setIntegral(req, res, next) {
        try {
            //data 是一个JSON字符串
            const data = req.query.data;
            let { customeruuid, count, desc } = JSON.parse(data);
            if (customeruuid && count && desc && Number(count)) {
                const integraobj = {
                    uuid: Common.GUID(),
                    customer_uuid: customeruuid,
                    count: count,
                    desc: desc
                }
                const integralData = await integralModel.create(integraobj);
                res.send(req.app.locals.ReturnData(integralData));
            }
            else {
                res.send(req.app.locals.ReturnData('', 1, '参数错误'));
            }
        } catch (error) {
            console.log('获得积分失败', error);
            res.send(req.app.locals.ReturnData('', 1, '获得积分失败' + error));
        }
    }

    /**
     * 消费积分
     */
    async consumeIntegral(req, res, next) {
        try {
            //data 是一个JSON字符串
            const data = req.query.data;
            let { customeruuid, count, orderuuid } = JSON.parse(data);
            if (customeruuid && count && desc && Number(count)) {
                const consumeObj = {
                    uuid: Common.GUID(),
                    customer_uuid: customeruuid,
                    count: count,
                    order_uuid: orderuuid
                }
                const consumeData = await integralConsumeModel.create(consumeObj);
                res.send(req.app.locals.ReturnData(consumeData));
            }
            else {
                res.send(req.app.locals.ReturnData('', 1, '参数错误'));
            }
        } catch (error) {
            console.log('消费积分失败', error);
            res.send(req.app.locals.ReturnData('', 1, '消费积分失败' + error));
        }
    }

    /**
     * 获取[我的]页面的个人信息
     */
    async getUserInfoMy(req, res, next) {
        try {
            //data 是一个JSON字符串
            const data = req.query.data;
            console.log(req.query.data);
            let { customer_uuid } = JSON.parse(data);
            let datetime = new Date();

            if (customer_uuid) {
                //查询用户基本信息
                const userInfo = await Customer.findOne({ uuid: customer_uuid, deleted: config.deleted.nodel });
                if (userInfo) {

                    //查询获得积分的总和
                    const integral = await integralModel.aggregate
                        ([
                            { $match: { deleted: config.deleted.nodel, customer_uuid: customer_uuid } },
                            { $group: { _id: "$customer_uuid", num_tutorial: { $sum: "$count" } } }
                        ]);
                    let integralCount = 0; //获得积分的总数
                    if (integral.length > 0) {
                        integralCount = integral[0].num_tutorial;
                    }

                    //查询今日获得积分的总和
                    const integralDay = await integralModel.aggregate
                        ([
                            {
                                $match: {
                                    deleted: config.deleted.nodel, customer_uuid: customer_uuid, created_at: {
                                        $gte: new Date(datetime.toLocaleDateString()).toISOString()
                                    }
                                }
                            },
                            { $group: { _id: "$customer_uuid", num_tutorial: { $sum: "$count" } } }
                        ]);
                    let integralDayCount = 0; //今日获得积分的总和
                    if (integralDay.length > 0) {
                        integralDayCount = integralDay[0].num_tutorial;
                    }

                    //查询消费积分的总和
                    const integralConsume = await integralConsumeModel.aggregate
                        ([
                            { $match: { deleted: config.deleted.nodel, customer_uuid: customer_uuid } },
                            { $group: { _id: "$customer_uuid", num_tutorial: { $sum: "$count" } } }
                        ]);
                    let ConsumeCount = 0; //消费积分的总和
                    if (integralConsume.length > 0) {
                        ConsumeCount = integralConsume[0].num_tutorial;
                    }

                    let surplusIntegralCount = integralCount - ConsumeCount;
                    const userData = {
                        nickname: userInfo.nickname, //昵称
                        photo: userInfo.photo, // 头像
                        surplusintegralcount: surplusIntegralCount, //剩余总积分
                        integraldaycount: integralDayCount, //今日获得总积分
                        consumecount: ConsumeCount //消费总积分
                    }
                    res.send(req.app.locals.ReturnData(userData));
                }
                else {
                    res.send(req.app.locals.ReturnData('', 1, '此用户不存在'));
                }
            }
            else {
                res.send(req.app.locals.ReturnData('', 1, '参数错误'));
            }
        } catch (error) {
            console.log('获取我的页面的个人信息失败', error);
            res.send(req.app.locals.ReturnData('', 1, '获取我的页面的个人信息失败' + error));
        }
    }

    /**
     * 获取用户信息
     */
    async getUserInfo(req, res, next) {
        try {
            //data 是一个JSON字符串
            const data = req.query.data;
            let { customer_uuid } = JSON.parse(data);
            if (customer_uuid) {
                let customerData = await Customer.findOne({ uuid: customer_uuid, deleted: config.deleted.nodel }).lean(); //Mongose返回的不是真正的object类型 需要lean函数来支持后期操作返回的对象
                if (customerData) {
                    let sex = customerData.sex == 0 ? '女' : '男';
                    let phone = customerData.phone.toString();
                    phone = phone.substring(0, 3) + '....' + phone.substring(7, phone.length);
                    customerData.sex = sex;
                    customerData.phone = phone;

                    res.send(req.app.locals.ReturnData(customerData));
                }
                else {
                    res.send(req.app.locals.ReturnData('', 1, '此用户不存在'));
                }
            }
            else {
                res.send(req.app.locals.ReturnData('', 1, '参数错误'));
            }
        } catch (error) {
            console.log('获取用户信息失败', error);
            res.send(req.app.locals.ReturnData('', 1, '获取用户信息失败' + error));
        }
    }

}

export default new Customers();