import { InjectedConnector } from '@web3-react/injected-connector';
import { NetworkConnector } from '@web3-react/network-connector';

const RPC_URLS = {
  80001: 'https://matic-mumbai.chainstacklabs.com',
};

export const network = new NetworkConnector({
  urls: RPC_URLS,
  defaultChainId: 80001,
});

export const injected = new InjectedConnector({
  supportedChainIds: Object.keys(RPC_URLS).map((key) => parseInt(key, 10)),
});
