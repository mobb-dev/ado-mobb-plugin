# Mobb Fixer for Azure DevOps Pipeline

## Overview

This extension integrates the **Mobb Autofixer** into your Azure DevOps pipeline, enabling automated security fixes for vulnerabilities detected in your source code. It simplifies the remediation process by analyzing SAST reports and providing fixes that you can easily commit back into your repository. 

## Pre-Requisites

* Azure DevOps Services, or Azure DevOps Server 2022.2

## Features

- Runs Mobb Autofixer to analyze SAST reports from **CodeQL, Snyk, Checkmarx, Fortify, SonarQube, Semgrep or Opengrep** and generates a **Mobb Fix Report Link**.
- Easily integrates with Azure DevOps pipelines to scan and fix vulnerabilities automatically.
- **Enhanced PR Workflow**  
  - Supports **Automatic PR** and **Direct Commits** to apply fixes automatically.  
  - Publishes **Mobb Fix Report links** in PR comments.  
  - Displays **fix details** directly in PR comments when applicable.  

## Usage

1. First create a Mobb Service endpoint by going to Projects -> Services Connections -> New Connections -> Mobb Service Endpoint
2. In your pipeline task, search and add the "Mobb Autofixer" task.

## Installation & Setup

For step-by-step tutorial on how to use this plugin, please visit: https://docs.mobb.ai/mobb-user-docs/ci-cd-integrations/azure-devops

## Latest Changes

### Version 0.1.206 - May 13, 2025

- Change default behavior to not include **-p .** in default runs unless specified by user in the **Repo Sub Folder Location** field. This allows Bugsy to fetch the source code files directly from the repository to assist with obtaining the **Dev Owner** info. 

### Version 0.1.201 - March 17, 2025

- **Added support for "commit directly" functionality**.
- **Publishing of Mobb link in the PR comments**: A direct link to the Mobb analysis results is now included in PR comments.
- **Publishing of what fix was committed directly in PR comments (if the context is a PR)**: When a fix is committed within a PR context, the details of the fix will be automatically published in the PR comments.
