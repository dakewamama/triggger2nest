"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokensController = void 0;
var common_1 = require("@nestjs/common");
var TokensController = function () {
    var _classDecorators = [(0, common_1.Controller)('tokens')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _getServiceHealth_decorators;
    var _getFeaturedTokens_decorators;
    var _getTrendingTokens_decorators;
    var _getNewTokens_decorators;
    var _searchTokensAdvanced_decorators;
    var _searchTokens_decorators;
    var _getTokenByMint_decorators;
    var _getTokenTrades_decorators;
    var _getLatestTrades_decorators;
    var _getMarketStats_decorators;
    var _getSolPrice_decorators;
    var _getDashboardData_decorators;
    var _testSearch_decorators;
    var _listAllTokens_decorators;
    var TokensController = _classThis = /** @class */ (function () {
        function TokensController_1(tokensService) {
            this.tokensService = (__runInitializers(this, _instanceExtraInitializers), tokensService);
            this.logger = new common_1.Logger(TokensController.name);
        }
        /**
         * Health check endpoint
         */
        TokensController_1.prototype.getServiceHealth = function () {
            return __awaiter(this, void 0, void 0, function () {
                var result, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this.tokensService.getTrendingTokens(1, 0)];
                        case 1:
                            result = _a.sent();
                            return [2 /*return*/, {
                                    status: 'ok',
                                    timestamp: new Date().toISOString(),
                                    service: 'tokens-service',
                                    externalApi: {
                                        pumpFun: result.data.length > 0 ? 'connected' : 'limited',
                                        dataCount: result.data.length
                                    }
                                }];
                        case 2:
                            error_1 = _a.sent();
                            this.logger.error('Tokens service health check failed:', error_1);
                            return [2 /*return*/, {
                                    status: 'error',
                                    timestamp: new Date().toISOString(),
                                    service: 'tokens-service',
                                    error: error_1.message
                                }];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Get featured tokens (King of the Hill)
         */
        TokensController_1.prototype.getFeaturedTokens = function () {
            return __awaiter(this, arguments, void 0, function (limit, offset) {
                var result, error_2;
                if (limit === void 0) { limit = 20; }
                if (offset === void 0) { offset = 0; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            this.logger.log("Fetching featured tokens - limit: ".concat(limit, ", offset: ").concat(offset));
                            return [4 /*yield*/, this.tokensService.getFeaturedTokens(Number(limit), Number(offset))];
                        case 1:
                            result = _a.sent();
                            this.logger.log("Returned ".concat(result.data.length, " featured tokens"));
                            return [2 /*return*/, {
                                    success: true,
                                    data: result.data,
                                    pagination: {
                                        limit: Number(limit),
                                        offset: Number(offset),
                                        total: result.data.length,
                                    },
                                }];
                        case 2:
                            error_2 = _a.sent();
                            this.logger.error('Failed to fetch featured tokens:', error_2);
                            return [2 /*return*/, {
                                    success: false,
                                    error: error_2.message || 'Failed to fetch featured tokens',
                                    data: [],
                                }];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Get trending tokens
         */
        TokensController_1.prototype.getTrendingTokens = function () {
            return __awaiter(this, arguments, void 0, function (limit, offset) {
                var result, error_3;
                if (limit === void 0) { limit = 50; }
                if (offset === void 0) { offset = 0; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            this.logger.log("Fetching trending tokens - limit: ".concat(limit, ", offset: ").concat(offset));
                            return [4 /*yield*/, this.tokensService.getTrendingTokens(Number(limit), Number(offset))];
                        case 1:
                            result = _a.sent();
                            this.logger.log("Returned ".concat(result.data.length, " trending tokens"));
                            return [2 /*return*/, {
                                    success: true,
                                    data: result.data,
                                    pagination: {
                                        limit: Number(limit),
                                        offset: Number(offset),
                                        total: result.data.length,
                                    },
                                }];
                        case 2:
                            error_3 = _a.sent();
                            this.logger.error('Failed to fetch trending tokens:', error_3);
                            return [2 /*return*/, {
                                    success: false,
                                    error: error_3.message || 'Failed to fetch trending tokens',
                                    data: [],
                                }];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Get new tokens
         */
        TokensController_1.prototype.getNewTokens = function () {
            return __awaiter(this, arguments, void 0, function (limit, offset) {
                var result, error_4;
                if (limit === void 0) { limit = 50; }
                if (offset === void 0) { offset = 0; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            this.logger.log("Fetching new tokens - limit: ".concat(limit, ", offset: ").concat(offset));
                            return [4 /*yield*/, this.tokensService.getNewTokens(Number(limit), Number(offset))];
                        case 1:
                            result = _a.sent();
                            this.logger.log("Returned ".concat(result.data.length, " new tokens"));
                            return [2 /*return*/, {
                                    success: true,
                                    data: result.data,
                                    pagination: {
                                        limit: Number(limit),
                                        offset: Number(offset),
                                        total: result.data.length,
                                    },
                                }];
                        case 2:
                            error_4 = _a.sent();
                            this.logger.error('Failed to fetch new tokens:', error_4);
                            return [2 /*return*/, {
                                    success: false,
                                    error: error_4.message || 'Failed to fetch new tokens',
                                    data: [],
                                }];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Advanced search endpoint with suggestions and related tokens
         */
        TokensController_1.prototype.searchTokensAdvanced = function (query_1) {
            return __awaiter(this, arguments, void 0, function (query, limit) {
                var result, error_5;
                var _a;
                if (limit === void 0) { limit = 20; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 3]);
                            if (!query || query.trim().length === 0) {
                                return [2 /*return*/, {
                                        success: false,
                                        error: 'Query parameter is required',
                                        data: [],
                                        suggestions: [],
                                        relatedTokens: [],
                                        searchInfo: {
                                            supportedSearchTypes: [
                                                'Contract Address (full or partial)',
                                                'Token Name',
                                                'Token Symbol',
                                                'Description',
                                                'Fuzzy Matching (handles typos)',
                                                'Multi-word Search'
                                            ],
                                            examples: [
                                                'Full CA: "HeLLonEArth5cPN3wQMVYLhgMBR1Wny7t5ggp5pump"',
                                                'Partial CA: "HeLLon" or "p5pump"',
                                                'Token Name: "Doge"',
                                                'Token Symbol: "PEPE"',
                                                'Multiple words: "moon coin"'
                                            ]
                                        }
                                    }];
                            }
                            this.logger.log("\uD83D\uDD0D Advanced search request: \"".concat(query, "\" - limit: ").concat(limit));
                            return [4 /*yield*/, this.tokensService.searchTokensAdvanced(query.trim(), Number(limit))];
                        case 1:
                            result = _b.sent();
                            this.logger.log("\u2705 Advanced search completed: ".concat(result.data.length, " results, ").concat(((_a = result.suggestions) === null || _a === void 0 ? void 0 : _a.length) || 0, " suggestions"));
                            return [2 /*return*/, {
                                    success: true,
                                    query: query.trim(),
                                    searchType: result.searchType,
                                    data: result.data,
                                    totalMatches: result.totalMatches,
                                    suggestions: result.suggestions || [],
                                    relatedTokens: result.relatedTokens || [],
                                    metadata: {
                                        limit: Number(limit),
                                        timestamp: new Date().toISOString(),
                                        searchCapabilities: {
                                            contractAddress: true,
                                            tokenName: true,
                                            tokenSymbol: true,
                                            description: true,
                                            fuzzyMatching: true,
                                            partialMatching: true,
                                            suggestions: true
                                        }
                                    }
                                }];
                        case 2:
                            error_5 = _b.sent();
                            this.logger.error('Advanced search failed:', error_5);
                            return [2 /*return*/, {
                                    success: false,
                                    error: error_5.message || 'Failed to perform advanced search',
                                    data: [],
                                    suggestions: [],
                                    relatedTokens: []
                                }];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Standard search endpoint (uses advanced search internally)
         */
        TokensController_1.prototype.searchTokens = function (query_1) {
            return __awaiter(this, arguments, void 0, function (query, limit) {
                var result, error_6;
                if (limit === void 0) { limit = 20; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            if (!query || query.trim().length === 0) {
                                return [2 /*return*/, {
                                        success: false,
                                        error: 'Query parameter is required',
                                        data: [],
                                        searchInfo: {
                                            supportedSearchTypes: [
                                                'Contract Address (full or partial)',
                                                'Token Name',
                                                'Token Symbol',
                                                'Description',
                                                'Fuzzy Matching (handles typos)',
                                                'Multi-word Search'
                                            ],
                                            examples: [
                                                'Full CA: "HeLLonEArth5cPN3wQMVYLhgMBR1Wny7t5ggp5pump"',
                                                'Partial CA: "HeLLon" or "p5pump"',
                                                'Token Name: "Doge"',
                                                'Token Symbol: "PEPE"',
                                                'Multiple words: "moon coin"'
                                            ]
                                        }
                                    }];
                            }
                            this.logger.log("Searching tokens with query: \"".concat(query, "\" - limit: ").concat(limit));
                            return [4 /*yield*/, this.tokensService.searchTokensAdvanced(query.trim(), Number(limit))];
                        case 1:
                            result = _a.sent();
                            this.logger.log("Found ".concat(result.data.length, " tokens for query: \"").concat(query, "\""));
                            return [2 /*return*/, {
                                    success: true,
                                    data: result.data,
                                    query: query.trim(),
                                    searchType: result.searchType,
                                    totalMatches: result.totalMatches || result.data.length,
                                    suggestions: result.suggestions || [],
                                    pagination: {
                                        limit: Number(limit),
                                        total: result.data.length,
                                    },
                                }];
                        case 2:
                            error_6 = _a.sent();
                            this.logger.error('Failed to search tokens:', error_6);
                            return [2 /*return*/, {
                                    success: false,
                                    error: error_6.message || 'Failed to search tokens',
                                    data: [],
                                }];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Get token details by mint address
         */
        TokensController_1.prototype.getTokenByMint = function (mint) {
            return __awaiter(this, void 0, void 0, function () {
                var result, error_7;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            if (!mint || mint.trim().length === 0) {
                                return [2 /*return*/, {
                                        success: false,
                                        error: 'Mint address is required',
                                        data: null,
                                    }];
                            }
                            this.logger.log("Fetching token details for mint: ".concat(mint));
                            return [4 /*yield*/, this.tokensService.getTokenDetails(mint.trim())];
                        case 1:
                            result = _a.sent();
                            if (result.data) {
                                this.logger.log("Found token: ".concat(result.data.name || 'Unknown'));
                                return [2 /*return*/, {
                                        success: true,
                                        data: result.data,
                                    }];
                            }
                            else {
                                this.logger.log("Token not found for mint: ".concat(mint));
                                return [2 /*return*/, {
                                        success: false,
                                        error: 'Token not found',
                                        data: null,
                                    }];
                            }
                            return [3 /*break*/, 3];
                        case 2:
                            error_7 = _a.sent();
                            this.logger.error("Failed to fetch token ".concat(mint, ":"), error_7);
                            return [2 /*return*/, {
                                    success: false,
                                    error: error_7.message || 'Failed to fetch token details',
                                    data: null,
                                }];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Get trades for a specific token
         */
        TokensController_1.prototype.getTokenTrades = function (mint_1) {
            return __awaiter(this, arguments, void 0, function (mint, limit, offset) {
                var result, error_8;
                if (limit === void 0) { limit = 50; }
                if (offset === void 0) { offset = 0; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            if (!mint || mint.trim().length === 0) {
                                return [2 /*return*/, {
                                        success: false,
                                        error: 'Mint address is required',
                                        data: [],
                                    }];
                            }
                            this.logger.log("Fetching trades for token: ".concat(mint, " - limit: ").concat(limit, ", offset: ").concat(offset));
                            return [4 /*yield*/, this.tokensService.getTokenTrades(mint.trim(), Number(limit), Number(offset))];
                        case 1:
                            result = _a.sent();
                            this.logger.log("Found ".concat(result.data.length, " trades for token: ").concat(mint));
                            return [2 /*return*/, {
                                    success: true,
                                    data: result.data,
                                    mint: mint.trim(),
                                    pagination: {
                                        limit: Number(limit),
                                        offset: Number(offset),
                                        total: result.data.length,
                                    },
                                }];
                        case 2:
                            error_8 = _a.sent();
                            this.logger.error("Failed to fetch trades for token ".concat(mint, ":"), error_8);
                            return [2 /*return*/, {
                                    success: false,
                                    error: error_8.message || 'Failed to fetch token trades',
                                    data: [],
                                }];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Get latest trades across all tokens
         */
        TokensController_1.prototype.getLatestTrades = function () {
            return __awaiter(this, arguments, void 0, function (limit) {
                var result, error_9;
                if (limit === void 0) { limit = 100; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            this.logger.log("Fetching latest trades - limit: ".concat(limit));
                            return [4 /*yield*/, this.tokensService.getLatestTrades(Number(limit))];
                        case 1:
                            result = _a.sent();
                            this.logger.log("Found ".concat(result.data.length, " latest trades"));
                            return [2 /*return*/, {
                                    success: true,
                                    data: result.data,
                                    pagination: {
                                        limit: Number(limit),
                                        total: result.data.length,
                                    },
                                }];
                        case 2:
                            error_9 = _a.sent();
                            this.logger.error('Failed to fetch latest trades:', error_9);
                            return [2 /*return*/, {
                                    success: false,
                                    error: error_9.message || 'Failed to fetch latest trades',
                                    data: [],
                                }];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Get market statistics
         */
        TokensController_1.prototype.getMarketStats = function () {
            return __awaiter(this, void 0, void 0, function () {
                var result, error_10;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            this.logger.log('Fetching market statistics');
                            return [4 /*yield*/, this.tokensService.getMarketStats()];
                        case 1:
                            result = _a.sent();
                            this.logger.log('Market stats calculated successfully');
                            return [2 /*return*/, {
                                    success: true,
                                    data: result.data,
                                }];
                        case 2:
                            error_10 = _a.sent();
                            this.logger.error('Failed to fetch market stats:', error_10);
                            return [2 /*return*/, {
                                    success: false,
                                    error: error_10.message || 'Failed to fetch market stats',
                                    data: {
                                        totalMarketCap: 0,
                                        totalVolume24h: 0,
                                        activeTokens: 0,
                                        successfulGraduations: 0,
                                        totalTokens: 0,
                                    },
                                }];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Get SOL price
         */
        TokensController_1.prototype.getSolPrice = function () {
            return __awaiter(this, void 0, void 0, function () {
                var result, error_11;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            this.logger.log('Fetching SOL price');
                            return [4 /*yield*/, this.tokensService.getSolPrice()];
                        case 1:
                            result = _a.sent();
                            this.logger.log("SOL price: $".concat(result.data.price));
                            return [2 /*return*/, {
                                    success: true,
                                    data: result.data,
                                }];
                        case 2:
                            error_11 = _a.sent();
                            this.logger.error('Failed to fetch SOL price:', error_11);
                            return [2 /*return*/, {
                                    success: false,
                                    error: error_11.message || 'Failed to fetch SOL price',
                                    data: { price: 0 },
                                }];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Dashboard analytics endpoint
         */
        TokensController_1.prototype.getDashboardData = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a, featuredResult, trendingResult, newResult, marketStats, totalFeatured, totalTrending, totalNew, allTokens, uniqueTokens, analytics, error_12;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 3]);
                            this.logger.log('Fetching dashboard analytics data');
                            return [4 /*yield*/, Promise.all([
                                    this.tokensService.getFeaturedTokens(10),
                                    this.tokensService.getTrendingTokens(20),
                                    this.tokensService.getNewTokens(20),
                                    this.tokensService.getMarketStats(),
                                ])];
                        case 1:
                            _a = _b.sent(), featuredResult = _a[0], trendingResult = _a[1], newResult = _a[2], marketStats = _a[3];
                            totalFeatured = featuredResult.data.length;
                            totalTrending = trendingResult.data.length;
                            totalNew = newResult.data.length;
                            allTokens = __spreadArray(__spreadArray([], featuredResult.data, true), trendingResult.data, true);
                            uniqueTokens = allTokens.filter(function (token, index, arr) {
                                return arr.findIndex(function (t) { return t.mint === token.mint; }) === index;
                            });
                            analytics = {
                                featuredTokens: featuredResult.data,
                                trendingTokens: trendingResult.data,
                                newTokens: newResult.data,
                                marketStats: marketStats.data,
                                summary: {
                                    totalFeatured: totalFeatured,
                                    totalTrending: totalTrending,
                                    totalNew: totalNew,
                                    totalUnique: uniqueTokens.length,
                                },
                            };
                            this.logger.log("Dashboard data prepared: ".concat(totalFeatured, " featured, ").concat(totalTrending, " trending, ").concat(totalNew, " new"));
                            return [2 /*return*/, {
                                    success: true,
                                    data: analytics,
                                }];
                        case 2:
                            error_12 = _b.sent();
                            this.logger.error('Failed to fetch dashboard data:', error_12);
                            return [2 /*return*/, {
                                    success: false,
                                    error: error_12.message || 'Failed to fetch dashboard data',
                                    data: {
                                        featuredTokens: [],
                                        trendingTokens: [],
                                        newTokens: [],
                                        marketStats: null,
                                        summary: {
                                            totalFeatured: 0,
                                            totalTrending: 0,
                                            totalNew: 0,
                                            totalUnique: 0,
                                        },
                                    },
                                }];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Debug endpoint - Search test
         */
        TokensController_1.prototype.testSearch = function () {
            return __awaiter(this, arguments, void 0, function (query) {
                var sampleTokens, firstLetters, searchTerm_1, potentialMatches, searchResults, diagnostic, error_13;
                var _a;
                if (query === void 0) { query = 'test'; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 3, , 4]);
                            this.logger.log("========== SEARCH DIAGNOSTIC ==========");
                            this.logger.log("Testing search for: \"".concat(query, "\""));
                            return [4 /*yield*/, this.tokensService.getTrendingTokens(50, 0)];
                        case 1:
                            sampleTokens = _b.sent();
                            firstLetters = new Set(sampleTokens.data
                                .map(function (t) { var _a, _b; return (_b = (_a = t.name) === null || _a === void 0 ? void 0 : _a.charAt(0)) === null || _b === void 0 ? void 0 : _b.toUpperCase(); })
                                .filter(Boolean));
                            searchTerm_1 = query.toLowerCase();
                            potentialMatches = sampleTokens.data.filter(function (token) {
                                var _a, _b;
                                var name = ((_a = token.name) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
                                var symbol = ((_b = token.symbol) === null || _b === void 0 ? void 0 : _b.toLowerCase()) || '';
                                var firstLetter = searchTerm_1.charAt(0);
                                return name.startsWith(firstLetter) || symbol.startsWith(firstLetter);
                            });
                            return [4 /*yield*/, this.tokensService.searchTokensAdvanced(query, 20)];
                        case 2:
                            searchResults = _b.sent();
                            diagnostic = {
                                query: query,
                                timestamp: new Date().toISOString(),
                                results: {
                                    found: searchResults.data.length,
                                    searchType: searchResults.searchType,
                                    totalMatches: searchResults.totalMatches,
                                    tokens: searchResults.data.slice(0, 5).map(function (t) { return ({
                                        name: t.name,
                                        symbol: t.symbol,
                                        mint: t.mint.slice(0, 8) + '...'
                                    }); })
                                },
                                suggestions: searchResults.suggestions || [],
                                relatedTokens: ((_a = searchResults.relatedTokens) === null || _a === void 0 ? void 0 : _a.slice(0, 5).map(function (t) { return ({
                                    name: t.name,
                                    symbol: t.symbol
                                }); })) || [],
                                sampleData: {
                                    totalTokensFetched: sampleTokens.data.length,
                                    uniqueFirstLetters: Array.from(firstLetters).sort(),
                                    sampleTokenNames: sampleTokens.data.slice(0, 20).map(function (t) { return t.name; }),
                                    tokensStartingWithSameLetter: potentialMatches.slice(0, 10).map(function (t) { return ({
                                        name: t.name,
                                        symbol: t.symbol
                                    }); })
                                },
                                searchSuggestions: this.generateSearchSuggestions(sampleTokens.data, query),
                                apiStatus: {
                                    working: sampleTokens.data.length > 0,
                                    message: sampleTokens.data.length > 0
                                        ? "API is working, fetched ".concat(sampleTokens.data.length, " tokens")
                                        : 'API might be down or rate limited'
                                }
                            };
                            this.logger.log("Diagnostic complete:", JSON.stringify(diagnostic, null, 2));
                            return [2 /*return*/, {
                                    success: true,
                                    diagnostic: diagnostic
                                }];
                        case 3:
                            error_13 = _b.sent();
                            this.logger.error('Search diagnostic failed:', error_13);
                            return [2 /*return*/, {
                                    success: false,
                                    error: error_13.message,
                                    diagnostic: {
                                        query: query,
                                        error: 'Diagnostic failed',
                                        suggestion: 'Check backend logs for details'
                                    }
                                }];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Debug endpoint - List all available tokens
         */
        TokensController_1.prototype.listAllTokens = function () {
            return __awaiter(this, arguments, void 0, function (limit, offset) {
                var result, error_14;
                if (limit === void 0) { limit = 100; }
                if (offset === void 0) { offset = 0; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            this.logger.log("Fetching all available tokens - limit: ".concat(limit, ", offset: ").concat(offset));
                            return [4 /*yield*/, this.tokensService.getTrendingTokens(Number(limit), Number(offset))];
                        case 1:
                            result = _a.sent();
                            return [2 /*return*/, {
                                    success: true,
                                    total: result.data.length,
                                    tokens: result.data.map(function (t) { return ({
                                        name: t.name,
                                        symbol: t.symbol,
                                        mint: t.mint,
                                        marketCap: t.usd_market_cap,
                                        created: new Date(t.created_timestamp * 1000).toISOString(),
                                        isLive: t.is_currently_live,
                                        isComplete: t.complete
                                    }); }),
                                    message: "Showing ".concat(result.data.length, " tokens (offset: ").concat(offset, ")")
                                }];
                        case 2:
                            error_14 = _a.sent();
                            this.logger.error('Failed to list tokens:', error_14);
                            return [2 /*return*/, {
                                    success: false,
                                    error: error_14.message,
                                    tokens: []
                                }];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Helper method to generate search suggestions
         */
        TokensController_1.prototype.generateSearchSuggestions = function (tokens, query) {
            var suggestions = new Set();
            // Get some popular token names as suggestions
            tokens.slice(0, 20).forEach(function (token) {
                if (token.name && token.name.length > 2) {
                    // Take first word of multi-word names
                    var firstWord = token.name.split(' ')[0];
                    if (firstWord.length <= 20) {
                        suggestions.add(firstWord);
                    }
                }
                if (token.symbol && token.symbol.length <= 10) {
                    suggestions.add(token.symbol);
                }
            });
            return Array.from(suggestions).slice(0, 10);
        };
        return TokensController_1;
    }());
    __setFunctionName(_classThis, "TokensController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getServiceHealth_decorators = [(0, common_1.Get)('health')];
        _getFeaturedTokens_decorators = [(0, common_1.Get)('featured')];
        _getTrendingTokens_decorators = [(0, common_1.Get)('trending')];
        _getNewTokens_decorators = [(0, common_1.Get)('new')];
        _searchTokensAdvanced_decorators = [(0, common_1.Get)('search/advanced')];
        _searchTokens_decorators = [(0, common_1.Get)('search')];
        _getTokenByMint_decorators = [(0, common_1.Get)(':mint')];
        _getTokenTrades_decorators = [(0, common_1.Get)(':mint/trades')];
        _getLatestTrades_decorators = [(0, common_1.Get)('trades/latest')];
        _getMarketStats_decorators = [(0, common_1.Get)('stats/market')];
        _getSolPrice_decorators = [(0, common_1.Get)('price/sol')];
        _getDashboardData_decorators = [(0, common_1.Get)('analytics/dashboard')];
        _testSearch_decorators = [(0, common_1.Get)('debug/search-test')];
        _listAllTokens_decorators = [(0, common_1.Get)('debug/list-all')];
        __esDecorate(_classThis, null, _getServiceHealth_decorators, { kind: "method", name: "getServiceHealth", static: false, private: false, access: { has: function (obj) { return "getServiceHealth" in obj; }, get: function (obj) { return obj.getServiceHealth; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getFeaturedTokens_decorators, { kind: "method", name: "getFeaturedTokens", static: false, private: false, access: { has: function (obj) { return "getFeaturedTokens" in obj; }, get: function (obj) { return obj.getFeaturedTokens; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getTrendingTokens_decorators, { kind: "method", name: "getTrendingTokens", static: false, private: false, access: { has: function (obj) { return "getTrendingTokens" in obj; }, get: function (obj) { return obj.getTrendingTokens; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getNewTokens_decorators, { kind: "method", name: "getNewTokens", static: false, private: false, access: { has: function (obj) { return "getNewTokens" in obj; }, get: function (obj) { return obj.getNewTokens; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _searchTokensAdvanced_decorators, { kind: "method", name: "searchTokensAdvanced", static: false, private: false, access: { has: function (obj) { return "searchTokensAdvanced" in obj; }, get: function (obj) { return obj.searchTokensAdvanced; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _searchTokens_decorators, { kind: "method", name: "searchTokens", static: false, private: false, access: { has: function (obj) { return "searchTokens" in obj; }, get: function (obj) { return obj.searchTokens; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getTokenByMint_decorators, { kind: "method", name: "getTokenByMint", static: false, private: false, access: { has: function (obj) { return "getTokenByMint" in obj; }, get: function (obj) { return obj.getTokenByMint; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getTokenTrades_decorators, { kind: "method", name: "getTokenTrades", static: false, private: false, access: { has: function (obj) { return "getTokenTrades" in obj; }, get: function (obj) { return obj.getTokenTrades; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getLatestTrades_decorators, { kind: "method", name: "getLatestTrades", static: false, private: false, access: { has: function (obj) { return "getLatestTrades" in obj; }, get: function (obj) { return obj.getLatestTrades; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getMarketStats_decorators, { kind: "method", name: "getMarketStats", static: false, private: false, access: { has: function (obj) { return "getMarketStats" in obj; }, get: function (obj) { return obj.getMarketStats; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getSolPrice_decorators, { kind: "method", name: "getSolPrice", static: false, private: false, access: { has: function (obj) { return "getSolPrice" in obj; }, get: function (obj) { return obj.getSolPrice; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getDashboardData_decorators, { kind: "method", name: "getDashboardData", static: false, private: false, access: { has: function (obj) { return "getDashboardData" in obj; }, get: function (obj) { return obj.getDashboardData; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _testSearch_decorators, { kind: "method", name: "testSearch", static: false, private: false, access: { has: function (obj) { return "testSearch" in obj; }, get: function (obj) { return obj.testSearch; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _listAllTokens_decorators, { kind: "method", name: "listAllTokens", static: false, private: false, access: { has: function (obj) { return "listAllTokens" in obj; }, get: function (obj) { return obj.listAllTokens; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        TokensController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return TokensController = _classThis;
}();
exports.TokensController = TokensController;
