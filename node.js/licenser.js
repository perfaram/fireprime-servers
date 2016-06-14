var fs = require('fs');
// License files are actually Protocol-Buffers-encoded.
var protobuf = require('protocol-buffers');
// Libsodium is used for all things crypto here.
var sodium = require('sodium');
 
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
	this.email = email || null;
	this.company = company || null;
	this.instances = instances || null;
	this.orderId = orderId || null;
	return this;
}

// An object abstracting away all cryptography & serialization stuff. Instanciate one by passing a `seed`,
// along with its encoding. See the README for more informations on obtaining a seed.
function LicenseGenerator(seed, encoding) {
	var re = /^(?:utf8|ascii|binary|hex|utf16le|ucs2|base64)$/
	if( !re.test(encoding) ) {
        throw new Error('[LicenseGenerator] bad encoding. Must be: utf8|ascii|binary|hex|utf16le|ucs2|base64');
    }

	var signpair = new sodium.Key.Sign.fromSeed(seed, encoding);
	this.signer = new sodium.Sign(signpair);
}

// The method for signing a LicenseMetadata object, using the seed passed when instanciating.
LicenseGenerator.prototype.signMetadata = function(metadata) {
	if (Object.getPrototypeOf(metadata) !== LicenseMetadata.prototype) {
		throw new Error("Must pass LicenseMetadata object !");
		return;
	}

	var metaBuf = messages.Metadata.encode({
	 	name : metadata.name,
		target : metadata.target,
		licenseId : metadata.licenseId,
		created : metadata.created,
		email : metadata.email,
		company : metadata.company,
		instances : metadata.instances,
		orderId : metadata.orderId
	});

	var sigBuf = this.signer.signDetached(metaBuf, "binary");

	var licenseBuf = messages.License.encode({
		license: metadata,
		signature: sigBuf.sign
	});

	return licenseBuf;
};

exports.LicenseMetadata = LicenseMetadata;
exports.LicenseGenerator = LicenseGenerator;
