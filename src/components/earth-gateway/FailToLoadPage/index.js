import React, { useState, useEffect } from 'react'
import {Container, Form, Button, Card} from 'react-bootstrap'
import axios from 'axios'
import {baseUrl} from '../../../config/baseUrl'
import Spinner from '../../common/Spinner';
import { helpers } from '../../../helpers';

const FailurePage = ({ encryptData, message, cancelUrl, base64Data, dataDecode, showCashPaymentBtn, cashPaymentUrl, goBackButton }) => {
  const [data, setData] = useState(encryptData)
  const [loading, setLoading] = useState(false)
  const [loadingCashPayment, setLoadingCashPayment] = useState(false)
  const [show, setShow] = useState(true);
  const [providerUrl, setBaseUrl] = useState("");
  const [providerName, setProviderName] = useState("");
  const [orderInfo, setOrderInfo] = useState('');

  const cancelPayment = async (data) => {
    try {
      // const {cancel_url} = base64Data?.cancel_url
      console.log(window.location.href)
      const cancel_url = base64Data?.cancel_url ? base64Data?.cancel_url : ''
      window.location.replace(cancel_url)
    } catch (error) {
      console.log('Error happende here:', error)
    }
  }

  const handleCashPayment =  () => {
    setLoadingCashPayment(true);
    window.location.replace(cashPaymentUrl)
  }

  const handleCancelEvent = () => {
    setLoading(true)
    cancelPayment(data)
  }
  

  return (
    <div className='col d-flex justify-content-center mt-4 container'>
      <div className='col-sm-7 col-md-5 col-lg-6 col-xl-4'>
        <div className="btn btn-light back-btn-container" onClick={goBackButton}>« Back</div>
        <div className='col-md-10 card'>
          <p className='lead mt-4'>Unable to process your request, Please try again later!</p>
          <p className='lead' style={{ color:'grey', fontSize: 12}}>{message}</p>
          {/* <Button
            className=' btn-block'
            variant='success'
            href={`/${providerName}/?response=${base64Data}`}
            data-loading-text='Processing, please wait...'
          >
            Try Again
          </Button> */}

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
