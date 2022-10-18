import { RabbitMQMessageBroker } from '@esss-swap/duo-message-broker';
import {
  getToken,
  changeQuestionAnswers,
  changeQuestionAnswer,
  searchQuestionnaire,
} from './dmp-api';
import mapping from '../resources/useroffice-dmp-mapping.json';
import instrumentInformation from '../resources/instrumentInformation.json';
import { addUser, addDMP, updateDMP } from './helper';

import {
  ProposalAcceptedMessage,
  ProposalTopicAnswer,
} from './messageInterfaces';

export async function start() {
  await getToken();

  const rabbitMq = new RabbitMQMessageBroker();

  await rabbitMq.setup({
    hostname: process.env.RABBITMQ_HOST ?? 'localhost',
    username: process.env.RABBITMQ_USER ?? 'guest',
    password: process.env.RABBITMQ_PASSWORD ?? 'guest',
  });

  rabbitMq.listenOnBroadcast(async (type, message: unknown) => {
    console.log(type, message);

    if (type === 'PROPOSAL_CREATED') {
      const acceptMessage = message as ProposalAcceptedMessage;

      const userUuid = await addUser(acceptMessage);
      await addDMP(acceptMessage, userUuid);
    } else if (type === 'PROPOSAL_UPDATED') {
      await new Promise((resolve) => setTimeout(resolve, 5000, [])); // This is hacky but for the moment needed as a search right after a create will not find the DMP
      const acceptMessage = message as ProposalAcceptedMessage;

      await updateDMP(acceptMessage);
    } else if (type === 'TOPIC_ANSWERED') {
      const answers = message as ProposalTopicAnswer[];
      const uuid = await searchQuestionnaire(`${answers[0].proposalId}-DMP`);
      if (uuid.length === 1) {
        const questionnaireUuid = uuid[0].uuid;

        const userOfficeMapping: { [key: string]: string } = mapping;
        const instrumentInfo: { [key: string]: any } = instrumentInformation;

        answers.forEach(async (answer) => {
          if (
            answer.dataType === 'TEXT_INPUT' &&
            userOfficeMapping[answer.questionId]
          ) {
            await changeQuestionAnswer(
              questionnaireUuid,
              userOfficeMapping[answer.questionId],
              answer.answer
            );
          }
          // Here is the place we can fetch and add calculations for instruments
          if (answer.questionId === 'selection_from_options_instrument') {
            console.log(answer.answer);
            console.log(instrumentInfo[answer.answer[0]].static);
            await changeQuestionAnswers(
              questionnaireUuid,
              instrumentInfo[answer.answer[0]].static
            );

            //Here we could do a simple lookup based on instrument and time allocated for a proposal
            const days = parseInt(
              answers.find((ans) => ans.questionId === 'days_at_instrument')!
                .answer
            );
            await changeQuestionAnswer(
              questionnaireUuid,
              mapping.data_size,
              `${
                instrumentInfo[answer.answer[0]].dailyGigabyteIndex * days
              } Gigabytes`
            );
          }
        });
      }
    }
  });
}

export async function test() {
  await getToken();
  const questionnaireUuid = 'ce715543-c766-434b-9dad-43b00a648904';
  await changeQuestionAnswers(questionnaireUuid, instrumentInformation.NMX);
}
