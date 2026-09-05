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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var app_1 = require("firebase/app");
var firestore_1 = require("firebase/firestore");
var fs_1 = __importDefault(require("fs"));
var KISHOREGANJ_AREAS = [
    "Harua (হারুয়া)",
    "Rathkhola (রথখোলা)",
    "Gaital (গাইট্যাল)",
    "Botrish (বত্রিশ)",
    "Akhrakhabazar (আখড়াবাজার)",
    "Boro Bazar (বড় বাজার)",
    "Nilganj (নীলগঞ্জ)",
    "Puran Thana (পুরান থানা)",
    "Tarapasha (তারা পাশা)",
    "Yashodal (যশোদল)",
    "Haybatnagar (হায়বতনগর)",
    "Ukilpara (উকিলপাড়া)",
    "Shikkok Polli (শিক্ষক পল্লী)",
    "Borpul (বড়পুল)",
    "Newtown (নিউটাউন)",
    "Others (অন্যান্য)"
];
function getParentArea(location) {
    var _a;
    if (!location)
        return "Others (অন্যান্য)";
    var normalized = location.toLowerCase();
    for (var _i = 0, KISHOREGANJ_AREAS_1 = KISHOREGANJ_AREAS; _i < KISHOREGANJ_AREAS_1.length; _i++) {
        var area = KISHOREGANJ_AREAS_1[_i];
        if (area === location)
            return area;
        var englishPart = area.split(' (')[0].toLowerCase();
        var banglaPart = ((_a = area.match(/\((.*?)\)/)) === null || _a === void 0 ? void 0 : _a[1]) || '';
        if (normalized.includes(englishPart) || (banglaPart && normalized.includes(banglaPart))) {
            return area;
        }
    }
    return "Others (অন্যান্য)";
}
var firebaseConfig = JSON.parse(fs_1.default.readFileSync("./firebase-applet-config.json", "utf-8"));
var app = (0, app_1.initializeApp)(firebaseConfig);
var db = (0, firestore_1.getFirestore)(app);
var appId = "tc-admin-panel";
var DEALS_COLLECTION = "artifacts/".concat(appId, "/public/data/tc_deals");
var AREA_STATS_COLLECTION = "artifacts/".concat(appId, "/public/data/tc_area_stats");
function seed() {
    return __awaiter(this, void 0, void 0, function () {
        var dealsSnap, realCounts, _i, KISHOREGANJ_AREAS_2, area, _a, KISHOREGANJ_AREAS_3, area, baseCount, realCount, finalCount;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log("Starting seed process...");
                    return [4 /*yield*/, (0, firestore_1.getDocs)((0, firestore_1.collection)(db, DEALS_COLLECTION))];
                case 1:
                    dealsSnap = _b.sent();
                    realCounts = {};
                    for (_i = 0, KISHOREGANJ_AREAS_2 = KISHOREGANJ_AREAS; _i < KISHOREGANJ_AREAS_2.length; _i++) {
                        area = KISHOREGANJ_AREAS_2[_i];
                        realCounts[area] = 0;
                    }
                    dealsSnap.forEach(function (d) {
                        var data = d.data();
                        if (data.location) {
                            var parentArea = getParentArea(data.location);
                            realCounts[parentArea] = (realCounts[parentArea] || 0) + 1;
                        }
                    });
                    console.log("--- Seeding Results ---");
                    _a = 0, KISHOREGANJ_AREAS_3 = KISHOREGANJ_AREAS;
                    _b.label = 2;
                case 2:
                    if (!(_a < KISHOREGANJ_AREAS_3.length)) return [3 /*break*/, 5];
                    area = KISHOREGANJ_AREAS_3[_a];
                    baseCount = Math.floor(Math.random() * 19) + 1;
                    realCount = realCounts[area];
                    finalCount = baseCount + realCount;
                    console.log("Area: ".concat(area, " | Base Count: ").concat(baseCount, " | Real Count: ").concat(realCount, " | Final Count: ").concat(finalCount));
                    return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(db, AREA_STATS_COLLECTION, area), {
                            area: area,
                            count: finalCount
                        })];
                case 3:
                    _b.sent();
                    _b.label = 4;
                case 4:
                    _a++;
                    return [3 /*break*/, 2];
                case 5:
                    console.log("Seeding complete!");
                    process.exit(0);
                    return [2 /*return*/];
            }
        });
    });
}
seed();
