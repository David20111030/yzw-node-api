/**
 * Created by zanxiaopeng on 17/1/11.
 */
/* 对MonogoDB进行操作 */

var MongoClient = require('mongodb').MongoClient;
var DB_CONN_STR = 'mongodb://localhost:27017/iyouzhuang';

/*
*插入
*data 例如 [{"name":'wilson001',"age":21},{"name":'wilson002',"age":22}]
 */
var insertData = function(db,tbName,data,callback) {
    if(typeof(data) == 'undefined' || data==""){
        callback(-1);
        return;
    }
    //连接到表
    var collection = db.collection(tbName);
    //插入数据
    //var data = [{"name":'wilson001',"age":21},{"name":'wilson002',"age":22}];
    collection.insert(data, function(err, result) {
        //判断成功失败 返回影响行数
        if(err) {
            console.log('Error:'+ err);
            callback(-1);
        }
        else{
            callback(result.insertedCount);
        }
    });
}

var MongoInsert = function(tbName,data,callback){
    MongoClient.connect(DB_CONN_STR, function(err, db) {
        console.log("连接成功！");
        insertData(db,tbName,data,function(result) {
            //console.log(result);
            db.close();
            callback(result);
        });
    });
}

/*
*查询
* whereStr 例如：{"name":'wilson001'}  －－没有条件则不传
 */
var selectData = function(db,tbName,whereStr,callback) {
    //连接到表
    var collection = db.collection(tbName);
    //查询数据
    //var whereStr = {"name":'wilson001'};
    if(typeof(whereStr) == 'undefined' || whereStr==""){
        collection.find().toArray(function(err, result) {
            if(err) {
                console.log('Error:'+ err);
                callback(-1);
            }
            else{
                callback(result);
            }
        });
    }
    else{
        collection.find(whereStr).toArray(function(err, result) {
            if(err) {
                console.log('Error:'+ err);
                callback(-1);
            }
            else{
                callback(result);
            }
        });
    }

}

var MongoSelect = function(tbName,whereStr,callback){
    MongoClient.connect(DB_CONN_STR, function(err, db) {
        console.log("连接成功！");
        selectData(db,tbName,whereStr,function(result) {
            console.log(result);
            db.close();
            callback(result);
        });
    });
}

/*
*修改
* whereStr 条件  例如 {"name":'wilson001'}
* updateStr 修改字段和值  例如 {$set: { "age" : 100 }}
 */
var updateData = function(db,tbName,whereStr,updateStr,callback) {
    if(typeof(whereStr) == 'undefined' || whereStr=="" || typeof(updateStr) == 'undefined' || updateStr==""){
        callback(-1);
        return;
    }
    //连接到表
    var collection = db.collection(tbName);
    //更新数据
    //var whereStr = {"name":'wilson001'};
    //var updateStr = {$set: { "age" : 100 }};
    collection.update(whereStr,updateStr, function(err, result) {
        if(err) {
            console.log('Error:'+ err);
            callback(-1);
        }
        else{
            callback(result);
        }
    });
}

var MongoUpdate = function(tbName,whereStr,updateStr,callback){
    MongoClient.connect(DB_CONN_STR, function(err, db) {
        console.log("连接成功！");
        updateData(db,tbName,whereStr,updateStr,function(result) {
            console.log(result);
            db.close();
            callback(result);
        });
    });
}

/*
*删除
* tbName 表名
* whereStr 条件 例如 {"name":'wilson001'}
 */
var delData = function(db,tbName,whereStr,callback) {
    if(typeof(whereStr) == 'undefined' || whereStr==""){
        callback(-1);
        return;
    }
    //连接到表
    var collection = db.collection(tbName);
    //删除数据
    //var whereStr = {"name":'wilson001'};
    collection.remove(whereStr, function(err, result) {
        if(err) {
            console.log('Error:'+ err);
            callback(-1);
        }
        else{
            callback(result);
        }
    });
}

var MongoDelete = function(tbName,whereStr,callback){
    MongoClient.connect(DB_CONN_STR,tbName,whereStr,function(err, db) {
        console.log("连接成功！");
        delData(db, function(result) {
            console.log(result);
            db.close();
            callback(result);
        });
    });
}



module.exports.MongoSelect = MongoSelect;
module.exports.MongoInsert = MongoInsert;
module.exports.MongoUpdate = MongoUpdate;
module.exports.MongoDelete = MongoDelete;


