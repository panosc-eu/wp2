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
import { addUser, addDMP, updateDMP } from "./helper";

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
    let userUuid = "";
    let questionnaireUuid = "";

    if (type === "PROPOSAL_CREATED") {
      let acceptMessage = message as ProposalAcceptedMessage;

      userUuid = await addUser(acceptMessage);
      questionnaireUuid = await addDMP(acceptMessage, userUuid);
    } else if (type === "PROPOSAL_UPDATED") {
      await new Promise((resolve) => setTimeout(resolve, 5000, [])); // This is hacky but for the moment needed as a search right after a create will not find the DMP
      let acceptMessage = message as ProposalAcceptedMessage;

      await updateDMP(acceptMessage);
    } else if (type === "TOPIC_ANSWERED") {
      const answers = message as ProposalTopicAnswer[];
      const uuid = await searchQuestionnarie(`${answers[0].proposalId}-DMP`);
      if (uuid.length === 1) {
        const questionnaireUuid = uuid[0].uuid;

        answers.forEach(async (answer) => {
          // @ts-ignore: Unreachable code error
          if (answer.dataType === "TEXT_INPUT" && mapping[answer.questionId]) {
            await changeQuestionAnswer(
              questionnaireUuid, // @ts-ignore: Unreachable code error
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
//   let questionnaireUuid = "ce715543-c766-434b-9dad-43b00a648904";
//   await changeQuestionAnswers(questionnaireUuid, instrumentInformation.NMX);
// }
// test();
