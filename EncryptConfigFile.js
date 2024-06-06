var reqEncryptionInstance = require('./torus-references/common/crypto/EncryptionInstance');
encryptData();
//decryptData();
function encryptData() {
	var crypto = require('crypto');
	var fs = require('fs');
	fs.readFile('config/config.json', function (error, data) {
		//console.log(data.toString());
		var strConfig = data.toString();
		var encrypted = reqEncryptionInstance.Encryption(strConfig);
		fs.writeFile('config/config.enc', encrypted, function () {
			//console.log(encrypted);
			//decryptData();
			console.log('SUCCESS');
		});
	});
}
function decryptData() {
	var crypto = require('crypto');
	var fs = require('fs');
	fs.readFile('config.enc', function (error, result) {
		var decrypted = reqEncryptionInstance.DecryptPassword(result);
		//console.log(decrypted);
		console.log('SUCCESS');
	});
}