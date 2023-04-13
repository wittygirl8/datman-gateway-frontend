import React, { useState, useEffect } from "react";
import axios from "axios";
import { baseUrl } from "../../../config/baseUrl";
import Spinner from "../../common/Spinner";
import { Button, Form, InputGroup, Alert } from 'react-bootstrap'
import Cleave from "cleave.js/react";
import valid from 'card-validator'
import { trimSpace } from '../../../helpers'

export default function AddCard({ data, base64Data }) {
  const [message, setMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState('')
  const [redirectUrl, setRedirectUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [amexCardError, setAmexCardErrror] = useState(false);
  const [card_error, setCardError] = useState(true)
  const [card_length, setCardLength] = useState(16)
  const [card_number, setCardNumber] = useState('')
  const [expDate, setExpDate] = useState('')
  const [cvv, setCvv] = useState('')
  const [exp_date_error, setExpDateError] = useState(true)
  const [cvv_error, setCVVError] = useState(true)
  const [cvv_length, setCVVLength] = useState(3)
  const [isSameAddress, setAddressCheck] = useState(false)
  const [billingAddress, setAddress] = useState('')
  const [postCode, setPostCode] = useState('');
  const [decryptPayload, setDecryptPayload] = useState('')
  const [base64String, setBase64Data] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    //Defining payload using input from user which will go to backend api
    const rawData = {
      merchant_id: decryptPayload?.merchant_id,
      customer_id: decryptPayload?.customer_id,
      billing_address: billingAddress,
      billing_post_code: postCode,
      card_number: card_number,
      exp_month: expDate.slice(0, 2),
      exp_year: expDate.slice(2),
      cvv: cvv,
      redirect_url: decryptPayload?.redirect_url,
      webhook_url: decryptPayload?.webhook_url,
      order_id: decryptPayload?.order_id ? decryptPayload?.order_id : Math.floor(Math.random() * 1000000000)
    }

    let encData = JSON.stringify(rawData)
    let bufferObj = Buffer.from(encData, 'utf8');

    // Encode the Buffer as a base64 string
    let encodedData = bufferObj.toString('base64');

    //Passing the encrypted payload to backend in POST req
    await addCardUpdate(encodedData);
  };

  //Function to post to Backend /savecard API with encrypted data from eg payload
  const addCardUpdate = async (data) => {
    try {
      let response = await axios.post(`${baseUrl.earth}/add-card`, { data })

      //Initialize mastertoken and redirect url if response is successfull
      if (response.status === 200) {
        let redirectUrl = decodeURIComponent(response?.data?.headers?.location);
        setRedirectUrl(redirectUrl);

        if (response?.data?.statusCode === 301) {
          setErrorMessage('')
          // setMessage('Card added successfully');
          setMessage('Your request has been processed successfully');
          window.setTimeout(function () {
            window.location.replace(redirectUrl);
          }, 2000);

        };
      };
      setLoading(false);

    } catch (error) {
      //settting error and alert for any other kind of error usecase
      setLoading(false)
      setErrorMessage('Something went wrong. Please try again later!');
    }
  };

  const allowOnlyNumber = (value) => {
    const re = /^[0-9\b]+$/
    if (value === '' || re.test(value)) {
      return true
    }
  }

  useEffect(() => {
    const decryptData = async (data, base64Data) => {

      //using decrypt endpoint
      const url = `${baseUrl.earth}/decrypt-addcard`;
      const decryptedPayload = await axios.post(url, { data })
      const decryptPayload = decryptedPayload?.data?.data;

      let bufferObj = Buffer.from(base64Data, 'base64');
      let base64String = JSON.parse(bufferObj.toString('utf8'));
      setBase64Data(base64String);
      setDecryptPayload(decryptPayload);
    }
    data && base64Data && decryptData(data, base64Data);

  }, [data, base64Data])

  const payButtonValidation = () => {
    // console.log('!card_error', !card_error)
    // console.log('!cvv_error', !cvv_error)
    // console.log('!exp_date_error', !exp_date_error)
    // console.log('(data?.billing_address_req_new_card && !billingAddress.length)', (base64String?.billing_address_req_new_card && !billingAddress.length))
    // console.log('(data?.billing_address_req_new_card && !postCode.length)', (base64String?.billing_address_req_new_card && !postCode.length))
    // console.log('card_number.length !== 16 ', card_number.length !== 16)
    // console.log('cvv.length !== 3 ', cvv.length !== 3)
    // console.log('expDate.length !== 4', expDate.length !== 4)
    let result = (!card_error ||
      !cvv_error ||
      !exp_date_error ||
      (data?.billing_address_req_new_card && !billingAddress.length) ||
      (data?.billing_address_req_new_card && !postCode.length) ||
      card_number.length !== 16
      || cvv.length !== 3
      || expDate.length !== 4)
    return result
  }

  return !loading ? (
    <div className='container col d-flex justify-content-center   '>
      <div className='col-sm-6 col-md-6 col-lg-4 col-xl-3'>
        {message ?
          <Alert variant='success' className="alert-box" show={message}>
            <Alert.Heading>Success</Alert.Heading>
            <p> {message}</p>
          </Alert> : errorMessage ?
            <Alert variant='danger' className="alert-box" show={errorMessage}>
              <Alert.Heading>Failure</Alert.Heading>
              <p>{errorMessage}</p>
            </Alert> :
            <Form onSubmit={handleSubmit} className='mt-5' method='POST'>
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
                    className={` form-control  ${!card_error ? 'error-color' : ''
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
                          if (isValidCard.card.type === 'american-express') {
                            setAmexCardErrror(true);
                            setCardNumber('');
                            setCardError(true);
                            return
                          }

                          if (isValidCard.card.code.size !== null) {
                            setCVVLength(isValidCard.card.code.size)
                            setCardLength(isValidCard.card.lengths[0])
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
                      className={`shadow-sm form-control ${!exp_date_error ? 'error-color' : ''
                        } `}
                      pattern='[0-9/]*'
                      type='tel'
                      autoComplete="cc-exp"
                      value={expDate}
                      minLength='5'
                      maxLength='5'
                      required
                      onChange={(event) => {
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
                      className={`shadow-sm col-md-9 form-control ${!cvv_error ? 'error-color' : ''
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
                <Form.Group>
                  <Form.Label className=''>Billing Address</Form.Label>
                  { ( trimSpace.trimData(base64String?.avs?.house_number)) && ( trimSpace.trimData(base64String?.avs?.postcode)) &&
                  <span
                    style={{ float: "right", fontSize: "15px" }}
                    onClick={() => {
                      setAddressCheck(!isSameAddress)

                      if (isSameAddress === false) {
                        setAddress(trimSpace.trimData(base64String?.avs?.house_number));
                        setPostCode(trimSpace.trimData(base64String?.avs?.postcode));
                      } else {
                        setAddress('')
                        setPostCode('')
                      }

                    }}>
                    <Form.Check type="checkbox"
                      // className='mr-2 mt-2'
                      checked={isSameAddress}
                      name='delivery_address'
                      label="Same as delivery" />
                  </span>}
                  <InputGroup>
                    <Form.Control
                      placeholder='Address Line 1'
                      name="house-number"
                      // disabled={isSameAddress ? true : false}
                      value={billingAddress}
                      style={{ borderBottomLeftRadius: '0', borderBottom: '0', borderTopRightRadius: '0.25em' }}
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
                </Form.Group>
              </Form.Group>
              <Form.Group >
                <Button
                  variant='primary'
                  block
                  type='submit'
                  disabled={payButtonValidation()}
                >
                  Add Card
                </Button>
              </Form.Group>
              <Form.Group >
                <p className='text-muted text-center'>
                  <small>
                    <i className='fas fa-lock'></i> Your card information is
                    encrypted
                  </small>
                </p>
              </Form.Group>
            </Form>}
      </div>
    </div>
  ) : (
    <Spinner message='Please wait while we are adding your card details...' />
  )
}