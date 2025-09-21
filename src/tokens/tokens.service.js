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
exports.TokensService = void 0;
var common_1 = require("@nestjs/common");
var axios_1 = require("axios");
var TokensService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var TokensService = _classThis = /** @class */ (function () {
        function TokensService_1() {
            this.logger = new common_1.Logger(TokensService.name);
            // Updated API configurations with working endpoints
            this.API_CONFIGS = [
                {
                    name: 'pump.fun v3',
                    baseUrl: 'https://frontend-api.pump.fun',
                    endpoints: {
                        coins: '/coins',
                        coinDetails: '/coins',
                        search: '/coins',
                        trades: '/trades',
                        kingOfHill: '/coins/king-of-the-hill'
                    }
                },
                {
                    name: 'pump.fun v2',
                    baseUrl: 'https://frontend-api-v2.pump.fun',
                    endpoints: {
                        coins: '/coins',
                        coinDetails: '/coins',
                        search: '/coins',
                        trades: '/trades'
                    }
                },
                {
                    name: 'pump.fun v1',
                    baseUrl: 'https://frontend-api.pump.fun',
                    endpoints: {
                        coins: '/coins',
                        coinDetails: '/coins',
                        search: '/coins',
                        trades: '/trades'
                    }
                }
            ];
            // PumpPortal configuration with correct endpoints
            this.PUMPPORTAL_CONFIG = {
                name: 'PumpPortal',
                baseUrl: 'https://pumpportal.fun/api',
                endpoints: {
                    coins: '/coins',
                    coinDetails: '/coins',
                    trades: '/trades',
                    stats: '/stats'
                }
            };
            // Cache for tokens
            this.tokenCache = new Map();
            this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
        }
        /**
         * Enhanced API caller with proper error handling and success detection
         */
        TokensService_1.prototype.callAPI = function (config_1, endpoint_1) {
            return __awaiter(this, arguments, void 0, function (config, endpoint, params) {
                var url, response, error_1;
                if (params === void 0) { params = {}; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            url = "".concat(config.baseUrl).concat(endpoint);
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            this.logger.log("Attempting ".concat(config.name, ": ").concat(url));
                            return [4 /*yield*/, axios_1.default.get(url, {
                                    params: params,
                                    timeout: 10000,
                                    headers: {
                                        'Accept': 'application/json',
                                        'User-Agent': 'PumpFunController/1.0',
                                        'Origin': 'https://pump.fun',
                                        'Referer': 'https://pump.fun/'
                                    },
                                    validateStatus: function (status) {
                                        // Accept 200-299 as success
                                        return status >= 200 && status < 300;
                                    }
                                })];
                        case 2:
                            response = _a.sent();
                            // Check if response has data
                            if (response.status === 200 && response.data) {
                                this.logger.log("\u2705 ".concat(config.name, " succeeded with ").concat(JSON.stringify(response.data).length, " chars"));
                                return [2 /*return*/, response.data];
                            }
                            else {
                                throw new Error("Invalid response: status ".concat(response.status, ", no data"));
                            }
                            return [3 /*break*/, 4];
                        case 3:
                            error_1 = _a.sent();
                            if (error_1.response) {
                                this.logger.warn("\u274C ".concat(config.name, " failed: ").concat(error_1.response.status, " - ").concat(error_1.message));
                                throw new Error("".concat(error_1.response.status, " - ").concat(error_1.message));
                            }
                            else if (error_1.request) {
                                this.logger.warn("\u274C ".concat(config.name, " failed: Network error - ").concat(error_1.message));
                                throw new Error("Network error - ".concat(error_1.message));
                            }
                            else {
                                this.logger.warn("\u274C ".concat(config.name, " failed: ").concat(error_1.message));
                                throw error_1;
                            }
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Try multiple APIs with fallback logic
         */
        TokensService_1.prototype.callWithFallback = function (endpoint_1) {
            return __awaiter(this, arguments, void 0, function (endpoint, params) {
                var errors, _i, _a, config, result, error_2, pumpPortalEndpoint, result, error_3;
                var _this = this;
                if (params === void 0) { params = {}; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            errors = [];
                            _i = 0, _a = this.API_CONFIGS;
                            _b.label = 1;
                        case 1:
                            if (!(_i < _a.length)) return [3 /*break*/, 7];
                            config = _a[_i];
                            _b.label = 2;
                        case 2:
                            _b.trys.push([2, 5, , 6]);
                            if (!config.endpoints[endpoint.replace('/', '')]) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.callAPI(config, config.endpoints[endpoint.replace('/', '')], params)];
                        case 3:
                            result = _b.sent();
                            return [2 /*return*/, result];
                        case 4: return [3 /*break*/, 6];
                        case 5:
                            error_2 = _b.sent();
                            errors.push("".concat(config.name, ": ").concat(error_2.message));
                            return [3 /*break*/, 6];
                        case 6:
                            _i++;
                            return [3 /*break*/, 1];
                        case 7:
                            _b.trys.push([7, 9, , 10]);
                            this.logger.log("Attempting PumpPortal: ".concat(this.PUMPPORTAL_CONFIG.baseUrl));
                            pumpPortalEndpoint = this.PUMPPORTAL_CONFIG.endpoints[endpoint.replace('/', '')] || endpoint;
                            return [4 /*yield*/, this.callAPI(this.PUMPPORTAL_CONFIG, pumpPortalEndpoint, params)];
                        case 8:
                            result = _b.sent();
                            return [2 /*return*/, result];
                        case 9:
                            error_3 = _b.sent();
                            errors.push("PumpPortal: ".concat(error_3.message));
                            return [3 /*break*/, 10];
                        case 10:
                            // All APIs failed
                            this.logger.error("\u274C All APIs failed for ".concat(endpoint, ":"));
                            errors.forEach(function (error) { return _this.logger.error("  - ".concat(error)); });
                            throw new Error("All APIs failed. Last errors: ".concat(errors.join('; ')));
                    }
                });
            });
        };
        /**
         * Health check for all APIs
         */
        TokensService_1.prototype.checkAPIHealth = function () {
            return __awaiter(this, void 0, void 0, function () {
                var health, _i, _a, config, error_4, error_5;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            this.logger.log('🔍 Performing API health check...');
                            health = {};
                            _i = 0, _a = this.API_CONFIGS;
                            _b.label = 1;
                        case 1:
                            if (!(_i < _a.length)) return [3 /*break*/, 6];
                            config = _a[_i];
                            _b.label = 2;
                        case 2:
                            _b.trys.push([2, 4, , 5]);
                            return [4 /*yield*/, this.callAPI(config, '/coins', { limit: 1 })];
                        case 3:
                            _b.sent();
                            health[config.name] = true;
                            this.logger.log("\u2705 ".concat(config.name, " is healthy"));
                            return [3 /*break*/, 5];
                        case 4:
                            error_4 = _b.sent();
                            health[config.name] = false;
                            this.logger.warn("\u274C ".concat(config.name, " is down: ").concat(error_4.message));
                            return [3 /*break*/, 5];
                        case 5:
                            _i++;
                            return [3 /*break*/, 1];
                        case 6:
                            _b.trys.push([6, 8, , 9]);
                            return [4 /*yield*/, this.callAPI(this.PUMPPORTAL_CONFIG, '/coins', { limit: 1 })];
                        case 7:
                            _b.sent();
                            health[this.PUMPPORTAL_CONFIG.name] = true;
                            this.logger.log("\u2705 ".concat(this.PUMPPORTAL_CONFIG.name, " is healthy"));
                            return [3 /*break*/, 9];
                        case 8:
                            error_5 = _b.sent();
                            health[this.PUMPPORTAL_CONFIG.name] = false;
                            this.logger.warn("\u274C ".concat(this.PUMPPORTAL_CONFIG.name, " is down: ").concat(error_5.message));
                            return [3 /*break*/, 9];
                        case 9: return [2 /*return*/, health];
                    }
                });
            });
        };
        /**
         * Calculate string similarity score (Levenshtein distance)
         */
        TokensService_1.prototype.calculateSimilarity = function (str1, str2) {
            var s1 = str1.toLowerCase();
            var s2 = str2.toLowerCase();
            if (s1 === s2)
                return 1;
            if (s1.includes(s2) || s2.includes(s1))
                return 0.8;
            var matrix = [];
            for (var i = 0; i <= s2.length; i++) {
                matrix[i] = [i];
            }
            for (var j = 0; j <= s1.length; j++) {
                matrix[0][j] = j;
            }
            for (var i = 1; i <= s2.length; i++) {
                for (var j = 1; j <= s1.length; j++) {
                    if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
                        matrix[i][j] = matrix[i - 1][j - 1];
                    }
                    else {
                        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
                    }
                }
            }
            var maxLength = Math.max(s1.length, s2.length);
            var distance = matrix[s2.length][s1.length];
            return 1 - distance / maxLength;
        };
        /**
         * Update token cache
         */
        TokensService_1.prototype.updateTokenCache = function (key, tokens) {
            var cacheSize = tokens.length;
            this.tokenCache.set(key, {
                tokens: tokens,
                timestamp: Date.now()
            });
            this.logger.debug("\uD83D\uDCE6 Updated cache \"".concat(key, "\" with ").concat(cacheSize, " tokens"));
        };
        /**
         * Search cached tokens
         */
        TokensService_1.prototype.searchCachedTokens = function (query, limit) {
            var searchTerm = query.toLowerCase();
            var allCachedTokens = [];
            var validCaches = 0;
            var expiredCaches = 0;
            for (var _i = 0, _a = this.tokenCache.entries(); _i < _a.length; _i++) {
                var _b = _a[_i], key = _b[0], cache = _b[1];
                if (Date.now() - cache.timestamp < this.CACHE_DURATION) {
                    allCachedTokens = allCachedTokens.concat(cache.tokens);
                    validCaches++;
                }
                else {
                    this.tokenCache.delete(key);
                    expiredCaches++;
                }
            }
            this.logger.debug("\uD83D\uDCE6 Cache status: ".concat(validCaches, " valid, ").concat(expiredCaches, " expired, ").concat(allCachedTokens.length, " total tokens"));
            var uniqueTokens = Array.from(new Map(allCachedTokens.map(function (token) { return [token.mint, token]; })).values());
            var filteredTokens = uniqueTokens.filter(function (token) {
                var _a, _b, _c;
                var nameMatch = (_a = token.name) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchTerm);
                var symbolMatch = (_b = token.symbol) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(searchTerm);
                var descriptionMatch = (_c = token.description) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes(searchTerm);
                return nameMatch || symbolMatch || descriptionMatch;
            });
            this.logger.debug("\uD83D\uDCE6 Cache search: Found ".concat(filteredTokens.length, " matches for \"").concat(query, "\""));
            return filteredTokens.slice(0, limit);
        };
        /**
         * Get featured tokens (King of the Hill)
         */
        TokensService_1.prototype.getFeaturedTokens = function () {
            return __awaiter(this, arguments, void 0, function (limit, offset) {
                var data, error_6, error_7, cached;
                if (limit === void 0) { limit = 20; }
                if (offset === void 0) { offset = 0; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 5, , 6]);
                            this.logger.log("Fetching featured tokens - limit: ".concat(limit, ", offset: ").concat(offset));
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.callWithFallback('kingOfHill', {
                                    offset: offset,
                                    limit: limit,
                                    includeNsfw: false,
                                })];
                        case 2:
                            data = _a.sent();
                            this.logger.log("Fetched ".concat(data.length, " featured tokens"));
                            this.updateTokenCache('featured', data);
                            return [2 /*return*/, { data: data }];
                        case 3:
                            error_6 = _a.sent();
                            this.logger.warn('Featured endpoint failed, using trending as fallback');
                            return [2 /*return*/, this.getTrendingTokens(limit, offset)];
                        case 4: return [3 /*break*/, 6];
                        case 5:
                            error_7 = _a.sent();
                            this.logger.error('All featured token APIs failed:', error_7.message);
                            cached = this.searchCachedTokens('', limit);
                            return [2 /*return*/, { data: cached }];
                        case 6: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Get trending tokens
         */
        TokensService_1.prototype.getTrendingTokens = function () {
            return __awaiter(this, arguments, void 0, function (limit, offset) {
                var data, error_8, cached;
                if (limit === void 0) { limit = 50; }
                if (offset === void 0) { offset = 0; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            this.logger.log("Fetching trending tokens - limit: ".concat(limit, ", offset: ").concat(offset));
                            return [4 /*yield*/, this.callWithFallback('coins', {
                                    offset: offset,
                                    limit: limit,
                                    sort: 'market_cap',
                                    order: 'DESC',
                                    includeNsfw: false,
                                })];
                        case 1:
                            data = _a.sent();
                            this.updateTokenCache('trending', data);
                            this.logger.log("Fetched ".concat(data.length, " trending tokens"));
                            return [2 /*return*/, { data: data }];
                        case 2:
                            error_8 = _a.sent();
                            this.logger.error('All trending token APIs failed:', error_8.message);
                            cached = this.searchCachedTokens('', limit);
                            return [2 /*return*/, { data: cached }];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Get new tokens
         */
        TokensService_1.prototype.getNewTokens = function () {
            return __awaiter(this, arguments, void 0, function (limit, offset) {
                var data, error_9, cached;
                if (limit === void 0) { limit = 50; }
                if (offset === void 0) { offset = 0; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            this.logger.log("Fetching new tokens - limit: ".concat(limit, ", offset: ").concat(offset));
                            return [4 /*yield*/, this.callWithFallback('coins', {
                                    offset: offset,
                                    limit: limit,
                                    sort: 'created_timestamp',
                                    order: 'DESC',
                                    includeNsfw: false,
                                })];
                        case 1:
                            data = _a.sent();
                            this.updateTokenCache('new', data);
                            this.logger.log("Fetched ".concat(data.length, " new tokens"));
                            return [2 /*return*/, { data: data }];
                        case 2:
                            error_9 = _a.sent();
                            this.logger.error('All new token APIs failed:', error_9.message);
                            cached = this.searchCachedTokens('', limit);
                            return [2 /*return*/, { data: cached }];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Enhanced search with suggestions and related tokens
         */
        TokensService_1.prototype.searchTokensAdvanced = function (query_1) {
            return __awaiter(this, arguments, void 0, function (query, limit) {
                var searchTerm_1, results, looksLikeCa, tokenResult, err_1, searchData, searchError_1, apiError_1, fetchPromises, _loop_1, this_1, page, fetchResults, allTokens, _i, fetchResults_1, result, uniqueTokens, exactMatches, fuzzyMatches, partialMatches, relatedTokens, tokenScores_1, _loop_2, this_2, _a, uniqueTokens_1, token, sortByMarketCap, suggestions_1, firstChar_1, similarTokens, suggestions_2, error_10, cachedResults;
                var _this = this;
                var _b, _c, _d;
                if (limit === void 0) { limit = 20; }
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            _e.trys.push([0, 12, , 13]);
                            this.logger.log("\uD83D\uDD0D ============ ADVANCED SEARCH START ============");
                            this.logger.log("Query: \"".concat(query, "\" | Limit: ").concat(limit));
                            if (!query || query.trim().length === 0) {
                                return [2 /*return*/, {
                                        data: [],
                                        searchType: 'exact',
                                        totalMatches: 0
                                    }];
                            }
                            searchTerm_1 = query.trim().toLowerCase();
                            results = {
                                data: [],
                                suggestions: [],
                                relatedTokens: [],
                                searchType: 'exact',
                                totalMatches: 0
                            };
                            looksLikeCa = /^[a-zA-Z0-9]{32,44}$/.test(searchTerm_1) ||
                                (/^[a-zA-Z0-9]{6,}$/.test(searchTerm_1) && searchTerm_1.length > 10);
                            if (!looksLikeCa) return [3 /*break*/, 4];
                            this.logger.log("\uD83D\uDD11 Detected possible Contract Address: ".concat(searchTerm_1));
                            results.searchType = 'ca';
                            if (!(searchTerm_1.length >= 32)) return [3 /*break*/, 4];
                            _e.label = 1;
                        case 1:
                            _e.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.getTokenDetails(searchTerm_1)];
                        case 2:
                            tokenResult = _e.sent();
                            if (tokenResult.data) {
                                this.logger.log("\u2705 Found token by exact CA match");
                                results.data = [tokenResult.data];
                                results.totalMatches = 1;
                                return [2 /*return*/, results];
                            }
                            return [3 /*break*/, 4];
                        case 3:
                            err_1 = _e.sent();
                            this.logger.debug("No exact CA match for ".concat(searchTerm_1));
                            return [3 /*break*/, 4];
                        case 4:
                            _e.trys.push([4, 9, , 10]);
                            this.logger.log("[Method 1] Attempting direct API search for: \"".concat(query, "\""));
                            _e.label = 5;
                        case 5:
                            _e.trys.push([5, 7, , 8]);
                            return [4 /*yield*/, this.callWithFallback('search', {
                                    q: query,
                                    query: query,
                                    search: query,
                                    limit: limit,
                                    includeNsfw: false,
                                })];
                        case 6:
                            searchData = _e.sent();
                            if (searchData && searchData.length > 0) {
                                this.logger.log("\u2705 Found ".concat(searchData.length, " tokens via search endpoint"));
                                results.data = searchData.slice(0, limit);
                                results.totalMatches = searchData.length;
                                results.searchType = 'exact';
                                return [2 /*return*/, results];
                            }
                            return [3 /*break*/, 8];
                        case 7:
                            searchError_1 = _e.sent();
                            this.logger.debug("Search endpoint failed: ".concat(searchError_1.message));
                            return [3 /*break*/, 8];
                        case 8: return [3 /*break*/, 10];
                        case 9:
                            apiError_1 = _e.sent();
                            this.logger.warn("Direct API search failed for \"".concat(query, "\": ").concat(apiError_1.message));
                            return [3 /*break*/, 10];
                        case 10:
                            // Fetch and filter approach
                            this.logger.log("\uD83D\uDCCA Using fetch-and-filter search for: \"".concat(query, "\""));
                            fetchPromises = [];
                            _loop_1 = function (page) {
                                fetchPromises.push(this_1.callWithFallback('coins', {
                                    limit: 200,
                                    offset: page * 200,
                                    includeNsfw: false,
                                    sort: 'market_cap',
                                    order: 'DESC'
                                }).catch(function (err) {
                                    _this.logger.debug("Page ".concat(page, " (market_cap) failed: ").concat(err.message));
                                    return [];
                                }));
                            };
                            this_1 = this;
                            // Fetch multiple pages
                            for (page = 0; page < 3; page++) {
                                _loop_1(page);
                            }
                            // Also fetch newest tokens
                            fetchPromises.push(this.callWithFallback('coins', {
                                limit: 100,
                                offset: 0,
                                includeNsfw: false,
                                sort: 'created_timestamp',
                                order: 'DESC'
                            }).catch(function (err) {
                                _this.logger.debug("New tokens fetch failed: ".concat(err.message));
                                return [];
                            }));
                            this.logger.log("Fetching ".concat(fetchPromises.length, " pages of tokens..."));
                            return [4 /*yield*/, Promise.allSettled(fetchPromises)];
                        case 11:
                            fetchResults = _e.sent();
                            allTokens = [];
                            for (_i = 0, fetchResults_1 = fetchResults; _i < fetchResults_1.length; _i++) {
                                result = fetchResults_1[_i];
                                if (result.status === 'fulfilled' && result.value) {
                                    allTokens = allTokens.concat(result.value);
                                }
                            }
                            uniqueTokens = Array.from(new Map(allTokens.map(function (token) { return [token.mint, token]; })).values());
                            this.logger.log("\u2705 Fetched ".concat(uniqueTokens.length, " unique tokens from API"));
                            exactMatches = [];
                            fuzzyMatches = [];
                            partialMatches = [];
                            relatedTokens = [];
                            tokenScores_1 = new Map();
                            _loop_2 = function (token) {
                                var bestScore = 0;
                                var matchType = 'none';
                                // CA matching
                                if (looksLikeCa) {
                                    var mintLower = token.mint.toLowerCase();
                                    if (mintLower === searchTerm_1) {
                                        bestScore = 1.2;
                                        matchType = 'ca_exact';
                                    }
                                    else if (mintLower.startsWith(searchTerm_1) || mintLower.endsWith(searchTerm_1)) {
                                        bestScore = 0.95;
                                        matchType = 'ca_partial';
                                    }
                                    else if (mintLower.includes(searchTerm_1)) {
                                        bestScore = 0.9;
                                        matchType = 'ca_contains';
                                    }
                                }
                                // Name matching
                                var nameLower = ((_b = token.name) === null || _b === void 0 ? void 0 : _b.toLowerCase()) || '';
                                var nameScore = this_2.calculateSimilarity(nameLower, searchTerm_1);
                                if (nameLower === searchTerm_1) {
                                    bestScore = Math.max(bestScore, 1);
                                    matchType = bestScore === 1 ? 'exact_name' : matchType;
                                }
                                else if (nameLower.includes(searchTerm_1)) {
                                    bestScore = Math.max(bestScore, 0.8);
                                    matchType = matchType === 'none' ? 'partial_name' : matchType;
                                }
                                else if (nameScore > 0.7) {
                                    bestScore = Math.max(bestScore, nameScore * 0.9);
                                    matchType = matchType === 'none' ? 'fuzzy_name' : matchType;
                                }
                                // Symbol matching
                                var symbolLower = ((_c = token.symbol) === null || _c === void 0 ? void 0 : _c.toLowerCase()) || '';
                                var symbolScore = this_2.calculateSimilarity(symbolLower, searchTerm_1);
                                if (symbolLower === searchTerm_1) {
                                    bestScore = Math.max(bestScore, 1.1);
                                    matchType = bestScore === 1.1 ? 'exact_symbol' : matchType;
                                }
                                else if (symbolLower.includes(searchTerm_1)) {
                                    bestScore = Math.max(bestScore, 0.85);
                                    matchType = matchType === 'none' ? 'partial_symbol' : matchType;
                                }
                                else if (symbolScore > 0.7) {
                                    bestScore = Math.max(bestScore, symbolScore * 0.95);
                                    matchType = matchType === 'none' ? 'fuzzy_symbol' : matchType;
                                }
                                // Description matching
                                var descLower = ((_d = token.description) === null || _d === void 0 ? void 0 : _d.toLowerCase()) || '';
                                if (descLower.includes(searchTerm_1)) {
                                    bestScore = Math.max(bestScore, 0.6);
                                    matchType = matchType === 'none' ? 'description' : matchType;
                                }
                                // Multi-word search
                                var searchWords = searchTerm_1.split(/\s+/);
                                if (searchWords.length > 1) {
                                    var allWordsMatch = searchWords.every(function (word) {
                                        return nameLower.includes(word) || symbolLower.includes(word) || descLower.includes(word);
                                    });
                                    if (allWordsMatch) {
                                        bestScore = Math.max(bestScore, 0.75);
                                        matchType = matchType === 'none' ? 'multi_word' : matchType;
                                    }
                                }
                                if (bestScore > 0.5) {
                                    tokenScores_1.set(token.mint, { token: token, score: bestScore, matchType: matchType });
                                    if (bestScore >= 1) {
                                        exactMatches.push(token);
                                    }
                                    else if (bestScore >= 0.8) {
                                        fuzzyMatches.push(token);
                                    }
                                    else if (bestScore >= 0.6) {
                                        partialMatches.push(token);
                                    }
                                    else {
                                        relatedTokens.push(token);
                                    }
                                }
                            };
                            this_2 = this;
                            for (_a = 0, uniqueTokens_1 = uniqueTokens; _a < uniqueTokens_1.length; _a++) {
                                token = uniqueTokens_1[_a];
                                _loop_2(token);
                            }
                            sortByMarketCap = function (a, b) {
                                return (b.usd_market_cap || 0) - (a.usd_market_cap || 0);
                            };
                            exactMatches.sort(sortByMarketCap);
                            fuzzyMatches.sort(sortByMarketCap);
                            partialMatches.sort(sortByMarketCap);
                            relatedTokens.sort(sortByMarketCap);
                            // Combine results
                            results.data = __spreadArray(__spreadArray(__spreadArray([], exactMatches.slice(0, Math.min(10, limit)), true), fuzzyMatches.slice(0, Math.min(5, limit - exactMatches.length)), true), partialMatches.slice(0, Math.max(0, limit - exactMatches.length - fuzzyMatches.length)), true);
                            results.totalMatches = exactMatches.length + fuzzyMatches.length + partialMatches.length;
                            results.relatedTokens = relatedTokens.slice(0, 5);
                            if (exactMatches.length > 0) {
                                results.searchType = 'exact';
                            }
                            else if (fuzzyMatches.length > 0) {
                                results.searchType = 'fuzzy';
                            }
                            else if (partialMatches.length > 0) {
                                results.searchType = 'partial';
                            }
                            // Generate suggestions
                            if (results.data.length === 0) {
                                suggestions_1 = new Set();
                                firstChar_1 = searchTerm_1.charAt(0);
                                similarTokens = uniqueTokens.filter(function (token) {
                                    var _a, _b;
                                    return ((_a = token.name) === null || _a === void 0 ? void 0 : _a.toLowerCase().startsWith(firstChar_1)) ||
                                        ((_b = token.symbol) === null || _b === void 0 ? void 0 : _b.toLowerCase().startsWith(firstChar_1));
                                }).slice(0, 20);
                                similarTokens.forEach(function (token) {
                                    if (token.name && suggestions_1.size < 10) {
                                        suggestions_1.add(token.name);
                                    }
                                    if (token.symbol && suggestions_1.size < 10) {
                                        suggestions_1.add(token.symbol);
                                    }
                                });
                                results.suggestions = Array.from(suggestions_1);
                                this.logger.log("\uD83D\uDCA1 No exact matches. Generated ".concat(results.suggestions.length, " suggestions"));
                            }
                            else {
                                suggestions_2 = new Set();
                                results.data.slice(0, 5).forEach(function (token) {
                                    if (token.symbol && token.symbol.toLowerCase() !== searchTerm_1) {
                                        suggestions_2.add(token.symbol);
                                    }
                                });
                                relatedTokens.slice(0, 5).forEach(function (token) {
                                    if (token.name && suggestions_2.size < 8) {
                                        suggestions_2.add(token.name);
                                    }
                                });
                                results.suggestions = Array.from(suggestions_2);
                            }
                            this.logger.log("\uD83D\uDCCA Search Results Summary:");
                            this.logger.log("  Query: \"".concat(query, "\""));
                            this.logger.log("  Search Type: ".concat(results.searchType));
                            this.logger.log("  Exact Matches: ".concat(exactMatches.length));
                            this.logger.log("  Fuzzy Matches: ".concat(fuzzyMatches.length));
                            this.logger.log("  Partial Matches: ".concat(partialMatches.length));
                            this.logger.log("  Related Tokens: ".concat(relatedTokens.length));
                            this.logger.log("  Total Results: ".concat(results.data.length));
                            if (results.data.length > 0) {
                                this.logger.log("  Top Results:");
                                results.data.slice(0, 3).forEach(function (token, i) {
                                    var _a;
                                    var scoreInfo = tokenScores_1.get(token.mint);
                                    _this.logger.log("    ".concat(i + 1, ". ").concat(token.name, " (").concat(token.symbol, ")"));
                                    _this.logger.log("       Match: ".concat(scoreInfo === null || scoreInfo === void 0 ? void 0 : scoreInfo.matchType, " | Score: ").concat((_a = scoreInfo === null || scoreInfo === void 0 ? void 0 : scoreInfo.score) === null || _a === void 0 ? void 0 : _a.toFixed(2)));
                                });
                            }
                            this.logger.log("\uD83D\uDD0D ============ ADVANCED SEARCH END ============");
                            return [2 /*return*/, results];
                        case 12:
                            error_10 = _e.sent();
                            this.logger.error("\u274C Advanced search failed for \"".concat(query, "\": ").concat(error_10.message));
                            cachedResults = this.searchCachedTokens(query, limit);
                            return [2 /*return*/, {
                                    data: cachedResults,
                                    searchType: 'fuzzy',
                                    totalMatches: cachedResults.length,
                                    suggestions: []
                                }];
                        case 13: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Standard search wrapper
         */
        TokensService_1.prototype.searchTokens = function (query_1) {
            return __awaiter(this, arguments, void 0, function (query, limit) {
                var advancedResults;
                if (limit === void 0) { limit = 20; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.searchTokensAdvanced(query, limit)];
                        case 1:
                            advancedResults = _a.sent();
                            return [2 /*return*/, { data: advancedResults.data }];
                    }
                });
            });
        };
        /**
         * Get token details by mint address
         */
        TokensService_1.prototype.getTokenDetails = function (mint) {
            return __awaiter(this, void 0, void 0, function () {
                var data, error_11;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            this.logger.log("Fetching token details for mint: ".concat(mint));
                            return [4 /*yield*/, this.callWithFallback('coinDetails', { mint: mint })];
                        case 1:
                            data = _a.sent();
                            this.logger.log("Fetched token details: ".concat((data === null || data === void 0 ? void 0 : data.name) || 'Unknown'));
                            return [2 /*return*/, { data: data }];
                        case 2:
                            error_11 = _a.sent();
                            this.logger.error("Failed to fetch token details for ".concat(mint, ": ").concat(error_11.message));
                            return [2 /*return*/, { data: null }];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Get token trades
         */
        TokensService_1.prototype.getTokenTrades = function (mint_1) {
            return __awaiter(this, arguments, void 0, function (mint, limit, offset) {
                var data, error_12;
                if (limit === void 0) { limit = 50; }
                if (offset === void 0) { offset = 0; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            this.logger.log("Fetching trades for token: ".concat(mint, " - limit: ").concat(limit, ", offset: ").concat(offset));
                            return [4 /*yield*/, this.callWithFallback('trades', {
                                    mint: mint,
                                    offset: offset,
                                    limit: limit,
                                })];
                        case 1:
                            data = _a.sent();
                            this.logger.log("Fetched ".concat(data.length, " trades for token: ").concat(mint));
                            return [2 /*return*/, { data: data }];
                        case 2:
                            error_12 = _a.sent();
                            this.logger.warn("No trades found for token ".concat(mint, ": ").concat(error_12.message));
                            return [2 /*return*/, { data: [] }];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Get latest trades across all tokens
         */
        TokensService_1.prototype.getLatestTrades = function () {
            return __awaiter(this, arguments, void 0, function (limit) {
                var data, error_13;
                if (limit === void 0) { limit = 100; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            this.logger.log("Fetching latest trades - limit: ".concat(limit));
                            return [4 /*yield*/, this.callWithFallback('trades', { limit: limit })];
                        case 1:
                            data = _a.sent();
                            this.logger.log("Fetched ".concat(data.length, " latest trades"));
                            return [2 /*return*/, { data: data }];
                        case 2:
                            error_13 = _a.sent();
                            this.logger.warn("No latest trades available: ".concat(error_13.message));
                            return [2 /*return*/, { data: [] }];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Get SOL price from CoinGecko
         */
        TokensService_1.prototype.getSolPrice = function () {
            return __awaiter(this, void 0, void 0, function () {
                var response, price, coinGeckoError_1, error_14;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _c.trys.push([0, 5, , 6]);
                            this.logger.log('Fetching SOL price');
                            _c.label = 1;
                        case 1:
                            _c.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, axios_1.default.get('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd', {
                                    timeout: 5000,
                                })];
                        case 2:
                            response = _c.sent();
                            price = ((_b = (_a = response.data) === null || _a === void 0 ? void 0 : _a.solana) === null || _b === void 0 ? void 0 : _b.usd) || 0;
                            this.logger.log("SOL price from CoinGecko: $".concat(price));
                            return [2 /*return*/, { data: { price: price } }];
                        case 3:
                            coinGeckoError_1 = _c.sent();
                            this.logger.warn('CoinGecko failed, using fallback price');
                            return [2 /*return*/, { data: { price: 100 } }];
                        case 4: return [3 /*break*/, 6];
                        case 5:
                            error_14 = _c.sent();
                            this.logger.error('Failed to fetch SOL price:', error_14.message);
                            return [2 /*return*/, { data: { price: 100 } }];
                        case 6: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Get market statistics
         */
        TokensService_1.prototype.getMarketStats = function () {
            return __awaiter(this, void 0, void 0, function () {
                var trendingResult, tokens, totalMarketCap, activeTokens, successfulGraduations, totalVolume24h, oneDayAgo_1, newTokensLast24h, stats, error_15;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            this.logger.log('Calculating market stats from real token data');
                            return [4 /*yield*/, this.getTrendingTokens(100)];
                        case 1:
                            trendingResult = _a.sent();
                            tokens = trendingResult.data;
                            if (tokens.length === 0) {
                                this.logger.warn('No tokens available for stats calculation');
                                return [2 /*return*/, {
                                        data: {
                                            totalMarketCap: 0,
                                            totalVolume24h: 0,
                                            activeTokens: 0,
                                            successfulGraduations: 0,
                                            totalTokens: 0,
                                        }
                                    }];
                            }
                            totalMarketCap = tokens.reduce(function (sum, token) { return sum + (token.usd_market_cap || 0); }, 0);
                            activeTokens = tokens.filter(function (token) { return token.is_currently_live; }).length;
                            successfulGraduations = tokens.filter(function (token) { return token.complete; }).length;
                            totalVolume24h = tokens.reduce(function (sum, token) { return sum + (token.volume_24h || 0); }, 0);
                            oneDayAgo_1 = Date.now() / 1000 - 86400;
                            newTokensLast24h = tokens.filter(function (token) {
                                return token.created_timestamp > oneDayAgo_1;
                            }).length;
                            stats = {
                                totalMarketCap: totalMarketCap,
                                totalVolume24h: totalVolume24h,
                                activeTokens: activeTokens,
                                successfulGraduations: successfulGraduations,
                                totalTokens: tokens.length,
                                last24Hours: {
                                    newTokens: newTokensLast24h,
                                    volume: totalVolume24h,
                                    trades: 0
                                }
                            };
                            this.logger.log("Market stats calculated: ".concat(JSON.stringify(stats)));
                            return [2 /*return*/, { data: stats }];
                        case 2:
                            error_15 = _a.sent();
                            this.logger.error('Failed to calculate market stats:', error_15.message);
                            return [2 /*return*/, {
                                    data: {
                                        totalMarketCap: 0,
                                        totalVolume24h: 0,
                                        activeTokens: 0,
                                        successfulGraduations: 0,
                                        totalTokens: 0,
                                    }
                                }];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        return TokensService_1;
    }());
    __setFunctionName(_classThis, "TokensService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        TokensService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return TokensService = _classThis;
}();
exports.TokensService = TokensService;
