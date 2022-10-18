import axios from "axios";
import { v4 as uuidv4 } from "uuid";

export function getToken() {
  return axios
    .post(`${process.env.DMP_HOST}/tokens`, {
      email: process.env.INGESTOR_EMAIL,
      password: process.env.INGESTOR_PASSWORD,
    })
    .then(function (response) {
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.token}`;
    })
    .catch(function (error) {
      console.log(error);
    });
}

export function changeQuestionAnswers(questionnaireUuid: string, answers: any) {
  return axios
    .put(
      `${process.env.DMP_HOST}/questionnaires/${questionnaireUuid}/content`,
      {
        events: answers,
      }
    )
    .then(function (response) {
      return response;
    })
    .catch(function (error) {
      console.log(error);
    });
}

export function changeQuestionAnswer(
  questionnaireUuid: string,
  path: string,
  answer: string
) {
  return axios
    .put(
      `${process.env.DMP_HOST}/questionnaires/${questionnaireUuid}/content`,
      {
        events: [
          {
            path,
            uuid: uuidv4(),
            value: {
              value: answer,
              type: "StringReply",
            },
            type: "SetReplyEvent",
          },
        ],
      }
    )
    .then(function (response) {
      return response;
    })
    .catch(function (error) {
      console.log(error);
    });
}

export function changeOwnerQuestionnarie(
  name: string,
  questionnaireUuid: string,
  uuid: string
) {
  return axios
    .put(`${process.env.DMP_HOST}/questionnaires/${questionnaireUuid}`, {
      name, // Why do I need to reset all these?
      description: null,
      isTemplate: false,
      visibility: "PrivateQuestionnaire",
      sharing: "RestrictedQuestionnaire",
      templateId: null,
      formatUuid: null,
      permissions: [
        {
          uuid: uuidv4(),
          questionnaireUuid,
          member: {
            uuid: uuid,
            type: "UserMember",
          },
          perms: ["VIEW", "EDIT", "ADMIN"],
        },
      ],
    })
    .then(function (response) {
      return response;
    })
    .catch(function (error) {
      console.log(error);
    });
}

export function createQuestionnarie(proposalId: string) {
  return axios
    .post(`${process.env.DMP_HOST}/questionnaires`, {
      name: `${proposalId}-DMP`,
      packageId: `${process.env.PACKAGE_ID}`,
      sharing: "RestrictedQuestionnaire",
      tagUuids: [process.env.DMP_TAG], // Here I am using the Horizon 2020 template tag
      templateId: null,
      visibility: "PrivateQuestionnaire",
    })
    .then(function (response) {
      return response.data.uuid;
    })
    .catch(function (error) {
      console.log(error);
    });
}

export function createUser(
  firstName: string,
  lastName: string,
  email: string,
  affiliation: string
) {
  return axios
    .post(`${process.env.DMP_HOST}/users`, {
      email,
      lastName,
      firstName,
      role: "researcher",
      password: "password", // this should be connected to your identity access solution instead of hardcoded
      affiliation,
    })
    .then(function (response) {
      return response.data.uuid as string;
    })
    .catch(function (error) {
      console.log(error);
      return "";
    });
}

export function activateUser(
  uuid: string,
  firstName: string,
  lastName: string,
  email: string,
  affiliation: string
) {
  return axios
    .put(`${process.env.DMP_HOST}/users/${uuid}`, {
      email,
      lastName,
      firstName,
      role: "researcher",
      affiliation,
      active: true,
      uuid,
    })
    .then(function (response) {
      return response.data.uuid as string;
    })
    .catch(function (error) {
      console.log(error);
      return "";
    });
}

export function searchUser(filter: string) {
  return axios
    .get(`${process.env.DMP_HOST}/users?size=10&q=${filter}`)
    .then((resp) => {
      return resp.data._embedded.users;
    })
    .catch(function (error) {
      console.log(error);
    });
}

export function searchQuestionnarie(filter: string) {
  return axios
    .get(`${process.env.DMP_HOST}/questionnaires?size=10&q=${filter}`)
    .then((resp) => {
      return resp.data._embedded.questionnaires;
    })
    .catch(function (error) {
      console.log(error);
    });
}
