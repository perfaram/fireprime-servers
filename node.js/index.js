//
var fs = require('fs');
var LicenseGenerator = require("./license_generator").LicenseGenerator;
var LicenseMetadata = require("./license_checker").LicenseMetadata;
var LicenseChecker = require("./license_checker").LicenseChecker;
var sodium = require('sodium');

var timestamp = 946684800; //2000-01-01 00:00:00 GMT
var metadata = new LicenseMetadata("Jon Snow", "com.valyriansteel.longclaw", "ASOIAF96", timestamp);
var licenseGen = new LicenseGenerator("Aav6yqemxoPNNqxeKJXMlruKxXEHLD931S8pXzxt4mk=", "base64");
var signedLicenseBuffer = licenseGen.signMetadata(metadata);

var checker = new LicenseChecker("0ec5b2832a13701eff353e4ea91cd3d1e6857fee9b2414920517c33b2537c7d9", "hex");
console.log(checker.validate(signedLicenseBuffer) ? "valid license" : "invalid license");

// Examples
// Reading a file : fs.readFileSync('./mylicense.license'))

// Saving a license buffer to disk : 
// var wstream = fs.createWriteStream('mynewlicense.license');
// wstream.write(buf);
// wstream.end();