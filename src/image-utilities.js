"use strict";

const async = require("async");
const path = require("path");
const fs = require("fs-extra");
const imageSize = require("image-size");
const jimp = require("jimp");
const utilities = require("extra-utilities");
const fileUtilities = require("file-utilities");

const imageUtilities = { };

Object.defineProperty(imageUtilities, "ResizeModes", {
	value: Object.freeze([
		"contain",
		"cover",
		"fill",
		"fit"
	]),
	enumerable: true
});

Object.defineProperty(imageUtilities, "DefaultResizeMode", {
	value: "fit",
	enumerable: true
});

const jimpResizeImageFunctionNames = Object.freeze({
	contain: "contain",
	cover: "cover",
	fill: "resize",
	fit: "scaleToFit"
});

const resizeImageFormat = {
	type: "object",
	removeExtra: true,
	nonEmpty: true,
	order: true,
	strict: true,
	autopopulate: true,
	required: true,
	format: {
		source: {
			type: "string",
			trim: true,
			nonEmpty: true,
			required: true
		},
		destination: {
			type: "string",
			trim: true,
			nonEmpty: true,
			required: true
		},
		width: {
			type: "integer",
			required: true,
			validator: function(value) {
				return value > 0;
			}
		},
		height: {
			type: "integer",
			required: true,
			validator: function(value) {
				return value > 0;
			}
		},
		resizeMode: {
			type: "string",
			case: "lower",
			trim: true,
			nonEmpty: true,
			default: imageUtilities.DefaultResizeMode,
			validator: function(value) {
				if(imageUtilities.ResizeModes.indexOf(value) === -1) {
					throw new Error(`Invalid image resize mode: '${value}'!`);
				}

				return true;
			}
		},
		overwrite: {
			type: "boolean",
			default: false
		},
		information: {
			type: "boolean",
			default: true
		}
	}
};

const resizeImageOptions = {
	throwErrors: true,
	verbose: false
};

imageUtilities.getImageInformation = function(imageFilePath, callback) {
	if(!utilities.isFunction(callback)) {
		throw new Error("Missing or invalid callback function!");
	}

	if(utilities.isEmptyString(imageFilePath)) {
		return callback(new Error("Missing or invalid image file path!"));
	}

	return async.waterfall(
		[
			function(callback) {
				return fileUtilities.getFileInformation(
					imageFilePath,
					function(error, info) {
						if(error) {
							return callback(error);
						}

						return callback(null, info);
					}
				);
			},
			function(info, callback) {
				return imageSize(
					imageFilePath,
					function(error, dimensions) {
						if(error) {
							return callback(error);
						}

						return callback(null, info, {
							width: dimensions.width,
							height: dimensions.height
						});
					}
				);
			}
		],
		function(error, info, size) {
			if(error) {
				return callback(error);
			}

			return callback(null, utilities.merge(info, size));
		}
	);
};

imageUtilities.resizeImage = function(options, callback) {
	if(!utilities.isFunction(callback)) {
		throw new Error("Missing or invalid callback function!");
	}

	try {
		options = utilities.formatValue(options, resizeImageFormat, resizeImageOptions);
	}
	catch(error) {
		return callback(error);
	}

	return async.waterfall(
		[
			function(callback) {
				return fs.stat(
					options.source,
					function(error, sourceStats) {
						if(error) {
							return callback(error);
						}

						if(sourceStats.isDirectory()) {
							return callback(new Error("Source image path cannot be a directory!"));
						}

						return callback(null, sourceStats);
					}
				);
			},
			function(sourceStats, callback) {
				return fs.stat(
					options.destination,
					function(error, destinationStats) {
						if(error && error.code !== "ENOENT") {
							return callback(error);
						}

						if(utilities.isEmptyString(path.extname(options.destination))) {
							options.destination = path.join(options.destination, path.basename(options.source));
						}

						return callback(null, sourceStats);
					}
				);
			},
			function(sourceStats, callback) {
				return fs.stat(
					options.destination,
					function(error, destinationStats) {
						if(error && error.code !== "ENOENT") {
							return callback(error);
						}

						if(utilities.isValid(destinationStats)) {
							if(sourceStats.ino === destinationStats.ino) {
								return callback(new Error("Source and destination file are the same!"));
							}

							if(!options.overwrite) {
								return callback(new Error("Destination file already exists!"));
							}
						}

						return callback();
					}
				);
			},
			function(callback) {
				return fs.mkdirs(
					path.dirname(options.destination),
					function(error) {
						if(error) {
							return callback(error);
						}

						return callback();
					}
				);
			},
			function(callback) {
				return jimp.read(options.source, function(error, image) {
					if(error) {
						return callback(error);
					}

					return image[jimpResizeImageFunctionNames[options.resizeMode]](options.width, options.height)
						.write(options.destination, function() { return callback(); });
				});
			},
			function(callback) {
				if(!options.information) {
					return callback(null, options.destination);
				}

				return imageUtilities.getImageInformation(
					options.destination,
					function(error, information) {
						if(error) {
							return callback(error);
						}

						return callback(null, options.destination, information);
					}
				);
			}
		],
		function(error, filePath, information) {
			if(error) {
				return callback(error);
			}

			return callback(null, utilities.merge({ path: filePath }, information));
		}
	);
};

module.exports = imageUtilities;
