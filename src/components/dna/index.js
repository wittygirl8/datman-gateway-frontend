import React, { useState, useEffect } from 'react';
import queryString from 'query-string';
import Spinner from '../common/Spinner';
import axios from 'axios';
import { baseUrl } from '../../config/baseUrl';
import { Card, Container } from 'react-bootstrap';
import { configureDNAPayments } from "./configure-dna-payments";
import { createPaymentPage } from "./create-payment-page";

export default function HostedPage(props) {

    const [message, setMessage] = useState('Processing payment...');
    const [loading, setLoading] = useState(false);
    const [failure, setFailure] = useState(false);
    const [response, setResponse] = useState(null);

    useEffect(() => {
        const url = window.location.href;
        const params = queryString.parseUrl(url);
        const encryptedData = params.query.data;
        const base64Data = params.query.response;

        // get session details from dna
        const getDnaSessionDetails = async (encryptedData) => {
            try {
                const url = `${baseUrl.dnaUrl}/hosted-form/sale`;
                const response = await axios.post(url, { data: encryptedData, base64Data }).then(res => res.data);
                setResponse(response);
            } catch (error) {
                console.error("error: ", error);
                // window.DD_LOGS.logger.info(`error`, { error });
                setFailure(true);
                if (error.response) {
                    const { message, redirect_url } = error.response.data.error;
                    setMessage(message);
                    redirect_url && setTimeout(() => { window.location.replace(redirect_url); }, 2000);
                } else {
                    setMessage(error.message);
                }
            }
        }
        getDnaSessionDetails(encryptedData);
    }, []);

    useEffect(() => {
        if (response) {
            const { metadata, data } = response;

            // configure DNA payments options
            configureDNAPayments(metadata, baseUrl?.paymentEnvironemnt);

            // open DNA payment page
            createPaymentPage(metadata, data, baseUrl.dnaUrl);

            setLoading(true);
        }
    }, [response]);

    return !failure ? (!loading ? <Spinner message={message} /> : <div id="dna-embedded-widget-container"></div>) :
        (<Container className="py-5" style={{ width: '50%' }}>
            <Card className="text-center border-danger  alert-danger ">
                <Card.Body><div className='text-danger' style={{ fontSize: '18px' }}>{message}</div></Card.Body>
            </Card>
        </Container>)
}
