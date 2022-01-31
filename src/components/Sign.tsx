import React, { useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';

const now = new Date().getTime();

export const Sign: React.FC<{ library: Web3Provider }> = ({ library }) => {
  const { account, chainId } = useWeb3React();
  const [sign, setSign] = useState('');
  const [signedAddress, setSignedAddress] = useState('');

  const provider = new ethers.providers.Web3Provider(library.provider);
  const signer = provider.getSigner();

  const message = `Login with Metamask: ${account}, chainId: ${chainId}, timestamp: ${now}`;

  const handleSign = useCallback(() => {
    signer.signMessage(message).then((signature) => {
      setSign(signature);
    });
  }, [signer, message]);

  useEffect(() => {
    if (sign === '') return;
    setSignedAddress(ethers.utils.verifyMessage(message, sign));
  }, [sign, message]);

  return (
    <div>
      <button onClick={handleSign}>Sign</button>
      <div>sign message: {message}</div>
      <div>address: {account}</div>
      <div>sign: {sign}</div>
      <div>signed address: {signedAddress}</div>
    </div>
  );
};
