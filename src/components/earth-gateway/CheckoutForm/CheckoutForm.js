import React, { useState, useEffect } from 'react'
import { Button, Form, InputGroup, Alert } from 'react-bootstrap'
import { CountryDropdown } from 'react-country-region-selector'
import axios from 'axios'
import valid from 'card-validator'
import Cleave from 'cleave.js/react'
import './style.css'
import {baseUrl} from '../../../config/baseUrl'
import Spinner from '../../common/Spinner'
import FailurePage from '../FailurePage'
import { Link } from 'react-router-dom'
import { decodeHtml } from '../../../config/helper';
import { helpers, deviceInfo, threeDsRedirect, trimSpace } from '../../../helpers';

const AMERICAN_EXPRESS = 'american-express'
export default function CheckoutForm({ data, encryptData,exist, base64Data, goBackButton }) {
  const [loading, setLoading] = useState(false)
  const [isChecked, setIsChecked] = useState(true)

  const [cardHolderName, setCardHolderName] = useState('T2S Customer')
  const [card_number, setCardNumber] = useState(' ')
  const [expDate, setExpDate] = useState(' ')
  const [cvv, setCvv] = useState('')
  const [country, setCountry] = useState('United Kingdom')
  const [card_error, setCardError] = useState(true)
  const [exp_date_error, setExpDateError] = useState(true)
  const [cvv_error, setCVVError] = useState(true)
  const [cvv_length, setCVVLength] = useState(3)
  const [card_length, setCardLength] = useState(16)

  const [error, setError] = useState(false)
  const [message, setMessage] = useState('')
  const [failedMessage, setFailedMessage] = useState('')
  const [cancelUrl, setCancelUrl] = useState()
  const [amexCardError, setAmexCardErrror] = useState(false);

  const [providerUrl, setBaseUrl] = useState("");
  const [providerName, setProviderName] = useState("");

  const [isSameAddress, setAddressCheck] = useState(false)
  const [billingAddress, setAddress] = useState('')
  const [postCode, setPostCode] = useState('');
  // const [orderId, setOrderid] = useState('');
  
  const initiateSale = async (appendedData) => {
    try {
      const url = `${providerUrl}/sale/create`
      
      const response = await axios.post(url, { ...appendedData })

      // window.DD_LOGS.logger.info(`Response from backend create sale  ${response?.data?.data?.order_id} `, {httpres: response?.data})
      // setOrderid(response.data.data.order_id);

      if (response.status === 200) {
        const { redirectUrl } = response.data.data
        // window.DD_LOGS.logger.info('status 200', { httpres: response?.data})

        window.location.replace(redirectUrl)
        // setLoading(false);
      } else if (response.status === 201) {
        const { success, threeDSreq } = response.data.data
        // window.DD_LOGS.logger.info('status 201', { httpres: response?.data})
        if(success === '3d'){
          // window.DD_LOGS.logger.info(`3dsv2 state debug FE received response for 3ds v1 ${response?.data?.data?.order_id} `, {})
          await threeDsRedirect.threeDsV1AcsRedirect(threeDSreq, {orderId: response?.data?.data?.order_id});
        }
        else if(success === '3dsV2'){
          // window.DD_LOGS.logger.info(`3dsv2 state debug FE received response on 3ds v2 ${response?.data?.data?.order_id} `, {})
          if(threeDSreq.hasOwnProperty('creq')){
            // window.DD_LOGS.logger.info(`Direct creq received for 3ds v2 ${response?.data?.data?.order_id} `, {})
            threeDsRedirect.AcsRedirect({
              action: 'creq',
              threeDSURL: threeDSreq.threeDSURL,
              creq: threeDSreq.creq
            })
          }
          else if(threeDSreq.hasOwnProperty('threeDSMethodData')){
            // window.DD_LOGS.logger.info(`Response received for Fingerprinting on 3ds v2 ${response?.data?.data?.order_id} `, {})
            await threeDsRedirect.threeDsV2AcsRedirect(threeDSreq, {orderId: response?.data?.data?.order_id})
          }
          else {
            // window.DD_LOGS.logger.info(`neither received creq or threeDSMethodData for 3ds v2 ${response?.data?.data?.order_id} `, {})
          }
          
        }
        return false;
        //setLoading(false);
      }
    } catch (error) {
      // console.error('Error:======>', error.response)
      const { message, failedMessage } = error.response.data.errorResponse.error;
      if (message === 'Payment already done' && error.response.status === 500) {
        setTimeout(() => { window.location.replace(data.redirect_url); }, 2000)
      } else {
        setMessage(message)
        setFailedMessage(failedMessage)
        setLoading(false)
        setError(true)
      }
    }
  }

  const handleSubmit = async (e) => {
    let kountSessionID ="";
    try{
      kountSessionID = localStorage.kSessionId;
      localStorage.removeItem('kSessionId');
    }
    catch(e) {
      console.error("Something went wrong in accesing - kSessionId ", e);
    }
    e.preventDefault()

    setLoading(true)
    const params = {
      exp_month: expDate.slice(0, 2),
      exp_year: expDate.slice(2),
      save_card: isChecked,
      session_id:kountSessionID,
      billing_address: billingAddress,
      billing_post_code: postCode
    }

    const appendedData = { 
      data: encryptData, 
      card_number, cvv, 
      ...params, 
      deviceInfo: deviceInfo.GetDeviceInfo(), 
      base64Data 
    }
    setCancelUrl(data.cancel_url)
    initiateSale(appendedData)
  }

  useEffect(() => {
    var { url, name } = helpers.GetProviderConfig(data.provider)
    setBaseUrl(url)
    setProviderName(name)
  })

  const allowOnlyNumber = (value) => {
    const re = /^[0-9\b]+$/
    if (value === '' || re.test(value)) {
      return true
    }
  }
  const handleInputChange = (text) => {
    if (/^[a-zA-Z\s]+$/.test(text) || text === '') {
      setCardHolderName(text)
    }
  }
 
  const is_amex_card = card_number.slice(0, 2) == 37;
  const payButtonValidation = () => {
    let result = (!card_error ||
      !cvv_error ||
      !exp_date_error ||
      !cardHolderName.length ||
      !country.length ||
      (data?.billing_address_req_new_card && !billingAddress.length) ||
      (data?.billing_address_req_new_card && !postCode.length) ||
      (is_amex_card ? card_number.length !== 15 && cvv.length !== 4 : card_number.length !== 16 && cvv.length !== 3) ||
      // is_amex_card ? card_number.length !== 15 : card_number.length !== 16 ||
      // is_amex_card ? cvv.length !== 4 : cvv.length !== 3 ||
      expDate.length !== 4)
    return result
  }
   return !error ? (
    !loading ? (
      <>
        <div className='container col d-flex justify-content-center   '>
          {/* <!-- Form --> */}
          <div className='col-sm-7 col-md-5 col-lg-6 col-xl-4 mt-4'>
          <div className='back-btn-container'>
              {exist ?(<Link
                style={{ fontSize: '12px', fontWeight: 500,paddingLeft:0,paddingTop:0 }}
                to={`/${providerName}/?data=${encryptData}&response=${base64Data}`}
                className='nav-link text-left'
                >
                <div className="btn btn-light">« Back</div>
              </Link>):
              <div className="btn btn-light" onClick={goBackButton}>« Back</div>
              }
            </div>
            <Form onSubmit={handleSubmit} method='POST'>
              {/* <Form.Group>
                <Form.Label className=''>Email</Form.Label>

                <InputGroup>
                  <Form.Control
                    type='email'
                    className='shadow-sm'
                    maxLength='28'
                    disabled
                    required
                    defaultValue={data.email}
                  />
                </InputGroup>
              </Form.Group> */}
              <Alert variant='info' show={amexCardError}>
                Sorry, we don’t accept AMEX cards.
              </Alert>

              <Form.Group>
              <div className='text-danger'>
                  {`${data.gateway_switched ? 'Please re-enter your card details.' : ''}`}
              </div>
                <Form.Label className=''>Card Information</Form.Label>                
                
                <InputGroup>
                  <Cleave
                    autoFocus
                    options={{ creditCard: true }}
                    type='tel'
                    name="cardnumber"
                    autoComplete="cc-number"
                    placeholder='1234 1234 1234 1234'
                    className={` form-control  ${
                      !card_error ? 'error-color' : ''
                      } `}
                    style={{
                      borderBottom: '0',
                      borderBottomLeftRadius: '0',
                    }}
                    required
                    minLength={card_length}
                    value={card_number}
                     onBlur={() => {
                      let isValidCard
                      if (card_number.length) {
                        isValidCard = valid.number(card_number, {
                          maxLength: 16,
                        })

                        setCardError(isValidCard.isValid)

                        if (
                          isValidCard !== undefined &&
                          isValidCard !== null &&
                          isValidCard.card !== null
                        ) {
                          if (!data.amex_enabled) {
                            if (isValidCard.card.type === AMERICAN_EXPRESS) {
                              setAmexCardErrror(true);
                              setCardNumber('');
                              setCardError(true);
                              return
                            }
                          }

                          if (isValidCard.card.code.size !== null) {
                            setCVVLength(isValidCard.card.code.size)
                            setCardLength(isValidCard.card.lengths[0])
                          }
                          if (is_amex_card) {
                            setCVVLength(4);
                          }
                        }
                      } else {
                        setCardError(true)
                      }
                    }}
                    onChange={(event) => {
                      setAmexCardErrror(false);
                      const value = event.target.rawValue
                      const re = /^[1-9][0-9]*$/ //not to allow with zero
                      if (value === '' || re.test(value)) {
                        setCardNumber(value)
                      }
                    }}
                  />
                  <InputGroup>
                    <Cleave
                      options={{ date: true, datePattern: ['m', 'y'] }}
                      placeholder='MM YY'
                      name="cc-exp"
                      style={{ borderTopLeftRadius: '0' }}
                      className={`shadow-sm form-control ${
                        !exp_date_error ? 'error-color' : ''
                        } `}
                      pattern='[0-9/]*'
                      type='tel'
                      autoComplete="cc-exp"
                      value={expDate}
                      minLength='5'
                      maxLength='5'
                      required
                      onChange={(event) => {
                        //console.log('event:', event.target.rawValue);
                        const value = event.target.rawValue
                        if (allowOnlyNumber(value)) setExpDate(value)
                      }}
                      onBlur={() => {
                        let isDateValid
                        if (expDate.length) {
                          isDateValid = valid.expirationDate(expDate).isValid

                          setExpDateError(isDateValid)
                        }
                      }}
                    />
                    <Form.Control
                      type='tel'
                      name="cvc"
                      autoComplete="cc-csc"
                      placeholder='CVV'
                      className={`shadow-sm col-md-9 form-control ${
                        !cvv_error ? 'error-color' : ''
                        } `}
                      style={{ borderTopRightRadius: '0' }}
                      pattern='[0-9]*'
                      value={cvv}
                      minLength={cvv_length}
                      maxLength={cvv_length}
                      required
                      onChange={(event) => {
                        const value = event.target.value
                        if (allowOnlyNumber(value)) setCvv(value)
                      }}
                      onBlur={() => {
                        let isValidCVV
                        if (cvv.length) {
                          isValidCVV = valid.cvv(cvv, cvv_length).isValid
                          setCVVError(isValidCVV)
                        }
                      }}
                    />
                  </InputGroup>
                </InputGroup>
              </Form.Group>
              <Form.Group>
              {data?.billing_address_req_new_card && <Form.Group>
                  <Form.Label className=''>Billing Address</Form.Label>
                  { ( trimSpace.trimData(data?.avs?.house_number)) && ( trimSpace.trimData(data?.avs?.postcode)) &&
                        <span
                        style={{float:"right",fontSize:"15px"}}
                          onClick={() => {
                            setAddressCheck(!isSameAddress)

                            if (isSameAddress === false) {
                              setAddress(trimSpace.trimData(data?.avs?.house_number));
                              setPostCode(trimSpace.trimData(data?.avs?.postcode));
                            } else {
                              setAddress('')
                              setPostCode('')
                            }

                          }}>
                        <Form.Check type="checkbox"
                                    // className='mr-2 mt-2'
                                    defaultChecked={isSameAddress}
                                    name='delivery_address'
                                    // onChange={(event) => {
                                    //   const checked = event.target.checked
                                    //   setAddressCheck(checked)

                                    //   if (checked) {
                                    //     setAddress(data?.avs?.house_number);
                                    //     setPostCode(data?.avs?.postcode);
                                    //   } else {
                                    //     setAddress('')
                                    //     setPostCode('')
                                    //   }

                                    // }}
                                    label="Same as delivery"/>
                        </span>} 
                  <InputGroup>
                    <Form.Control
                        placeholder='Address Line 1'
                        name="house-number"
                        // disabled={isSameAddress ? true : false}
                        value={billingAddress}
                        style={{borderBottomLeftRadius:'0', borderBottom:'0', borderTopRightRadius:'0.25em'}}
                        className={` form-control`}
                        onChange={(event) => {
                          const value = event.target.value
                          setAddress(value)
                        }}

                    />
                    <InputGroup>
                      <Form.Control
                          placeholder='Postcode'
                          name="post-code"
                          // disabled={isSameAddress ? true : false}
                          value={postCode}
                          style={{ borderTopLeftRadius: '0', borderBottomRightRadius: '0.25em', borderTopRightRadius: '0', width: '50%' }}
                          className={`shadow-sm form-control`}
                          maxLength='8'
                          onChange={(event) => {
                            const value = (event.target.value).toUpperCase();
                            setPostCode(value)
                          }}
                      />

                      
                    </InputGroup>
                  </InputGroup>
                </Form.Group>}
                {/* <Form.Label className=''>Name card</Form.Label>

                <InputGroup>
                  <Form.Control
                    type='text'
                    name="ccname"
                    autoComplete="cc-name"
                    className='shadow-sm'
                    required
                    value={cardHolderName}
                    placeholder='Name'
                    onChange={(event) => handleInputChange(event.target.value)}
                  />
                </InputGroup> */}
              </Form.Group>

              {/* <Form.Group>
                <Form.Label>Country or region</Form.Label>

                <CountryDropdown
                  value={country}
                  onChange={(value) => setCountry(value)}
                  className='form-control shadow-sm'
                  disabled
                />
              </Form.Group> */}

              <div>
                <Button
                  variant='primary'
                  block
                  type='submit'
                  disabled={payButtonValidation()}
                >
                  Pay &nbsp;{decodeHtml(data?.currency_sign ? data.currency_sign : data.country_info?.currency_sign)} {parseFloat(data.total).toFixed(2)}
                </Button>
              </div>

              <Form.Group >
                <InputGroup>
                  {/* <input
                    type='checkbox'
                    className='mr-2 mt-1'
                    checked={isChecked}
                    name='remember'
                    onChange={(event) => setIsChecked(event.target.checked)}
                  />
                  <Form.Label>Remember this card</Form.Label> */}
                  <span>
                    <Form.Check type="checkbox"
                      className='mr-2 mt-2'
                      checked={isChecked}
                      name='remember'
                      onChange={() => setIsChecked(!isChecked)}
                      label="Remember this card" />
                  </span>
                </InputGroup>
              </Form.Group>
            </Form>
            {/* <div className=''>
                 {exist ?(<Link
                style={{ fontSize: '12px', fontWeight: 500,paddingLeft:0,paddingTop:0 }}
                to={`/${providerName}/?data=${encryptData}&response=${base64Data}`}
                className='nav-link text-left'
                >
                <i className='fe fe-arrow-left'>Back</i>
              </Link>):null}
            </div> */}
            <p className='text-muted text-center'>
              <small>
                <i className='fas fa-lock'></i> Your card information is
                encrypted
              </small>
            </p>
          </div>
        </div>
      </>
    ) : (
        <Spinner message='Please wait while we process your payment' />
      )
  ) : (
      <FailurePage
        encryptData={encryptData}
        message={message}
        cancelUrl={cancelUrl}
        base64Data={base64Data}
        dataDecode={data}
        failedMessage={failedMessage}
      />
    )
}
