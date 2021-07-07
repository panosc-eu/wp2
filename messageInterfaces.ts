export interface Member {
  firstName: string;
  lastName: string;
  email: string;
}

export interface ProposalAcceptedMessage {
  proposalId: number;
  shortCode: string;
  title: string;
  members: Member[];
  proposer?: Member;
}
