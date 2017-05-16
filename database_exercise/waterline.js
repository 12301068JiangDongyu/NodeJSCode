/**
  * 演示 waterline 的使用
  */

var Waterline = require('waterline');
var mysqlAdapter = require('sails-mysql');
var mongoAdapter = require('sails-mongo');

// 适配器
var adapters = {
  mongo: mongoAdapter,
  mysql: mysqlAdapter,
  default: 'mongo'
};

// 连接
var connections = {
  mongo: {
    adapter: 'mongo',
    url: 'mongodb://localhost/watereline-sample'
  },
  mysql: {
    adapter: 'mysql',
    url: 'mysql://root:123456@localhost/notes'
  }
};

var User = Waterline.Collection.extend({
    identity: 'user',
    connection: 'mysql',
    schema: true,
    attributes: {
        username: {
            type: 'string',
            required: true
        },
        password: {
            type: 'string',
            required: true           
        },
        email: {
            type: 'email',
            required: false
        },
        createTime: {
            type: 'date'
        }
    },
    beforeCreate: function(value, cb) {
        value.createTime = new Date();
        return cb();
    }

});

var Note = Waterline.Collection.extend({
    identity: 'note',
    connection: 'mysql',
    schema: true,
    attributes: {
        _id: {
            type: 'string',
            primaryKey:true,
            autoIncrement: true
        },
        title: {
            type: 'string',
            required: true
        },
        author: {
            type: 'string',
            required: true           
        },
        tag: {
            type: 'string',
            required: true           
        },
        content: {
            type: 'string',
            required: false
        },
        createTime: {
            type: 'date'
        }
    },
    beforeCreate: function(value, cb) {
        value.createTime = new Date();
        return cb();
    }
});

var orm = new Waterline();

// 加载数据集合
orm.loadCollection(User);
orm.loadCollection(Note);

var config = {
  adapters: adapters,
  connections: connections
}

orm.initialize(config, function(err, models){
  if(err) {
    console.error('orm initialize failed.', err)
    return;
  }

  // console.log('models:', models);
  // models.collections.user.create({username: 'Sid'}, function(err, user){
  //   console.log('after user.create, err, user:', err, user);
  // });

  models.collections.note.find({_id:'1'}).exec(function(err,art){
    console.log('after user.find, err, art:', err, art);
  });

  // models.collections.note.find({author:'hahaha'}).exec(function(err, allNotes){
  //   console.log('after note.find, err, allNotes:', err, allNotes);
  // });
});