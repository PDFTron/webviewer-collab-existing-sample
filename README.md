# WebViewer Collaboration - Existing Sample

A repo displaying how one might integrate realtime collaboration into an existing application with the [Webviewer Collaboration modules.](https://collaboration.pdftron.com/)

## How it works

The `master` branch contains a basic file upload & annotation application with no collaboration. It uses a local representation of a database, and just stores all data in JSON files.

The `withCollab` branch contains the same application, but with realtime collaboration built in. It adds a few UI components to invite users and edit documents, as well as your typical real time features.

### Diff

A diff of these two branches can be viewed in [this PR](https://github.com/PDFTron/webviewer-collab-existing-sample/pull/1).

This is useful for showing what work might be required when integrating real time collaboration!

## Run the project

Install dependencies

```
yarn
```

Start the server

```
yarn start-server
```

Start the client

```
yarn start-client
```

The application will then be available at http://localhost:1234