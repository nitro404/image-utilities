var async = require("async");
var fs = require("fs-extra");
var imageSize = require("image-size");
var jimp = require("jimp");
var utilities = require("extra-utilities");
var fileUtilities = require("file-utilities");

var imageUtilities = { };

imageUtilities.getImageInformation = function(imageFilePath, callback) {
	if(!utilities.isFunction(callback)) {
		throw new Error("Missing or invalid callback.");
	}

	if(utilities.isEmptyString(imageFilePath)) {
		return callback(new Error("Missing or invalid image file path!"));
	}

	return fileUtilities.getFileInformation(
		imageFilePath,
		function(error, info) {
			if(error) {
				return callback(error);
			}

			return imageSize(
				imageFilePath,
				function(error, dimensions) {
					if(error) {
						return callback(error);
					}

					return callback(null, {
						width: dimensions.width,
						height: dimensions.height,
						fileSize: info.fileSize,
						md5: info.md5
					});
				}
			);
		}
	);
};

imageUtilities.resizeImage = function(options, callback) {
	var formattedOptions = null;

	try {
		formattedOptions = utilities.formatObject(
			options,
			{
				source: {
					type: "string",
					trim: true,
					required: true
				},
				destination: {
					type: "string",
					trim: true,
					required: true
				},
				width: {
					type: "number",
					subtype: "integer",
					required: true,
					validator: function(value) {
						return value > 0;
					}
				},
				height: {
					type: "number",
					subtype: "integer",
					required: true,
					validator: function(value) {
						return value > 0;
					}
				},
				overwrite: {
					type: "boolean",
					required: false,
					default: false
				},
				information: {
					type: "boolean",
					default: true
				}
			},
			true,
			true
		);
	}
	catch(error) {
		error.status = 400;
		return callback(error);
	}

	if(formattedOptions === null) {
		var error = new Error("Missing or invalid image resizing options.");
		error.status = 400;
		return callback(error);
	}

	if(!fs.existsSync(formattedOptions.source)) {
		var error = new Error("Image resizing failed, source file does not exist!");
		error.status = 400;
		return callback(error);
	}

	if(fs.existsSync(formattedOptions.destination) && !formattedOptions.overwrite) {
		var error = new Error("Destination file already exists! Use truthful overwrite option or remove image and try again.");
		error.status = 400;
		return callback(error);
	}

	return async.waterfall(
		[
			function(callback) {
				var filePath = utilities.getFilePath(formattedOptions.destination);

				if(utilities.isEmptyString(filePath)) {
					return callback();
				}

				if(fs.existsSync(filePath)) { return callback(); }

				return fs.mkdirp(
					filePath,
					function(error) {
						if(error) {
							return callback(error);
						}

						return callback();
					}
				);
			},
			function(callback) {
				return jimp.read(formattedOptions.source, function(error, image) {
					if(error) {
						return callback(error);
					}

					return image.scaleToFit(formattedOptions.width, formattedOptions.height)
						.write(formattedOptions.destination, function() { return callback(); });
				});
			},
			function(callback) {
				if(!formattedOptions.information) {
					return callback(null, null);
				}

				return imageUtilities.getImageInformation(
					formattedOptions.destination,
					function(error, information) {
						if(error) {
							return callback(error);
						}

						information.path = formattedOptions.destination;

						return callback(null, information);
					}
				);
			}
		],
		function(error, information) {
			if(error) {
				return callback(error);
			}

			if(utilities.isValid(information)) {
				return callback(null, information);
			}

			return callback();
		}
	);
};


module.exports = imageUtilities;
