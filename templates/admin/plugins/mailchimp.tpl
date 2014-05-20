<h1><i class="fa {faIcon}"></i> {name}</h1>

<form role="form" class="{nbbId}-settings">
	<fieldset>
		<div class="row">
			<div class="col-sm-12">
                <div class="checkbox">
                   <label>
                     <input data-toggle-target="input:not(#mailchimpEnabled)" type="checkbox" id="mailchimpEnabled" name="mailchimpEnabled"/> Enable MailChimp
                   </label>
                 </div>
                <p class="help-block">Enable or Disable the auto emails subscriptions, or just disable the plugin :)</p>
			</div>

            <div class="col-sm-12">
                <div class="form-group">
                    <label for="mailchimpApiKey">MailChimp API Key</label>
                    <input placeholder="MailChimp API Key here" type="text" class="form-control" id="mailchimpApiKey" name="mailchimpApiKey" />
                </div>
                <p class="help-block">
                    To get yours, visit <a target="_blank" href="https://admin.mailchimp.com/account/api/">mailchimp.com/account/api</a>, then click on Extras > API Keys
                </p>
            </div>

            <div class="col-sm-12">
                <div class="form-group">
                    <label for="mailchimpListId">MailChimp List ID</label>
                    <input placeholder="MailChimp List Id" type="text" class="form-control" id="mailchimpListId" name="mailchimpListId" />
                </div>
                <p class="help-block">
                    Visit <a target="_blank" href="https://admin.mailchimp.com/lists/">mailchimp.com/lists</a> click on [LIST NAME] > Settings > List name & default (find it on the right)
                </p>
            </div>

            <h3>Some MailChimp specific options</h3>
            <p class="text-muted">
                Basically I picked out a couple from
                <a target="_blank" href="http://apidocs.mailchimp.com/api/2.0/lists/subscribe.php">here</a>.
                Will add more per request
            </p>

            <div class="col-sm-12">
                <div class="checkbox">
                   <label>
                     <input type="checkbox" id="mc_double_optin" name="mc_double_optin"/> double_optin
                   </label>
                 </div>
                <p class="help-block">
                    If turned on, it would requires the user to click on a confirmation link in an email sent by MailChimp in order to subscribe.
                    Mailchimp recommends not abusing this, "<i>Abusing this may cause your account to be suspended</i>"
                    go <a target="_blank" href="http://apidocs.mailchimp.com/api/2.0/lists/subscribe.php">here</a> and search for 'double_optin' if you do not beleive me.
                    So, if you have high registration frequency, I would recommend turning it on.
                </p>
            </div>

		    <div class="col-sm-12">
                <div class="checkbox">
                   <label>
                     <input type="checkbox" id="mc_update_existing" name="mc_update_existing"/> update_existing
                   </label>
                 </div>
                <p class="help-block">Updates existing record if email exists</p>
            </div>

		    <div class="col-sm-12">
                <div class="checkbox">
                   <label>
                     <input type="checkbox" id="mc_send_welcome" name="mc_send_welcome"/> send_welcome
                   </label>
                 </div>
                <p class="help-block">Send welcome note from mailchimp when user signs up</p>
            </div>

		</div>

        <hr />

		<button class="btn btn-lg btn-primary" id="save" type="button">Save</button>

	    <p class="help-block">
	        This plugin uses <a target="_blank" href="https://github.com/gomfunkel/node-mailchimp">mailchimp</a>
	        <br />
	        File issues, pull requests or ideas at the <a target="_blank" href="https://github.com/akhoury/{nbbId}">github repo</a>
	    </p>
	</fieldset>
</form>


<script type="text/javascript">
	require(['settings'], function(Settings) {
		var nbbId = '{nbbId}',
		    klass = nbbId + '-settings',
		    wrapper = $('.' + klass);

        wrapper.find('input[type="checkbox"]').on('change', function(e) {
            var target = $(e.target),
                input = wrapper.find(target.attr('data-toggle-target'));
            if (target.is(':checked')) {
                input.prop('disabled', false);
            } else {
                input.prop('disabled', true);
            }
        });

		Settings.load(nbbId, wrapper, function() {
            wrapper.find('input[type="checkbox"]').trigger('change');
		});

		wrapper.find('#save').on('click', function(e) {
			e.preventDefault();
			wrapper.find('.form-group').removeClass('has-error');

			var invalidSelector = '', invalidCount = 0;
			wrapper.find('input[type="checkbox"]').each(function(i, checkbox) {
			    checkbox = $(checkbox);
			    if (checkbox.is(':checked') && !wrapper.find(checkbox.attr('data-toggle-target')).val()) {
			        invalidSelector += (!invalidCount++ ? '' : ', ') + checkbox.attr('data-toggle-target');
			    }
			});

			if (invalidSelector) {
			    wrapper.find(invalidSelector).each(function(i, el) { el = $(el); el.parents('.form-group').addClass('has-error'); });
			} else {
                Settings.save(nbbId, wrapper, function() {
                    socket.emit('admin.restart');
                });
			}
		});
	});
</script>