import React, { useState } from "react";
import { Button, Form, InputGroup, Alert } from "react-bootstrap";
import axios from "axios";
import valid from "card-validator";
import Cleave from "cleave.js/react";
import "./style.css";
import { baseUrl } from "../../../config/baseUrl";
import Spinner from "../../common/Spinner";
import FailurePage from "../FailurePage";
import { Link } from "react-router-dom";
import { decodeHtml } from "../../../config/helper";
import { trimSpace } from "../../../helpers";

const AMERICAN_EXPRESS = "american-express";
export default function PhonePaymentCheckoutForm({
  data,
  encryptData,
  exist,
  base64Data,
  goBackButton
}) {
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const [cardHolderName, setCardHolderName] = useState("T2S Customer");
  const [card_number, setCardNumber] = useState("");
  const [expDate, setExpDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [card_error, setCardError] = useState(true);
  const [exp_date_error, setExpDateError] = useState(true);
  const [cvv_error, setCVVError] = useState(true);
  const [cvv_length, setCVVLength] = useState(3);
  const [card_length, setCardLength] = useState(16);

  const [error, setError] = useState(false);
  const [message, setMessage] = useState("");
  const [failedMessage, setFailedMessage] = useState("");
  const [cancelUrl, setCancelUrl] = useState();
  const [cashPaymentUrl, setCashPaymentUrl] = useState("");
  const [amexCardError, setAmexCardErrror] = useState(false);

  const [isSameAddress, setAddressCheck] = useState(false);
  const [billingAddress, setAddress] = useState("");
  const [postCode, setPostCode] = useState("");

  const [exp_home_name_error, setHomeNameError] = useState(true);
  const [exp_post_code_error, setPostCodeError] = useState(true);
  const [previousClicked, setPreviousClicked] = useState(false);

  const initiateSale = async (appendedData) => {
    try {
      const url = `${baseUrl.earth}/sale/create`;

      const response = await axios.post(url, { ...appendedData });

      if (response.status === 200) {
        /* //otherwise set loading false and payment successful as true so we can show success msg on same domain
          setLoading(false)
          setPaymentSuccess(true);    */
        //disabling the behaviour of showing success message in the same page, instead redirecting to success Url
        const { redirectUrl } = response.data.data;
        window.location.replace(redirectUrl);
      } else if (response.status === 201) {
        const { threeDSreq } = response.data.data;

        const { acsUrl, md, paReq, termUrl } = threeDSreq;

        function postToBank(path, params, method) {
          method = method || "POST";

          let form = document.createElement("form");
          form.setAttribute("id", "send-form");
          form.setAttribute("method", method);
          form.setAttribute("action", path);

          for (let key in params) {
            if (params.hasOwnProperty(key)) {
              let hiddenField = document.createElement("input");
              hiddenField.setAttribute("type", "hidden");
              hiddenField.setAttribute("name", key);
              hiddenField.setAttribute("value", params[key]);

              form.appendChild(hiddenField);
            }
          }

          document.body.appendChild(form);

          form.submit();
        }

        postToBank(
          acsUrl,
          {
            MD: md,
            PaReq: paReq,
            TermUrl: termUrl,
          },
          "POST"
        );

        //setLoading(false);
      }
    } catch (error) {
      console.log("Error:======>", error.response);
      const { message, failedMessage } =
        error.response.data.errorResponse.error;
      setMessage(message);
      setLoading(false);
      setError(true);
      setFailedMessage(failedMessage);
    }
  };

  const handleSubmit = async (e) => {
    let kountSessionID = "";
    try {
      kountSessionID = localStorage.kSessionId;
    } catch (e) {
      console.log("Something went wrong in accesing - kSessionId ", e);
    }

    e.preventDefault();

    setLoading(true);
    const params = {
      exp_month: expDate.slice(0, 2),
      exp_year: expDate.slice(2),
      save_card: false,
      session_id: kountSessionID,
      billing_address: billingAddress,
      billing_post_code: postCode,
      same_as_delivery_address: isSameAddress,
    };

    const appendedData = {
      data: encryptData,
      card_number,
      cvv,
      ...params,
      base64Data,
    };
    setCancelUrl(data.cancel_url);
    setCashPaymentUrl(data.cash_payment_url);
    initiateSale(appendedData);
  };

  const allowOnlyNumber = (value) => {
    const re = /^[0-9\b]+$/;
    if (value === "" || re.test(value)) {
      return true;
    }
  };

  const alphaNumeric = (value) => {
    var regex = /^[a-z\d\-_\s]+$/i;
    if (regex.test(value)) return true;
    return false;
  };

  const handleInputChange = (text) => {
    if (/^[a-zA-Z\s]+$/.test(text) || text === "") {
      setCardHolderName(text);
    }
  };
  const is_amex_card = card_number.slice(0, 2) == 37;
  return !error && !previousClicked ? (
    !loading && !paymentSuccess ? (
      <>
        <div className="container col d-flex justify-content-center   ">
          {/* <!-- Form --> */}
          <div className='col-sm-7 col-md-5 col-lg-6 col-xl-4 mt-4'>
          <div className='back-btn-container'>
              {exist ?(<Link
                  style={{
                    fontSize: "12px",
                    fontWeight: 500,
                    paddingLeft: 0,
                    paddingTop: 0,
                  }}
                  to={`/earth/?data=${encryptData}&response=${base64Data}`}
                  className="nav-link text-left"
                >
                <div className="btn btn-light">« Back</div>
              </Link>):
              <div className="btn btn-light" onClick={goBackButton}>« Back</div>
              }
            </div>
            <Form onSubmit={handleSubmit} >
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
              <Alert variant="info" show={amexCardError}>
                Sorry, we don’t accept AMEX cards.
              </Alert>

              <Form.Group>
                <div className="text-danger">
                  {`${
                    data.gateway_switched
                      ? "Please re-enter your card details."
                      : ""
                  }`}
                </div>
                <Form.Label className="">Card Information</Form.Label>

                <InputGroup>
                  <Cleave
                    autoFocus
                    options={{ creditCard: true }}
                    type="tel"
                    name="cardnumber"
                    autoComplete="cc-number"
                    placeholder="1234 1234 1234 1234"
                    className={` form-control  ${
                      !card_error ? "error-color" : ""
                    } `}
                    style={{
                      borderBottom: "0",
                      borderBottomLeftRadius: "0",
                    }}
                    required
                    minLength={card_length}
                    value={card_number}
                    onBlur={() => {
                      let isValidCard;
                      if (card_number.length) {
                        isValidCard = valid.number(card_number, {
                          maxLength: 16,
                        });

                        setCardError(isValidCard.isValid);

                        if (
                          isValidCard !== undefined &&
                          isValidCard !== null &&
                          isValidCard.card !== null
                        ) {
                          if (!data.amex_enabled) {
                            if (isValidCard.card.type === AMERICAN_EXPRESS) {
                              setAmexCardErrror(true);
                              setCardNumber("");
                              setCardError(true);
                              return;
                            }
                          }

                          if (isValidCard.card.code.size !== null) {
                            setCVVLength(isValidCard.card.code.size);
                            setCardLength(isValidCard.card.lengths[0]);
                          }
                          if (is_amex_card) {
                            setCVVLength(4);
                          }
                        }
                      } else {
                        setCardError(true);
                      }
                    }}
                    onChange={(event) => {
                      setAmexCardErrror(false);
                      const value = event.target.rawValue;
                      const re = /^[1-9][0-9]*$/; //not to allow with zero
                      if (value === "" || re.test(value)) {
                        setCardNumber(value);
                      }
                    }}
                  />
                  <InputGroup>
                    <Cleave
                      options={{ date: true, datePattern: ["m", "y"] }}
                      placeholder="MM YY"
                      name="cc-exp"
                      style={{ borderTopLeftRadius: "0" }}
                      className={`shadow-sm form-control ${
                        !exp_date_error ? "error-color" : ""
                      } `}
                      pattern="[0-9/]*"
                      type="tel"
                      autoComplete="cc-exp"
                      value={expDate}
                      minLength="5"
                      maxLength="5"
                      required
                      onChange={(event) => {
                        //console.log('event:', event.target.rawValue);
                        const value = event.target.rawValue;
                        if (allowOnlyNumber(value)) setExpDate(value);
                      }}
                      onBlur={() => {
                        let isDateValid;
                        if (expDate.length) {
                          isDateValid = valid.expirationDate(expDate).isValid;

                          setExpDateError(isDateValid);
                        }
                      }}
                    />
                    <Form.Control
                      type="tel"
                      name="cvc"
                      autoComplete="cc-csc"
                      placeholder="CVV"
                      className={`shadow-sm col-md-9 form-control ${
                        !cvv_error ? "error-color" : ""
                      } `}
                      style={{ borderTopRightRadius: "0" }}
                      pattern="[0-9]*"
                      value={cvv}
                      minLength={cvv_length}
                      maxLength={cvv_length}
                      required
                      onChange={(event) => {
                        const value = event.target.value;
                        if (allowOnlyNumber(value)) setCvv(value);
                      }}
                      onBlur={() => {
                        let isValidCVV;
                        if (cvv.length) {
                          isValidCVV = valid.cvv(cvv, cvv_length).isValid;
                          setCVVError(isValidCVV);
                        }
                      }}
                    />
                  </InputGroup>
                </InputGroup>
              </Form.Group>
              <Form.Group>
                <Form.Label className="">Billing Address</Form.Label>
                {trimSpace.trimData(data?.avs?.house) ||
                trimSpace.trimData(data?.avs?.postcode) ? (
                  <span
                    style={{ float: "right", fontSize: "15px" }}
                    onClick={() => {
                      setAddressCheck(!isSameAddress);
                      if (isSameAddress === false) {
                        setAddress(trimSpace.trimData(data?.avs?.house));
                        setPostCode(trimSpace.trimData(data?.avs?.postcode));
                        setHomeNameError(true);
                        setPostCodeError(true);
                      } else if (isSameAddress === true) {
                        setAddress("");
                        setPostCode("");
                        if (!billingAddress) {
                          setHomeNameError(false);
                        }

                        if (!postCode) {
                          setPostCodeError(false);
                        }
                      }
                    }}
                  >
                    <Form.Check
                      type="checkbox"
                      // className='mr-2 mt-2'
                      checked={isSameAddress}
                      name="delivery_address"
                      // onChange={(event) => {
                      //   setAddressCheck(event.target.checked)
                      //   if(event.target.checked){
                      //     setAddress(data?.avs?.house)
                      //     setPostCode(data?.avs?.postcode)
                      //     setHomeNameError(true)
                      //     setPostCodeError(true)
                      //   }else if(!event.target.checked){
                      //     setAddress("")
                      //     setPostCode("")
                      //     if(!billingAddress){
                      //       setHomeNameError(false)
                      //     }

                      //     if(!postCode){
                      //       setPostCodeError(false)
                      //     }
                      //   }
                      // }}
                      label="Same as delivery"
                    />
                  </span>
                ) : null}
                <InputGroup>
                  <Form.Control
                    placeholder="Address Line 1"
                    name="house-number"
                    // disabled={isSameAddress ? true : false}
                    value={billingAddress}
                    style={{ borderBottomLeftRadius: "0", borderBottom: "0" }}
                    className={` form-control ${
                      !exp_home_name_error ? "error-color" : ""
                    } `}
                    maxLength="100"
                    onChange={(event) => {
                      const value = event.target.value;
                      setAddress(value);
                    }}
                    onBlur={() => {
                      var validValue = alphaNumeric(billingAddress);
                      if (!isSameAddress && !billingAddress) {
                        setHomeNameError(false);
                      } else {
                        setHomeNameError(true);
                      }
                      if (!validValue) {
                        setHomeNameError(false);
                      }
                    }}
                  />

                  <InputGroup>
                    <Form.Control
                      placeholder="Postcode"
                      name="post-code"
                      // disabled={isSameAddress ? true : false}
                      value={postCode}
                      style={{
                        borderTopLeftRadius: "0",
                        borderBottomRightRadius: "0.25em",
                        width: "50%",
                      }}
                      className={`shadow-sm form-control ${
                        !exp_post_code_error ? "error-color" : ""
                      } `}
                      maxLength="8"
                      onChange={(event) => {
                        const value = event.target.value.toUpperCase();
                        setPostCode(value);
                      }}
                      onBlur={() => {
                        var validPost = alphaNumeric(postCode);
                        if (!isSameAddress && !postCode) {
                          setPostCodeError(false);
                        } else {
                          setPostCodeError(true);
                        }
                        if (!validPost) {
                          setPostCodeError(false);
                        }
                      }}
                    />
                  </InputGroup>
                </InputGroup>
              </Form.Group>

              <div>
                <Button
                  variant="primary"
                  block
                  type="submit"
                  disabled={
                    !card_error ||
                    !cvv_error ||
                    !exp_date_error ||
                    !cardHolderName.length ||
                    !card_number.length ||
                    !exp_home_name_error ||
                    !exp_post_code_error ||
                    (!isSameAddress && !billingAddress) ||
                    (!isSameAddress && !postCode)
                  }
                >
                  Pay &nbsp;{decodeHtml(data.currency_sign)}{" "}
                  {parseFloat(data.total).toFixed(2)}
                </Button>
                <Button
                  variant="link"
                  type="submit"
                  disabled={loading}
                  data-loading-text="Processing, please wait..."
                  onClick={(e) => {
                    setCashPaymentUrl(data.cash_payment_url);
                    setPreviousClicked(true);
                  }}
                >
                  <i className="fe fe-arrow-left">Previous</i>
                </Button>
              </div>
            </Form>
            {/* <div className="">
              {exist ? (
                <Link
                  style={{
                    fontSize: "12px",
                    fontWeight: 500,
                    paddingLeft: 0,
                    paddingTop: 0,
                  }}
                  to={`/earth/?data=${encryptData}&response=${base64Data}`}
                  className="nav-link text-left"
                >
                  <i className="fe fe-arrow-left">Back</i>
                </Link>
              ) : null}
            </div> */}
            <p className="text-muted text-center">
              <small>
                <i className="fas fa-lock"></i> Your card information is
                encrypted
              </small>
            </p>
          </div>
        </div>
      </>
    ) : paymentSuccess ? (
      <p className="lead text-center mt-5">Your payment is successful</p>
    ) : (
      <Spinner message="Please wait while we process your payment" />
    )
  ) : (
    <FailurePage
      encryptData={encryptData}
      message={message}
      cancelUrl={cancelUrl}
      base64Data={base64Data}
      showCashPaymentBtn={true}
      cashPaymentUrl={cashPaymentUrl}
      failedMessage={failedMessage}
    />
  );
}
