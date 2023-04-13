import AdyenCheckout from '@adyen/adyen-web';
import '@adyen/adyen-web/dist/adyen.css';
import { getAdyenPaymentSession } from "./get-session";
import { envVar } from '../../config/baseUrl';
// import { getDecryptedData } from '../../helpers';

export const initiatePayment = async (encryptedData, base64Data, helpers) => {
    try {
        // const { decodedString } = await getDecryptedData(base64Data);
        // const isBillingAddressRequired = decodedString.billing_address_req;
        // console.log('isBillingAddressRequired: ', isBillingAddressRequired);
        const response = await getAdyenPaymentSession(encryptedData, helpers.setMessage);

        const configuration = {
            environment: envVar.adyenPaymentEnvironemnt,
            clientKey: envVar.adyenClientKey,
            session: {
                id: response?.id,
                sessionData: response?.sessionData // The payment session data.
            },
            analytics: {
                enabled: true // Set to false to not send analytics data to Adyen.
            },
            onPaymentCompleted: (result) => {
                console.info("payment result: ", result);
                const paymentResult = result.resultCode;
                if (paymentResult === 'Authorised' || paymentResult === 'Received' || paymentResult === 'AuthenticationNotRequired' || paymentResult === 'AuthenticationFinished') {
                    document.getElementsByClassName('adyen-checkout__status adyen-checkout__status--success').innerHTML = '<img alt="Success" src="https://checkoutshopper-test.adyen.com/checkoutshopper/images/components/success.svg">';
                    setTimeout(() => { window.location.replace(response?.returnUrl + `/?sessionId=${response.id}`); }, 2000);
                } else {
                    document.getElementsByClassName('adyen-checkout__status adyen-checkout__status--success').innerHTML = '<img alt="Error" src="https://checkoutshopper-test.adyen.com/checkoutshopper/images/components/error.svg">';
                }
            },
            onError: (error, component) => {
                console.error(error?.name, error?.message, error?.stack, component);
                helpers.setFailure(true);
                helpers.setLoading(false);
                helpers.setMessage(error?.message);
            },
            // Any payment method specific configuration.
            paymentMethodsConfiguration: {
                card: {
                    hasHolderName: true,
                    holderNameRequired: true,
                    enableStoreDetails: response.mode === 'phone_payment' ? false : true,
                    name: 'Credit or debit card',
                    billingAddressRequired: true,
                    billingAddressMode: 'partial',
                    locale: 'en-GB',
                    translations: {
                        postalCode: "Postal code"
                    }
                }
            }
        };

        initiateCheckout(configuration, helpers.setLoading);
    } catch (error) {
        console.log('Error:======>', error);
        helpers.setFailure(true);
        helpers.setLoading(false);
        let message, redirect_url;
        if (error.response?.data?.error) {
            message = error.response?.data?.error?.message;
            redirect_url = error.response?.data?.error?.redirect_url;
        } else {
            message = error?.message || 'Something went wrong';
        }
        helpers.setMessage(message);
        if (message?.includes('has been already paid') && error.response.status === 409) {
            setTimeout(() => { window.location.replace(redirect_url); }, 2000);
        }
    }
}

const initiateCheckout = async (configuration, setLoading) => {
    setLoading(true);
    console.log("sessionId: ", configuration?.session?.id);
    // Create an instance of AdyenCheckout using the configuration object.
    const checkout = await AdyenCheckout(configuration);

    // Create an instance of Drop-in and mount it to the container you created.
    checkout.create('dropin').mount('#dropin-container');
};