"use strict";
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
var react_1 = require("react");
var react_router_dom_1 = require("react-router-dom");
var apiService_1 = require("./services/api/apiService");
var env_1 = require("./config/env");
// Simple connection status component
function ConnectionStatus(_a) {
    var status = _a.status, onRetry = _a.onRetry;
    if (status === 'checking') {
        return (<div className="min-h-screen bg-terminal flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-neon-lime/20 border-t-neon-lime rounded-full animate-spin mx-auto"></div>
          <h2 className="text-xl font-bold text-neon-lime">TRIGGER TERMINAL</h2>
          <p className="text-gray-400">Connecting to backend...</p>
          <p className="text-sm text-gray-500">{env_1.ENV.API_URL}</p>
        </div>
      </div>);
    }
    if (status === 'error') {
        return (<div className="min-h-screen bg-terminal flex items-center justify-center p-4">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-8 max-w-md w-full text-center space-y-4">
          <h2 className="text-xl text-red-400">CONNECTION FAILED</h2>
          <p className="text-gray-300">Cannot connect to backend server</p>
          <div className="text-left bg-gray-900 rounded p-4 space-y-2">
            <p className="text-sm text-gray-400">Troubleshooting:</p>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Ensure backend is running</li>
              <li>• Check port 3000 is available</li>
              <li>• Verify API URL: {env_1.ENV.API_URL}</li>
            </ul>
          </div>
          <button onClick={onRetry} className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
            RETRY CONNECTION
          </button>
        </div>
      </div>);
    }
    return null;
}
// Main homepage component
function HomePage() {
    return (<div className="min-h-screen bg-terminal">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-8">
          <h1 className="text-6xl font-bold">
            <span className="text-neon-lime">TRIGGER</span>
            <span className="text-neon-cyan ml-4">TERMINAL</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            The arcade-style trading terminal for Solana memecoins. 
            Discover trending tokens, trade with precision, and ride the waves.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-neon-cyan mb-4">🚀 Trade</h3>
              <p className="text-gray-400">
                Buy and sell tokens with lightning-fast execution
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-neon-lime mb-4">📊 Discover</h3>
              <p className="text-gray-400">
                Find trending tokens and hidden gems
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-neon-magenta mb-4">💎 Create</h3>
              <p className="text-gray-400">
                Launch your own tokens with ease
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>);
}
function App() {
    var _this = this;
    var _a = (0, react_1.useState)('checking'), backendStatus = _a[0], setBackendStatus = _a[1];
    (0, react_1.useEffect)(function () {
        checkBackendConnection();
    }, []);
    var checkBackendConnection = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    console.log('[App] Checking backend connection...');
                    return [4 /*yield*/, apiService_1.apiService.healthCheck()];
                case 1:
                    _a.sent();
                    console.log('[App] Backend connection successful');
                    setBackendStatus('connected');
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error('[App] Backend connection failed:', error_1);
                    setBackendStatus('error');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    if (backendStatus !== 'connected') {
        return (<ConnectionStatus status={backendStatus} onRetry={checkBackendConnection}/>);
    }
    return (<react_router_dom_1.BrowserRouter>
      <div className="min-h-screen bg-terminal text-white">
        <react_router_dom_1.Routes>
          <react_router_dom_1.Route path="/" element={<HomePage />}/>
          <react_router_dom_1.Route path="*" element={<HomePage />}/>
        </react_router_dom_1.Routes>
      </div>
    </react_router_dom_1.BrowserRouter>);
}
exports.default = App;
