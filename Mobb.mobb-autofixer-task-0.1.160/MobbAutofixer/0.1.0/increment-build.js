"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const vssExtensionfilePath = './vss-extension.json';
const taskFilePath = './MobbAutofixer/0.1.0/task.json';
function incrementVersionVssExtension(version) {
    const versionParts = version.split('.');
    const lastPartIndex = versionParts.length - 1;
    const lastPart = parseInt(versionParts[lastPartIndex]);
    if (isNaN(lastPart)) {
        throw new Error('invalid version format');
    }
    versionParts[lastPartIndex] = (lastPart + 1).toString();
    return versionParts.join('.');
}
fs.readFile(vssExtensionfilePath, 'utf-8', (err, data) => {
    if (err) {
        console.log('error reading the file: ', err);
        return;
    }
    try {
        const jsonData = JSON.parse(data);
        const currentVersion = jsonData.version;
        const newVersion = incrementVersionVssExtension(currentVersion);
        console.log(`vss-exntension.json old Version: ${currentVersion}`);
        console.log(`vss-exntension.json new Version: ${newVersion}`);
        jsonData.version = newVersion;
        fs.writeFile(vssExtensionfilePath, JSON.stringify(jsonData, null, 4), 'utf8', (writeErr) => {
            if (writeErr) {
                console.error('Error writing file: ', writeErr);
                return;
            }
            console.log('vss-extension.json version updated successfullly!');
        });
    }
    catch (parseErr) {
        console.error('error parsing json: ', parseErr);
    }
});
fs.readFile(taskFilePath, 'utf-8', (err, data) => {
    if (err) {
        console.log('error reading the file: ', err);
        return;
    }
    try {
        const jsonData = JSON.parse(data);
        const currentVersion = jsonData.version.Patch;
        const currentVersionInInt = parseInt(currentVersion);
        if (isNaN(currentVersionInInt)) {
            throw new Error('invalid version format');
        }
        const newVersion = (currentVersionInInt + 1).toString();
        console.log(`vss-exntension.json old Version: ${currentVersion}`);
        console.log(`vss-exntension.json new Version: ${newVersion}`);
        jsonData.version = newVersion;
        fs.writeFile(vssExtensionfilePath, JSON.stringify(jsonData, null, 4), 'utf8', (writeErr) => {
            if (writeErr) {
                console.error('Error writing file: ', writeErr);
                return;
            }
            console.log('vss-extension.json version updated successfullly!');
        });
    }
    catch (parseErr) {
        console.error('error parsing json: ', parseErr);
    }
});
