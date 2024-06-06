var reqEncryptionInstance = require('./torus-references/common/crypto/EncryptionInstance');
// print process.argv
var encrypted = reqEncryptionInstance.DoEncrypt(process.argv[2]);
console.log(encrypted);
//console.log(reqEncryptionInstance.DoDecrypt(('CDA5DE0A1D98F70C408086EB7730C6D8881E6A4C93228D831FFCE97081E406BEEEC1192E').toLowerCase()))
if(reqEncryptionInstance.DoDecrypt(encrypted) == process.argv[2]){
console.log('SUCCESS');
}