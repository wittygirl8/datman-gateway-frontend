import React, { useState, useEffect } from 'react';
import queryString from 'query-string';
import { Card, Container } from 'react-bootstrap';
import { initiatePayment } from "./initiate-payment";
import { handleRedirect } from "./handle-redirect";
import Spinner from '../common/Spinner';
import './style.css';

export default function AdyenCheckoutPage(props) {

    //console.log('baseUrl',baseUrl);return;
    const [message, setMessage] = useState('Processing payment...');
    const [loading, setLoading] = useState(false);
    const [failure, setFailure] = useState(false);

    // get encryptedData from query params
    const url = window.location.href;
    const params = queryString.parseUrl(url);
    const encryptedData = params.query.data;
    const base64Data = params.query.response;

    // get sessionId & redirectResult for adyen redirect
    const queryResultString = window.location.search;
    const urlParams = new URLSearchParams(queryResultString);
    const redirectResult = urlParams.get('redirectResult');
    const sessionId = urlParams.get('sessionId');

    useEffect(() => {
        // If no paramters are present in the URL, mount the Drop-in
        if (!redirectResult && !sessionId) {
            initiatePayment(encryptedData, base64Data, { setLoading, setMessage, setFailure });
        } else {
            // Otherwise, handle the redirect
            handleRedirect(sessionId, redirectResult, setLoading);
        }
    }, [sessionId, redirectResult, encryptedData, base64Data]);

    const goBackButton = () => {
        console.log('inside goBackButton');
        window.history.back();
    }

    return !failure ? (!loading ? <Spinner message={message} /> :
        <div className="payment-container">
            <div className="back-container btn btn-light" onClick={goBackButton}>« Back</div>
            <div id="dropin-container"></div>
        </div>
    )
        :
        (<Container className="py-5" style={{ width: '50%' }}>
            <Card className="text-center border-danger  alert-danger ">
                <Card.Body><div className='text-danger' style={{ fontSize: '18px' }}>{message}</div></Card.Body>
            </Card>
        </Container>)
}
