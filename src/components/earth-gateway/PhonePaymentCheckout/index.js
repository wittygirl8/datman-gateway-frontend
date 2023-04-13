import React, {useState, useEffect} from 'react'

import PhonePaymentCheckoutForm from './PhonePCheckoutForm'
function PCCard(props) {
  const {data, encrypt_data,exist, base64_data} = props.location.state

  return <PhonePaymentCheckoutForm data={data} encryptData={encrypt_data} exist={exist} base64Data={base64_data}/>
}

export default PCCard
