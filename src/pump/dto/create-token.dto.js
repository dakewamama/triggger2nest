"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTokenDto = void 0;
var class_validator_1 = require("class-validator");
var CreateTokenDto = function () {
    var _a;
    var _name_decorators;
    var _name_initializers = [];
    var _name_extraInitializers = [];
    var _symbol_decorators;
    var _symbol_initializers = [];
    var _symbol_extraInitializers = [];
    var _description_decorators;
    var _description_initializers = [];
    var _description_extraInitializers = [];
    var _website_decorators;
    var _website_initializers = [];
    var _website_extraInitializers = [];
    var _twitter_decorators;
    var _twitter_initializers = [];
    var _twitter_extraInitializers = [];
    var _telegram_decorators;
    var _telegram_initializers = [];
    var _telegram_extraInitializers = [];
    return _a = /** @class */ (function () {
            function CreateTokenDto() {
                this.name = __runInitializers(this, _name_initializers, void 0);
                this.symbol = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _symbol_initializers, void 0));
                this.description = (__runInitializers(this, _symbol_extraInitializers), __runInitializers(this, _description_initializers, void 0));
                this.website = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _website_initializers, void 0));
                this.twitter = (__runInitializers(this, _website_extraInitializers), __runInitializers(this, _twitter_initializers, void 0));
                this.telegram = (__runInitializers(this, _twitter_extraInitializers), __runInitializers(this, _telegram_initializers, void 0));
                __runInitializers(this, _telegram_extraInitializers);
            }
            return CreateTokenDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, class_validator_1.IsString)()];
            _symbol_decorators = [(0, class_validator_1.IsString)()];
            _description_decorators = [(0, class_validator_1.IsString)()];
            _website_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsUrl)()];
            _twitter_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsUrl)()];
            _telegram_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsUrl)()];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: function (obj) { return "name" in obj; }, get: function (obj) { return obj.name; }, set: function (obj, value) { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _symbol_decorators, { kind: "field", name: "symbol", static: false, private: false, access: { has: function (obj) { return "symbol" in obj; }, get: function (obj) { return obj.symbol; }, set: function (obj, value) { obj.symbol = value; } }, metadata: _metadata }, _symbol_initializers, _symbol_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: function (obj) { return "description" in obj; }, get: function (obj) { return obj.description; }, set: function (obj, value) { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            __esDecorate(null, null, _website_decorators, { kind: "field", name: "website", static: false, private: false, access: { has: function (obj) { return "website" in obj; }, get: function (obj) { return obj.website; }, set: function (obj, value) { obj.website = value; } }, metadata: _metadata }, _website_initializers, _website_extraInitializers);
            __esDecorate(null, null, _twitter_decorators, { kind: "field", name: "twitter", static: false, private: false, access: { has: function (obj) { return "twitter" in obj; }, get: function (obj) { return obj.twitter; }, set: function (obj, value) { obj.twitter = value; } }, metadata: _metadata }, _twitter_initializers, _twitter_extraInitializers);
            __esDecorate(null, null, _telegram_decorators, { kind: "field", name: "telegram", static: false, private: false, access: { has: function (obj) { return "telegram" in obj; }, get: function (obj) { return obj.telegram; }, set: function (obj, value) { obj.telegram = value; } }, metadata: _metadata }, _telegram_initializers, _telegram_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.CreateTokenDto = CreateTokenDto;
