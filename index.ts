import { RabbitMQMessageBroker } from "@esss-swap/duo-message-broker";
import {
  searchUser,
  getToken,
  createQuestionnarie,
  changeOwnerQuestionnarie,
  changeQuestionAnswers,
  changeQuestionAnswer,
  createUser,
  activateUser,
  searchQuestionnarie,
} from "./dmp-api";
import mapping from "./useroffice-dmp-mapping.json";
import facilityInformation from "./facilityInformation.json";
import instrumentInformation from "./instrumentInformation.json";

import {
  ProposalAcceptedMessage,
  ProposalTopicAnswer,
} from "./messageInterfaces";

async function start() {
  await getToken();

  const rabbitMq = new RabbitMQMessageBroker();

  await rabbitMq.setup({
    hostname: process.env.RABBITMQ_HOST ?? "localhost",
    username: process.env.RABBITMQ_USER ?? "guest",
    password: process.env.RABBITMQ_PASSWORD ?? "guest",
  });

  rabbitMq.listenOnBroadcast(async (type, message: unknown) => {
    console.log(type, message);
    if (type === "PROPOSAL_CREATED") {
      let acceptMessage = message as ProposalAcceptedMessage;
      let users = await searchUser(
        `${acceptMessage.proposer.firstName} ${acceptMessage.proposer.lastName}`
      );
      let userUuid = "";
      if (users.length === 0) {
        userUuid = await createUser(
          acceptMessage.proposer.firstName,
          acceptMessage.proposer.lastName,
          acceptMessage.proposer.email,
          " "
        );
        await activateUser(
          userUuid,
          acceptMessage.proposer.firstName,
          acceptMessage.proposer.lastName,
          acceptMessage.proposer.email,
          " "
        );
      } else {
        userUuid = users[0].uuid;
      }
      let questionnaireUuid = await createQuestionnarie("tmp");
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
    } else if (type === "PROPOSAL_UPDATED") {
      await new Promise((resolve) => setTimeout(resolve, 5000)); // This is hacky but for the moment needed as a search right after a create will not find the DMP
      const acceptMessage = message as ProposalAcceptedMessage;
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
          mapping.projectCoordinator,
          `${acceptMessage.proposer.firstName} ${acceptMessage.proposer.lastName}`
        );
      }
    } else if (type === "TOPIC_ANSWERED") {
      const answers = message as ProposalTopicAnswer[];
      const uuid = await searchQuestionnarie(`${answers[0].proposalId}-DMP`);
      if (uuid.length === 1) {
        const questionnaireUuid = uuid[0].uuid;

        answers.forEach(async (answer) => {
          if (answer.dataType === "TEXT_INPUT" && mapping[answer.questionId]) {
            await changeQuestionAnswer(
              questionnaireUuid,
              mapping[answer.questionId],
              answer.answer
            );
          }
          // Here is the place we can fetch and add calculations for instruments
          if (answer.questionId === "selection_from_options_instrument") {
            await changeQuestionAnswers(
              questionnaireUuid,
              instrumentInformation.NMX
            );

            //Here we could do a simple lookup based on instrument and time allocated for a proposal
            await changeQuestionAnswer(
              questionnaireUuid,
              mapping.data_size,
              "20 Gigabytes"
            );
          }
        });
      }
    }
  });
}
start();

// async function test() {
//   await getToken();
//   let questionnaireUuid = "1a5d400a-b623-43d3-a771-689acebea722";
//   await changeQuestionAnswer(
//     questionnaireUuid,
//     mapping.projectCoordinator,
//     "vad!"
//   );
// }
// test();

// await changeQuestionAnswers(
//   questionnaireUuid,
//   instrumentInformation.NMX
// );
