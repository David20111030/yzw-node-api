module.exports = {
	port: 8001,
	mongoUrl: 'mongodb://localhost:27017/yzw',
	session: {
		name: 'YZW',
		secret: 'YZW',
		cookie: {
			httpOnly: true,
			secure: false,
			maxAge: 365 * 24 * 60 * 60 * 1000,
		}
	},
	bannerType: {
		indexBanner: 0
	},
	deleted: {
		nodel: 0,
		del: 1
	},
	smsCount: 5, //3小时内 允许获取的短信数量
	pageDocument: 10, //每页显示的文档数
	newRurnDay: 15, //添加时间在15天之内的算新品
	payType: {
		weixin: 0,
		alipay: 1
	},
	payState: {
		pendin_Payment: "00", //待支付
		already_Paid: "01", //已支付——待发货
		completed: "02", //已发货
		pending_evaluation: "03", //待评价
		canceled: "04",//已取消
		payStateWri(data) {
			let returnData = "";
			switch (data) {
				case "00":
					returnData = "待支付";
					break;
				case "01":
					returnData = "待发货";
					break;
				case "02":
					returnData = "已发货";
					break;
				case "03":
					returnData = "待评价";
					break;
				default:
					returnData = "已取消";
			}
			return returnData;
		}
	},
	expressData: {
		EBusinessID: "1269746",
		ExpressAppKey: "9e4d47af-06e0-4f23-876e-e0ef32daee67",
		ReqURL: "http://api.kdniao.cc/Ebusiness/EbusinessOrderHandle.aspx"
	}
}