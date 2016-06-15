var fs = require('fs');
// License files are actually Protocol-Buffers-encoded.
var protobuf = require('protocol-buffers');
// Libsodium is used for all things crypto here.
var sodium = require('sodium');
var toBuffer = sodium.Utils.toBuffer;

// Notice how a specific .proto file is used. This is because the protobuf module used here rejects
// anything that it does not understand, such as the objc-specific macros.
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
	if (email !== undefined) {
        this.email = email;
    }
    if (company !== undefined) {
        this.company = company;
    }
    if (instances !== undefined) {
        this.instances = instances;
    }
    if (orderId !== undefined) {
        this.orderId = orderId;
    }
	return this;
}

// An object abstracting away all cryptography & unserialization stuff. Instanciate one by passing a 
// `publicKey`, along with its encoding. See the README for more informations on obtaining a publicKey.
function LicenseChecker(publicKey, encoding) {
	this.publicKey = toBuffer(publicKey, encoding);
}

// The method for signing a LicenseMetadata object, using the seed passed when instanciating.
LicenseChecker.prototype.validate = function(buffer) {
	if (Object.getPrototypeOf(buffer) !== Buffer.prototype) {
		throw new Error("Must pass Buffer object !");
		return;
	}

	var license = messages.License.decode(buffer);
	var signature = license.signature;
	var metaBuf = messages.Metadata.encode(license.license);
	//console.log(this.publicKey.toString('hex'))
	var res = sodium.api.crypto_sign_verify_detached(signature, metaBuf, this.publicKey);
	//console.log(metaBuf.toString('hex'));
	//console.log(signature.toString('hex'));
	return res;
};

exports.LicenseMetadata = LicenseMetadata;
exports.LicenseChecker = LicenseChecker;
