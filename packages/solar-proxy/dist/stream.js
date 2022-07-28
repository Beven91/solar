"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var stream_1 = __importDefault(require("stream"));
var RequestMemoryStream = /** @class */ (function (_super) {
    __extends(RequestMemoryStream, _super);
    function RequestMemoryStream(request, handler) {
        var _this = _super.call(this) || this;
        _this.readBuffers = Buffer.from([]);
        if (request.nativeRequest) {
            request.nativeRequest.pipe(_this);
        }
        else {
            request.pipe(_this);
        }
        _this.on('finish', function () {
            handler(_this.readBuffers);
            _this.readBuffers = null;
        });
        return _this;
    }
    RequestMemoryStream.prototype._write = function (chunk, encoding, cb) {
        this.readBuffers = Buffer.concat([this.readBuffers, chunk]);
        cb();
    };
    return RequestMemoryStream;
}(stream_1.default.Writable));
exports.default = RequestMemoryStream;
//# sourceMappingURL=stream.js.map