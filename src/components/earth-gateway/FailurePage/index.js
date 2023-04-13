import React, { useState, useEffect } from 'react'
import {Container, Form, Button, Card} from 'react-bootstrap'
import axios from 'axios'
import {baseUrl} from '../../../config/baseUrl'
import Spinner from '../../common/Spinner';
import { helpers } from '../../../helpers';

const FailurePage = ({ encryptData, failedMessage, message, cancelUrl, base64Data, dataDecode, showCashPaymentBtn, cashPaymentUrl}) => {
  const [data, setData] = useState(encryptData)
  const [loading, setLoading] = useState(false)
  const [loadingCashPayment, setLoadingCashPayment] = useState(false)
  const [show, setShow] = useState(true);
  const [providerUrl, setBaseUrl] = useState("");
  const [providerName, setProviderName] = useState("");
  const [orderInfo, setOrderInfo] = useState('');

  const cancelPayment = async (data) => {
    try {
      const url = `${providerUrl}/sale/cancel`

      const response = await axios.post(url, {data,error_message: message})
      const {cancel_url} = response.data.data
      window.location.replace(cancel_url)
    } catch (error) {
      console.log('Error happende here:', error)
      window.location.replace('')
    }
  }
  const checkPaymentStatus = async (data) => {
    try {
      setShow(true);
      const url = `${baseUrl.earth}/decrypt`;
      //using decrypt endpoint to check the payment status
      const response = await axios.post(url, { data,error_message: failedMessage })
      setOrderInfo(response);
      setShow(false);
      //if getting response do nothing
    } catch (error) {
      console.log('Error:', error.response.data)
      const { message, redirect_url } = error.response.data.error;
      //if payment done
      //will be getting status code of 500 -> redirect to respect page
      if (message === 'Payment already done' && error.response.status === 500) {
        setTimeout(() => { window.location.replace(redirect_url); }, 2000)
      }
      setShow(false);
    }
  }
  const handleCancelEvent = () => {
    setLoading(true)
    cancelPayment(data)
  }
  const handleCashPayment =  () => {
    setLoadingCashPayment(true);
    window.location.replace(cashPaymentUrl)
  }
  useEffect(() => {
    var { url, name } = helpers.GetProviderConfig(data?.provider)
    setBaseUrl(url)
    setProviderName(name);
    
    checkPaymentStatus(encryptData);
  }, [])

  return show ? <Spinner message='Processing, please wait...' /> : (
    <div className='container col d-flex justify-content-center'>
      <div className='row justify-content-center'>
      <div className='col-md-6 card mt-2'>
      <br></br>
      <b>{failedMessage}</b> 
          <p className='lead mt-5'>Your payment for order #{orderInfo?.data?.data?.order_id} was not completed.  
If an amount was debited, it will be refunded to your card within 3 to 5 working days.</p>
          <p className='lead' style={{ color:'grey', fontSize: 12}}>{message}</p>
          <Button
            className=' btn-block'
            variant='success'
            href={`/${providerName}/?data=${encryptData}&response=${base64Data}`}
            data-loading-text='Processing, please wait...'
          >
            Try Again
          </Button>

          <Button
            className=' btn-block  mb-5'
            variant='info'
            disabled={loading}
            data-loading-text='Processing, please wait...'
            onClick={handleCancelEvent}
          >
            {!loading ? (
              'Cancel'
            ) : (
              <>
                <div
                  className='spinner-border spinner-border-sm'
                  role='status'
                ></div>
                Please Wait...
              </>
            )}
          </Button>
          { showCashPaymentBtn && <Button
              className=' btn-block'
              variant='primary'
              disabled={loading}
              data-loading-text='Processing, please wait...'
              onClick={handleCashPayment}
          >
            {!loadingCashPayment ? (
                'Pay Cash'
            ) : (
                <>
                  <div
                      className='spinner-border spinner-border-sm'
                  > </div>
                  Please Wait...
                </>
            )}
          </Button>}
        </div>
      </div>
    </div>
  )
}

export default FailurePage
