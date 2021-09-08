# DSW Deployment Example with PaNOSC User Office middleware

:exclamation: This example is intended for **local setup and testing**. For production use there are many more things to do such as authentication, controlling exposed ports (e.g. do not expose ports of `postgres` and `minio`), data backups, or using proxy. 

## Usage

This is an example deployment of the [Data Stewardship Wizard](https://ds-wizard.org) using [docker-compose](https://docs.docker.com/compose/). You can clone the repository and run it with:

```
$ docker-compose build

$ docker-compose up -d
```

Then visit [localhost:8080](http://localhost:8080) and login as `albert.einstein@example.com` with password `password`.

Included in this repository is a PaNOSC/ExPANDS knowledge model(myorg_panosc-expands_2.0.6.km) that can be imported by login into the DMP platform and clicking "Knowledge Models" and then Import.

To use the middleware one needs to simulate a user office connection the the rabbitmq by manually creating a message, this can be done by visiting the rabbitmq interface located at http://localhost:15672/ and using the credentials guest for both password and username. Once logged in visit the "Exchanges" tab and you will find a "useroffice.fanout" exchange that is going be used by your local user office to issue events that occur such as PROPOSAL_CREATED, PROPOSAL_UPDATED, by selecting "useroffice.fanout" we can simulate a user office event by publishing a message. A message has two parts we need to be concerned about; 1. Properties that should be set as "type: PROPOSAL_CREATED" and payload which can look like:

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

This will create a DMP and a user in the data steward wizard. The user can login with their email and the password "password". The DMP will be filled out with the information located in the facitilyInformation.json file, to change this information change in the json and run docker-compose build. 
