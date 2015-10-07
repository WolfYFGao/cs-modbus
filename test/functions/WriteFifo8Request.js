/*jshint maxlen:999*/
/*global describe:false,it:false*/

'use strict';

require('should');

var LIB_DIR = process.env.LIB_FOR_TESTS_DIR || '../../lib';

var WriteFifo8Request = require(LIB_DIR + '/functions/WriteFifo8Request');
var WriteFifo8Response = require(LIB_DIR + '/functions/WriteFifo8Response');
var ExceptionResponse = require(LIB_DIR + '/functions/ExceptionResponse');

describe("WriteFifo8Request", function()
{
  it("should throw if the specified id is invalid", function()
  {
    function testLessThanZero1()
    {
      new WriteFifo8Request(-1337, new Buffer(2));
    }

    function testLessThanZero2()
    {
      new WriteFifo8Request(-1, new Buffer(2));
    }

    function testGreaterThanMax()
    {
      new WriteFifo8Request(256, new Buffer(2));
    }

    testLessThanZero1.should.throw();
    testLessThanZero2.should.throw();
    testGreaterThanMax.should.throw();
  });

  it("should throw if the specified Buffer is invalid", function()
  {
    function testEmpty()
    {
      new WriteFifo8Request(0, new Buffer(0));
    }

    function testTooBig()
    {
      new WriteFifo8Request(0, new Buffer(251));
    }

    function testMax()
    {
      new WriteFifo8Request(0, new Buffer(250));
    }

    testEmpty.should.throw();
    testTooBig.should.throw();
    testMax.should.not.throw();
  });


  describe("getCode", function()
  {
    it("should return a valid function code", function()
    {
      new WriteFifo8Request(0, [0x00, 0x01]).getCode().should.be.equal(0x47);
    });
  });

  describe("fromOptions", function()
  {
    it("should create an instance from the specified options object", function()
    {
      var req = WriteFifo8Request.fromOptions({
        id: 0x01,
        values: new Buffer([0x00, 0x10])
      });

      req.getId().should.be.equal(0x01);
      req.getValues().should.be.eql(new Buffer([0x00, 0x10]));
    });
  });

  describe("fromBuffer", function()
  {
    it("should throw if the specified Buffer is not at least 4 bytes long", function()
    {
      function test1()
      {
        WriteFifo8Request.fromBuffer(new Buffer([]));
      }

      function test2()
      {
        WriteFifo8Request.fromBuffer(new Buffer([0x47, 0x00, 0x01]));
      }

      test1.should.throw();
      test2.should.throw();
    });

    it("should throw if the first byte is an invalid function code", function()
    {
      function test()
      {
        WriteFifo8Request.fromBuffer(new Buffer([0x03, 0x00, 0x00, 0x00, 0x01, 0x02, 0x00, 0x01]));
      }

      test.should.throw();
    });

    it("should read uint8 at 1 as an id", function()
    {
      var frame = new Buffer([0x47, 0x12, 0x01, 0x00]);
      var req = WriteFifo8Request.fromBuffer(frame);

      req.getId().should.be.equal(0x12);
    });

    it("should read bytes starting at 3 as Buffer of length specified as uint8 at 2", function()
    {
      var frame = new Buffer([0x47, 0x12, 0x02, 0x00, 0x02]);
      var req = WriteFifo8Request.fromBuffer(frame);

      req.getValues().should.be.eql(new Buffer([0x00, 0x02]));
    });
  });

  describe("toBuffer", function()
  {
    it("should return a properly sized Buffer for 1 byte write", function()
    {
      new WriteFifo8Request(0x01, new Buffer([0x00])).toBuffer().length.should.be.equal(4);
    });

    it("should write the function code as uint8 at 0", function()
    {
      new WriteFifo8Request(0x02, new Buffer([0x00, 0x01])).toBuffer()[0].should.be.equal(0x47);
    });

    it("should write the id as uint8 at 1", function()
    {
      new WriteFifo8Request(0x12, new Buffer([0x00, 0x01])).toBuffer()[1].should.be.equal(0x12);
    });

    it("should write the count as uint8 at 2", function()
    {
      new WriteFifo8Request(0x01, new Buffer([0x01, 0x21])).toBuffer()[2].should.be.equal(2);
    });

    it("should write the values Buffer starting at 3", function()
    {
      var req = new WriteFifo8Request(0x01, new Buffer([0x13, 0x37]));
      var buf = req.toBuffer();

      buf[3].should.be.eql(0x13);
      buf[4].should.be.eql(0x37);
    });
  });

  describe("toString", function()
  {
    it("should return a string", function()
    {
      new WriteFifo8Request(0x01, new Buffer([0x00, 0x01])).toString().should.be.a('string');
    });
  });

  describe("createResponse", function()
  {
    it("should return an instance of ExceptionResponse if the function code is an exception", function()
    {
      var req = new WriteFifo8Request(0x01, [0, 1]);
      var res = req.createResponse(new Buffer([0xC7, 0x02]));

      res.should.be.an.instanceOf(ExceptionResponse);
      res.getCode().should.be.equal(0x47);
      res.getExceptionCode().should.be.equal(2);
    });

    it("should return an instance of WriteFifo8Response if the function code is not an exception", function()
    {
      var req = new WriteFifo8Request(0x01, new Buffer([0x00, 0x01]));
      var res = req.createResponse(new Buffer([0x47, 0x01]));

      res.should.be.an.instanceOf(WriteFifo8Response);
      res.getCode().should.be.equal(0x47);
      res.getQuantity().should.be.equal(1);
    });
  });

  describe("getId", function()
  {
    it("should return an id specified in the constructor", function()
    {
      new WriteFifo8Request(0x23, new Buffer([0x00, 0x01])).getId().should.be.equal(0x23);
    });
  });

  describe("getValues", function()
  {
    it("should return a values Buffer specified in the constructor", function()
    {
      new WriteFifo8Request(0x12, new Buffer([0x00, 0x01])).getValues().should.be.eql(new Buffer([0x00, 0x01]));
    });
  });
});
