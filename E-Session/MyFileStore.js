var fs = require('fs');
var path=require('path');

module.exports = function (session) {
    var Store = session.Store;
    function MyFileStore(options) {
        var self = this;
        options = options || {};
        Store.call(self, defaultOption(options));

        self.options = defaultOption(options);
    };

    /**
     * Inherit from Store
     */
    MyFileStore.prototype.__proto__ = Store.prototype;

    /**
    * 获取sessionId的信息
    */
    MyFileStore.prototype.get = function (sessionId,callBack) {
        //指定sessionPath，并读取文件
        var sessionPath = this.options.path+sessionId+'.json';
            fs.readFile(sessionPath, 'utf8', function (err, data) {
                if (!err) {
                    var json;
                    try {
                        json = JSON.parse(data);
                    } catch (err2) {
                        err = err2;
                    }
                    return callBack(null, json);
                }

            });

    };

    /**
    * 设置sessionId的信息（新增或更新）
    */
    MyFileStore.prototype.set = function (sessionId, session, callback) {
        try {
            var sessionPath = this.options.path + sessionId + '.json';
            //对应的session实例转为JSON格式
            var json = JSON.stringify(session);

            fs.writeFile(sessionPath, json, function (err) {
                if(err) console.log("complete");
                if (callback) {
                    err ? callback(err) : callback(null, session);
                }
            });
        }catch (err) {
                if (callback) callback(err);
            }

    };

    /**
    * 销毁sessionId
    */
    MyFileStore.prototype.destroy = function (sessionId, callback) {
        var sessionPath = this.options.path+sessionId+'.json';
        console.log('deleting sessionPath:'+sessionPath)
        fs.remove(sessionPath);
    };


    return MyFileStore;

};

//default setting
function defaultOption(options) {
    options = options || {};

    var NOOP_FN = function () {
    };
    return {
        path: path.normalize(options.path || './sessions'),
        ttl: options.ttl || 3600,
        retries: options.retries || 5,
        factor: options.factor || 1,
        minTimeout: options.minTimeout || 50,
        maxTimeout: options.maxTimeout || 100,
        filePattern: /\.json$/,
        reapInterval: options.reapInterval || 3600,
        reapMaxConcurrent: options.reapMaxConcurrent || 10,
        reapAsync: options.reapAsync || false,
        reapSyncFallback: options.reapSyncFallback || false,
        logFn: options.logFn || console.log || NOOP_FN,
        fallbackSessionFn: options.fallbackSessionFn,
        encrypt: options.encrypt || false
    };
}
