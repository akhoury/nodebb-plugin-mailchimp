<h1>MailChimp</h1>

<h3>Account Options</h3>

<form class="form">

	<div class="form-group">
		<label for="apikey">
			<input type="text" placeholder="MailChimp API Key" data-field="nodebb-plugin-mailchimp:options:apikey" id="apikey" />
			Your MailChimp API key
			<p>Visit <a target="_blank" href="https://admin.mailchimp.com/account/api/">mailchimp.com/account/api</a>, then click on Extras > API Keys</p>
		</label>
	</div>

	<div class="form-group">
		<label for="listid">
			<input type="text" placeholder="MailChimp List ID" data-field="nodebb-plugin-mailchimp:options:listid" id="listid" />
			Your MailChimp list ID
			<p>Visit <a target="_blank" href="https://admin.mailchimp.com/lists/">mailchimp.com/lists</a> click on [LIST NAME] > Settings > List name & default (find it on the right)</p>
		</label>
	</div>

	<div class="form-group">
		<label for="logging">
			<input type="checkbox" data-field="nodebb-plugin-mailchimp:options:logging" id="logging" />
			Use Logging
		</label>
	</div>

	<hr />
	<h4>MailChimp specific options</h4>
  <hr />

  <p>Just a few <a target="_blank" href="http://apidocs.mailchimp.com/api/2.0/lists/subscribe.php">lists.subscribe</a> options, for now</p>

	<div class="form-group">
		<label for="mc_double_optin">
			<input type="checkbox" data-field="nodebb-plugin-mailchimp:options:mc_double_optin" id="mc_double_optin" />
			double_optin
			<p>Requires the user to click on a confirmation link, sent by MailChimp</p>
		</label>
	</div>

	<div class="form-group">
		<label for="mc_update_existing">
			<input type="checkbox" data-field="nodebb-plugin-mailchimp:options:mc_update_existing" id="mc_update_existing" />
			update_existing
			<p>Updates existing record if email exists</p>
		</label>
	</div>

	<div class="form-group">
		<label for="mc_send_welcome">
			<input type="checkbox" data-field="nodebb-plugin-mailchimp:options:mc_send_welcome" id="mc_send_welcome" />
			send_welcome
			<p>Send welcome note from mailchimp when user signs up</p>
		</label>
	</div>

	<button class="btn btn-lg btn-primary" id="save">Save</button>
</form>

<script type="text/javascript">
	require(['forum/admin/settings'], function(Settings) {
		Settings.prepare();
	});
</script>