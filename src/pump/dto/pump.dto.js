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
exports.SellTokenDto = exports.BuyTokenDto = exports.CreateTokenDto = void 0;
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
    return _a = /** @class */ (function () {
            function CreateTokenDto() {
                this.name = __runInitializers(this, _name_initializers, void 0);
                this.symbol = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _symbol_initializers, void 0));
                this.description = (__runInitializers(this, _symbol_extraInitializers), __runInitializers(this, _description_initializers, void 0));
                __runInitializers(this, _description_extraInitializers);
            }
            return CreateTokenDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsNotEmpty)()];
            _symbol_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsNotEmpty)()];
            _description_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsNotEmpty)()];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: function (obj) { return "name" in obj; }, get: function (obj) { return obj.name; }, set: function (obj, value) { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _symbol_decorators, { kind: "field", name: "symbol", static: false, private: false, access: { has: function (obj) { return "symbol" in obj; }, get: function (obj) { return obj.symbol; }, set: function (obj, value) { obj.symbol = value; } }, metadata: _metadata }, _symbol_initializers, _symbol_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: function (obj) { return "description" in obj; }, get: function (obj) { return obj.description; }, set: function (obj, value) { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.CreateTokenDto = CreateTokenDto;
var BuyTokenDto = function () {
    var _a;
    var _mintAddress_decorators;
    var _mintAddress_initializers = [];
    var _mintAddress_extraInitializers = [];
    var _amountSol_decorators;
    var _amountSol_initializers = [];
    var _amountSol_extraInitializers = [];
    var _slippage_decorators;
    var _slippage_initializers = [];
    var _slippage_extraInitializers = [];
    return _a = /** @class */ (function () {
            function BuyTokenDto() {
                this.mintAddress = __runInitializers(this, _mintAddress_initializers, void 0);
                this.amountSol = (__runInitializers(this, _mintAddress_extraInitializers), __runInitializers(this, _amountSol_initializers, void 0));
                this.slippage = (__runInitializers(this, _amountSol_extraInitializers), __runInitializers(this, _slippage_initializers, void 0)); // Slippage tolerance in basis points (e.g., 500 = 5%)
                __runInitializers(this, _slippage_extraInitializers);
            }
            return BuyTokenDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _mintAddress_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsNotEmpty)()];
            _amountSol_decorators = [(0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0.000000001)];
            _slippage_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(1)];
            __esDecorate(null, null, _mintAddress_decorators, { kind: "field", name: "mintAddress", static: false, private: false, access: { has: function (obj) { return "mintAddress" in obj; }, get: function (obj) { return obj.mintAddress; }, set: function (obj, value) { obj.mintAddress = value; } }, metadata: _metadata }, _mintAddress_initializers, _mintAddress_extraInitializers);
            __esDecorate(null, null, _amountSol_decorators, { kind: "field", name: "amountSol", static: false, private: false, access: { has: function (obj) { return "amountSol" in obj; }, get: function (obj) { return obj.amountSol; }, set: function (obj, value) { obj.amountSol = value; } }, metadata: _metadata }, _amountSol_initializers, _amountSol_extraInitializers);
            __esDecorate(null, null, _slippage_decorators, { kind: "field", name: "slippage", static: false, private: false, access: { has: function (obj) { return "slippage" in obj; }, get: function (obj) { return obj.slippage; }, set: function (obj, value) { obj.slippage = value; } }, metadata: _metadata }, _slippage_initializers, _slippage_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.BuyTokenDto = BuyTokenDto;
var SellTokenDto = function () {
    var _a;
    var _mintAddress_decorators;
    var _mintAddress_initializers = [];
    var _mintAddress_extraInitializers = [];
    var _amountTokens_decorators;
    var _amountTokens_initializers = [];
    var _amountTokens_extraInitializers = [];
    var _slippage_decorators;
    var _slippage_initializers = [];
    var _slippage_extraInitializers = [];
    return _a = /** @class */ (function () {
            function SellTokenDto() {
                this.mintAddress = __runInitializers(this, _mintAddress_initializers, void 0);
                this.amountTokens = (__runInitializers(this, _mintAddress_extraInitializers), __runInitializers(this, _amountTokens_initializers, void 0));
                this.slippage = (__runInitializers(this, _amountTokens_extraInitializers), __runInitializers(this, _slippage_initializers, void 0)); // Slippage tolerance in basis points
                __runInitializers(this, _slippage_extraInitializers);
            }
            return SellTokenDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _mintAddress_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsNotEmpty)()];
            _amountTokens_decorators = [(0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0.000000001)];
            _slippage_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(1)];
            __esDecorate(null, null, _mintAddress_decorators, { kind: "field", name: "mintAddress", static: false, private: false, access: { has: function (obj) { return "mintAddress" in obj; }, get: function (obj) { return obj.mintAddress; }, set: function (obj, value) { obj.mintAddress = value; } }, metadata: _metadata }, _mintAddress_initializers, _mintAddress_extraInitializers);
            __esDecorate(null, null, _amountTokens_decorators, { kind: "field", name: "amountTokens", static: false, private: false, access: { has: function (obj) { return "amountTokens" in obj; }, get: function (obj) { return obj.amountTokens; }, set: function (obj, value) { obj.amountTokens = value; } }, metadata: _metadata }, _amountTokens_initializers, _amountTokens_extraInitializers);
            __esDecorate(null, null, _slippage_decorators, { kind: "field", name: "slippage", static: false, private: false, access: { has: function (obj) { return "slippage" in obj; }, get: function (obj) { return obj.slippage; }, set: function (obj, value) { obj.slippage = value; } }, metadata: _metadata }, _slippage_initializers, _slippage_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.SellTokenDto = SellTokenDto;
