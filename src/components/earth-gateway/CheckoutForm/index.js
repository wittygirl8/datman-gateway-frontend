import React, {useState,useEffect} from "react";

import CheckoutForm from "./CheckoutForm";
import FailToLoadPage from '../FailToLoadPage';

function CCard(props) {
  useEffect(() => {}, []);

  try {
    // const { data, encrypt_data, exist, base64_data } = props.location.state;

    const data = props.location.state?.data;
    const encrypt_data = props.location.state?.encrypt_data;
    const exist = props.location.state?.exist;
    const base64_data = props.location.state?.base64_data;

    const goBackButton = () => {
      console.log('inside EG goBackButton');
      window.history.back();
    }

    if(!data) {
      console.log("Page crashed!");

    return (
      <FailToLoadPage
        encryptData={encrypt_data}
        message= {`Payment Failed: 80${Math.floor(Math.random()*(999-1+1)+1)}`}
        base64Data={base64_data}
        goBackButton={goBackButton}
      />
    );
    }

    return (
      <CheckoutForm
        data={data}
        encryptData={encrypt_data}
        exist={exist}
        base64Data={base64_data}
        goBackButton={goBackButton}
      />
    );
  } catch (error) {
    console.log(`error:${error}`);
  }
}

export default CCard;
