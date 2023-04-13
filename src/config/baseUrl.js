module.exports.baseUrl = {
  switch: process.env.REACT_APP_SWITCH_URL ? process.env.REACT_APP_SWITCH_URL : require('./local_environment').switchUrl,
  earth: process.env.REACT_APP_EARTH_URL ? process.env.REACT_APP_EARTH_URL : require('./local_environment').earthUrl,
  pluto: process.env.REACT_APP_PLUTO_URL ? process.env.REACT_APP_PLUTO_URL: require('./local_environment').plutoUrl,
  checkout: process.env.REACT_APP_CHECKOUT_URL ? process.env.REACT_APP_CHECKOUT_URL : require('./local_environment').checkoutUrl,
  paystack: process.env.REACT_APP_PAYSTACK_URL ? process.env.REACT_APP_PAYSTACK_URL : require('./local_environment').paystackUrl,
  dnaUrl: process.env.REACT_APP_DNA_URL ? process.env.REACT_APP_DNA_URL: require('./local_environment').dnaUrl,
  antar: process.env.REACT_APP_ANTAR_URL ? process.env.REACT_APP_ANTAR_URL: require('./local_environment').antarUrl,
  paymentEnvironemnt: process.env.REACT_APP_PAYMENT_ENVIRONMENT ? process.env.REACT_APP_PAYMENT_ENVIRONMENT: require('./local_environment').paymentEnvironemnt,
};

module.exports.envVar = {
  adyenClientKey: process.env.REACT_APP_ADYEN_CLIENT_KEY ? process.env.REACT_APP_ADYEN_CLIENT_KEY : require('./local_environment').adyenClientKey,
  adyenPaymentEnvironemnt: process.env.REACT_APP_ADYEN_PAYMENT_ENVIRONMENT ? process.env.REACT_APP_ADYEN_PAYMENT_ENVIRONMENT : require('./local_environment').adyenPaymentEnvironemnt,
}