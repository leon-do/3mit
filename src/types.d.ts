export interface Event {
  contractAddress: string;
  transactionHash: string;
  eventHash: string;
  args: string[];
  data: string;
}
