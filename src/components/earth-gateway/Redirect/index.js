import React, { useState,useEffect } from 'react';
import {Buffer} from 'buffer';
import Spinner from '../../common/Spinner';
// import baseUrl from '../../config/baseUrl';
// import { Button, Form, InputGroup } from 'react-bootstrap';
// import { CountryDropdown } from 'react-country-region-selector';
// import axios from 'axios';
// import valid from 'card-validator';
// import Cleave from 'cleave.js/react';
// import paymentlogo from '../../assets/payments2.svg';


export default function CheckoutForm(props) {
  const [encodedString, setEncodedString] = useState('');
  const [decodedObject, setDecoded] = useState('');
  useEffect(() => {
    let encoded = decodeURIComponent(props.match.params.string);
    let decoded = Buffer.from(encoded, 'base64').toString()
    decoded = JSON.parse(decoded);
    setEncodedString(encoded)
    // setDecoded(decoded)
    Redirect(
      decoded.url,
      decoded.fields,
      decoded.method
    );
    // console.log('decoded_string',decoded_string)
  },['encodedString']);

  const Redirect = (path, params, method) => {
    method = method || 'POST';
    let form = document.createElement('form');
    form.setAttribute('id', 'send-form');
    form.setAttribute('method', method);
    form.setAttribute('action', path);

    for (let key in params) {
      if (params.hasOwnProperty(key)) {
        let hiddenField = document.createElement('input');
        hiddenField.setAttribute('type', 'hidden');
        hiddenField.setAttribute('name', key);
        hiddenField.setAttribute('value', params[key]);
        form.appendChild(hiddenField);
      }
    }

    document.body.appendChild(form);

    form.submit();
  }

  return (
    <>
    <Spinner message='Redirecting to merchant site...please wait..' />
    </>
    
  );
}
