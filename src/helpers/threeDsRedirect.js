export const threeDsV1AcsRedirect = async (threeDSreq, metaData) => {
    const { acsUrl, md, paReq, termUrl } = threeDSreq

    postToBank(
      acsUrl,
      {
        MD: md,
        PaReq: paReq,
        TermUrl: termUrl,
      },
      'POST',
      metaData
    )
}

export const threeDsV2AcsRedirect = async (threeDSreq, metaData) => {
  console.log({threeDSreq})
  const { threeDSURL, threeDSMethodData } = threeDSreq
  

    postToBank(
      threeDSURL,
      {
        threeDSMethodData
      },
      'POST',
      metaData
    )
}

export const AcsRedirect = (threeDSreq) => {
  // window.DD_LOGS.logger.info(`3dsv2 state debug - landed at acs redirect function`, {threeDSreq})
  console.log({threeDSreq})
  const { action } = threeDSreq
  if(action === 'creq'){ //3dsv2 acs form submit
    // window.DD_LOGS.logger.info(`3dsv2 state debug - The action is creq `, {threeDSreq})
    const { threeDSURL, creq } = threeDSreq
    postToBank(
      threeDSURL,
      {
        "creq" : creq
      },
      'POST'
    )
  }if(action === 'PaReq'){ //3dsv1 acs form submit
    // window.DD_LOGS.logger.info(`3dsv2 state debug - The action is Pareq - 3ds1 submit`, {threeDSreq})
    console.log({threeDSreq})
    threeDsV1AcsRedirect(threeDSreq)
  }
  
}


function postToBank(path, params, method, metaData) {
  method = method || 'POST'

  let form = document.createElement('form')
  form.setAttribute('id', 'send-form')
  form.setAttribute('method', method)
  form.setAttribute('action', path)

  for (let key in params) {
    if (params.hasOwnProperty(key)) {
      let hiddenField = document.createElement('input')
      hiddenField.setAttribute('type', 'hidden')
      hiddenField.setAttribute('name', key)
      hiddenField.setAttribute('value', params[key])

      form.appendChild(hiddenField)
    }
  }
 
  document.body.appendChild(form)
  // window.DD_LOGS.logger.info(`3dsv2 state debug - Redirecting to bank... ${metaData?.orderId} `)
  form.submit()
  
}