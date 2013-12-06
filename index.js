var	MailChimpAPI = require('mailchimp').MailChimpAPI,
	fse = require('fs-extra'),
	path = require('path'),
	async = require('async'),
	meta = module.parent.require('./meta'),
	api,
	logFile = path.join(__dirname, 'nodebb-plugin-mailchimp.log'),

	Mailchimp = {
		config: {},

		init: function() {

			// Load saved config
			var	_self = this,
				fields = [
					'apikey', 'listid', 'logging',
					'mc_double_optin', 'mc_update_existing', 'mc_send_welcome'
				],
				defaults = [
					'', '', false,
					false, true, false

				],
				hashes = fields.map(function(field) { return 'nodebb-plugin-mailchimp:options:' + field });

			meta.getFields('config', hashes, function(err, options) {
				fields.forEach(function(field, idx) {
					if (field === 'logging' || field.indexOf('mc_') >= 0) {
						options[idx] = options[idx] === '1';
					} else {
						options[idx] = options[idx] || defaults[idx];
					}
					_self.config[field] = options[idx];
				});

				// enable/disable logging
				_self.toggleLogging(_self.config.logging);

				// create the mailchimp api instance
				try {
					api = new MailChimpAPI(_self.config.apikey, {version: '2.0'});
				} catch (err) {
					_self.log('e0: ' +err);
				}
			});
		},

		listSubscribe: function(userData) {
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
		},

		reload: function(hookVals) {
			var	isMailchimpPlugin = /^nodebb-plugin-mailchimp:options:apikey/;
			if (isMailchimpPlugin.test(hookVals.key)) {
				this.init();
			}
		},

		toggleLogging: function(toggle){
			var _self = this;
			if (toggle) {
				fse.createFile(logFile, function(err){
					if (err)
						_self.log('e2: ' + err, true);
					else
						_self.log('Logging enabled in file: ' + logFile);
				});
			} else {
				fse.remove(logFile, function(){
					_self.log('Logging disabled, file ' + logFile + ' removed.', true);
				});
			}
		},

		log: function(msg, dontWrite){
			var _self = this, prefix = '[nodebb-plugin-mailchimp]: ';
			console.log(prefix + msg);

			if (!dontWrite && _self.config.logging)
				fse.appendFile(logFile, prefix + msg + '\n', function(err){
					if (err)
						_self.log('e3: ' + err, true);
				});
		},

		admin: {

			menu: function(custom_header, callback) {
				custom_header.plugins.push({
					"route": '/plugins/mailchimp',
					"icon": 'icon-edit',
					"name": 'Mailchimp'
				});

				return custom_header;
			},

			route: function(custom_routes, callback) {
				fse.readFile(path.join(__dirname, 'public/templates/admin.tpl'), function(err, tpl) {
					custom_routes.routes.push({
						route: '/plugins/mailchimp',
						method: "get",
						options: function(req, res, callback) {
							callback({
								req: req,
								res: res,
								route: '/plugins/mailchimp',
								name: Mailchimp,
								content: tpl
							});
						}
					});

					callback(null, custom_routes);
				});
			},

			activate: function(id) {
				if (id === 'nodebb-plugin-mailchimp') {
						defaults = [
							{ field: 'apikey', value: '' },
							{ field: 'listid', value: '' },
							{ field: 'logging', value: '0' },
							{ field: 'mc_double_optin', value: '0' },
							{ field: 'mc_update_existing', value: '1' },
							{ field: 'mc_send_welcome', value: '0' }
						];

					async.each(defaults, function(optObj, next) {
						meta.configs.setOnEmpty('nodebb-plugin-mailchimp:options:' + optObj.field, optObj.value, next);
					});
				}
			}
		}
	};

Mailchimp.init();
module.exports = Mailchimp;
