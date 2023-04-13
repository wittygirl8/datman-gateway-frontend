import React, { useState } from 'react'
import axios from 'axios'
import {baseUrl} from '../../../config/baseUrl'
import CancelButtonComponent from './CancelButtonComponent';

const CancelButtonContainer = ({ encryptData, message }) => {
    const [loading, setLoading] = useState(false);
    
    const cancelPayment = async (data) => {
        try {
            const url = `${baseUrl.earth}/sale/cancel`
            const response = await axios.post(url, {data,error_message: message})
            const {cancel_url} = response.data.data
            window.location.replace(cancel_url)
        } catch (error) {
            console.log('Error on Cancel', error)
            setLoading(false)
        }
    }
    
    const handleCancelEvent =  async () => {
        setLoading(true)
        await cancelPayment(encryptData)
    }
   
   
    return <CancelButtonComponent
    handleCancelEvent={handleCancelEvent}
    loading={loading}
    />
}

export default CancelButtonContainer
