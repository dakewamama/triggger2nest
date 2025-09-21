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
exports.SellTokenDto = void 0;
var class_validator_1 = require("class-validator");
var SellTokenDto = function () {
    var _a;
    var _mint_decorators;
    var _mint_initializers = [];
    var _mint_extraInitializers = [];
    var _publicKey_decorators;
    var _publicKey_initializers = [];
    var _publicKey_extraInitializers = [];
    var _amount_decorators;
    var _amount_initializers = [];
    var _amount_extraInitializers = [];
    var _slippage_decorators;
    var _slippage_initializers = [];
    var _slippage_extraInitializers = [];
    var _priorityFee_decorators;
    var _priorityFee_initializers = [];
    var _priorityFee_extraInitializers = [];
    return _a = /** @class */ (function () {
            function SellTokenDto() {
                this.mint = __runInitializers(this, _mint_initializers, void 0);
                this.publicKey = (__runInitializers(this, _mint_extraInitializers), __runInitializers(this, _publicKey_initializers, void 0)); // Wallet public key for signing
                this.amount = (__runInitializers(this, _publicKey_extraInitializers), __runInitializers(this, _amount_initializers, void 0)); // Number of tokens to sell (or percentage like "100%")
                this.slippage = (__runInitializers(this, _amount_extraInitializers), __runInitializers(this, _slippage_initializers, void 0)); // Slippage tolerance (default 1%)
                this.priorityFee = (__runInitializers(this, _slippage_extraInitializers), __runInitializers(this, _priorityFee_initializers, void 0)); // Priority fee (default 0.00001)
                __runInitializers(this, _priorityFee_extraInitializers);
            }
            return SellTokenDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _mint_decorators = [(0, class_validator_1.IsString)()];
            _publicKey_decorators = [(0, class_validator_1.IsString)()];
            _amount_decorators = [(0, class_validator_1.IsNumber)(), (0, class_validator_1.IsPositive)()];
            _slippage_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)()];
            _priorityFee_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)()];
            __esDecorate(null, null, _mint_decorators, { kind: "field", name: "mint", static: false, private: false, access: { has: function (obj) { return "mint" in obj; }, get: function (obj) { return obj.mint; }, set: function (obj, value) { obj.mint = value; } }, metadata: _metadata }, _mint_initializers, _mint_extraInitializers);
            __esDecorate(null, null, _publicKey_decorators, { kind: "field", name: "publicKey", static: false, private: false, access: { has: function (obj) { return "publicKey" in obj; }, get: function (obj) { return obj.publicKey; }, set: function (obj, value) { obj.publicKey = value; } }, metadata: _metadata }, _publicKey_initializers, _publicKey_extraInitializers);
            __esDecorate(null, null, _amount_decorators, { kind: "field", name: "amount", static: false, private: false, access: { has: function (obj) { return "amount" in obj; }, get: function (obj) { return obj.amount; }, set: function (obj, value) { obj.amount = value; } }, metadata: _metadata }, _amount_initializers, _amount_extraInitializers);
            __esDecorate(null, null, _slippage_decorators, { kind: "field", name: "slippage", static: false, private: false, access: { has: function (obj) { return "slippage" in obj; }, get: function (obj) { return obj.slippage; }, set: function (obj, value) { obj.slippage = value; } }, metadata: _metadata }, _slippage_initializers, _slippage_extraInitializers);
            __esDecorate(null, null, _priorityFee_decorators, { kind: "field", name: "priorityFee", static: false, private: false, access: { has: function (obj) { return "priorityFee" in obj; }, get: function (obj) { return obj.priorityFee; }, set: function (obj, value) { obj.priorityFee = value; } }, metadata: _metadata }, _priorityFee_initializers, _priorityFee_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.SellTokenDto = SellTokenDto;
