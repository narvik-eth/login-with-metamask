import React, { useState, useEffect } from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';

import { useEagerConnect } from '../hooks/useEagerConnect';
import { useInactiveListener } from '../hooks/useInactiveListener';
import { injected } from '../connectors';

const shorter = (str: string | null | undefined) => {
  if (str === undefined || str === null) return '';
  return str.length > 8 ? str.slice(0, 6) + '...' + str.slice(-4) : str;
};

export const Connect = () => {
  const { chainId, account, activate, deactivate, active, connector } =
    useWeb3React<Web3Provider>();
  const [activatingConnector, setActivatingConnector] = useState();

  useEffect(() => {
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined);
    }
  }, [activatingConnector, connector]);

  const triedEager = useEagerConnect();
  useInactiveListener(!triedEager || !!activatingConnector);

  return (
    <>
      {active ? (
        <>
          <div>
            <div>ChainId: {chainId}</div>
            <div>Account: {shorter(account)}</div>
          </div>
          <div className="navbar-item">
            <button className="button is-danger" onClick={deactivate}>
              Disconnect
            </button>
          </div>
        </>
      ) : (
        <div className="navbar-item">
          <button
            className="button is-primary"
            onClick={() => activate(injected)}
          >
            Connect
          </button>
        </div>
      )}
    </>
  );
};
