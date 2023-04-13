import React, { useState, useEffect } from 'react'
import {Buffer} from 'buffer';
import queryString from 'query-string'
import { Container } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import {baseUrl} from '../../../config/baseUrl'
import axios from 'axios'
import CardList from './CardList'
import Spinner from '../../common/Spinner'
import FailurePage from '../FailurePage'
import CheckoutForm from '../CheckoutForm/CheckoutForm'
import PhonePaymentCheckoutForm from '../PhonePaymentCheckout/PhonePCheckoutForm';
import { helpers } from '../../../helpers';

const SavedCC = () => {
  const [encryptedData, setEncryptedData] = useState('')
  const [base64Data, setBase64Response] = useState('')
  const [data, setData] = useState({})
  const [message, setMessage] = useState('')
  const [failedMessage, setFailedMessage] = useState('')
  const [token, setToken] = useState([])
  const [loading, setLoading] = useState(false)
  const [failure, setFailure] = useState(false)
  const [paid, setPaid] = useState(false);
  const [exist, setExist] = useState(false);
  const [cancelUrl, setCancelUrl] = useState('')
  const [phonePMode, setPhonePaymentMode] = useState(false);

  const [providerName, setProviderName] = useState("");

  const renderCard = token.map((_token, i) => {
    return (
      <CardList
        token={_token}
        data={data}
        key={i}
        encryptData={encryptedData}
        base64Data={base64Data}
      />
    )
  })

  useEffect(() => {
    const url = window.location.href
    const params = queryString.parseUrl(url)

    const encryptedData = params.query.data
    const base64EncryptedData = params.query.response

    setEncryptedData(encryptedData)
    setBase64Response(base64EncryptedData)
    
    const decryptData = async (decryptData, apiCall = true) => {
      try {
        if(apiCall){
          let data = decryptData
          let  response = await axios.post(`${baseUrl.earth}/decrypt`, { data })
          var { token } = response.data.data
          setData(response.data.data)

          var { name } = helpers.GetProviderConfig()
          setProviderName(name)

        }else{
          let bufferObjj = Buffer.from(decryptData, "base64"); // Create a buffer from the string
          let decodedString = JSON.parse(bufferObjj.toString("utf8")) // Encode the Buffer as a utf8 string

          var { token } = decodedString;
          setData(decodedString)

          if(decodedString.phone_payment){
            setPhonePaymentMode(true)
          }

          var { name } = helpers.GetProviderConfig(decodedString.provider)
          setProviderName(name)
        }

        setToken(token)
        setLoading(true)

      } catch (error) {
        console.log('Error:======>', error)
        const message = error?.response?.data?.error?.message;
        const redirect_url = error?.response?.data?.error?.redirect_url;
        const failedMessage  = error?.response?.data?.error?.failedMessage;
        if (redirect_url) {
          setPaid(true);
          setTimeout(() => { window.location.replace(redirect_url); }, 2000)

        } else {
          setMessage(message)
          setFailure(true)
          setFailedMessage(failedMessage)
        }
      }
    }

    var functionData = encryptedData
    var apiProp = true
    if(base64EncryptedData && base64EncryptedData != "undefined"){
      functionData = base64EncryptedData;
      apiProp = false
    }
    decryptData(functionData, apiProp)
    //for that time you need to show spinner
  }, []);

  const goBackButton = () => {
    console.log('inside goBackButton');
    window.history.back();
  }

  if (loading) {
    if (token.length && !exist ) {    
return (
<Container className='col d-flex justify-content-center mt-4'>
          <div className='col-sm-7 col-md-5 col-lg-6 col-xl-4'>
          <div className="btn btn-light back-btn-container" onClick={goBackButton}>« Back</div>
      <p> Your Saved Credit and Debit Cards</p>
            {renderCard}
     <div className='text-center mt-4'>
              <Link
              to={{
                  pathname: `/${providerName}/card/?data=${encryptedData}`,
                  state: {
                    data: data,
                    encrypt_data: encryptedData, 
                    exist:true,
                    base64_data: base64Data
                  },
                }}
                className='nav-link '
              >
                Add New Card{' '}
                <p>
                  <i className='fas fa-plus-circle'></i>
                </p>
              </Link>
            </div>
            <footer className='text-center text-muted footer-size mt-3'>
              Powered by <span className='font-weight-bold'>Datman</span>
            </footer>

          </div>
        </Container>
      )
     
      } else if(phonePMode) {
      return <PhonePaymentCheckoutForm data={data} encryptData={encryptedData} exist={exist} base64Data={base64Data} goBackButton ={goBackButton} />
    } else {
      return <CheckoutForm data={data} encryptData={encryptedData} exist={exist} base64Data={base64Data} goBackButton={goBackButton} />
    }
  } else {
    if (!failure) {
      return <Spinner message={`${!paid && !failure ? 'Please wait' : 'Redirecting to merchant site'}`} />
    } else {
      return (
        <FailurePage
          encryptData={encryptedData}
          message={message}
          cancelUrl={cancelUrl}
          base64Data={base64Data}
          dataDecode={data}
          failedMessage={failedMessage}
        />
      )
    }
  }
}

export default SavedCC


//encrypted data stored in sessionStorage to avoid keep calling it everytime page refreshes
// let encSession = sessionStorage.getItem('encSession')
// encSession = encSession ? JSON.parse(encSession) : null;
// let response;
// if(encSession && encSession.encryptedData === encryptedData){
//   response = encSession.response;
// }else{
    //response = await axios.post(`${baseUrl.earth}/decrypt`, { data })
    //sessionStorage.setItem('encSession',JSON.stringify({encryptedData,response}))
// }
