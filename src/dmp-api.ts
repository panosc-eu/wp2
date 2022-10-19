import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

export function getToken() {
  return axios
    .post(`${process.env.DMP_HOST}/tokens`, {
      email: process.env.INGESTOR_EMAIL,
      password: process.env.INGESTOR_PASSWORD,
    })
    .then(function (response) {
      axios.defaults.headers.common[
        'Authorization'
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

export function buildAnswer(path: string, value: any) {
  return {
    phasesAnsweredIndication: {
      answeredQuestions: 3,
      unansweredQuestions: 1,
      indicationType: 'PhasesAnsweredIndication',
    },
    path,
    uuid: uuidv4(),
    value: value,
    type: 'SetReplyEvent',
  };
}

export function changeQuestionAnswer(
  questionnaireUuid: string,
  path: string,
  answer: string
) {
  const answers = [
    buildAnswer(path, {
      value: answer,
      type: 'StringReply',
    }),
  ];
  return changeQuestionAnswers(questionnaireUuid, answers);
}

function getPermissionMember(
  questionnaireUuid: string,
  uuid: string,
  permissions: string[]
) {
  return {
    uuid: uuidv4(),
    questionnaireUuid,
    member: {
      uuid: uuid,
      type: 'UserMember',
    },
    perms: permissions,
  };
}

export function changeOwnerQuestionnaire(
  name: string,
  questionnaireUuid: string,
  uuid: string,
  description: string
) {
  const membersPermissions = [];
  membersPermissions.push(
    getPermissionMember(questionnaireUuid, uuid, ['VIEW', 'EDIT', 'ADMIN'])
  );
  const templateId = process.env.DMP_DOCUMENT_TEMPLATE
    ? process.env.DMP_DOCUMENT_TEMPLATE
    : null;

  return axios
    .put(`${process.env.DMP_HOST}/questionnaires/${questionnaireUuid}`, {
      name, // Why do I need to reset all these?
      description,
      isTemplate: false,
      visibility: 'PrivateQuestionnaire',
      sharing: 'RestrictedQuestionnaire',
      templateId: templateId,
      formatUuid: null,
      permissions: membersPermissions,
      projectTags: [],
    })
    .then(function (response) {
      return response;
    })
    .catch(function (error) {
      console.log(error);
    });
}

export function createQuestionnaire(proposalId: string) {
  return axios
    .post(`${process.env.DMP_HOST}/questionnaires`, {
      name: `${proposalId}-DMP`,
      packageId: `${process.env.PACKAGE_ID}`,
      sharing: 'RestrictedQuestionnaire',
      questionTagUuids: [process.env.DMP_TAG], // Here I am using the Horizon 2020 template tag
      templateId: null,
      visibility: 'PrivateQuestionnaire',
      formatUuid: null,
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
      role: 'researcher',
      password: 'password', // this should be connected to your identity access solution instead of hardcoded
      affiliation,
    })
    .then(function (response) {
      return response.data.uuid as string;
    })
    .catch(function (error) {
      console.log(error);
      return '';
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
      role: 'researcher',
      affiliation,
      active: true,
      uuid,
    })
    .then(function (response) {
      return response.data.uuid as string;
    })
    .catch(function (error) {
      console.log(error);
      return '';
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

export function searchQuestionnaire(filter: string) {
  return axios
    .get(`${process.env.DMP_HOST}/questionnaires?size=10&q=${filter}`)
    .then((resp) => {
      return resp.data._embedded.questionnaires;
    })
    .catch(function (error) {
      console.log(error);
    });
}
