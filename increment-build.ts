import * as fs from 'fs';


function incrementVersionVssExtension(version: string): string {
    const versionParts = version.split('.');
    const lastPartIndex = versionParts.length - 1;

    const lastPart = parseInt(versionParts[lastPartIndex]);
    if(isNaN(lastPart)){
        throw new Error('invalid version format');
    }

    versionParts[lastPartIndex] = (lastPart + 1).toString();
    return versionParts.join('.');
}
function incrementvssExtensionFile(vssExtensionfilePath: string): void {
    fs.readFile(vssExtensionfilePath, 'utf-8',(err,data)=>{
        if (err){
            console.log('error reading the file: ', err);
            return;
        }
        try {
            const jsonData = JSON.parse(data);
            const currentVersion = jsonData.version;
            const newVersion = incrementVersionVssExtension(currentVersion);

            console.log(`${vssExtensionfilePath} old Version: ${currentVersion}`);
            console.log(`${vssExtensionfilePath} new Version: ${newVersion}`);

            jsonData.version = newVersion;

            fs.writeFile(vssExtensionfilePath,JSON.stringify(jsonData,null,4),'utf8',(writeErr)=>{
                if (writeErr){
                    console.error('Error writing file: ', writeErr);
                    return;
                }
                console.log('vss-extension.json version updated successfullly!');
            });
        } catch(parseErr){
            console.error('error parsing json: ', parseErr);
        }
    });
}

function incrementtaskFile(taskFilePath: string): void {
    fs.readFile(taskFilePath, 'utf-8',(err,data)=>{
        if (err){
            console.log('error reading the file: ', err);
            return;
        }
        try {
            const jsonData = JSON.parse(data);
            const currentVersion = jsonData.version.Patch;
            const currentVersionInInt = parseInt(currentVersion);
            if(isNaN(currentVersionInInt)){
                throw new Error('invalid version format');
            }
        
            const newVersion = currentVersionInInt + 1;
        

            console.log(`task.json old Version: ${currentVersion}`);
            console.log(`task.json new Version: ${newVersion}`);

            jsonData.version.Patch = newVersion;

            fs.writeFile(taskFilePath,JSON.stringify(jsonData,null,4),'utf8',(writeErr)=>{
                if (writeErr){
                    console.error('Error writing file: ', writeErr);
                    return;
                }
                console.log('task.json version updated successfullly!');
            });
        } catch(parseErr){
            console.error('error parsing json: ', parseErr);
        }
    });
}

incrementvssExtensionFile('./vss-extension.json');
incrementvssExtensionFile('./vss-extension-preview.json');
incrementtaskFile('./MobbAutofixer/0.1.0/task.json');
