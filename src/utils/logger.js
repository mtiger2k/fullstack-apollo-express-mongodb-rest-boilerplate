var fs = require('fs');
var util = require('util');
var os = require('os');
const cluster = require('cluster');
require('dotenv').config();
require('./DateUtils');

// kafka init
if (process.env.KAFKA_ENABLED == 'true') {
	var kafka = require('kafka-node');
	var Producer = kafka.Producer;
	var client = new kafka.Client(process.env.KAFKA_CLUSTER);
	var topic_info = process.env.KAFKA_TOPIC_INFO;
	var topic_error = process.env.KAFKA_TOPIC_ERROR;

	var producer = new Producer(client, {
	    requireAcks: 1
	});
	producer.on('ready', function() {
	    console.log('kafka is ready...');
	    client.createTopics([topic_info, topic_error], (error, result) => {
	    	console.log('topic cas-logs created.');
	    });
	});
}

var format = function(msg, username, number) {
	var ret = '';
	if (!msg) {
		return ret;
	}

	var date = new Date();
	var time = date.Format('yyyy-MM-dd hh:mm:ss.S ') + (cluster.worker?`[${cluster.worker.process.pid}]`:'');
	if (username && number) {
		time += ` [${username}:${number}]`;
	} else if (username) {
		time += ` [${username}]`;
	}
	if (msg instanceof Error) {
		var err = {
			name: msg.name,
			data: msg.data
		};

		err.stack = msg.stack;
		ret = util.format('%s %s: %s\nHost: %s\nData: %j\n',
			time,
			err.name,
			err.stack,
			os.hostname(),
			err.data
		);
		console.log(ret);
	} else {
		ret = time + ' ' + util.format.apply(util, [msg]);
	}
	return ret;
}

var logdir = process.env.LOGGER_DIR || __dirname;

var info = fs.createWriteStream(logdir + '/info.log', {flags: 'a', mode: '0666'});
var error = fs.createWriteStream(logdir + '/error.log', {flags: 'a', mode: '0666'});

var logger = new console.Console(info, error);

exports.info = function(msg, username, number) {
    var formattedMsg;
    if (username && number) {
		formattedMsg = format(msg, username, number);
	} else if (username) {
		formattedMsg = format(msg, username);
	} else {
		formattedMsg = format(msg);
	}
	if (process.env.KAFKA_ENABLED == 'true') {
	    producer.send([{
	        topic: topic_info,
	        partition: 0,
	        messages: [formattedMsg],
	        attributes: 0
	    }], function(err, result) {
	        if (err) console.log(err);
	        //process.exit();
	    });
	} else {
		logger.info(formattedMsg);
	}

}

exports.error = function(msg, username, number) {
	var formattedMsg;
	if (username && number) {
		formattedMsg = format(msg, username, number);
	} else if (username) {
		formattedMsg = format(msg, username);
	} else {
		formattedMsg = format(msg);
	}
	if (process.env.KAFKA_ENABLED == 'true') {
	    producer.send([{
	        topic: topic_info,
	        partition: 0,
	        messages: [formattedMsg],
	        attributes: 0
	    }], function(err, result) {
	        if (err) console.log(err);
	        //process.exit();
	    });
	} else {
		logger.error(formattedMsg);
	}
}

/*
var input = '{error: format}';
try {
	JSON.parse(input);
} catch(ex) {
	ex.data = input;
	logger.error(format(ex));
}
logger.info(format('server started'));
*/