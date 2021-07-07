import axios from "axios";
import { v4 as uuidv4 } from "uuid";

export function getToken() {
  return axios
    .post("http://api.dmp.info/tokens", {
      email: "albert.einstein@example.com",
      password: "password",
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

export function changeQuestionAnswer(
  questionnaireUuid: string,
  path: string,
  value: string
) {
  return axios
    .put(`http://api.dmp.info/questionnaires/${questionnaireUuid}/content`, {
      events: [
        {
          path, // This needs to  point all the way to the question
          uuid: uuidv4(), // Needs to be auto generated
          value: {
            value,
            type: "StringReply",
          },
          type: "SetReplyEvent",
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

export function changeOwnerQuestionnarie(
  name: string,
  questionnaireUuid: string,
  uuid: string
) {
  return axios
    .put(`http://api.dmp.info/questionnaires/${questionnaireUuid}`, {
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
    .post("http://api.dmp.info/questionnaires", {
      name: `${proposalId}-DMP`,
      packageId: "myorg:panosc-expands:2.0.2",
      sharing: "RestrictedQuestionnaire",
      tagUuids: [],
      templateId: null,
      visibility: "PrivateQuestionnaire",
    })
    .then(function (response) {
      console.log(response);
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
    .post("http://api.dmp.info/users", {
      email,
      lastName,
      firstName,
      role: "researcher",
      password: "password",
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

export function searchUser(filter: string) {
  return axios
    .get(`http://api.dmp.info/users?size=10&q=${filter}`)
    .then((resp) => {
      return resp.data._embedded.users;
    })
    .catch(function (error) {
      console.log(error);
    });
}
