import React, { useState, useEffect } from 'react'
import queryString from 'query-string'
import CheckoutSaveCard from './checkoutSaveCard'

function SavedCard(props) {
  const [encryptedData, setEncryptedData] = useState('');
  const [response, setResponse] = useState('');

  console.log('SavedCard', props.location);
  useEffect(() => {
    let url = window.location.href;
    const params = queryString.parseUrl(url);
    const { data, response } = params.query;
    setEncryptedData(data);
    setResponse(response);
  }, []);

  return <CheckoutSaveCard encryptedData={encryptedData} base64Data={response} />
}

export default SavedCard;
