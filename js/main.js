/* MEMO
	BackGround(Event) Page = 後ろで動いているページ（権限強い、DOMアクセス不可）
	ContentScripts = 指定したドメインで読み込まれる追加JS（権限弱い、DOMアクセス可）
	BrowserAction = タスクバーから実行されるポップアップ（権限普通、DOMアクセス不可）
	http://www.apps-gcp.com/calendar-extension/
*/

function clearBuff() {
	$target = $("#buff");

	$target.val("");
}
function writeToBuff(text) {
	$target = $("#buff");

	$target.val( $target.text() + text );
}
function saveToBuff() {
	$target = $("#buff");

	$target.focus();
	$target.blur();
}
function jsStorageLoader(name) {
	if ( localStorage.getItem(name) ) {
		return localStorage.getItem(name);
	}
}
function jsStorageSaver(name, val) {
	localStorage.setItem(name, val);
}

$(document).ready(function(){
	$(".js-storage").each(function() {
		var name = $(this).attr("name");

		$(this).val( jsStorageLoader(name) );
	});

	$(".js-storage").bind("blur change", function() {
		var name = $(this).attr("name");
		jsStorageSaver(name, $(this).val());
	});

	$("#init-error").hide();

	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, { method: "getForm" }, function(response) {
			var html = response;

			$("#targetform").html(html);
			$("#targetform").val( jsStorageLoader("targetform") );

			if ( html == null ) {
				$("#init-error").show();
				$("#init-error").prevAll().hide();
			}
		});
	});

	// 元のカレンダーからイベントを取得
	$("#trace").click(function() {
		var targetform = $("#targetform").val();

		clearBuff();

		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, { method: "copy", targetform: $("#targetform").val() }, function(response) {
				var html = response;

				writeToBuff(html);
				saveToBuff();
			});
		});
	});

	// 元のカレンダーからイベントを取得
	$("#paste").click(function() {
		var targetform = $("#targetform").val();

		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, { method: "paste", data: $("#buff").val(), targetform: $("#targetform").val() }, function(response) {
			});
		});
	});

	// 元のカレンダーからイベントを取得
	$("#clear").click(function() {
		clearBuff();
		saveToBuff();
	});
});