/*
* Copyright 2013 Research In Motion Limited.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var barcodescanner,
	resultObjs = {},
	readCallback,
	_utils = require("../../lib/utils");

module.exports = {

	// methods to start and stop scanning
	startRead: function (success, fail, args, env) {
		var result = new PluginResult(args, env);
		resultObjs[result.callbackId] = result;
		readCallback = result.callbackId;
		result.ok(barcodescanner.getInstance().startRead(result.callbackId), true);
		success();
	},
	stopRead: function (success, fail, args, env) {
		var result = new PluginResult(args, env);
		resultObjs[result.callbackId] = result;
		result.ok(barcodescanner.getInstance().stopRead(result.callbackId), true);
		success();
	},
	add: function (success, fail) {
		console.log('Frame Available event listening');
	},
	remove: function (success, fail) {
		console.log('End listening to frames');
	}
};


JNEXT.BarcodeScanner = function () {
	var self = this,
		hasInstance = false;

	self.getId = function () {
		return self.m_id;
	};

	self.init = function () {
		if (!JNEXT.require("libBarcodeScanner")) {
			return false;
		}

		self.m_id = JNEXT.createObject("libBarcodeScanner.BarcodeScannerJS");

		if (self.m_id === "") {
			return false;
		}

		JNEXT.registerEvents(self);
	};

	// ************************
	// Enter your methods here
	// ************************

	// Fired by the Event framework (used by asynchronous callbacks)

	self.onEvent = function (strData) {
		var arData = strData.split(" "),
			callbackId = arData[0],
			receivedEvent = arData[1],
			data = receivedEvent + " " + arData[2],
			result = resultObjs[callbackId],
			events = [
                "barcodescanner.codefound.native",
                "barcodescanner.errorfound.native",
                "barcodescanner.frameavailable.native",
                "barcodescanner.started.native",
                "barcodescanner.ended.native"
            ];

		if (events.indexOf(receivedEvent) !== -1) {
			result.callbackOk(data, true);
		}
		if (receivedEvent === "barcodescanner.ended.native") {
			delete resultObjs[readCallback];
			readCallback = null;
		}

	};

	// Thread methods
	self.startRead = function (callbackId) {
		return JNEXT.invoke(self.m_id, "startRead " + callbackId);
	};
	self.stopRead = function (callbackId) {
		return JNEXT.invoke(self.m_id, "stopRead " + callbackId);
	};

	// ************************
	// End of methods to edit
	// ************************
	self.m_id = "";

	self.getInstance = function () {
		if (!hasInstance) {
			hasInstance = true;
			self.init();
		}
		return self;
	};

};

barcodescanner = new JNEXT.BarcodeScanner();
