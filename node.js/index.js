//
var Licensing = require("./licenser");
var unixTmstp = (Math.floor(Date.now() / 1000));
var metadata = new Licensing.LicenseMetadata("Jon Snow", "org.nightswatch.longclaw", "COCO", unixTmstp);

var licenseGen = new Licensing.LicenseGenerator("Aav6yqemxoPNNqxeKJXMlruKxXEHLD931S8pXzxt4mk=", "base64");

var buf = licenseGen.signMetadata(metadata);
console.log(buf);
//var check = messages.License.decode(buf);
//console.log(check);