import React from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';

import { Connect } from './components/Connect';
import { Sign } from './components/Sign';

export const App = () => {
  const { library } = useWeb3React<Web3Provider | undefined>();

  return (
    <div>
      <div>Login with Metamask</div>
      <Connect />
      {library === undefined ? null : <Sign {...{ library }} />}
    </div>
  );
};
