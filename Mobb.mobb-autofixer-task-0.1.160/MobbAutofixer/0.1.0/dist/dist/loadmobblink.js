import * as SDK from "azure-devops-extension-sdk";
import AzdoAttachmentService from "./azdo-attachment-service";
class LoadMobblink {
    constructor(taskId) {
        this.attachmentService = new AzdoAttachmentService(taskId);
    }
    async initialize() {
        try {
            // Initialize the SDK
            await SDK.init();
            console.log("SDK initialized");
            // Wait for the SDK to be ready
            await SDK.ready();
            console.log("SDK is ready");
            // Extract attachments of type 'mobbLinkReport'
            const attachments = await this.attachmentService.getAttachments('mobbLinkReport');
            this.displayAttachments(attachments);
        }
        catch (error) {
            console.error("Failed to initialize or load attachments:", error);
        }
    }
    displayAttachments(attachments) {
        const mobbLinkReport = attachments.find(attachment => attachment.name === 'mobbLinkReport.txt');
        const mobbButton = document.getElementById('mobbButton');
        const loadingMessage = document.getElementById('loadingMessage');
        if (mobbLinkReport && mobbButton && loadingMessage) {
            console.log("Attachment retrieved:", mobbLinkReport);
            console.log(`Attachment: ${mobbLinkReport.name}`);
            console.log(`Content: ${mobbLinkReport.content}`);
            const cleanURL = this.cleanUrl(mobbLinkReport.content);
            console.log('Clean URL: ' + cleanURL);
            // Set the button href
            mobbButton.href = cleanURL;
            // Hide the loading message and show the button
            loadingMessage.style.display = 'none';
            mobbButton.style.display = 'flex'; // Show the button
        }
        else {
            console.log("mobbLinkReport.txt not found.");
        }
    }
    cleanUrl(url) {
        // Regular expression to match ANSI escape codes
        const ansiRegex = /\x1B\[([0-9;]*[m])/g;
        // Remove any ANSI escape codes from the URL
        const cleanedUrl = url.replace(ansiRegex, '');
        return cleanedUrl;
    }
}
// Instantiate and run the LoadMobblink class
const taskId = "d49b6d4a-9db5-465d-9770-e62b734e4a45"; // Replace with the actual task ID
const loadMobblink = new LoadMobblink(taskId);
// Start the process of initializing the SDK and extracting the attachments
loadMobblink.initialize();
