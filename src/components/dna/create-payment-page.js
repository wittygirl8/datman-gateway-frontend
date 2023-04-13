
export const createPaymentPage = async (metadata, authDetials, dnaBaseUrl) => {
    let paymentRequest = {
        invoiceId: metadata?.omt,
        currency: metadata?.currency,
        paymentSettings: {
            terminalId: metadata?.terminalId,
            returnUrl: metadata?.returnUrl,
            failureReturnUrl: metadata?.failureReturnUrl,
            callbackUrl: `${dnaBaseUrl}/hosted-form/webhook`,
            failureCallbackUrl: `${dnaBaseUrl}/hosted-form/webhook`
        },
        customerDetails: {
            billingAddress: {
                firstName: metadata?.firstName,
                lastName: metadata?.lastName
            },
            email: metadata?.email,
            firstName: metadata?.firstName,
            lastName: metadata?.lastName,
        },
        amount: metadata?.total / 100,
        auth: {
            access_token: authDetials.access_token,
            expires_in: authDetials.expires_in,
            scope: authDetials.scope,
            token_type: authDetials.token_type
        }
    };

    metadata?.mode && ( paymentRequest.entryMode = metadata?.mode === 'phone_payment' ? 'telephone-order' : 'mail-order' );

    window.DNAPayments.openPaymentPage(paymentRequest);
}
