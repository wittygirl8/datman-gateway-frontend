import AdyenCheckout from '@adyen/adyen-web';
import '@adyen/adyen-web/dist/adyen.css';
import { envVar } from '../../config/baseUrl';

export const handleRedirect = async (sessionId, redirectResult, setLoading) => {
    setLoading(true);
    const configuration = {
        environment: envVar.adyenPaymentEnvironemnt, // Change to 'live' for the live environment.
        clientKey: envVar.adyenClientKey, // Public key used for client-side authentication: https://docs.adyen.com/development-resources/client-side-authentication
        session: {
            id: sessionId, // Retreived identifier for the payment completion on redirect.
        },
        onPaymentCompleted: (result, component) => {
            console.info("payment result: ", result);
            const paymentResult = result.resultCode;
            if (paymentResult === 'Authorised' || paymentResult === 'Received' || paymentResult === 'AuthenticationNotRequired' || paymentResult === 'AuthenticationFinished') {
                document.getElementsByClassName('adyen-checkout__status adyen-checkout__status--success').innerHTML = '<img alt="Success" src="https://checkoutshopper-test.adyen.com/checkoutshopper/images/components/success.svg">';
            } else {
                document.getElementsByClassName('adyen-checkout__status adyen-checkout__status--success').innerHTML = '<img alt="Error" src="https://checkoutshopper-test.adyen.com/checkoutshopper/images/components/error.svg">';
            }
        },
        onError: (error, component) => {
            console.error(error.name, error.message, error.stack, component);
        },
    };
    
    // Create an instance of AdyenCheckout to handle the shopper returning to your website.
    // Configure the instance with the sessionId you extracted from the returnUrl.
    const checkout = await AdyenCheckout(configuration);
    
    // const redirectResult = response?.returnUrl + `/?sessionId=${response.id}&redirectResult=X6XtfGC3!Y`
    console.log("redirectResult : ", redirectResult);
    // Submit the redirectResult value you extracted from the returnUrl.
    checkout.submitDetails({ details: { "redirectResult": redirectResult } });
}