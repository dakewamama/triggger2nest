"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiService = void 0;
var axios_1 = require("axios");
var env_1 = require("../../config/env");
var ApiService = /** @class */ (function () {
    function ApiService() {
        this.api = axios_1.default.create({
            baseURL: env_1.ENV.API_URL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        // Request interceptor
        this.api.interceptors.request.use(function (config) {
            var _a;
            console.log("[API] ".concat((_a = config.method) === null || _a === void 0 ? void 0 : _a.toUpperCase(), " ").concat(config.url));
            return config;
        }, function (error) {
            console.error('[API] Request error:', error);
            return Promise.reject(error);
        });
        // Response interceptor
        this.api.interceptors.response.use(function (response) { return response; }, function (error) {
            var _a, _b;
            console.error('[API] Response error:', (_a = error.response) === null || _a === void 0 ? void 0 : _a.status, (_b = error.response) === null || _b === void 0 ? void 0 : _b.data);
            if (error.code === 'ERR_NETWORK') {
                throw new Error('Cannot connect to backend. Please ensure the backend is running on port 3000.');
            }
            throw error;
        });
    }
    // Health check
    ApiService.prototype.healthCheck = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.api.get('/health')];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        });
    };
    // Pump endpoints - connecting to your backend
    ApiService.prototype.createToken = function (data, imageFile) {
        return __awaiter(this, void 0, void 0, function () {
            var formData, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        formData = new FormData();
                        formData.append('name', data.name);
                        formData.append('symbol', data.symbol);
                        formData.append('description', data.description);
                        if (data.website)
                            formData.append('website', data.website);
                        if (data.twitter)
                            formData.append('twitter', data.twitter);
                        if (data.telegram)
                            formData.append('telegram', data.telegram);
                        if (imageFile)
                            formData.append('image', imageFile);
                        return [4 /*yield*/, this.api.post('/pump/create-token', formData, {
                                headers: { 'Content-Type': 'multipart/form-data' },
                            })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        });
    };
    ApiService.prototype.buyToken = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.api.post('/pump/buy-token', __assign(__assign({}, data), { slippage: data.slippage || env_1.ENV.DEFAULT_SLIPPAGE, priorityFee: data.priorityFee || env_1.ENV.DEFAULT_PRIORITY_FEE }))];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        });
    };
    ApiService.prototype.sellToken = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.api.post('/pump/sell-token', __assign(__assign({}, data), { slippage: data.slippage || env_1.ENV.DEFAULT_SLIPPAGE, priorityFee: data.priorityFee || env_1.ENV.DEFAULT_PRIORITY_FEE }))];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        });
    };
    // Token endpoints
    ApiService.prototype.getTrendingTokens = function () {
        return __awaiter(this, arguments, void 0, function (limit) {
            var response;
            var _a;
            if (limit === void 0) { limit = 50; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.api.get("/tokens/trending", { params: { limit: limit } })];
                    case 1:
                        response = _b.sent();
                        return [2 /*return*/, ((_a = response.data) === null || _a === void 0 ? void 0 : _a.data) || []];
                }
            });
        });
    };
    ApiService.prototype.searchTokens = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.api.get("/tokens/search", { params: { q: query } })];
                    case 1:
                        response = _b.sent();
                        return [2 /*return*/, ((_a = response.data) === null || _a === void 0 ? void 0 : _a.data) || []];
                }
            });
        });
    };
    ApiService.prototype.getTokenDetails = function (mint) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.api.get("/tokens/".concat(mint))];
                    case 1:
                        response = _b.sent();
                        return [2 /*return*/, ((_a = response.data) === null || _a === void 0 ? void 0 : _a.data) || null];
                    case 2:
                        error_1 = _b.sent();
                        console.error("Failed to get token details for ".concat(mint, ":"), error_1);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Wallet endpoints
    ApiService.prototype.getWalletBalance = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.api.get("/wallet/".concat(address, "/balance"))];
                    case 1:
                        response = _b.sent();
                        return [2 /*return*/, ((_a = response.data) === null || _a === void 0 ? void 0 : _a.balance) || 0];
                }
            });
        });
    };
    // Trading endpoints
    ApiService.prototype.executeBuyTrade = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.api.post('/trading/buy', params)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        });
    };
    ApiService.prototype.executeSellTrade = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.api.post('/trading/sell', params)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        });
    };
    // Utility methods
    ApiService.prototype.formatPrice = function (price) {
        if (price < 0.01)
            return price.toExponential(2);
        return price.toFixed(6);
    };
    ApiService.prototype.formatMarketCap = function (marketCap) {
        if (marketCap >= 1e9)
            return "$".concat((marketCap / 1e9).toFixed(2), "B");
        if (marketCap >= 1e6)
            return "$".concat((marketCap / 1e6).toFixed(2), "M");
        if (marketCap >= 1e3)
            return "$".concat((marketCap / 1e3).toFixed(2), "K");
        return "$".concat(marketCap.toFixed(2));
    };
    ApiService.prototype.formatAddress = function (address, length) {
        if (length === void 0) { length = 4; }
        if (!address)
            return '';
        if (address.length <= length * 2)
            return address;
        return "".concat(address.slice(0, length), "...").concat(address.slice(-length));
    };
    return ApiService;
}());
exports.apiService = new ApiService();
exports.default = exports.apiService;
