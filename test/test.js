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
	});

	describe("resizeImage", function() {
		it("should be a function", function() {
			expect(utilities.isFunction(imageUtilities.resizeImage)).to.equal(true);
		});
	});
});
