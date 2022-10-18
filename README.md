# DSW Deployment Example with PaNOSC User Office middleware

:exclamation: This example is intended for **local setup and testing**. For
production use there are many more things to do such as authentication,
controlling exposed ports (e.g. do not expose ports of `postgres` and `minio`),
data backups, or using proxy.

## Usage

This is an example deployment of the
[Data Stewardship Wizard](https://ds-wizard.org) using
[docker-compose](https://docs.docker.com/compose/). You can clone the repository
and run it with:

```
$ docker-compose build

$ docker-compose up -d
```

The server containers needs aroud 5 minutes to be up.

Then visit [localhost:8080](http://localhost:8080) and login as
`albert.einstein@example.com` with password `password`.

If you want to upgrade the version, please refer to the migration
[upgrade guidelines](https://guide.ds-wizard.org/miscellaneous/self-hosted-dsw/upgrade-guidelines).

Included in this repository is a PaNOSC/ExPANDS knowledge
model(myorg_panosc-expands_2.0.6.km) that can be imported by login into the DMP
platform and clicking "Knowledge Models" and then Import.

To use the middleware one needs to simulate a user office connection to the
rabbitmq by manually creating a message, this can be done by visiting the
rabbitmq interface located at http://localhost:15672/ and using the credentials
guest for both password and username. Once logged in visit the "Exchanges" tab
and you will find a "useroffice.fanout" exchange that is going be used by your
local user office to issue events that occur such as PROPOSAL_CREATED,
PROPOSAL_UPDATED, by selecting "useroffice.fanout" we can simulate a user office
event by publishing a message. A message has two parts we need to fill in, these
are properties and payload. The properties should be set as
"type=PROPOSAL_CREATED" and payload can look like:

```
  {"proposalPk": "345",
  "shortCode": "284692",
  "title": "",
  "abstract": "",
  "members": "[]",
  "proposer": {
    "firstName": "Bob",
    "lastName": "Andersson",
    "email": "bob.andersson@gmail.com"
  }
}
```

![image](https://user-images.githubusercontent.com/6403388/132503931-594b5a22-7edb-4daf-b065-13a1080ada5d.png)

This will create a DMP and a user in the data steward wizard. The user can login
with their email and the password "password". The DMP will be filled out with
the information located in the facitilyInformation.json file, to change this
information change in the json and run docker-compose build.

Then there is also the answering for individual questions as well as setting
instrument specific information, this is done with the type of TOPIC_ANSWERED
and takes the following as an example:

```
[
  {
    "proposalId": "284692",
    "question": "Select an instrument",
    "questionId": "selection_from_options_instrument",
    "dataType": "SELECTION_FROM_OPTIONS",
    "answer": ["NMX"]
  },
  {
    "proposalId": "284692",
    "question": "Number of days",
    "questionId": "days_at_instrument",
    "dataType": "NUMBER_INPUT",
    "answer": 8
  }
]
```

## Important notes

- Do not expose PostgreSQL and Minio to the internet
- When you want to use DSW publicly, set up proxy (e.g. Nginx) with a
  certificate for your domain and change default accounts
- Set up volume mounted to PostgreSQL and Minio containers for persistent data
- You have to create S3 bucket, either using Web UI (for Minio, you can expose
  and use `http://localhost:9000`) or via client:
  https://docs.min.io/docs/minio-client-complete-guide.html#mb, e.g. use
  `create-bucket.sh` script.

## Event types

Currently the middleware listens to three types of events, these are;

1. PROPOSAL_CREATED - Issued when a proposal is created and has only essential
   information about the proposal such as title, abstract, members and proposer
2. PROPOSAL_UPDATED - Issued when core proposal information is updated, this has
   the same format and information as PROPOSAL_CREATED
3. TOPIC_ANSWERED - Issued when one or more questions in the user office has
   been answered.

## Architecture overview

The green boxes below are for the individual facilities to change so that the
information propogated to the DMP is inline with the facilities information.
Currently a significant amount of the information sent to the DMP is fetched
from the three json files, this could however be changed to incorporate other
software repositories. The index file is listening to a rabbitmq that is sending
out events concerning PROPOSAL_ACCEPTED, PROPOSAL_UPDATED and TOPIC_ANSWERED.

<img width="1063" alt="Screenshot 2021-09-13 at 13 01 30" src="https://user-images.githubusercontent.com/6403388/133072843-cf45ce5b-6bc0-41bf-aece-dd470352d724.png">
