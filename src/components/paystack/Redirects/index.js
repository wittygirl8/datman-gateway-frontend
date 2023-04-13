import React, { useEffect } from 'react';
import queryString from 'query-string';
import Spinner from '../../common/Spinner';
import { baseUrl } from '../../../config/baseUrl';

let BackendUrl = baseUrl.paystack + '/sale/hosted-form/?data=';

function PaystackHosted() {

  useEffect(() => {
    let url = window.location.href;
    const params = queryString.parseUrl(url);
    console.log('params: ', params);
    const { data } = params.query;

    console.log('new card: ', BackendUrl);
    window.location.replace(BackendUrl + data);
  }, []);

  return <Spinner message='Please wait redirecting to payment page' />
}

export default PaystackHosted;
