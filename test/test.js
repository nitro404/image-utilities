"use strict";

var imageUtilities = require("../dist/image-utilities.js");
var utilities = require("extra-utilities");
var path = require("path");
var chai = require("chai");
var expect = chai.expect;

describe("Image Utilities", function() {
	describe("getImageInformation", function() {
		it("should be a function", function() {
			expect(utilities.isFunction(imageUtilities.getImageInformation)).to.equal(true);
		});

		it("should throw an error if no callback function is provided", function() {
			var thrownError = null;

			try { imageUtilities.getImageInformation(); }
			catch(error) { thrownError = error; }

			expect(thrownError).to.not.equal(null);
			expect(thrownError.message).to.equal("Missing or invalid callback function!");
		});

		it("should return an error if an invalid path is provided", function(callback) {
			imageUtilities.getImageInformation(
				NaN,
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
				path.join(__dirname, "/data/test.json"),
				function(error, info) {
					expect(error).to.not.equal(null);

					return callback();
				}
			);
		});

		it("should return an error for files that do not exist", function(callback) {
			imageUtilities.getImageInformation(
				path.join(__dirname, "/data/missing.jpg"),
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
		it("should be a function", function() {
			expect(utilities.isFunction(imageUtilities.resizeImage)).to.equal(true);
		});
	});
});
