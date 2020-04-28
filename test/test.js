"use strict";

const imageUtilities = require("../src/image-utilities.js");
const async = require("async");
const utilities = require("extra-utilities");
const path = require("path");
const fs = require("fs-extra");
const chai = require("chai");
const expect = chai.expect;

const tempDirectory = path.join(__dirname, "temp");

const paths = {
	tempDirectory: tempDirectory,
	testImage: path.join(__dirname, "data/test.png"),
	testJson: path.join(__dirname, "data/test.json"),
	missingFile: path.join(__dirname, "data/missing.jpg"),
	outputImage: path.join(tempDirectory, "test_resized.png"),
	localOutputImage: path.join(__dirname, "test_local.png")
};

let invalidPathCharacters = null;

if(process.platform === "win32") {
	invalidPathCharacters = "<>:\"|?*";
}

const verbose = false;

describe("Image Utilities", function() {
	describe("getImageInformation", function() {
		it("should be a function", function() {
			expect(utilities.isFunction(imageUtilities.getImageInformation)).to.equal(true);
		});

		it("should throw an error if no callback function is provided", function() {
			let thrownError = null;

			try { imageUtilities.getImageInformation(); }
			catch(error) { thrownError = error; }

			expect(thrownError).to.not.equal(null);
			expect(thrownError.message).to.equal("Missing or invalid callback function!");
		});

		it("should return an error if an invalid path is provided", function(callback) {
			imageUtilities.getImageInformation(
				-Infinity,
				function(error, info) {
					expect(error).to.not.equal(null);
					expect(error.message).to.equal("Missing or invalid image file path!");
					expect(info).to.be.undefined;

					return callback();
				}
			);
		});

		it("should correctly retrieve the file size, md5 hash and dimensions for an image", function(callback) {
			imageUtilities.getImageInformation(
				path.join(__dirname, "/data/test.png"),
				function(error, info) {
					expect(error).to.equal(null);
					expect(utilities.isObjectStrict(info)).to.equal(true);
					expect(info.fileSize).to.equal(186);
					expect(info.md5).to.equal("3ef805e62459d92a5ca749a164ce07f0");
					expect(info.width).to.equal(4);
					expect(info.height).to.equal(3);

					return callback();
				}
			);
		});

		it("should return an error for invalid image files", function(callback) {
			imageUtilities.getImageInformation(
				paths.testJson,
				function(error, info) {
					expect(error).to.not.equal(null);
					expect(info).to.be.undefined;

					return callback();
				}
			);
		});

		it("should return an error for files that do not exist", function(callback) {
			imageUtilities.getImageInformation(
				paths.missingFile,
				function(error, info) {
					expect(error).to.not.equal(null);
					expect(info).to.be.undefined;

					return callback();
				}
			);
		});

		it("should return an error for directories", function(callback) {
			imageUtilities.getImageInformation(
				path.join(__dirname, "/data"),
				function(error, info) {
					expect(error).to.not.equal(null);
					expect(info).to.be.undefined;

					return callback();
				}
			);
		});
	});

	describe("resizeImage", function() {
		const validResizeImageOptions = {
			source: paths.testImage,
			destination: paths.outputImage,
			width: 8,
			height: 6
		};

		const resizedImageInfo = {
			fileSize: 213,
			md5: "dcf4e631bc95f7ad1c5547b19ac0cbbf",
			width: 8,
			height: 6
		};

		afterEach(function(callback) {
			async.eachSeries(
				[paths.tempDirectory, paths.localOutputImage],
				function(path, callback) {
					return fs.stat(
						path,
						function(error, stats) {
							if(error && error.code !== "ENOENT") {
								return callback(error);
							}

							if(!stats) {
								return callback();
							}

							return fs.remove(
								path,
								function(error) {
									if(error) {
										return callback(error);
									}

									if(verbose) {
										console.log("Removed temporary " + (stats.isDirectory() ? "directory" : "file") +": " + path);
									}

									return callback();
								}
							);
						}
					);
				},
				function(error) {
					if(error) {
						if(verbose) {
							console.error(error);
						}
					}

					return callback();
				}
			);
		});

		it("should be a function", function() {
			expect(utilities.isFunction(imageUtilities.resizeImage)).to.equal(true);
		});

		it("should throw an error if no callback function is provided", function() {
			let thrownError = null;

			try { imageUtilities.resizeImage(); }
			catch(error) { thrownError = error; }

			expect(thrownError).to.not.equal(null);
			expect(thrownError.message).to.equal("Missing or invalid callback function!");
		});

		it("should return an error if invalid options are provided", function(callback) {
			const invalidOptions = [
				undefined, null, false, true, new Boolean(false), new Boolean(true), 0, 1, 3.141592654, NaN, Infinity, -Infinity, "", "test", " trim\t", { }, { nice: "meme" }, [ ], [0], new Date(), function() { }, new RegExp(".+"),
				{
					source: paths.testImage,
					destination: paths.outputImage,
					width: 8,
				},
				{
					source: paths.testImage,
					destination: paths.outputImage,
					height: 6
				},
				{
					source: paths.testImage,
					width: 8,
					height: 6
				},
				{
					destination: paths.outputImage,
					width: 8,
					height: 6
				},
				utilities.merge(validResizeImageOptions, { width: -Infinity }),
				utilities.merge(validResizeImageOptions, { width: -1 }),
				utilities.merge(validResizeImageOptions, { height: NaN }),
				utilities.merge(validResizeImageOptions, { height: -1 }),
				utilities.merge(validResizeImageOptions, { destination: "\t" }),
				utilities.merge(validResizeImageOptions, { source: " " }),
				utilities.merge(validResizeImageOptions, { overwrite: function() { } }),
				utilities.merge(validResizeImageOptions, { information: new Date() })
			];

			async.eachSeries(
				invalidOptions,
				function(invalidOption, callback) {
					imageUtilities.resizeImage(
						invalidOption,
						function(error, info) {
							expect(error).to.not.equal(null);
							expect(info).to.be.undefined;

							return callback();
						}
					);
				},
				function(error) {
					if(error) {
						return callback(error);
					}

					return callback();
				}
			);
		});

		it("should return an error for invalid resize modes", function(callback) {
			imageUtilities.resizeImage(
				utilities.merge(
					validResizeImageOptions,
					{
						resizeMode: "scalar"
					}
				),
				function(error, info) {
					expect(error).to.not.equal(null);
					expect(error.message).to.equal("Invalid image resize mode: 'scalar'!");
					expect(info).to.be.undefined;

					return callback();
				}
			);
		});

		it("should return an error for invalid source image files", function(callback) {
			imageUtilities.resizeImage(
				utilities.merge(
					validResizeImageOptions,
					{
						source: paths.testJson
					}
				),
				function(error, info) {
					expect(error).to.not.equal(null);
					expect(info).to.be.undefined;

					return callback();
				}
			);
		});

		it("should return an error for source files that do not exist", function(callback) {
			imageUtilities.resizeImage(
				utilities.merge(
					validResizeImageOptions,
					{
						source: paths.missingFile
					}
				),
				function(error, info) {
					expect(error).to.not.equal(null);
					expect(error.code).to.equal("ENOENT");
					expect(info).to.be.undefined;

					return callback();
				}
			);
		});

		it("should return an error for source directories", function(callback) {
			imageUtilities.resizeImage(
				utilities.merge(
					validResizeImageOptions,
					{
						source: path.join(__dirname, "data")
					}
				),
				function(error, info) {
					expect(error).to.not.equal(null);
					expect(error.message).to.equal("Source image path cannot be a directory!");
					expect(info).to.be.undefined;

					return callback();
				}
			);
		});

		it("should return an error if the destination file already exists and overwrite is set to false", function(callback) {
			imageUtilities.resizeImage(
				utilities.merge(
					validResizeImageOptions,
					{
						destination: paths.testJson
					}
				),
				function(error, info) {
					expect(error).to.not.equal(null);
					expect(error.message).to.equal("Destination file already exists!");
					expect(info).to.be.undefined;

					return callback();
				}
			);
		});

		it("should return an error if the source and destination files are the same", function(callback) {
			imageUtilities.resizeImage(
				utilities.merge(
					validResizeImageOptions,
					{
						destination: validResizeImageOptions.source
					}
				),
				function(error, info) {
					expect(error).to.not.equal(null);
					expect(error.message).to.equal("Source and destination file are the same!");
					expect(info).to.be.undefined;

					return callback();
				}
			);
		});

		it("should " + (process.platform === "win32" ? "not " : "") + "return an error if the source and destination files are the same but in different case on " + process.platform, function(callback) {
			const newOutputImage = path.join(path.dirname(validResizeImageOptions.source), path.basename(validResizeImageOptions.source).toUpperCase());

			imageUtilities.resizeImage(
				utilities.merge(
					validResizeImageOptions,
					{
						destination: newOutputImage
					}
				),
				function(error, info) {
					if(process.platform === "win32") {
						expect(error).to.not.equal(null);
						expect(error.message).to.equal("Source and destination file are the same!");
						expect(info).to.be.undefined;
					}
					else {
						expect(error).to.equal(null);
						expect(utilities.isObjectStrict(info)).to.equal(true);
						expect(info).to.deep.equal(utilities.merge({ path: newOutputImage }, resizedImageInfo));
					}

					return callback();
				}
			);
		});

		it("should allow for images to be resized and output to the current working directory", function(callback) {
			imageUtilities.resizeImage(
				utilities.merge(
					validResizeImageOptions,
					{
						destination: paths.localOutputImage
					}
				),
				function(error, info) {
					expect(error).to.equal(null);
					expect(utilities.isObjectStrict(info)).to.equal(true);
					expect(info).to.deep.equal(utilities.merge({ path: paths.localOutputImage }, resizedImageInfo));

					return callback();
				}
			);
		});

		it("should allow for images to be resized using the contain resize mode and output to the current working directory", function(callback) {
			imageUtilities.resizeImage(
				utilities.merge(
					validResizeImageOptions,
					{
						width: 8,
						height: 8,
						resizeMode: "contain",
						destination: paths.localOutputImage
					}
				),
				function(error, info) {
					expect(error).to.equal(null);
					expect(utilities.isObjectStrict(info)).to.equal(true);
					expect(info).to.deep.equal(utilities.merge({ path: paths.localOutputImage }, {
						fileSize: 218,
						md5: "bb63d7f91505957488a111e644a5a95f",
						width: 8,
						height: 8
					}));

					return callback();
				}
			);
		});

		it("should allow for images to be resized using the cover resize mode and output to the current working directory", function(callback) {
			imageUtilities.resizeImage(
				utilities.merge(
					validResizeImageOptions,
					{
						width: 3,
						height: 3,
						resizeMode: "cover",
						destination: paths.localOutputImage
					}
				),
				function(error, info) {
					expect(error).to.equal(null);
					expect(utilities.isObjectStrict(info)).to.equal(true);
					expect(info).to.deep.equal(utilities.merge({ path: paths.localOutputImage }, {
						fileSize: 102,
						md5: "31b5145699393a1f5cd561e703667b93",
						width: 3,
						height: 3
					}));

					return callback();
				}
			);
		});

		it("should allow for images to be resized using the fill resize mode and output to the current working directory", function(callback) {
			imageUtilities.resizeImage(
				utilities.merge(
					validResizeImageOptions,
					{
						width: 8,
						height: 8,
						resizeMode: "fill",
						destination: paths.localOutputImage
					}
				),
				function(error, info) {
					expect(error).to.equal(null);
					expect(utilities.isObjectStrict(info)).to.equal(true);
					expect(info).to.deep.equal(utilities.merge({ path: paths.localOutputImage }, {
						fileSize: 245,
						md5: "c66d782f4957d04e8d707d184e14ba11",
						width: 8,
						height: 8
					}));

					return callback();
				}
			);
		});

		it("should allow for images to be resized using the fit resize mode and output to the current working directory", function(callback) {
			imageUtilities.resizeImage(
				utilities.merge(
					validResizeImageOptions,
					{
						width: 8,
						height: 8,
						resizeMode: "fit",
						destination: paths.localOutputImage
					}
				),
				function(error, info) {
					expect(error).to.equal(null);
					expect(utilities.isObjectStrict(info)).to.equal(true);
					expect(info).to.deep.equal(utilities.merge({ path: paths.localOutputImage }, {
						fileSize: 213,
						md5: "dcf4e631bc95f7ad1c5547b19ac0cbbf",
						width: 8,
						height: 6
					}));

					return callback();
				}
			);
		});

		it("should allow for images to be resized and output in non-existent directories by automatically creating the directory structure if it does not exist", function(callback) {
			imageUtilities.resizeImage(
				validResizeImageOptions,
				function(error, info) {
					expect(error).to.equal(null);
					expect(utilities.isObjectStrict(info)).to.equal(true);
					expect(info).to.deep.equal(utilities.merge({ path: paths.outputImage }, resizedImageInfo));

					return callback();
				}
			);
		});

		it("should allow for images to be resized and output with the original source filename to a different destination directory", function(callback) {
			imageUtilities.resizeImage(
				utilities.merge(
					validResizeImageOptions,
					{
						destination: paths.tempDirectory
					}
				),
				function(error, info) {
					expect(error).to.equal(null);
					expect(utilities.isObjectStrict(info)).to.equal(true);
					expect(info).to.deep.equal(utilities.merge({ path: path.join(paths.tempDirectory, path.basename(validResizeImageOptions.source)) }, resizedImageInfo));

					return callback();
				}
			);
		});

		it("should overwrite an existing output file if it already exists and the overwrite flag is enabled", function(callback) {
			async.waterfall(
				[
					function(callback) {
						return imageUtilities.resizeImage(
							validResizeImageOptions,
							function(error, info) {
								expect(error).to.equal(null);
								expect(utilities.isObjectStrict(info)).to.equal(true);
								expect(info).to.deep.equal(utilities.merge({ path: paths.outputImage }, resizedImageInfo));

								return callback();
							}
						);
					},
					function(callback) {
						return imageUtilities.resizeImage(
							utilities.merge(
								validResizeImageOptions,
								{
									overwrite: true
								}
							),
							function(error, info) {
								expect(error).to.equal(null);
								expect(utilities.isObjectStrict(info)).to.equal(true);
								expect(info).to.deep.equal(utilities.merge({ path: paths.outputImage }, resizedImageInfo));

								return callback();
							}
						);
					},
				],
				function(error) {
					return callback();
				}
			);
		});

		it("should only return basic image information when the information flag is disabled", function(callback) {
			imageUtilities.resizeImage(
				utilities.merge(
					validResizeImageOptions,
					{
						information: false
					}
				),
				function(error, info) {
					expect(error).to.equal(null);
					expect(utilities.isObjectStrict(info)).to.equal(true);
					expect(info).to.deep.equal({ path: paths.outputImage });

					return callback();
				}
			);
		});

// TODO: test disabled due to timing issues triggering failures
		/*it("should handle errors returned by the get image information function", function(callback) {
			const fileCheckInterval = setInterval(function() {
				fs.removeSync(validResizeImageOptions.destination);
			});

			imageUtilities.resizeImage(
				validResizeImageOptions,
				function(error, info) {
					clearInterval(fileCheckInterval);

//					expect(error).to.not.equal(null);
//					expect(error.code).to.equal("ENOENT");
//					expect(info).to.be.undefined;

					return callback();
				}
			);
		});*/

		if(utilities.isValid(invalidPathCharacters)) {
			it("should return an error if an invalid character is used in the destination path", function(callback) {
				return async.eachSeries(
					Array.from(invalidPathCharacters),
					function(invalidCharacter, callback) {
						return imageUtilities.resizeImage(
							utilities.merge(
								validResizeImageOptions,
								{
									destination: path.join(path.dirname(validResizeImageOptions.destination), "te" + invalidCharacter + "st", path.basename(validResizeImageOptions.destination))
								}
							),
							function(error, info) {
								expect(error).to.not.equal(null);
								expect(error.code).to.equal("EINVAL");
								expect(info).to.be.undefined;

								return callback();
							}
						);
					},
					function(error) {
						return callback();
					}
				);
			});
		}
	});
});
