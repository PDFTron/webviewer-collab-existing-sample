# WebViewer Collaboration - Existing Sample

A repo displaying how one might integrate realtime collaboration into an existing application with the [Webviewer Collaboration modules.](https://collaboration.pdftron.com/)

## Branches

### master

`master` branch contains a basic file upload & annotation application with no collaboration. It uses a local representation of a database, and just stores all data in JSON files.

`withCollab` branch contains the same application, but with realtime collaboration built in. It adds a few UI components to invite users and edit documents, as well as your typical real time features.

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