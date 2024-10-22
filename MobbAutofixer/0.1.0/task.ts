import * as os from 'os';
import * as tl from 'azure-pipelines-task-lib/task';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Function to clear and write to the file
  const clearAndWriteFile = (filePath: string, content: string): void => {
    // Clear the file content by writing an empty string
    fs.writeFile(filePath, '', (err) => {
      if (err) {
        console.error("Error clearing the file:", err);
        return;
      }

      // Write the new content to the file
      fs.writeFile(filePath, content, (err) => {
        if (err) {
          console.error("Error writing to the file:", err);
          return;
        }
        console.log("File successfully updated at: " + filePath);
      });
    });
  };
  
  async function run(): Promise<void> {
    try {
        
        //Get all inputs from service endpoint
        const endpointId = tl.getInput('MobbConnection', false) || '';
        const apiToken: string = tl.getEndpointAuthorizationParameter(endpointId,'apiToken',false) || '';
        const serverUrl = tl.getEndpointUrl(endpointId, false) || '';
        
        //Get all inputs from task
        const sastReportFileLocation: string = tl.getInput('SASTReportFileLocation', false) || ''; 
        const RepositoryURI: string = tl.getInput('RepositoryURI', false)|| ''; 
        const BranchName: string = tl.getInput('BranchName', false)|| ''; 
        const MobbProjectName: string = tl.getInput('MobbProjectName', false)|| ''; 
        let repoFolderLocation: string = tl.getInput('repoFolderLocation', false)|| ''; 
        const autopr: boolean = tl.getBoolInput('autopr', false) || false; 

        //env vars
        let finalBranchname: string;
        let finalRepoURI: string;
        //mobb link file
        const mobbLinkFilePath = path.join(__dirname, 'dist', 'mobblink.txt');


        console.debug('INPUT: serverUrl is: '+serverUrl);
        console.debug('INPUT: apiToken is: '+apiToken);
        console.debug('INPUT: sastReportFileLocation is: '+sastReportFileLocation);
        console.debug('INPUT: RepositoryURI is: '+RepositoryURI);
        console.debug('INPUT: BranchName is: '+BranchName);
        console.debug('INPUT: MobbProjectName is: '+MobbProjectName);
        console.debug('INPUT: repoFolderLocation is: '+repoFolderLocation);
        console.debug('INPUT: autopr is: '+repoFolderLocation);

        // Log environment variables using Node.js built-in process.env
        //console.debug('Environment variables:');
        //console.debug(process.env);

        // Execute platform-specific commands
        if (os.platform() === 'win32') {
            console.log('Running on Windows');
            //execSync('dir', { stdio: 'inherit' });  // Windows equivalent of 'ls -la'


        } else {
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
          throw new Error(`SAST report file not found at location: ${sastReportFileLocation}. Failing the build.`);
      }

      // Check if the server URL is https://app.mobb.ai, if not, set additional environment variables
      const parsedUrl = new URL(serverUrl);
      const hostname = parsedUrl.hostname;
  
      if (hostname !== 'app.mobb.ai') {
        // Set environment variables for custom Mobb URL
        tl.setVariable('API_URL', `https://api-${hostname}/v1/graphql`);
        tl.setVariable('WEB_LOGIN_URL', `https://${hostname}/cli-login`);
        tl.setVariable('WEB_APP_URL', `${parsedUrl.origin}`);

        console.log("Custom Mobb URL environment variables have been set.");
        console.log('API_URL: ' + tl.getVariable('API_URL'));
        console.log('WEB_LOGIN_URL: ' + tl.getVariable('WEB_LOGIN_URL'));
        console.log('WEB_APP_URL: ' + tl.getVariable('WEB_APP_URL'));
      } else {
          console.log("Using default Mobb URL: app.mobb.ai");
      }

      // Check if RepositoryURI is provided, if not, use BUILD_REPOSITORY_URI or a default one
      if (RepositoryURI) {
        finalRepoURI = RepositoryURI;
      }else{
        finalRepoURI = tl.getVariable('BUILD_REPOSITORY_URI') || '';
        console.log(`RepositoryURI was not specified. Using BUILD_REPOSITORY_URI instead. `);
      }
      console.log(`repoURI is: ${finalRepoURI}`);

      // Check if BranchName is provided, if not, use SYSTEM_PULLREQUEST_SOURCEBRANCH, BUILD_SOURCEBRANCHNAME or a default one
      if (BranchName) {
          finalBranchname = BranchName;
      }else if (tl.getVariable('SYSTEM_PULLREQUEST_SOURCEBRANCH')){
        console.log(`BranchName was not specified. SYSTEM_PULLREQUEST_SOURCEBRANCH found and will be used.`);
        finalBranchname = tl.getVariable('SYSTEM_PULLREQUEST_SOURCEBRANCH') || '';
  
      }else if (tl.getVariable('BUILD_SOURCEBRANCHNAME')){
        finalBranchname = tl.getVariable('BUILD_SOURCEBRANCHNAME') || '';
        console.log(`BranchName was not specified. Using BUILD_SOURCEBRANCHNAME instead.`);

      }else{
        finalBranchname = 'no-branch';
        console.log(`BranchName was not specified, setting it to 'no-branch'.`);
      }

      finalBranchname = finalBranchname.startsWith("refs/heads/") ? finalBranchname.substring("refs/heads/".length) : finalBranchname;

      console.log(`finalBranchname is: ${finalBranchname}`);

      // Check if repoFolderLocation is empty, if it is, then just add .
        if(repoFolderLocation===""){
          repoFolderLocation = ".";
        }
        //Building Mobb execution String
        let mobbExecString = `npx mobbdev@latest analyze --scan-file ${sastReportFileLocation} --repo ${finalRepoURI} --ref ${finalBranchname} -p ${repoFolderLocation} --api-key ${apiToken} --ci`;

        if(MobbProjectName){
          mobbExecString = mobbExecString + ` --mobb-project-name "${MobbProjectName}"`;
        }
        if(autopr){
          mobbExecString = mobbExecString + ` --auto-pr`;
        }

        console.log(`Mobb Exec String: ${mobbExecString}`);
        
        let output = execSync(mobbExecString,{ encoding: 'utf-8' });
        output = output.trim();
        console.log('Mobb link output:', output);

        clearAndWriteFile(mobbLinkFilePath, output);
        
        tl.addAttachment('mobbLinkReport','mobbLinkReport.txt',mobbLinkFilePath)
        tl.setVariable('MOBBLINK',output);
        tl.setTaskVariable('MOBBLINK',output);
        tl.uploadArtifact('mobblink',mobbLinkFilePath,'mobbLinkReport');
        tl.setResult(tl.TaskResult.Succeeded, 'Task completed successfully.');
        


    } catch (err) {
        tl.setResult(tl.TaskResult.Failed, (err as Error).message);
    }
}

run();

