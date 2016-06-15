var fs = require('fs');
// License files are actually Protocol-Buffers-encoded.
var protobuf = require('protocol-buffers');
// Libsodium is used for all things crypto here.
var sodium = require('sodium'), toBuffer = sodium.Utils.toBuffer;
// Relies on the checker part for LicenseMetadata definition
var LicenseMetadata = require('./license_checker').LicenseMetadata;
 
// Notice how a specific .proto file is used. This is because the protobuf module used here rejects
// anything that it does not understand, such as the objc-specific macros.
var messages = protobuf(fs.readFileSync('../fireprime-protos/license_js.proto'));

// An object abstracting away all cryptography & serialization stuff. Instanciate one by passing a `seed`,
// along with its encoding. See the README for more informations on obtaining a seed.
function LicenseGenerator(seed, encoding) {
	var re = /^(?:utf8|ascii|binary|hex|utf16le|ucs2|base64)$/
	if( !re.test(encoding) ) {
        throw new Error('[LicenseGenerator] bad encoding. Must be: utf8|ascii|binary|hex|utf16le|ucs2|base64');
    }

	this.signpair = new sodium.Key.Sign.fromSeed(seed, encoding);
	this.signer = new sodium.Sign(this.signpair);
}

// The method for signing a LicenseMetadata object, using the seed passed when instanciating.
LicenseGenerator.prototype.signMetadata = function(metadata) {
	if (Object.getPrototypeOf(metadata) !== LicenseMetadata.prototype) {
		throw new Error("Must pass LicenseMetadata object !");
		return;
	}

	var metadataBuf = messages.Metadata.encode(metadata);

	var signatureBuffer = this.signer.signDetached(metadataBuf, "binary");

	var licenseBuf = messages.License.encode({
		license: metadata,
		signature: signatureBuffer.sign
	});

	return licenseBuf;
};

exports.LicenseGenerator = LicenseGenerator;
