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
var os = require("os");
var tl = require("azure-pipelines-task-lib/task");
var child_process_1 = require("child_process");
var fs = require("fs");
var path = require("path");
// Function to clear and write to the file
var clearAndWriteFile = function (filePath, content) {
    // Clear the file content by writing an empty string
    fs.writeFile(filePath, '', function (err) {
        if (err) {
            console.error("Error clearing the file:", err);
            return;
        }
        // Write the new content to the file
        fs.writeFile(filePath, content, function (err) {
            if (err) {
                console.error("Error writing to the file:", err);
                return;
            }
            console.log("File successfully updated at: " + filePath);
        });
    });
};
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var endpointId, apiToken, serverUrl, sastReportFileLocation, RepositoryURI, BranchName, MobbProjectName, repoFolderLocation, autopr, finalBranchname, finalRepoURI, mobbLinkFilePath, parsedUrl, hostname, mobbExecString, output;
        return __generator(this, function (_a) {
            try {
                endpointId = tl.getInput('MobbConnection', false) || '';
                apiToken = tl.getEndpointAuthorizationParameter(endpointId, 'apiToken', false) || '';
                serverUrl = tl.getEndpointUrl(endpointId, false) || '';
                sastReportFileLocation = tl.getInput('SASTReportFileLocation', false) || '';
                RepositoryURI = tl.getInput('RepositoryURI', false) || '';
                BranchName = tl.getInput('BranchName', false) || '';
                MobbProjectName = tl.getInput('MobbProjectName', false) || '';
                repoFolderLocation = tl.getInput('repoFolderLocation', false) || '';
                autopr = tl.getBoolInput('autopr', false) || false;
                finalBranchname = void 0;
                finalRepoURI = void 0;
                mobbLinkFilePath = path.join(__dirname, 'dist', 'mobblink.txt');
                console.debug('INPUT: serverUrl is: ' + serverUrl);
                console.debug('INPUT: apiToken is: ' + apiToken);
                console.debug('INPUT: sastReportFileLocation is: ' + sastReportFileLocation);
                console.debug('INPUT: RepositoryURI is: ' + RepositoryURI);
                console.debug('INPUT: BranchName is: ' + BranchName);
                console.debug('INPUT: MobbProjectName is: ' + MobbProjectName);
                console.debug('INPUT: repoFolderLocation is: ' + repoFolderLocation);
                console.debug('INPUT: autopr is: ' + repoFolderLocation);
                // Log environment variables using Node.js built-in process.env
                //console.debug('Environment variables:');
                //console.debug(process.env);
                // Execute platform-specific commands
                if (os.platform() === 'win32') {
                    console.log('Running on Windows');
                    //execSync('dir', { stdio: 'inherit' });  // Windows equivalent of 'ls -la'
                }
                else {
                    console.log('Running on Linux/Mac');
                    //execSync('ls -la', { stdio: 'inherit' });  // Unix-based command
                }
                // List directory contents again
                // if (os.platform() === 'win32') {
                //     execSync('dir', { stdio: 'inherit' });
                // } else {
                //     execSync('ls -la', { stdio: 'inherit' });
                // }
                // Check for the presence of the SAST report file, exit and fail the build if not found
                if (!fs.existsSync(sastReportFileLocation)) {
                    throw new Error("SAST report file not found at location: ".concat(sastReportFileLocation, ". Failing the build."));
                }
                parsedUrl = new URL(serverUrl);
                hostname = parsedUrl.hostname;
                if (hostname !== 'app.mobb.ai') {
                    // Set environment variables for custom Mobb URL
                    tl.setVariable('API_URL', "https://api-".concat(hostname, "/v1/graphql"));
                    tl.setVariable('WEB_LOGIN_URL', "https://".concat(hostname, "/cli-login"));
                    tl.setVariable('WEB_APP_URL', "".concat(parsedUrl.origin));
                    console.log("Custom Mobb URL environment variables have been set.");
                    console.log('API_URL: ' + tl.getVariable('API_URL'));
                    console.log('WEB_LOGIN_URL: ' + tl.getVariable('WEB_LOGIN_URL'));
                    console.log('WEB_APP_URL: ' + tl.getVariable('WEB_APP_URL'));
                }
                else {
                    console.log("Using default Mobb URL: app.mobb.ai");
                }
                // Check if RepositoryURI is provided, if not, use BUILD_REPOSITORY_URI or a default one
                if (RepositoryURI) {
                    finalRepoURI = RepositoryURI;
                }
                else {
                    finalRepoURI = tl.getVariable('BUILD_REPOSITORY_URI') || '';
                    console.log("RepositoryURI was not specified. Using BUILD_REPOSITORY_URI instead. ");
                }
                console.log("repoURI is: ".concat(finalRepoURI));
                // Check if BranchName is provided, if not, use SYSTEM_PULLREQUEST_SOURCEBRANCH, BUILD_SOURCEBRANCHNAME or a default one
                if (BranchName) {
                    finalBranchname = BranchName;
                }
                else if (tl.getVariable('SYSTEM_PULLREQUEST_SOURCEBRANCH')) {
                    console.log("BranchName was not specified. SYSTEM_PULLREQUEST_SOURCEBRANCH found and will be used.");
                    finalBranchname = tl.getVariable('SYSTEM_PULLREQUEST_SOURCEBRANCH') || '';
                }
                else if (tl.getVariable('BUILD_SOURCEBRANCHNAME')) {
                    finalBranchname = tl.getVariable('BUILD_SOURCEBRANCHNAME') || '';
                    console.log("BranchName was not specified. Using BUILD_SOURCEBRANCHNAME instead.");
                }
                else {
                    finalBranchname = 'no-branch';
                    console.log("BranchName was not specified, setting it to 'no-branch'.");
                }
                finalBranchname = finalBranchname.startsWith("refs/heads/") ? finalBranchname.substring("refs/heads/".length) : finalBranchname;
                console.log("finalBranchname is: ".concat(finalBranchname));
                // Check if repoFolderLocation is empty, if it is, then just add .
                if (repoFolderLocation === "") {
                    repoFolderLocation = ".";
                }
                mobbExecString = "npx mobbdev@latest analyze --scan-file ".concat(sastReportFileLocation, " --repo ").concat(finalRepoURI, " --ref ").concat(finalBranchname, " -p ").concat(repoFolderLocation, " --api-key ").concat(apiToken, " --ci");
                if (MobbProjectName) {
                    mobbExecString = mobbExecString + " --mobb-project-name \"".concat(MobbProjectName, "\"");
                }
                if (autopr) {
                    mobbExecString = mobbExecString + " --auto-pr";
                }
                console.log("Mobb Exec String: ".concat(mobbExecString));
                output = (0, child_process_1.execSync)(mobbExecString, { encoding: 'utf-8' });
                output = output.trim();
                console.log('Mobb link output:', output);
                clearAndWriteFile(mobbLinkFilePath, output);
                tl.addAttachment('mobbLinkReport', 'mobbLinkReport.txt', mobbLinkFilePath);
                tl.setVariable('MOBBLINK', output);
                tl.setTaskVariable('MOBBLINK', output);
                tl.uploadArtifact('mobblink', mobbLinkFilePath, 'mobbLinkReport');
                tl.setResult(tl.TaskResult.Succeeded, 'Task completed successfully.');
            }
            catch (err) {
                tl.setResult(tl.TaskResult.Failed, err.message);
            }
            return [2 /*return*/];
        });
    });
}
run();
