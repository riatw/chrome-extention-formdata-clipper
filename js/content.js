console.log('contentscript.js started');

chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
	function injectElement(text) {
		var element = document.createElement('script');
		element.type = 'text/javascript';
		element.textContent = text;
		(document.head||document.documentElement).appendChild(element);
	}

	if (request.method == "getForm") {
		var html = "";

		$("form").each(function(i) {
			var opt = $("<option />");
			opt.val(i);
			opt.text("form[name=" + $(this).attr("name") + ", id=" + $(this).attr("id") + "]" + ", action=" + $(this).attr("action") + "]" );

			html = html + $("<div />").append(opt).html();
		});

		sendResponse(html);
	}

	if ( request.method == "copy" ) {
		var targetform = request.targetform;
		var targetExclude = [];
		var save = {};
		var nameList = [];

		if ( request.target_exclude ) {
			var _arr = request.target_exclude.split(",");

			for ( var i = 0; i < _arr.length; i++ ) {
				targetExclude.push( "[name='" + _arr[i] + "']" );
			}
		}

		$("form").eq(targetform).find("input[type=text],input[type=checkbox],input[type=tel],select,textarea").not( targetExclude.join(",") ).each(function() {
			var name = $(this).attr("name");
			nameList.push(name);
		});

		for ( var i = 0; i < nameList.length; i++ ) {
			var current = nameList[i];
			save[current] = [];

			$("[name='" + current + "']").each(function() {
				if ( $(this).is("[type='checkbox'],[type='radio']") ) {
					if ( $(this).prop("checked") ) {
						save[current].push($(this).val());
					}
					else {
						save[current].push("");
					}
				}
				else {
					save[current].push($(this).val());
				}
			});
 		}

		sendResponse(JSON.stringify(save));
	}

	if ( request.method == "paste" ) {
		var data = request.data;
		var obj = JSON.parse(data);
		var targetform = request.targetform;

		setTimeout(function() {
			for (var prop in obj) {
				var $target = $("form").eq(targetform).find("[name='" + prop +"']");

				$target.each(function(i) {
					if ( $(this).is("[type='checkbox'],[type='radio']") ) {
						if ( $.inArray( $(this).val(), obj[prop] ) != -1 ) {
							$(this).prop("checked","checked");
						}
					}
					else {
						$(this).val( obj[prop][i] );
					}
				});

				// tinyMCE editor fix
				var id = $target.attr("id");

				if ( $target.next().is("[role='application']") ) {
					var script = "tinyMCE.get('" + id + "').setContent(`" + obj[prop] + "`)";
					injectElement(script);
				}
			};
		}, 1000);
	}
});