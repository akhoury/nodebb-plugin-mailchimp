var	pluginData = require('./plugin.json'),
	winston = module.parent.require('winston'),
	nconf = module.parent.require('nconf'),
	async = module.parent.require('async'),
	Meta = module.parent.require('./meta'),
	Plugin = {}, pluginSettings = {},
	MailChimpAPI = require('mailchimp').MailChimpAPI,
	mailchimpApi;

pluginData.nbbId = pluginData.id.replace(/nodebb-plugin-/, '');

var util = {
	keys: function(obj, props, value) {
		if(props == null || obj == null)
			return undefined;

		var i = props.indexOf(".");
		if( i == -1 ) {
			if(value !== undefined)
				obj[props] = value;
			return obj[props];
		}
		var prop = props.slice(0, i),
			newProps = props.slice(i + 1);

		if(props !== undefined && !(obj[prop] instanceof Object) )
			obj[prop] = {};

		return util.keys(obj[prop], newProps, value);
	},

	toBool: function(val) {
		return !!(val === true || val === 1 || val === 'on' || val === '1');
	}
};

Plugin.load = function(params, callback) {
	var app = params.router;
	var middleware = params.middleware;

	var render = function(req, res, next) {
		res.render('admin/plugins/' + pluginData.nbbId, pluginData || {});
	};

	Meta.settings.get(pluginData.nbbId, function(err, settings) {
		if (!err && settings) {
			if (settings.mailchimpApiKey) {

				pluginSettings = {
					mailchimpApiKey: settings.mailchimpApiKey,
					mailchimpListId: settings.mailchimpListId,
					mailchimpEnabled: util.toBool(settings.mailchimpEnabled),
					mc_double_optin: util.toBool(settings.mc_double_optin),
					mc_update_existing: util.toBool(settings.mc_update_existing),
					mc_send_welcome: util.toBool(settings.mc_send_welcome)
				};

				mailchimpApi = new MailChimpAPI(settings.mailchimpApiKey, {version: '2.0'});
			} else {
				winston.warn('[plugins/' + pluginData.nbbId + '] mailchimpApiKey is not set');
			}

		} else {
			winston.warn('[plugins/' + pluginData.nbbId + '] Settings not set or could not be retrived!');
		}

		callback();
	});

	app.get('/admin/plugins/' + pluginData.nbbId, middleware.applyCSRF, middleware.admin.buildHeader, render);
	app.get('/api/admin/plugins/' + pluginData.nbbId, middleware.applyCSRF, render);

};

Plugin.admin = {
	menu: function(custom_header, callback) {
		custom_header.plugins.push({
			"route": '/plugins/' + pluginData.nbbId,
			"icon": pluginData.faIcon,
			"name": pluginData.name
		});

		callback(null, custom_header);
	}
};

Plugin.subscribe = function(userData) {
	if (mailchimpApi && pluginSettings.mailchimpEnabled && pluginSettings.mailchimpListId && userData) {
		var params = {
			id: pluginSettings.mailchimpListId,
			email: {email: userData.email},
			merge_vars: {
				'nodebb:uid': userData.uid,
				'nodebb:username': userData.username,
				'image': userData.picture || ''
			},
			double_optin: pluginSettings['mc_double_optin'],
			update_existing: pluginSettings['mc_update_existing'],
			send_welcome: pluginSettings['mc_send_welcome']
		};

		mailchimpApi.lists_subscribe(params, function(err, response){
			response = response || {};
			if (err) {
				winston.warn('[plugins/' + pluginData.nbbId + '] ' + err);
			} else {
				if (response.email) {
					if (process.env === 'development')
						winston.info('[plugins/' + pluginData.nbbId + '] Successfully subscribed ' + userData.email + ' to list: ' + pluginSettings.mailchimpListId);
				} else if (response.error) {
					winston.warn('[plugins/' + pluginData.nbbId + '] failed to subscribe ' + userData.email + ' without no returned :/, you\'re on your own, here\'s the response: \n' + JSON.stringify(response || {}));
				}
			}
		});
	} else {
		if (pluginSettings.mailchimpEnabled) {
			winston.warn('[plugins/' + pluginData.nbbId + '] did not attempt to subscribe ' + userData.email + '. make you have you entered both; a MailChimp API Key and a MailChimp List Id');
		}
	}
};

module.exports = Plugin;
