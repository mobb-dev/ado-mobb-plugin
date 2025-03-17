import * as path from 'path';
import * as tmrm from 'azure-pipelines-task-lib/mock-run';
import * as tl from 'azure-pipelines-task-lib/task';
import * as fs from 'fs';

const taskPath = path.join(__dirname, "MobbAutofixer", "0.1.0", "task.js");
const tmr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);

console.log(`Task path: ${taskPath}`);

const endpointId = 'mock-service-endpoint';
const token = 'xxxxxxx' //Mobb api token

tmr.setInput("serviceEndpoint",endpointId);
tmr.setInput("repoFolderLocation","./WF-examples");
tmr.setInput("MobbProjectName","Antony's Project");

process.env['INPUT_MobbConnection'] = endpointId;
process.env['INPUT_SASTReportFileLocation'] = 'codeql_report.json';
process.env['INPUT_RepositoryURI'] = 'https://github.com/test/test';
process.env['repoFolderLocation'] = "./WF-examples";


process.env[`ENDPOINT_URL_${endpointId}`] = 'https://app.mobb.ai';
process.env[`ENDPOINT_AUTH_PARAMETER_${endpointId}_apiToken`] = token;

process.env['BUILD_REPOSITORY_URI'] = 'http://ec2amaz-rsd6jm0/DefaultCollection/Extension-Test/_git/Mobb-CX-on-prem-integration.administrator';
process.env['BUILD_SOURCEBRANCHNAME'] = 'Checkmarx';

const mobbLinkFilePath = path.join(__dirname, 'MobbAutofixer','0.1.0','dist', 'mobblink.txt');


// Run the task
tmr.run();

fs.writeFile(mobbLinkFilePath, '', (err) => {
    if (err) {
      console.error("Error clearing the file:", err);
      return;
    }
    console.log("File successfully updated!");

  });
