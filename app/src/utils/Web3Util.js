import EmbarkJS from 'Embark/EmbarkJS';
import Governance from 'Embark/contracts/Governance';

class Web3Util {
  async getAccount() {
    const accounts = await web3.eth.getAccounts();
    return accounts[0];
  }

  /*
  @param details JSON object of the proposal details
  */
  async newProposal(details, minTokensSpent) {
    const from = await this.getAccount();
    const params = {from};
    const dataHash = await this.saveText(JSON.stringify(details));
    const estimateGas = await Governance.methods.newProposal(dataHash, minTokensSpent).estimateGas(params);
    console.log('newProposal - estimateGas', estimateGas);
    params.gas = estimateGas + 500;
    const createProposalTx = await Governance.methods.newProposal(dataHash, minTokensSpent).send(params);
    console.log('createProposalTx', createProposalTx);
  }

  async getCounter() {
    const counter = await Governance.methods.counter().call();
    return counter;
  }

  async voiceOpinion(id, proposalState) {
    const from = await this.getAccount();
    const params = {from};
    const dataHash = await this.saveText(JSON.stringify(proposalState));
    const estimateGas = await Governance.methods.voiceOpinion(id, dataHash).estimateGas(params);
    console.log('voiceOpinionTx - estimateGas', estimateGas);
    params.gas = estimateGas + 500;
    const voiceOpinionTx = await Governance.methods.voiceOpinion(id, dataHash).send(params);
    console.log('voiceOpinionTx', voiceOpinionTx);
  }

  /*
  @param from - account from which proposal was created
  @param id - proposal id
  */
  async readProposal(id) {
    const proposal = await Governance.methods.readProposal(id).call();
    console.log(proposal)
    const details = await this.decodeIpfsHash(proposal.dataHash, true);
    return {proposal, details};
  }

  /*
  @param id - proposal id
  @param address - address to assign governance tokens to
  @param numTokens
  @param from - creator of the proposal
  */
  async assignTokens(id, address, numTokens, from) {
    const params = {from};
    const estimateGas = await Governance.methods.assignTokens(id, address, numTokens).estimateGas(params);
    console.log('assignTokens - estimateGas', estimateGas);
    params.gas = estimateGas + 500;
    const assignTokensTx = await Governance.methods.assignTokens(id, address, numTokens).estimateGas(params);
    console.log('assignTokensTx', assignTokensTx);
  }

  async decodeIpfsHash(cid, jsonParse=false) {
    const content = await EmbarkJS.Storage.get(cid);
    return jsonParse ? JSON.parse(content) : content;
  }

  async saveText(text) {
    const hash = await EmbarkJS.Storage.saveText(text);
    return hash;
  }
}

export default new Web3Util();
