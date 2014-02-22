var Model = require('perstore/model').Model,
	pinturaConfig = require("pintura/pintura").config,
	admins = require("perstore/util/settings").security.admins,
	Notifying = require("perstore/store/notifying").Notifying,
	Role = pinturaConfig.security.getAuthenticationFacet();

pinturaConfig.getDataModel = function(request) {
	return SuperModel;
	/*var role = request.remoteUser;
	if (role) {
		if (admins.indexOf(user) > -1) {
			return SuperModel;
		}
	}*/
};

var ClassModel = Model(Notifying(require("perstore/stores").DefaultStore()),{});
var SuperModel = {
		User: require('./model/user').User,
		Itinerary: require('./model/itinerary').Itinerary,
		Role: Role,
		Class: ClassModel
};

require('perstore/model').initializeRoot(SuperModel);

exports.DataModel = SuperModel = require('perstore/model').createModelsFromModel(ClassModel, SuperModel);