let locals = {
    ReturnData:function(data,result=0,message=""){
        return JSON.stringify({
            result:result,
            data:data,
            message:message
        });
    }
}

module.exports = locals;