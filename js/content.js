console.log('contentscript.js started');

chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
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
		var save = {};

		$("form").eq(targetform).find("input[type=text],select,textarea").each(function() {
			var name = $(this).attr("name");
			var attr = $(this).val();

			save[name] = attr;
		});

		sendResponse(JSON.stringify(save));
	}

	if ( request.method == "paste" ) {
		var data = request.data;
		var obj = JSON.parse(data);
		var targetform = request.targetform;

		if ( $("#convert_breaks").val() == "richtext" ) {
			$("#convert_breaks").trigger("focus");
			$("#convert_breaks").val("0");
			$("#convert_breaks").trigger("change");
			$("#convert_breaks").trigger("blur");
		}

		setTimeout(function() {
		for (var prop in obj) {
			$("form").eq(targetform).find("[name='" + prop +"']").val(obj[prop]);
		};
		}, 1000);
	}
});