var fs = require('fs');
// License files are actually Protocol-Buffers-encoded.
var protobuf = require('protobufjs');
var builder = protobuf.loadProtoFile('../fireprime-protos/license_js.proto'),
FirePrime = builder.build("FirePrime"),
FPLicense = FirePrime.License,
FPMetadata = FirePrime.Metadata;
// Libsodium is used for all things crypto here.
var sodium = require('sodium');
var toBuffer = sodium.Utils.toBuffer;

// License files are actually Protocol-Buffers-encoded.
var protobuf = require('protocol-buffers');
var messages = protobuf(fs.readFileSync('../fireprime-protos/license_js.proto'));

// Little reminder of how to turn an hexadecimal representation (of a signing key, usually)
// to a buffer, and reverse
// hex2bin : new Buffer(key, "hex");
// bin2hex : .toString('hex');

// An object representing a license's metadata, such as the end user's name, the app it will be used 
// for, etc... See README for more informations about the parameters here
function LicenseMetadata(name, target, licenseId, created, email, company, instances, orderId) {
	if (!name || !target || !licenseId || !created) {
		throw new Error("Argument `name`, `target`, `licenseId`, and `created` are required");
		return;
	}
	this.name = name;
	this.target = target;
	this.licenseId = licenseId;
	this.created = created;
	if (email !== undefined && email !== '') {
        this.email = email;
    }
    if (company !== undefined && company !== '') {
        this.company = company;
    }
    if (instances !== undefined) {
        this.instances = instances;
    }
    if (orderId !== undefined && orderId !== '') {
        this.orderId = orderId;
    }
	return this;
}

// An object abstracting away all cryptography & unserialization stuff. Instanciate one by passing a 
// `publicKey`, along with its encoding. See the README for more informations on obtaining a publicKey.
function LicenseChecker(publicKey, encoding) {
	this.publicKey = toBuffer(publicKey, encoding);
}

// The method for validating a license buffer (e.g; directly read from a file), using the public key 
// passed when instanciating.
LicenseChecker.prototype.validate = function(buffer) {
	if (Object.getPrototypeOf(buffer) !== Buffer.prototype) {
		throw new Error("Must pass Buffer object !");
		return;
	}

	var license = messages.License.decode(buffer);
	var metadata = license.license;
	for (var i in metadata) {
		if (metadata[i] === null || metadata[i] === undefined || metadata[i] == '' || metadata[i] == 0) {
			delete metadata[i];
		}
	}
	
	var signatureBuffer = license.signature;
	var metadataBuffer = messages.Metadata.encode(metadata);
	var res = sodium.api.crypto_sign_verify_detached(signatureBuffer, metadataBuffer, this.publicKey);
	return res;
};

exports.LicenseMetadata = LicenseMetadata;
exports.LicenseChecker = LicenseChecker;
