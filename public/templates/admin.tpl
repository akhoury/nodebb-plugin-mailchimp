<style>
	div.note {
		font-size: 10px;
		color: gray;
	}
</style>
<h1>MailChimp</h1>

<h3>Account Options</h3>

<form class="form">

	<div class="form-group">
		<label for="apikey">
			<p>Your MailChimp API key</p>
			<input class="form-control" type="text" placeholder="MailChimp API Key" data-field="nodebb-plugin-mailchimp:options:apikey" id="apikey" />
			<div class="note">Visit <a target="_blank" href="https://admin.mailchimp.com/account/api/">mailchimp.com/account/api</a>, then click on Extras > API Keys</div>
		</label>
	</div>

	<div class="form-group">
		<label for="listid">
			<p>Your MailChimp list ID</p>
			<input class="form-control" type="text" placeholder="MailChimp List ID" data-field="nodebb-plugin-mailchimp:options:listid" id="listid" />
			<div class="note">Visit <a target="_blank" href="https://admin.mailchimp.com/lists/">mailchimp.com/lists</a> click on [LIST NAME] > Settings > List name & default (find it on the right)</div>
		</label>
	</div>

	<div class="form-group">
		<label for="logging">
			<p>Use Logging</p>
			<input class="form-control" type="checkbox" data-field="nodebb-plugin-mailchimp:options:logging" id="logging" />
			<div class="note">logs will be saved in <i>[NodeBB_PATH]/node_modules/nodebb-plugin-mailchimp/nodebb-plugin-mailchimp.log</i></div>
		</label>
	</div>

	<hr />
	<h4>MailChimp specific options</h4>
  <hr />

  <p>Just a few <a target="_blank" href="http://apidocs.mailchimp.com/api/2.0/lists/subscribe.php">lists.subscribe</a> options, for now</p>

	<div class="form-group">
		<label for="mc_double_optin">
			<p>double_optin</p>
			<input class="form-control" type="checkbox" data-field="nodebb-plugin-mailchimp:options:mc_double_optin" id="mc_double_optin" />
			<div class="note">Requires the user to click on a confirmation link, sent by MailChimp</div>
		</label>
	</div>

	<div class="form-group">
		<label for="mc_update_existing">
			<p>update_existing</p>
			<input class="form-control" type="checkbox" data-field="nodebb-plugin-mailchimp:options:mc_update_existing" id="mc_update_existing" />
			<div class="note">Updates existing record if email exists</div>
		</label>
	</div>

	<div class="form-group">
		<label for="mc_send_welcome">
			<p>send_welcome</p>
			<input class="form-control" type="checkbox" data-field="nodebb-plugin-mailchimp:options:mc_send_welcome" id="mc_send_welcome" />
			<div class="note">Send welcome note from mailchimp when user signs up</div>
		</label>
	</div>

	<button class="btn btn-lg btn-primary" id="save">Save</button>
</form>

<script type="text/javascript">
	require(['forum/admin/settings'], function(Settings) {
		Settings.prepare();
	});
</script>