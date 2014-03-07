var Util = (function() {
	return {
		stringToJSON : function (jsonString) {
			return eval("(" + jsonString + ")");
		},
		bindDataToUI : function(data) {
			var fElement;
			for (var idx = 0, len = data.length; idx < len; idx++) {
				fElement = $("#" + data[idx].id);
				if (fElement) {
					fElement.val(data[idx].value);
				}
			}
		},
		getURLParameter : function(name) {
		    return decodeURI(
		        (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
		    );
		},
		getDataFromUI : function(elementId) {
			var elements = $("#" + elementId + " input");
			var data = [];
			for (var idx = 0, len = elements.length; idx < len; idx++) {
				data.push(elements[idx].name + "=" + elements[idx].value);
			}
			return data.join('&');
		},
		extend: function(baseClass, extendClass, obj) {
			for (var key in baseClass.prototype) {
				extendClass.prototype[key] = baseClass.prototype[key];
			}
			for (var key in obj) {
				extendClass.prototype[key] = obj[key];
			}
		}
	};
})();