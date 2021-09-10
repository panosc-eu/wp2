export interface Member {
  firstName: string;
  lastName: string;
  email: string;
}

export interface ProposalAcceptedMessage {
  proposalId: number;
  shortCode: string;
  title: string;
  abstract: string;
  members: Member[];
  proposer: Member;
}

export interface ProposalTopicAnswer {
  proposalId: number;
  question: string;
  questionId: string;
  dataType: string;
  answer: string;
}
