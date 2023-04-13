import valid from 'card-validator'

export const configureDNAPayments = async (data, paymentEnvironemnt) => {
    console.log('paymentEnvironemnt: ', paymentEnvironemnt);
    let configObj = {
        isTestMode: paymentEnvironemnt !== 'test' ? false : true,
        isEnableDonation: true,
        autoRedirectDelayInMs: 3000,
        paymentMethods: [
            { name: window.DNAPayments.paymentMethods.BankCard }
        ],
        events: {
            opened: () => {
                console.log('DNA Checkout opened');
            },
            cancelled: () => {
                console.log('Transaction cancelled');
                window.location.replace(data?.failureReturnUrl);
            },
            paid: () => {
                console.log('Transaction successful');
            },
            declined: () => {
                console.log('Transaction declined');
            }
        }
    };

    if (data?.tokenDetails) {
        let card = data.tokenDetails;
        const cardTypeInfo = valid.creditCardType.getTypeInfo(card.scheme_name?.toLowerCase());

        configObj.cards = [{
            merchantTokenId: card.token,
            panStar: `${'*'.repeat(cardTypeInfo.lengths[0] - 4)}${card.last_4_digit}`,
            cardSchemeId: card.scheme_id,
            cardName: card.scheme_name,
            expiryDate: card.expiry_date,
            isCSCRequired: true,
            useStoredBillingData: true
        }];
    }
    // window.DD_LOGS.logger.info(`DNA config Obj: `, { configObj });

    window.DNAPayments.configure(configObj);
}