import React, { useState, useEffect } from 'react'
import {Buffer} from 'buffer';
import queryString from 'query-string'
import FailurePage from '../FailurePage'


const Error = (props) => {
  // console.log(props.match.params)
  const [data, setData] = useState({})
  const base64EncryptedData = decodeURIComponent(props.match.params.base64Data)
  try{
  const url = window.location.href;
  const params = queryString.parseUrl(url);
  var resObj = JSON.parse(params.query.reason);
  var errorCode = resObj?.errorCode;
  var errorMessage = resObj?.errorMessage;
} catch (error){
  console.log(error)
}
  useEffect(() => {

    const decryptData = async (data) => {
      if(data){
        const encryptedData = data
        // Create a buffer from the string
        let bufferObjj = Buffer.from(encryptedData, "base64");
    
        // Encode the Buffer as a utf8 string
        let decodedString = JSON.parse(bufferObjj.toString("utf8"))
    
        setData(decodedString)
      }
    }

    decryptData(base64EncryptedData)
  }, [])

  return (
    <>
      <div className='container'>
        <div className='row justify-content-center'>
          {/* <div className='col-12 col-md-5 col-xl-4 my-5'> */}
            {/* <div className='text-center'> */}
            <FailurePage
              encryptData={props.match.params.data}
              message={errorCode}
              base64Data={props.match.params.base64Data}
              dataDecode={data}
              failedMessage={errorMessage}
            />
            {/* </div> */}
          {/* </div> */}
        </div>
      </div>
    </>
  )
};

export default Error;
