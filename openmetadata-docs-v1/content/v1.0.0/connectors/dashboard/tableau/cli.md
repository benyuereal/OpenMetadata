---
title: Run Tableau Connector using the CLI
slug: /connectors/dashboard/tableau/cli
---

# Run Tableau using the metadata CLI

In this section, we provide guides and references to use the Tableau connector.

Configure and schedule Tableau metadata and profiler workflows from the OpenMetadata UI:

- [Requirements](#requirements)
- [Metadata Ingestion](#metadata-ingestion)

## Requirements

To ingest tableau metadata, minimum `Site Role: Viewer` is requried for the tableau user.

{%inlineCallout icon="description" bold="OpenMetadata 0.12 or later" href="/deployment"%}
To deploy OpenMetadata, check the Deployment guides.
{%/inlineCallout%}

To run the Ingestion via the UI you'll need to use the OpenMetadata Ingestion Container, which comes shipped with
custom Airflow plugins to handle the workflow deployment.

To create lineage between tableau dashboard and any database service via the queries provided from Tableau Metadata API, please enable the Tableau Metadata API for your tableau server.
For more information on enabling the Tableau Metadata APIs follow the link [here](https://help.tableau.com/current/api/metadata_api/en-us/docs/meta_api_start.html)

### Python Requirements

To run the Tableau ingestion, you will need to install:

```bash
pip3 install "openmetadata-ingestion[tableau]"
```

## Metadata Ingestion

All connectors are defined as JSON Schemas.
[Here](https://github.com/open-metadata/OpenMetadata/blob/main/openmetadata-spec/src/main/resources/json/schema/entity/services/connections/dashboard/tableauConnection.json)
you can find the structure to create a connection to Tableau.

In order to create and run a Metadata Ingestion workflow, we will follow
the steps to create a YAML configuration able to connect to the source,
process the Entities if needed, and reach the OpenMetadata server.

The workflow is modeled around the following
[JSON Schema](https://github.com/open-metadata/OpenMetadata/blob/main/openmetadata-spec/src/main/resources/json/schema/metadataIngestion/workflow.json)

### 1. Define the YAML Config

This is a sample config for Tableau:

{% codePreview %}

{% codeInfoContainer %}

#### Source Configuration - Service Connection

{% codeInfo srNumber=1 %}

**For Basic Authentication:**

**Username**: The name of the user whose credentials will be used to sign in.

**Password**: The password of the user.

{% /codeInfo %}

{% codeInfo srNumber=2%}

**For Access Token Authentication:**

**Personal Access Token**: The personal access token name. For more information to get a Personal Access Token please visit this [link](https://help.tableau.com/current/server/en-us/security_personal_access_tokens.htm).

**Personal Access Token Secret**: The personal access token value. For more information to get a Personal Access Token please visit this [link](https://help.tableau.com/current/server/en-us/security_personal_access_tokens.htm).

{% /codeInfo %}

{% codeInfo srNumber=3 %}

**env**: The config object can have multiple environments. The default environment is defined as `tableau_prod`, and you can change this if needed by specifying an `env` parameter.

{% /codeInfo %}

{% codeInfo srNumber=4 %}

**hostPort**: URL or IP address of your installation of Tableau Server.

{% /codeInfo %}

{% codeInfo srNumber=5 %}

**siteName**: Tableau Site Name. This corresponds to the `contentUrl` attribute in the Tableau REST API. The `site_name` is the portion of the URL that follows the `/site/` in the URL.

{% /codeInfo %}

{% codeInfo srNumber=6 %}

**siteUrl**: Tableau Site URL. Tableau Site Url. To be kept empty if you are using the default Tableau site

{% /codeInfo %}

{% codeInfo srNumber=7 %}

**apiVersion**: Tableau API version. A lists versions of Tableau Server and of the corresponding REST API and REST API schema versions can be found [here](https://help.tableau.com/current/api/rest_api/en-us/REST/rest_api_concepts_versions.htm).

{% /codeInfo %}

#### Source Configuration - Source Config

{% codeInfo srNumber=8 %}

The `sourceConfig` is defined [here](https://github.com/open-metadata/OpenMetadata/blob/main/openmetadata-spec/src/main/resources/json/schema/metadataIngestion/dashboardServiceMetadataPipeline.json):

- **dbServiceNames**: Database Service Names for ingesting lineage if the source supports it.
- **dashboardFilterPattern**, **chartFilterPattern**, **dataModelFilterPattern**: Note that all of them support regex as include or exclude. E.g., "My dashboard, My dash.*, .*Dashboard".
- **includeOwners**: Set the 'Include Owners' toggle to control whether to include owners to the ingested entity if the owner email matches with a user stored in the OM server as part of metadata ingestion. If the ingested entity already exists and has an owner, the owner will not be overwritten.
- **includeTags**: Set the 'Include Tags' toggle to control whether to include tags in metadata ingestion.
- **includeDataModels**: Set the 'Include Data Models' toggle to control whether to include tags as part of metadata ingestion.
- **markDeletedDashboards**: Set the 'Mark Deleted Dashboards' toggle to flag dashboards as soft-deleted if they are not present anymore in the source system.

{% /codeInfo %}

#### Sink Configuration

{% codeInfo srNumber=9 %}

To send the metadata to OpenMetadata, it needs to be specified as `type: metadata-rest`.

{% /codeInfo %}

#### Workflow Configuration

{% codeInfo srNumber=10 %}

The main property here is the `openMetadataServerConfig`, where you can define the host and security provider of your OpenMetadata installation.

For a simple, local installation using our docker containers, this looks like:

{% /codeInfo %}

{% /codeInfoContainer %}

{% codeBlock fileName="filename.yaml" %}

```yaml
source:
  type: tableau
  serviceName: local_tableau
  serviceConnection:
    config:
      type: Tableau
```
```yaml {% srNumber=1 %}
      # authType:
      #   username: username
      #   password: password
```
```yaml {% srNumber=2 %}
      # authType:
      #   personalAccessTokenName: personal_access_token_name
      #   personalAccessTokenSecret: personal_access_token_secret
```
```yaml {% srNumber=3 %}
      env: tableau_prod
```
```yaml {% srNumber=4 %}
      hostPort: http://localhost
```
```yaml {% srNumber=5 %}
      siteName: site_name
```
```yaml {% srNumber=6 %}
      siteUrl: site_url
```
```yaml {% srNumber=7 %}
      apiVersion: api_version
```
```yaml {% srNumber=8 %}
  sourceConfig:
    config:
      type: DashboardMetadata
      includeOwners: True
      markDeletedDashboards: True
      includeTags: True
      includeDataModels: True
      # dbServiceNames:
      #   - service1
      #   - service2
      # dashboardFilterPattern:
      #   includes:
      #     - dashboard1
      #     - dashboard2
      #   excludes:
      #     - dashboard3
      #     - dashboard4
      # chartFilterPattern:
      #   includes:
      #     - chart1
      #     - chart2
      #   excludes:
      #     - chart3
      #     - chart4
      # dataModelFilterPattern:
      #   includes:
      #     - datamodel1
      #     - datamodel2
      #   excludes:
      #     - datamodel3
      #     - datamodel4
```
```yaml {% srNumber=9 %}
sink:
  type: metadata-rest
  config: {}
```
```yaml {% srNumber=10 %}
workflowConfig:
  openMetadataServerConfig:
    hostPort: "http://localhost:8585/api"
    authProvider: openmetadata
    securityConfig:
      jwtToken: "{bot_jwt_token}"
```

{% /codeBlock %}

{% /codePreview %}

### Example Source Configurations for default and non-default tableau sites

#### 1. Sample config for default tableau site

For a default tableau site `siteName` and `siteUrl` fields should be kept as empty strings as shown in the below config.

```yaml
source:
  type: tableau
  serviceName: local_tableau
  serviceConnection:
    config:
      type: Tableau
      # For Tableau, choose one of basic or access token authentication
      # # For basic authentication
      # authType:
      #   username: username
      #   password: password
      # # For access token authentication
      # authType:
      #   personalAccessTokenName: personal_access_token_name
      #   personalAccessTokenSecret: personal_access_token_secret
      env: tableau_prod
      hostPort: http://localhost
      siteName: site_name
      siteUrl: site_url
      apiVersion: api_version
  sourceConfig:
    config:
      type: DashboardMetadata
      includeOwners: True
      markDeletedDashboards: True
      includeTags: True
      includeDataModels: True
      # dbServiceNames:
      #   - service1
      #   - service2
      # dashboardFilterPattern:
      #   includes:
      #     - dashboard1
      #     - dashboard2
      #   excludes:
      #     - dashboard3
      #     - dashboard4
      # chartFilterPattern:
      #   includes:
      #     - chart1
      #     - chart2
      #   excludes:
      #     - chart3
      #     - chart4
      # dataModelFilterPattern:
      #   includes:
      #     - datamodel1
      #     - datamodel2
      #   excludes:
      #     - datamodel3
      #     - datamodel4
sink:
  type: metadata-rest
  config: {}
workflowConfig:
  # loggerLevel: DEBUG  # DEBUG, INFO, WARN or ERROR
  openMetadataServerConfig:
    hostPort: <OpenMetadata host and port>
    authProvider: <OpenMetadata auth provider>
```

#### 1. Sample config for non-default tableau site

For a non-default tableau site `siteName` and `siteUrl` fields are required.

**Note**: If `https://xxx.tableau.com/#/site/sitename/home` represents the homepage url for your tableau site, the `sitename` from the url should be entered in the `siteName` and `siteUrl` fields in the config below.

```yaml
source:
  type: tableau
  serviceName: local_tableau
  serviceConnection:
    config:
      type: Tableau
      username: username
      password: password
      env: tableau_prod
      hostPort: http://localhost
      siteName: openmetadata
      siteUrl: openmetadata
      apiVersion: api_version
      # If not setting user and password
      # personalAccessTokenName: personal_access_token_name
      # personalAccessTokenSecret: personal_access_token_secret
  sourceConfig:
    config:
      type: DashboardMetadata
      overrideOwner: True
      # dbServiceNames:
      #   - service1
      #   - service2
      # dashboardFilterPattern:
      #   includes:
      #     - dashboard1
      #     - dashboard2
      #   excludes:
      #     - dashboard3
      #     - dashboard4
      # chartFilterPattern:
      #   includes:
      #     - chart1
      #     - chart2
      #   excludes:
      #     - chart3
      #     - chart4
sink:
  type: metadata-rest
  config: {}
workflowConfig:
  # loggerLevel: DEBUG  # DEBUG, INFO, WARN or ERROR
  openMetadataServerConfig:
    hostPort: <OpenMetadata host and port>
    authProvider: <OpenMetadata auth provider>
```

### Workflow Configs for Security Provider

We support different security providers. You can find their definitions [here](https://github.com/open-metadata/OpenMetadata/tree/main/openmetadata-spec/src/main/resources/json/schema/security/client).

## Openmetadata JWT Auth

- JWT tokens will allow your clients to authenticate against the OpenMetadata server. To enable JWT Tokens, you will get more details [here](/deployment/security/enable-jwt-tokens).

```yaml
workflowConfig:
  openMetadataServerConfig:
    hostPort: "http://localhost:8585/api"
    authProvider: openmetadata
    securityConfig:
      jwtToken: "{bot_jwt_token}"
```

- You can refer to the JWT Troubleshooting section [link](/deployment/security/jwt-troubleshooting) for any issues in your JWT configuration. If you need information on configuring the ingestion with other security providers in your bots, you can follow this doc [link](/deployment/security/workflow-config-auth).

### 2. Run with the CLI

First, we will need to save the YAML file. Afterward, and with all requirements installed, we can run:

```bash
metadata ingest -c <path-to-yaml>
```

Note that from connector to connector, this recipe will always be the same. By updating the YAML configuration,
you will be able to extract metadata from different sources.
