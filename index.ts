import { Queue, RabbitMQMessageBroker } from "@esss-swap/duo-message-broker";
import {
  searchUser,
  getToken,
  createQuestionnarie,
  changeOwnerQuestionnarie,
  changeQuestionAnswer,
  createUser,
} from "./dmp-api";
import mapping from "./useroffice-dmp-mapping.json";
import { ProposalAcceptedMessage } from "./messageInterfaces";

// async function start() {
//   await getToken();

//   const rabbitMq = new RabbitMQMessageBroker();

//   await rabbitMq.setup({
//     hostname: process.env.RABBITMQ_HOST ?? "localhost",
//     username: process.env.RABBITMQ_USER ?? "guest",
//     password: process.env.RABBITMQ_PASSWORD ?? "guest",
//   });

//   rabbitMq.listenOn(Queue.PROPOSAL, async (type, message: unknown) => {
//     if (type === "PROPOSAL_ACCEPTED") {
//       let acceptMessage = message as ProposalAcceptedMessage;
//       let users = await searchUser(
//         `${acceptMessage.proposer.firstName} ${acceptMessage.proposer.lastName}`
//       );
//       let userUuid = "";
//       if (users.length === 0) {
//         userUuid = await createUser(
//           acceptMessage.proposer.firstName,
//           acceptMessage.proposer.lastName,
//           acceptMessage.proposer.email,
//           " "
//         );
//       }
//       let questionnaireUuid = await createQuestionnarie("tmp");
//       await changeOwnerQuestionnarie(
//         `${acceptMessage.shortCode}-DMP`,
//         questionnaireUuid,
//         userUuid
//       );
//       await changeQuestionAnswer(
//         questionnaireUuid,
//         mapping.title,
//         acceptMessage.title
//       );
//     }
//   });
// }
// start();

async function test() {
  await getToken();
  let questionnaireUuid = await createQuestionnarie("tmp");
  let users = await searchUser("Fredrik Bolmsten");
  await changeOwnerQuestionnarie(`TEST-DMP`, questionnaireUuid, users[0].uuid);
  await changeQuestionAnswer(questionnaireUuid, mapping.title, "Hello world");
}
test();
