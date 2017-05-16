var Waterline = require('waterline');

exports.User = Waterline.Collection.extend({
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

exports.Note = Waterline.Collection.extend({
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