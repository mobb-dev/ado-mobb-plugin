import * as SDK from "azure-devops-extension-sdk";
//import { Attachment, IAttachmentService } from "./index";
import { getClient } from "azure-devops-extension-api";
import { BuildRestClient, BuildServiceIds } from "azure-devops-extension-api/Build";
import urlparse from 'url-parse';
export default class AzdoAttachmentService {
    constructor(taskId) {
        this.taskId = taskId;
        this.buildClient = getClient(BuildRestClient);
    }
    async getAttachments(type) {
        const attachments = [];
        const build = await this.getThisBuild();
        const azdoAttachments = await this.getPlanAttachmentNames(build.project.id, build.buildId, type);
        //todo: refactor this to utilize promise.all
        for (const a of azdoAttachments) {
            const content = await this.getAttachmentContent(a);
            attachments.push({
                name: a.name,
                type: a.type,
                content
            });
        }
        return attachments;
    }
    async getThisBuild() {
        const projectService = await SDK.getService("ms.vss-tfs-web.tfs-page-data-service" /* CommonServiceIds.ProjectPageService */);
        const buildService = await SDK.getService(BuildServiceIds.BuildPageDataService);
        const projectFromContext = await projectService.getProject();
        const buildFromContext = await buildService.getBuildPageData(); //requires await to work eventhough does not return Promise
        if (!projectFromContext || !buildFromContext) {
            throw new Error('Not running in AzureDevops context.');
        }
        else {
            console.log(`Running for project ${projectFromContext.id} and build ${buildFromContext.build?.id.toString()}`);
        }
        if (!buildFromContext.build?.id) {
            console.log("Cannot get build id.");
            throw new Error('Cannot get build from page data');
        }
        const buildId = buildFromContext.build.id;
        const build = await this.buildClient.getBuild(projectFromContext.name, buildId);
        const timeline = await this.buildClient.getBuildTimeline(projectFromContext.name, buildId);
        return {
            project: projectFromContext,
            buildId: buildId,
            build: build,
            timeline: timeline
        };
    }
    async getPlanAttachmentNames(project, buildId, attachmentType) {
        const attachments = await this.buildClient.getAttachments(project, buildId, attachmentType);
        return attachments.map(a => {
            const attachmentUrl = urlparse(a._links.self.href);
            const isVSTSUrl = attachmentUrl.hostname.includes('visualstudio.com');
            const segments = attachmentUrl.pathname.split('/');
            if (isVSTSUrl) {
                return {
                    projectId: segments[1],
                    buildId: Number.parseInt(segments[5]),
                    timelineId: segments[6],
                    recordId: segments[7],
                    name: a.name,
                    type: attachmentType,
                    href: a._links.self.href
                };
            }
            return {
                projectId: segments[2],
                buildId: Number.parseInt(segments[6]),
                timelineId: segments[7],
                recordId: segments[8],
                name: a.name,
                type: attachmentType,
                href: a._links.self.href
            };
        });
    }
    async getAttachmentContent(attachment) {
        let content;
        try {
            content = await this.getAttachment(attachment);
        }
        catch (e) {
            throw new Error(`Failed to download plain plan: ${e}`);
        }
        return content;
    }
    async getAttachment(attachment) {
        const content = await this.buildClient.getAttachment(attachment.projectId, attachment.buildId, attachment.timelineId, attachment.recordId, attachment.type, attachment.name);
        const td = new TextDecoder();
        return td.decode(content);
    }
}
