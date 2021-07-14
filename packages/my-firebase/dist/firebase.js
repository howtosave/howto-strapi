"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
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
exports.credentialInfoFromEnv = exports.initFirebaseApp = exports.deleteUser = exports.createUser = exports.getUser = void 0;
var admin = __importStar(require("firebase-admin"));
var getUser = function (uid, email, phoneNumber) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                if (!uid) return [3 /*break*/, 2];
                return [4 /*yield*/, admin.auth().getUser(uid)];
            case 1:
                _a = _d.sent();
                return [3 /*break*/, 9];
            case 2:
                if (!email) return [3 /*break*/, 4];
                return [4 /*yield*/, admin.auth().getUserByEmail(email)];
            case 3:
                _b = _d.sent();
                return [3 /*break*/, 8];
            case 4:
                if (!phoneNumber) return [3 /*break*/, 6];
                return [4 /*yield*/, admin.auth().getUserByPhoneNumber(phoneNumber)];
            case 5:
                _c = _d.sent();
                return [3 /*break*/, 7];
            case 6:
                _c = null;
                _d.label = 7;
            case 7:
                _b = _c;
                _d.label = 8;
            case 8:
                _a = _b;
                _d.label = 9;
            case 9: return [2 /*return*/, _a];
        }
    });
}); };
exports.getUser = getUser;
var createUser = function (properties) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, admin.auth().createUser(properties)];
            case 1: 
            /*
            {
              uid: 'some-uid',
              email: 'user@example.com',
              emailVerified: false,
              phoneNumber: '+11234567890',
              password: 'secretPassword',
              displayName: 'John Doe',
              photoURL: 'http://www.example.com/12345678/photo.png',
              disabled: false,
            }
            */
            return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.createUser = createUser;
var deleteUser = function (uid) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, admin.auth().deleteUser(uid)];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.deleteUser = deleteUser;
// See https://firebase.google.com/docs/admin/setup/#initialize-sdk
// export GOOGLE_APPLICATION_CREDENTIALS="/home/user/Downloads/service-account-file.json"
var initFirebaseApp = function (appConfig) {
    appConfig.credential = appConfig.credential || admin.credential.applicationDefault();
    return admin.initializeApp(appConfig);
};
exports.initFirebaseApp = initFirebaseApp;
//
// Utils
//
var a = {};
var credentialInfoFromEnv = function (env) { return (admin.credential.cert({
    projectId: env.FIREBASE_project_id,
    //private_key_id: env.FIREBASE_private_key_id,
    privateKey: env.FIREBASE_private_key,
    clientEmail: env.FIREBASE_client_email,
    //client_id: env.FIREBASE_client_id,
    //auth_url: env.FIREBASE_auth_uri,
    //token_url: env.FIREBASE_token_uri,
    //auth_provider_x509_cert_url: env.FIREBASE_auth_provider_x509_cert_url,
    //client_x509_cert_url: env.FIREBASE_client_x509_cert_url,
})); };
exports.credentialInfoFromEnv = credentialInfoFromEnv;
