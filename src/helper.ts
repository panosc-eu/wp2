import {
  searchUser,
  createQuestionnarie,
  changeOwnerQuestionnarie,
  changeQuestionAnswers,
  changeQuestionAnswer,
  createUser,
  activateUser,
  searchQuestionnarie,
} from './dmp-api';
import mapping from '../resources/useroffice-dmp-mapping.json';
import facilityInformation from '../resources/facilityInformation.json';

import { ProposalAcceptedMessage } from './messageInterfaces';

export async function addUser(acceptMessage: ProposalAcceptedMessage) {
  const users = await searchUser(
    `${acceptMessage.proposer.firstName} ${acceptMessage.proposer.lastName}`
  );
  let userUuid = '';
  if (users.length === 0) {
    userUuid = await createUser(
      acceptMessage.proposer.firstName,
      acceptMessage.proposer.lastName,
      acceptMessage.proposer.email,
      ' '
    );
    return await activateUser(
      userUuid,
      acceptMessage.proposer.firstName,
      acceptMessage.proposer.lastName,
      acceptMessage.proposer.email,
      ' '
    );
  } else {
    return users[0].uuid;
  }
}

// this will create a new questionnarie with the facility information set
export async function addDMP(
  acceptMessage: ProposalAcceptedMessage,
  userUuid: string
) {
  const questionnaireUuid = await createQuestionnarie('tmp');
  await changeOwnerQuestionnarie(
    `${acceptMessage.shortCode}-DMP`,
    questionnaireUuid,
    userUuid
  );

  // Set initial information about PI and already known facility information
  await changeQuestionAnswer(
    questionnaireUuid,
    mapping.projectCoordinator,
    `${acceptMessage.proposer.firstName} ${acceptMessage.proposer.lastName}`
  );
  await changeQuestionAnswers(questionnaireUuid, facilityInformation.data);
  return questionnaireUuid;
}

export async function updateDMP(acceptMessage: ProposalAcceptedMessage) {
  const uuid = await searchQuestionnarie(acceptMessage.shortCode);

  if (uuid.length === 1) {
    const questionnaireUuid = uuid[0].uuid;
    await changeQuestionAnswer(
      questionnaireUuid,
      mapping.title,
      acceptMessage.title
    );
    await changeQuestionAnswer(
      questionnaireUuid,
      mapping.abstract,
      acceptMessage.abstract
    );

    await changeQuestionAnswer(
      questionnaireUuid,
      mapping.purpose,
      acceptMessage.abstract
    );

    await changeQuestionAnswer(
      questionnaireUuid,
      mapping.projectCoordinator,
      `${acceptMessage.proposer.firstName} ${acceptMessage.proposer.lastName}`
    );
    await changeQuestionAnswer(
      questionnaireUuid,
      mapping.dataPerson,
      `${acceptMessage.proposer.firstName} ${acceptMessage.proposer.lastName}`
    );
  }
}
