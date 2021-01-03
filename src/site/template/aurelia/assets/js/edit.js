/**
 * Kunena Component
 * @package Kunena.Template.Crypsis
 *
 * @copyright     Copyright (C) 2008 - 2021 Kunena Team. All rights reserved.
 * @license https://www.gnu.org/copyleft/gpl.html GNU/GPL
 * @link https://www.kunena.org
 **/

/**
 *  Helper function for to perform JSON request for preview
 */
const previewActive = false;

function kPreviewHelper(previewActive) {
	const editor = jQuery('#editor');
	if (Joomla.getOptions('com_kunena.suffixpreview'))
	{
		var url = 'index.php?option=com_kunena&view=topic&layout=edit&format=raw';
	}
	else
	{
		var url = jQuery('#kpreview_url').val();
	}
	if (editor.val() !== null) {
		jQuery.ajax({
			type: 'POST',
			url: url,
			async: true,
			dataType: 'json',
			data: {body: editor.val()}
		})
			.done(function (data) {
				jQuery('#kbbcode-preview').html(data.preview);
			})
			.fail(function () {
				//TODO: handle the error of ajax request
			});
	}
}

jQuery(document).ready(function ($) {
	const qreply = $('.qreply');
	const editor = $('#editor');

	$('#tabs_kunena_editor a:first').tab('show');

	$('#tabs_kunena_editor a[href="#preview"]').click(function (e) {
		$('a[href="#write"]').parents('li,ul').removeClass('active');
		$('a[href="#secure_reply"]').parents('li,ul').removeClass('active');
		$('a[href="#preview"]').parents('li,ul').addClass('active');
		e.preventDefault();

		const preview = $("#kbbcode-preview");
		const message = $("#editor");
		const message_private = $("#editor-private");

		preview.css('display', 'block');

		message.hide();
		message_private.hide();

		kPreviewHelper();

		preview.attr('class', 'kbbcode-preview-bottom controls');
		const height = message.css('height');
		preview.css('height', height);
	});

	$('#tabs_kunena_editor a:last').click(function (e) {
		$('a[href="#write"]').parents('li,ul').removeClass('active');
		$('a[href="#preview"]').parents('li,ul').removeClass('active');
		$('a[href="#secure_reply"]').parents('li,ul').addClass('active');
		e.preventDefault();

		const message = $("#editor");
		const message_private = $("#editor-private");

		message.hide();
		message_private.show();
		$('#kbbcode-preview').hide();

		console.log('click on last');
	});

	$('#tabs_kunena_editor a[href="#write"]').click(function (e) {
		$('a[href="#preview"]').parents('li,ul').removeClass('active');
		$('a[href="#secure_reply"]').parents('li,ul').removeClass('active');
		$('a[href="#write"]').parents('li,ul').addClass('active');
		$('#kbbcode-preview').hide();
		$("#editor-private").hide();
		editor.css('display', 'inline-block');
		$('#markItUpeditor').css('display', 'inline-block');
	});

	$('#tabs_kunena_editor a[href="#preview"]').click(function (e) {
		editor.hide();
		$('#markItUpeditor').hide();
	});

	const cat = localStorage.getItem('copyKunenaeditor');
	if (cat) {
		var textarea = $("#editor").next();
		textarea.empty();
		$('#editor').val(cat);
		localStorage.removeItem('copyKunenaeditor');
	}

	$('#reset').onclick = function() {
		localStorage.removeItem('copyKunenaeditor');
	};

	/* To enabled emojis in kunena textera feature like on github */
	if ($('#kemojis_allowed').val() === 1) {
		var item = '';
		if (editor.length > 0 && qreply.length === 0) {
			item = '#editor';
		}
		else if (qreply.length > 0) {
			item = '.qreply';
		}

		if ($('#wysibb-body').length > 0) {
			item = '#wysibb-body';
		}

		if (item !== undefined) {
			$(item).atwho({
				at: ":",
				displayTpl: "<li data-value='${key}'>${name} <img src='${url}' height='20' width='20' /></li>",
				insertTpl: '${name}',
				callbacks: {
					remoteFilter: function (query, callback) {
						if (query.length > 0) {
							$.ajax({
								url: $("#kurl_emojis").val(),
								data: {
									search: query
								}
							})
								.done(function (data) {
									callback(data.emojis);
								})
								.fail(function () {
									//TODO: handle the error of ajax request
								});
						}
					}
				}
			});
		}
	}

	if (item !== undefined) {
		const users_url = $('#kurl_users').val();
		$(item).atwho({
			at: "@",
			data: users_url,
			limit: 5
		});
	}


	/* Store form data into localstorage every 1 second */
	if ($.fn.sisyphus !== undefined) {
		$("#postform").sisyphus({
			locationBased: true,
			timeout: 5
		});
	}

	$('#kshow_attach_form').click(function () {
		if ($('#kattach_form').is(":visible")) {
			$('#kattach_form').hide();
		}
		else {
			$('#kattach_form').show();
		}
	});

	$('.Kreplyclick').click(function () {
		const name = '#' + $(this).attr('data-related');
		if ($(name).is(":visible")) {
			$(name).hide();
		}
		else {
			$(name).show();
		}

		document.getElementsByTagName('body')[0].style = 'overflow: auto';
	});

	$('.kreply-cancel').click(function () {
		$('.qreplyform').hide();
	});

	$('#form_submit_button').click(function () {
		$("#subject").attr('required', 'required');

		localStorage.removeItem('copyKunenaeditor');
	});

	let category_template_text;
	$('#postcatid').change(function () {
		const catid = $('select#postcatid option').filter(':selected').val();
		const kurl_topicons_request = $('#kurl_topicons_request').val();

		if ($('#kanynomous-check').length > 0) {
			const arrayanynomousbox = jQuery.parseJSON(Joomla.getOptions('com_kunena.arrayanynomousbox'));
			if (arrayanynomousbox[catid] !== undefined) {
				$('#kanynomous-check').show();
				$('#kanonymous').prop('checked', true);
			}
			else {
				$('#kanynomous-check').hide();
				$('#kanonymous').prop('checked', false);
			}
		}

		// Load topic icons by ajax request
		$.ajax({
			type: 'POST',
			url: kurl_topicons_request,
			async: true,
			dataType: 'json',
			data: {catid: catid}
		})
			.done(function (data) {
				$('#iconset_topic_list').remove();

				const div_object = $('<div>', {'id': 'iconset_topic_list'});

				$('#iconset_inject').append(div_object);

				$.each(data, function (index, value) {
					if (value.type !== 'system') {
						if (value.id === 0) {
							var input = $('<input>', {
								type: 'radio',
								id: 'radio' + value.id,
								name: 'topic_emoticon',
								value: value.id
							}).prop('checked', true);
						}
						else {
							var input = $('<input>', {
								type: 'radio',
								id: 'radio' + value.id,
								name: 'topic_emoticon',
								value: value.id
							});
						}

						const span_object = $('<span>', {'class': 'kiconsel'}).append(input);

						if (Joomla.getOptions('com_kunena.kunena_topicicontype') === 'B3') {
							var label = $('<label>', {
								'class': 'radio inline',
								'for': 'radio' + value.id
							}).append($('<span>', {
								'class': 'glyphicon glyphicon-topic glyphicon-' + value.b3,
								'border': '0',
								'al': ''
							}));
						}
						else if (Joomla.getOptions('com_kunena.kunena_topicicontype') === 'fa') {
							var label = $('<label>', {
								'class': 'radio inline',
								'for': 'radio' + value.id
							}).append($('<i>', {
								'class': 'fa glyphicon-topic fa-2x fa-' + value.fa,
								'border': '0',
								'al': ''
							}));
						}
						else {
							var label = $('<label>', {
								'class': 'radio inline',
								'for': 'radio' + value.id
							}).append($('<img>', {'src': value.path, 'border': '0', 'al': ''}));
						}

						span_object.append(label);

						$('#iconset_topic_list').append(span_object);
					}
				});
			})
			.fail(function () {
				//TODO: handle the error of ajax request
			});

		// Load template text for the category by ajax request
		category_template_text = function cat_template_text() {
			return $.ajax({
				type: 'POST',
				url: $('#kurl_category_template_text').val(),
				async: true,
				dataType: 'json',
				data: {catid: catid}
			})
				.done(function (data) {
					if ($('#editor').val().length > 1) {
						if ($('#editor').val().length > 1) {
							$('#modal_confirm_template_category').modal('show');
						}
						else {
							$('#editor').val(category_template_text);
						}
					}
					else {
						if (data.length > 1) {
							$('#modal_confirm_template_category').modal('show');
						}
						else {
							$('#editor').val(data);
						}
					}

				})
				.fail(function () {
					//TODO: handle the error of ajax request
				});
		}();
	});

	$('#modal_confirm_erase').click(function () {
		$('#modal_confirm_template_category').modal('hide');
		const textarea = $("#editor").next();
		textarea.empty();
		$('#editor').val(category_template_text.responseJSON);
	});

	$('#modal_confirm_erase_keep_old').click(function () {
		$('#modal_confirm_template_category').modal('hide');
		const existing_content = editor.val();
		const textarea = $("#editor").next();
		textarea.empty();
		$('#editor').val(category_template_text.responseJSON + ' ' + existing_content);
	});

	if ($.fn.datepicker !== undefined) {
		// Load datepicker for poll
		$('#datepoll-container .input-group.date').datepicker({
			orientation: "bottom auto"
		});
	}

	const test = Joomla.getOptions('com_kunena.kunena_quickreplymesid');
	$('#gotoeditor'+test).click(function () {
		localStorage.setItem("copyKunenaeditor", $(".test" + test).val());
	});
});