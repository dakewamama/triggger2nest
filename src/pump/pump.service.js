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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PumpService = void 0;
// src/pump/pump.service.ts
var common_1 = require("@nestjs/common");
var config_1 = require("@nestjs/config");
var axios_1 = require("axios");
var PumpService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var PumpService = _classThis = /** @class */ (function () {
        function PumpService_1() {
            this.logger = new common_1.Logger(PumpService.name);
            this.configService = new config_1.ConfigService();
            // Use v3 API with proper configuration
            this.PUMP_API_V3 = 'https://frontend-api-v3.pump.fun';
            this.PUMP_API_V2 = 'https://frontend-api-v2.pump.fun';
            this.PUMP_API_V1 = 'https://frontend-api.pump.fun';
            this.PUMPPORTAL_API = 'https://pumpportal.fun/api';
        }
        /**
         * Get proper headers for pump.fun API requests
         */
        PumpService_1.prototype.getApiHeaders = function () {
            return {
                'Accept': 'application/json',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cache-Control': 'no-cache',
                'Content-Type': 'application/json',
                'Origin': 'https://pump.fun',
                'Referer': 'https://pump.fun/',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"macOS"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'cross-site',
            };
        };
        /**
         * Try pump.fun APIs in order: v3 -> v2 -> v1 -> PumpPortal
         */
        PumpService_1.prototype.callPumpApiWithFallback = function (endpoint_1) {
            return __awaiter(this, arguments, void 0, function (endpoint, params) {
                var apis, _i, apis_1, api, response, error_1;
                var _a;
                if (params === void 0) { params = {}; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            apis = [
                                { name: 'v3', url: this.PUMP_API_V3 },
                                { name: 'v2', url: this.PUMP_API_V2 },
                                { name: 'v1', url: this.PUMP_API_V1 },
                            ];
                            _i = 0, apis_1 = apis;
                            _b.label = 1;
                        case 1:
                            if (!(_i < apis_1.length)) return [3 /*break*/, 6];
                            api = apis_1[_i];
                            _b.label = 2;
                        case 2:
                            _b.trys.push([2, 4, , 5]);
                            this.logger.log("Attempting pump.fun ".concat(api.name, ": ").concat(api.url).concat(endpoint));
                            return [4 /*yield*/, axios_1.default.get("".concat(api.url).concat(endpoint), {
                                    params: params,
                                    headers: this.getApiHeaders(),
                                    timeout: 12000,
                                    validateStatus: function (status) { return status < 500; }, // Don't throw on 4xx errors
                                })];
                        case 3:
                            response = _b.sent();
                            if (response.status === 200 && response.data) {
                                this.logger.log("\u2705 Success with pump.fun ".concat(api.name));
                                return [2 /*return*/, response.data];
                            }
                            else {
                                this.logger.warn("\u274C pump.fun ".concat(api.name, " returned status ").concat(response.status));
                            }
                            return [3 /*break*/, 5];
                        case 4:
                            error_1 = _b.sent();
                            this.logger.warn("\u274C pump.fun ".concat(api.name, " failed: ").concat(((_a = error_1.response) === null || _a === void 0 ? void 0 : _a.status) || error_1.code, " - ").concat(error_1.message));
                            return [3 /*break*/, 5];
                        case 5:
                            _i++;
                            return [3 /*break*/, 1];
                        case 6: throw new Error('All pump.fun APIs failed');
                    }
                });
            });
        };
        /**
         * Call PumpPortal API as backup
         */
        PumpService_1.prototype.callPumpPortalApi = function (endpoint_1) {
            return __awaiter(this, arguments, void 0, function (endpoint, params) {
                var response, error_2;
                var _a;
                if (params === void 0) { params = {}; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 3]);
                            this.logger.log("Attempting PumpPortal: ".concat(this.PUMPPORTAL_API).concat(endpoint));
                            return [4 /*yield*/, axios_1.default.get("".concat(this.PUMPPORTAL_API).concat(endpoint), {
                                    params: params,
                                    headers: {
                                        'Accept': 'application/json',
                                        'User-Agent': 'PumpFunController/1.0',
                                    },
                                    timeout: 10000,
                                })];
                        case 1:
                            response = _b.sent();
                            if (response.status === 200 && response.data) {
                                this.logger.log("\u2705 Success with PumpPortal");
                                return [2 /*return*/, response.data];
                            }
                            return [3 /*break*/, 3];
                        case 2:
                            error_2 = _b.sent();
                            this.logger.warn("\u274C PumpPortal failed: ".concat(((_a = error_2.response) === null || _a === void 0 ? void 0 : _a.status) || error_2.code, " - ").concat(error_2.message));
                            throw error_2;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        PumpService_1.prototype.createToken = function (createTokenDto, imageFile) {
            return __awaiter(this, void 0, void 0, function () {
                var tokenData;
                return __generator(this, function (_a) {
                    try {
                        this.logger.log('Token creation request:', createTokenDto);
                        tokenData = {
                            name: createTokenDto.name,
                            symbol: createTokenDto.symbol,
                            description: createTokenDto.description,
                            website: createTokenDto.website,
                            twitter: createTokenDto.twitter,
                            telegram: createTokenDto.telegram,
                        };
                        if (imageFile) {
                            this.logger.log('Image file received:', imageFile.originalname || 'unknown');
                        }
                        // Token creation on pump.fun requires frontend wallet integration
                        return [2 /*return*/, {
                                success: false,
                                error: 'Token creation requires wallet integration. Please use pump.fun directly or integrate wallet signing.',
                                data: tokenData
                            }];
                    }
                    catch (error) {
                        this.logger.error('Token creation failed:', error);
                        return [2 /*return*/, {
                                success: false,
                                error: error.message || 'Token creation failed'
                            }];
                    }
                    return [2 /*return*/];
                });
            });
        };
        PumpService_1.prototype.buyToken = function (buyTokenDto) {
            return __awaiter(this, void 0, void 0, function () {
                var tradeData, response, error_3;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _c.trys.push([0, 2, , 3]);
                            this.logger.log('Creating buy transaction:', buyTokenDto);
                            if (!buyTokenDto.publicKey || buyTokenDto.publicKey === 'wallet_not_connected') {
                                return [2 /*return*/, {
                                        success: false,
                                        error: 'Wallet not connected. Please connect your wallet to trade.'
                                    }];
                            }
                            tradeData = {
                                publicKey: buyTokenDto.publicKey,
                                action: 'buy',
                                mint: buyTokenDto.mint,
                                denominatedInSol: true,
                                amount: buyTokenDto.solAmount,
                                slippage: buyTokenDto.slippage || 1,
                                priorityFee: buyTokenDto.priorityFee || 0.00001,
                                pool: 'pump'
                            };
                            return [4 /*yield*/, axios_1.default.post("".concat(this.PUMPPORTAL_API, "/trade-local"), tradeData, {
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    timeout: 30000,
                                })];
                        case 1:
                            response = _c.sent();
                            if (response.data) {
                                this.logger.log('Buy transaction prepared successfully');
                                return [2 /*return*/, {
                                        success: true,
                                        data: {
                                            transaction: response.data,
                                            mint: buyTokenDto.mint,
                                            amount: buyTokenDto.amount,
                                            solAmount: buyTokenDto.solAmount,
                                            action: 'buy'
                                        }
                                    }];
                            }
                            else {
                                throw new Error('No transaction data received');
                            }
                            return [3 /*break*/, 3];
                        case 2:
                            error_3 = _c.sent();
                            this.logger.error('Buy transaction failed:', error_3);
                            return [2 /*return*/, {
                                    success: false,
                                    error: ((_b = (_a = error_3.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || error_3.message || 'Buy failed'
                                }];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        PumpService_1.prototype.sellToken = function (sellTokenDto) {
            return __awaiter(this, void 0, void 0, function () {
                var tradeData, response, error_4;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _c.trys.push([0, 2, , 3]);
                            this.logger.log('Creating sell transaction:', sellTokenDto);
                            if (!sellTokenDto.publicKey || sellTokenDto.publicKey === 'wallet_not_connected') {
                                return [2 /*return*/, {
                                        success: false,
                                        error: 'Wallet not connected. Please connect your wallet to trade.'
                                    }];
                            }
                            tradeData = {
                                publicKey: sellTokenDto.publicKey,
                                action: 'sell',
                                mint: sellTokenDto.mint,
                                denominatedInSol: false,
                                amount: sellTokenDto.amount,
                                slippage: sellTokenDto.slippage || 1,
                                priorityFee: sellTokenDto.priorityFee || 0.00001,
                                pool: 'pump'
                            };
                            return [4 /*yield*/, axios_1.default.post("".concat(this.PUMPPORTAL_API, "/trade-local"), tradeData, {
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    timeout: 30000,
                                })];
                        case 1:
                            response = _c.sent();
                            if (response.data) {
                                this.logger.log('Sell transaction prepared successfully');
                                return [2 /*return*/, {
                                        success: true,
                                        data: {
                                            transaction: response.data,
                                            mint: sellTokenDto.mint,
                                            amount: sellTokenDto.amount,
                                            action: 'sell'
                                        }
                                    }];
                            }
                            else {
                                throw new Error('No transaction data received');
                            }
                            return [3 /*break*/, 3];
                        case 2:
                            error_4 = _c.sent();
                            this.logger.error('Sell transaction failed:', error_4);
                            return [2 /*return*/, {
                                    success: false,
                                    error: ((_b = (_a = error_4.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || error_4.message || 'Sell failed'
                                }];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        PumpService_1.prototype.getTokenInfo = function (mintAddress) {
            return __awaiter(this, void 0, void 0, function () {
                var data, pumpError_1, data, portalError_1, error_5;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 8, , 9]);
                            this.logger.log('Fetching token info for:', mintAddress);
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.callPumpApiWithFallback("/coins/".concat(mintAddress))];
                        case 2:
                            data = _a.sent();
                            if (data) {
                                this.logger.log("Token info found: ".concat(data.name || 'Unknown'));
                                return [2 /*return*/, {
                                        success: true,
                                        data: data
                                    }];
                            }
                            return [3 /*break*/, 4];
                        case 3:
                            pumpError_1 = _a.sent();
                            this.logger.warn('Pump.fun APIs failed for token info, trying PumpPortal...');
                            return [3 /*break*/, 4];
                        case 4:
                            _a.trys.push([4, 6, , 7]);
                            return [4 /*yield*/, this.callPumpPortalApi("/tokens/".concat(mintAddress))];
                        case 5:
                            data = _a.sent();
                            if (data) {
                                this.logger.log("Token info found via PumpPortal: ".concat(data.name || 'Unknown'));
                                return [2 /*return*/, {
                                        success: true,
                                        data: data
                                    }];
                            }
                            return [3 /*break*/, 7];
                        case 6:
                            portalError_1 = _a.sent();
                            this.logger.warn('PumpPortal also failed for token info');
                            return [3 /*break*/, 7];
                        case 7: throw new Error('Token not found in any API');
                        case 8:
                            error_5 = _a.sent();
                            this.logger.error("Failed to get token info for ".concat(mintAddress, ":"), error_5);
                            return [2 /*return*/, {
                                    success: false,
                                    error: error_5.message || 'Failed to get token info'
                                }];
                        case 9: return [2 /*return*/];
                    }
                });
            });
        };
        PumpService_1.prototype.getQuote = function (mint, amount, action) {
            return __awaiter(this, void 0, void 0, function () {
                var tokenInfo, token, virtual_sol_reserves, virtual_token_reserves, estimatedPrice, quote, error_6;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            this.logger.log("Getting quote for ".concat(action, " ").concat(amount, " of ").concat(mint));
                            return [4 /*yield*/, this.getTokenInfo(mint)];
                        case 1:
                            tokenInfo = _a.sent();
                            if (!tokenInfo.success || !tokenInfo.data) {
                                throw new Error('Could not fetch token info for quote');
                            }
                            token = tokenInfo.data;
                            virtual_sol_reserves = token.virtual_sol_reserves, virtual_token_reserves = token.virtual_token_reserves;
                            estimatedPrice = 0;
                            if (virtual_token_reserves > 0) {
                                estimatedPrice = virtual_sol_reserves / virtual_token_reserves;
                            }
                            quote = {
                                mint: mint,
                                action: action,
                                amount: amount,
                                estimatedPrice: estimatedPrice,
                                estimatedSolAmount: action === 'buy' ? amount : amount * estimatedPrice,
                                estimatedTokenAmount: action === 'buy' ? amount / estimatedPrice : amount,
                                virtualSolReserves: virtual_sol_reserves,
                                virtualTokenReserves: virtual_token_reserves,
                                timestamp: Date.now(),
                            };
                            this.logger.log('Quote calculated successfully');
                            return [2 /*return*/, {
                                    success: true,
                                    data: quote
                                }];
                        case 2:
                            error_6 = _a.sent();
                            this.logger.error('Failed to get quote:', error_6);
                            return [2 /*return*/, {
                                    success: false,
                                    error: error_6.message || 'Failed to get quote'
                                }];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        PumpService_1.prototype.healthCheck = function () {
            return __awaiter(this, void 0, void 0, function () {
                var results, error_7, error_8, connectedApis, error_9;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 8, , 9]);
                            this.logger.log('Running comprehensive health check...');
                            results = {
                                status: 'ok',
                                timestamp: new Date().toISOString(),
                                service: 'pump-service',
                                apis: {}
                            };
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.callPumpApiWithFallback('/coins', { limit: 1 })];
                        case 2:
                            _a.sent();
                            results.apis['pump_fun'] = 'connected';
                            this.logger.log('✅ Pump.fun API is healthy');
                            return [3 /*break*/, 4];
                        case 3:
                            error_7 = _a.sent();
                            results.apis['pump_fun'] = 'disconnected';
                            this.logger.warn('❌ Pump.fun API health check failed');
                            return [3 /*break*/, 4];
                        case 4:
                            _a.trys.push([4, 6, , 7]);
                            return [4 /*yield*/, this.callPumpPortalApi('', {})];
                        case 5:
                            _a.sent(); // Basic endpoint check
                            results.apis['pump_portal'] = 'connected';
                            this.logger.log('✅ PumpPortal API is healthy');
                            return [3 /*break*/, 7];
                        case 6:
                            error_8 = _a.sent();
                            results.apis['pump_portal'] = 'disconnected';
                            this.logger.warn('❌ PumpPortal API health check failed');
                            return [3 /*break*/, 7];
                        case 7:
                            connectedApis = Object.values(results.apis).filter(function (status) { return status === 'connected'; }).length;
                            if (connectedApis === 0) {
                                results.status = 'error';
                            }
                            else if (connectedApis === 1) {
                                results.status = 'degraded';
                            }
                            this.logger.log("Health check complete - Status: ".concat(results.status));
                            return [2 /*return*/, results];
                        case 8:
                            error_9 = _a.sent();
                            this.logger.error('Health check failed completely:', error_9);
                            return [2 /*return*/, {
                                    status: 'error',
                                    timestamp: new Date().toISOString(),
                                    service: 'pump-service',
                                    error: error_9.message,
                                    apis: {
                                        pump_fun: 'unknown',
                                        pump_portal: 'unknown'
                                    }
                                }];
                        case 9: return [2 /*return*/];
                    }
                });
            });
        };
        return PumpService_1;
    }());
    __setFunctionName(_classThis, "PumpService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PumpService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PumpService = _classThis;
}();
exports.PumpService = PumpService;
