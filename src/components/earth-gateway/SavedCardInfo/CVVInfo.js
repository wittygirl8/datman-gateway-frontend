import React, { useState, useEffect } from 'react'
import { Container, Form, Button, Card, InputGroup } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import axios from 'axios'
import Spinner from '../../common/Spinner'
import FailurePage from '../FailurePage'
import { helpers, deviceInfo, threeDsRedirect, trimSpace } from '../../../helpers';
import {decodeHtml} from '../../../config/helper';

export default function CVVInfo(props) {
  const { data, token, encryptData, base64Data } = props.location.state
  //const { token, encryptData } = props.location.params;

  const [cvv, setCvv] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [message, setMessage] = useState('')
  const [failedMessage, setFailedMessage] = useState('')
  const [cancelUrl, setCancelUrl] = useState(data.cancel_url)
  const [providerUrl, setBaseUrl] = useState("");
  const [providerName, setProviderName] = useState("");
  const [isSameAddress, setAddressCheck] = useState(false)
  const [billingAddress, setAddress] = useState('')
  const [postCode, setPostCode] = useState('');

  const initiateSale = async (appendedData) => {
    try {
      const url = `${providerUrl}/sale/token/create`

      const response = await axios.post(url, { ...appendedData })

      if (response.status === 200) {
        // const { redirectUrl } = response.data.data

        // window.location.replace(redirectUrl)

        const { redirectUrl } = response.data.data
        // window.DD_LOGS.logger.info('status 200', { httpres: response?.data})

        window.location.replace(redirectUrl)

      } else if (response.status === 201) {
        const { success, threeDSreq } = response.data.data
        // if(success === '3d'){
        //   window.DD_LOGS.logger.info(`3dsv2 state debug - FE received response for 3ds v1 ${response?.data?.order_id} saved card`)
        //   await threeDsRedirect.threeDsV1AcsRedirect(threeDSreq);
        // }
        // else if(success === '3dsV2'){
        //   window.DD_LOGS.logger.info(`3dsv2 state debug - FE received response for 3ds v2 ${response?.data?.order_id} saved card`)
        //   await threeDsRedirect.threeDsV2AcsRedirect(threeDSreq)
        // }
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
      }
    } catch (error) {
      console.log('Error:======>', error)
      if(error.response && error.response.data && error.response.data.errorResponse && error.response.data.errorResponse.error){
        const { message, failedMessage } = error.response.data.errorResponse.error
        if (message === 'Payment already done' && error.response.status === 400) {
          setTimeout(() => { window.location.replace(data.redirect_url); }, 2000)
        } else {
          setMessage(message)
          setLoading(false)
          setError(true)
          setFailedMessage(failedMessage)
        }
      }else{
        setMessage(message)
        setLoading(false)
        setError(true)
        setFailedMessage(failedMessage)
      }
    }
  }

  const onFormSubmit = (event) => {
    setLoading(true)
    event.preventDefault()
    let session_id = '';
    try{
      session_id = localStorage.kSessionId;
    }
    catch(e)
    {
      console.log("Something went wrong while accessgng - kSessionId ", e);
    }
    const card_token = token.token
    const master_token = token.master_token;
    const billing_address = billingAddress;
    const billing_post_code = postCode;
    const appendData = { 
            data: encryptData, 
            card_token, 
            cvv, 
            session_id, 
            base64Data,
            master_token, 
            billing_address, 
            billing_post_code,
            deviceInfo: deviceInfo.GetDeviceInfo()
    }

    initiateSale(appendData)
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
    return false
  }

  return !error ? (
    !loading ? (
      <Container className='mt-4 col d-flex justify-content-center'>
        <div className=' col-sm-7 col-md-5 col-lg-6 col-xl-4 '>
        <div className='back-btn-container'>
            <Link
              style={{ fontSize: '12px', fontWeight: 500,paddingLeft:0,paddingTop:0 }}
              to={`/${providerName}/?data=${encryptData}&response=${base64Data}`}
              className='nav-link text-left'
              >
              <div className="btn btn-light">« Back</div>
            </Link>
          </div>
          <Card>
            <Card.Body>
              <Form onSubmit={onFormSubmit}>
                <p className='lead'>
                  Card Ending With {token.last_four_digits}
                </p>
                <small>
                  Please enter your CVV.
                </small>

                <Form.Group>
                  <Form.Label className='float-left'>CVV </Form.Label>
                  <Form.Control
                    inputMode='numeric'
                    type='tel'
                    name='cvc'
                    autoComplete='cc-csc'
                    autoFocus = "on"
                    placeholder='CCV'
                    className='shaow-sm  form-control '
                    pattern='[0-9]*'
                    value={cvv}
                    minLength={3}
                    maxLength={3}
                    required
                    onChange={(event) => {
                      const value = event.target.value
                      if (allowOnlyNumber(value)) setCvv(value)
                    }}
                  />
                </Form.Group>
                { data?.billing_address_req && <Form.Group>
                  <Form.Label className=''>Billing Address</Form.Label>
                  { (trimSpace.trimData(data?.avs?.house_number)) && (trimSpace.trimData(data?.avs?.postcode)) &&
                      <span
                        style={{float:"right",fontSize:"15px"}}
                          onClick={() => {
                            setAddressCheck(!isSameAddress)
                            if(isSameAddress === false){
                              setAddress(trimSpace.trimData(data?.avs?.house_number));
                              setPostCode(trimSpace.trimData(data?.avs?.postcode));
                            }else {
                              setAddress('')
                              setPostCode('')
                            }
                          }}
                      >
                  <Form.Check type="checkbox"
                    // className='mr-2 mt-2'
                    defaultChecked={isSameAddress}
                    name='delivery_address'
                    // onChange={(event) => {
                    //   const checked = event.target.checked
                    //   setAddressCheck(checked)
                    
                    //   if(checked){
                    //     setAddress(data?.avs?.house_number);
                    //     setPostCode(data?.avs?.postcode);
                    //   }else {
                    //     setAddress('')
                    //     setPostCode('')
                    //   }
                     
                    // }}
                    label="Same as delivery" />
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
                <Button
                  className='btn btn-primary btn-block'
                  value='proceed'
                  type='submit'
                  disabled={
                    data?.billing_address_req ? !( billingAddress.length && postCode.length && (cvv.length === 3) )  : !(cvv.length === 3)
                  }
                >
                  Pay &nbsp;{decodeHtml(data?.currency_sign ? data.currency_sign : data.country_info?.currency_sign)} {parseFloat(data.total).toFixed(2)}
                </Button>
              </Form>
            </Card.Body>
            {/* <div className=''>
              <Link
                style={{ fontSize: '12px', fontWeight: 500 }}
                to={`/${providerName}/?data=${encryptData}&response=${base64Data}`}
                className='nav-link text-left'
              >
                <i className='fe fe-arrow-left'>Back</i>
              </Link>
            </div> */}
          </Card>
        </div>
      </Container>
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
