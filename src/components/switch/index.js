import React, { useState, useEffect } from 'react';
import queryString from 'query-string';
import {baseUrl} from '../../config/baseUrl';
import FailToLoadPage from "../earth-gateway/FailToLoadPage";
import axios from 'axios'
import { Card, Container } from 'react-bootstrap';
import Spinner from '../common/Spinner';
export default function MainPage(props) {

    //console.log('baseUrl',baseUrl);return;
    const [message, setMessage] = useState('Processing payment...')
    const [loading, setLoading] = useState(false)
    const [failure, setFailure] = useState(false)
    const encryptedData = props.match.params.data;

    useEffect(() => {

        const decryptData = async (data) => {
            try {
                const response = await axios.post(`${baseUrl.switch}/decrypt`, { data });
                const resData = response.data.data;
                const { redirect_url } = resData;
                setMessage(response.data.message);
                if (response.status === 200) {
                    //read redirect url and redirect to that
                    window.location.replace(redirect_url);
                }


            } catch (error) {
                console.log('Error:', error);
                // const message  = error?.response?.data?.error ? error?.response?.data?.error : 'Unable to process your request, Please try again later!';
                // setMessage(message);

                setFailure(true);
                return null;
            }
        }

        decryptData(encryptedData)


    }, [encryptedData])



    return !loading && !failure ? <Spinner message={message} /> : (<Container style={{ width: '50%' }}>
        <FailToLoadPage
                    message={`Payment Failed: 80${Math.floor(
                      Math.random() * (999 - 1 + 1) + 1
                    )}`}
                  />
        {/* <Card className="text-center border-danger  alert-danger ">
            <Card.Body><div className='text-danger' style={{ fontSize: '18px' }}>{message}</div></Card.Body>
        </Card> */}
    </Container>)
}
