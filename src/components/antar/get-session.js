import axios from 'axios';
import { baseUrl } from '../../config/baseUrl';

export const getAdyenPaymentSession = async (payload, setMessage) => {
    const response = await axios.post(`${baseUrl.antar}/antar/hosted-form/create-session`, { data: payload });
    // console.log('Adyen Response: ', response);
    const { data, message } = response.data;
    setMessage(message);
    return data;
}