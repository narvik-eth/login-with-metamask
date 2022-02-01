import React, { useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';

const now = new Date().getTime();

export const Sign: React.FC<{ library: Web3Provider }> = ({ library }) => {
  const { account, chainId } = useWeb3React();
  const [sign, setSign] = useState('');
  const [signedAddress, setSignedAddress] = useState('');
  const [jwt, setJWT] = useState('');

  const provider = new ethers.providers.Web3Provider(library.provider);
  const signer = provider.getSigner();

  const message = `Login with Metamask: ${account}, chainId: ${chainId}, timestamp: ${now}`;

  const handleSign = useCallback(() => {
    signer.signMessage(message).then((signature) => {
      setSign(signature);
    });
  }, [signer, message]);

  const handleClaimJWT = useCallback(() => {
    fetch('http://localhost:8080/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signature: sign, message }),
    })
      .then((r) => r.json())
      .then((obj) => setJWT(obj.jwt));
  }, [sign, message]);

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
      <hr />
      <button onClick={handleClaimJWT}>Claim JWT</button>
      <div>JWT: {jwt}</div>
      <div>
        Parsed:
        <code>{decodeJwt(jwt)}</code>
      </div>
    </div>
  );
};

const decodeJwt = (token: string) => {
  if (token === '') return '';
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.stringify(
    JSON.parse(decodeURIComponent(window.atob(base64))),
    null,
    2,
  );
};
