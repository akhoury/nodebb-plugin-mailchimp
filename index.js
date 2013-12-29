var	MailChimpAPI = require('mailchimp').MailChimpAPI,
	pluginData = require('./plugin.json'),
	fs = require('fs-extra'),
	path = require('path'),
	async = require('async'),
	log = require('tiny-logger').init(process.env.NODE_ENV === 'development' ? 'debug' : 'info,warn,error', '[' + pluginData.id + ']'),
	meta = module.parent.require('./meta'),
	logFile = path.join(__dirname, 'nodebb-plugin-mailchimp.log'),
	api;

(function(Plugin){
	Plugin.config = {};

	Plugin.init = function(callback){
		log.debug('init()');
		var _self = this,
			hashes = Object.keys(pluginData.defaults).map(function(field) { return pluginData.id + ':options:' + field });

		meta.configs.getFields(hashes, function(err, options){
			if (err) throw err;

			for (field in options) {
				meta.config[field] = options[field];
			}
			if (typeof _self.softInit == 'function') {
				_self.softInit(callback);
			} else if (typeof callback == 'function'){
				callback();
			}

		});
	};

	Plugin.reload = function(hookVals) {
		var	isThisPlugin = new RegExp(pluginData.id + ':options:' + Object.keys(pluginData.defaults)[0]);
		if (isThisPlugin.test(hookVals.key)) {
			this.init(this.softInit.bind(this));
		}
	};

	Plugin.admin = {
		menu: function(custom_header) {
			custom_header.plugins.push({
				"route": '/plugins/' + pluginData.name,
				"icon": 'icon-edit',
				"name": pluginData.name
			});

			return custom_header;
		},
		route: function(custom_routes, callback) {
			fs.readFile(path.join(__dirname, 'public/templates/admin.tpl'), function(err, tpl) {
				if (err) throw err;

				custom_routes.routes.push({
					route: '/plugins/' + pluginData.name,
					method: "get",
					options: function(req, res, callback) {
						callback({
							req: req,
							res: res,
							route: '/plugins/' + pluginData.name,
							name: Plugin,
							content: tpl
						});
					}
				});

				callback(null, custom_routes);
			});
		},
		activate: function(id) {
			log.debug('activate()');
			if (id === pluginData.id) {
				async.each(Object.keys(pluginData.defaults), function(field, next) {
					meta.configs.setOnEmpty(pluginData.id + ':options:' + field, pluginData.defaults[field], next);
				});
			}
		}
	};

	Plugin.softInit = function() {
		log.debug('softInit()');

		var	_self = this;

		if (!meta.config) {
			this.init(callback);
		}

		var prefix = pluginData.id + ':options:';
		Object.keys(meta.config).forEach(function(field, i) {
			var option, value;
			if (field.indexOf(pluginData.id + ':options:') === 0 ) {
				option = field.slice(prefix.length) || '';
				value = meta.config[field];
				var obj;
				if (option === 'logging' || option.indexOf('mc_') >= 0) {
					obj = value === '1';
				} else {
					obj = value || pluginData.defaults[option];
				}
				_self.config[option] = obj;
			}
		});

		// enable/disable logging
		this.toggleLogging(this.config.logging);

		// create the mailchimp api instance
		try {
			api = new MailChimpAPI(this.config.apikey, {version: '2.0'});
		} catch (err) {
			this.log('e0: ' + err);
		}

		this.initialized = true;
		if (typeof callback == 'function') {
			callback();
		}
	};

	Plugin.toggleLogging = function(toggle){
		var _self = this;
		if (toggle) {
			fs.createFile(logFile, function(err){
				if (err)
					log.warn('e2: ' + err);
				else
					_self.log('Logging enabled in file: ' + logFile);
			});
		} else {
			fs.remove(logFile, function(){
				log.debug('Logging disabled, file ' + logFile + ' removed.');
			});
		}
	};

	Plugin.log = function(msg) {
		var _self = this;
		if (_self.config.logging) {
			fs.appendFile(logFile, log.p + ' ' + msg + '\n', function(err){
				if (err)
					log.warn('e3: ' + err);
			});
		}
		log.debug(msg);
	};

	Plugin.listSubscribe = function(userData) {
		var _self = this;
		if (api && this.config.listid) {
			api.lists_subscribe({
				id: this.config.listid,
				email: {email: userData.email},
				merge_vars: {
					'nodebb:uid': userData.uid,
					'nodebb:username': userData.username,
					'image': userData.picture || ''
				},
				double_optin: this.config['mc_double_optin'],
				update_existing: this.config['mc_update_existing'],
				send_welcome: this.config['mc_send_welcome']
			}, function(err, res){
				res = res || {};
				if (err) {
					_self.log('e1: ' + err);
				} else {
					if (res.email) {
						_self.log('successfully subscribed: ' + JSON.stringify(res));
					} else if (res.error) {
						_self.log('API.failed to subscribe: ' + JSON.stringify(userData));
					}
				}
			});
		} else {
			this.log('Config.Failed to subscribe ' + JSON.stringify(userData))
		}
	};

	Plugin.init();

})(exports);
