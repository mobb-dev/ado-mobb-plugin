import * as os from 'os';
import * as tl from 'azure-pipelines-task-lib/task';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

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

  async function postCommentOnPullRequest(prComment: string): Promise<void> {
    try {
        const prId = tl.getVariable('SYSTEM_PULLREQUEST_PULLREQUESTID');
        if (!prId) {
            console.log("Not running in a PR context. Skipping PR comment.");
            return;
        }

        const collectionUri = tl.getVariable('SYSTEM_COLLECTIONURI') || '';
        const repoUri = tl.getVariable('BUILD_REPOSITORY_URI') || '';
        const repoId = repoUri.split('/').pop();
        const token = tl.getEndpointAuthorizationParameter('SystemVssConnection', 'AccessToken', false);
        const projectName = tl.getVariable('SYSTEM_TEAMPROJECT') || ''; 

        if (!collectionUri || !repoId || !token) {
            console.error("Missing required environment variables. Cannot proceed with PR comment.");
            return;
        }

        console.log(`Posting PR Comment on PR#${prId} in repo ${repoId}`);

        const apiUrl = `${collectionUri}${projectName}/_apis/git/repositories/${repoId}/pullRequests/${prId}/threads?api-version=6.0`;
        const commentPayload = {
            comments: [{ content: prComment, commentType: 1 }]
        };

        const response = await axios.post(apiUrl, commentPayload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        console.log(`Successfully posted PR comment: ${response.status} ${response.statusText}`);
    } catch (error) {
        console.error("Failed to post PR comment:", error);
    }
  }

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
        let commitdirectly: boolean = tl.getBoolInput('commitdirectly', false) || false;
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
        
        // Checking if the API_URL is api-st-NAME or api-NAME
        const primaryUrl = `https://api-${hostname}/v1/graphql`;
        const secondaryUrl = `https://api-st-${hostname}/v1/graphql`;
        try {
            // Perform a GET request to the primary URL
            const response = await axios.get(primaryUrl);

            // Check if the status is 200 (OK)
            if (response.status === 200) {
                tl.setVariable('API_URL', primaryUrl);
                console.log(`Primary URL is reachable. Setting API_URL to ${primaryUrl}`);
            }
        } catch (error) {
            // If there's an error (e.g., IP address not found), use the secondary URL
            console.log(`Primary URL is not reachable. Using secondary URL: ${secondaryUrl}`);
            tl.setVariable('API_URL', secondaryUrl);
        }

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

        // Ensure commitDirectly is false when autoPR is disabled
        if (!autopr) {
          commitdirectly = false;
        }

        if(commitdirectly){
          mobbExecString = mobbExecString + ` --commit-directly`;
          const prId = tl.getVariable('SYSTEM_PULLREQUEST_PULLREQUESTID');
          if (prId) {
            console.log(`PR ID found: ${prId}, adding --pr-id to the Mobb command.`);  
            mobbExecString = mobbExecString + ` --pr-id ${prId}`;
          }
        }

        console.log(`Mobb Exec String: ${mobbExecString}`);
        
        let mobblink = execSync(mobbExecString,{ encoding: 'utf-8' });
        
        mobblink = mobblink.trim();
        mobblink = mobblink.replace(/\x1B\[[0-9;]*m/g, '');  // Remove ANSI characters

        console.log('Mobb link output:', mobblink);
        await postCommentOnPullRequest(`[Mobb Autofixer Fix Report Link](${mobblink})`);

        clearAndWriteFile(mobbLinkFilePath, mobblink);
        
        tl.addAttachment('mobbLinkReport','mobbLinkReport.txt',mobbLinkFilePath)
        tl.setVariable('MOBBLINK',mobblink);
        tl.setTaskVariable('MOBBLINK',mobblink);
        tl.uploadArtifact('mobblink',mobbLinkFilePath,'mobbLinkReport');
        tl.setResult(tl.TaskResult.Succeeded, 'Task completed successfully.');
        
    } catch (err) {
        tl.setResult(tl.TaskResult.Failed, (err as Error).message);
    }
}

run();

