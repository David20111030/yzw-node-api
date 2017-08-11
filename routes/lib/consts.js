var consts = {
    success: 1,     //成功状态码
    error: {
        authorize: {
            result: -2, message: '登陆异常'
        },
        exception: {
            result: -1, message: '服务器繁忙，请稍后重试'
        },
        request: {
            result: 0, message: '网络异常，请稍后重试'
        }
    },
    data: {
        platform: {
            api: '00',
            weixin: '01',
            ios: '02',
            android: '03',
            wap: '04',
            pay: '05',
            task: '06',
            admin: '07',
            format: function (type) {
                switch (type) {
                    case '00': return 'API';
                    case '01': return '微信';
                    case '02': return 'IOS';
                    case '03': return 'Android';
                    case '04': return 'WAP';
                    case '05': return '支付';
                    case '06': return '服务';
                    case '07': return '后台';
                }
            }
        },
        order: {
            all: '',
            unpay: '00',
            paid: '01',
            systemsure: '02',
            send: '03',
            done: '04',
            waitrefund: '05',
            refund: '06',
            close: '07',
            format: function (type) {
                switch (type) {
                    case '': return '全部';
                    case '00': return '待支付';
                    case '01': return '已支付';
                    case '02': return '系统已确认(待发货)';
                    case '03': return '待收货';
                    case '04': return '已完成';
                    case '05': return '等待退款确认';
                    case '06': return '已退款';
                    case '07': return '已关闭';
                }
            }
        },
        product: {
            free: '01',
            buy: '00',
            experience: '03'
        },
        userlevel: {
            member:'00',
            sale: '01'
        }
    }
};

module.exports = consts;
