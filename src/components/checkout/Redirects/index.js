import React, { useEffect } from 'react';
import queryString from 'query-string';
import Spinner from '../../common/Spinner';
import { baseUrl } from '../../../config/baseUrl';

// let BackendUrl = 'http://localhost:4007/dev/api/v1/sale/hosted?data='
let BackendUrl = baseUrl.checkout + '/v1/sale/hosted?data=';

function CheckoutHosted() {

  useEffect(() => {
    let url = window.location.href;
    const params = queryString.parseUrl(url);
    console.log('params: ', params);
    const { data, response, via } = params.query;
    console.log('via', via);

    console.log('Saving card url: ', window.location.origin);

    // 0 New card
    if (via == 0) {
      console.log('new card: ', BackendUrl);
      window.location.replace(BackendUrl + data);

    }
    // 1 Save card
    else if (via == 1) {
      console.log('Saved card: ', window.location.origin);
      window.location.replace(window.location.origin + '/checkout/save-card' + '?data=' + data + '&response=' + response);
    }
  }, []);

  return <Spinner message='Please wait redirecting to payment page' />
}

export default CheckoutHosted;
