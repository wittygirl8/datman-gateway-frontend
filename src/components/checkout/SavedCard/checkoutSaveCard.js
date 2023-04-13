import React, { useState, useEffect } from 'react'
import { Container, Form, Button, Card } from 'react-bootstrap'
import Spinner from '../../common/Spinner';
import {baseUrl} from '../../../config/baseUrl';
import { decodeHtml } from '../../../config/helper';

export default function CheckoutSaveCard({ encryptedData, base64Data }) {
    // let BackendUrl = 'http://localhost:4007/dev/api/v1/sale/hosted?data='
    let BackendUrl = baseUrl.checkout + '/v1/sale/hosted?data=';
    const [cvv, setCvv] = useState('')
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({});
    const [token, setToken] = useState(null);

    const onFormSubmit = (e) => {
        e.preventDefault();
        console.log("onFormSubmit", e.target.cvc.value);
        setCvv(e.target.cvc.value)
        setLoading(true)
        window.location.replace(BackendUrl + encryptedData + `&v=${cvv}`);
    }

    useEffect(() => {
        setLoading(true);
        const decryptData = (data) => {
            let bufferObjj = Buffer.from(data, "base64"); // Create a buffer from the string
            let decodedString = JSON.parse(bufferObjj.toString("utf8")) // Encode the Buffer as a utf8 string

            let { token } = decodedString;
            setToken(token[0]);
            setData(decodedString);
            setLoading(false);
        }
        base64Data && decryptData(base64Data);
    }, [base64Data]);

    const allowOnlyNumber = (value) => {
        const re = /^[0-9\b]+$/
        if (value === '' || re.test(value)) {
            return true
        }
        return false
    }

    return (
        loading ? <Spinner message='Please wait redirecting to 3ds' /> :
            <>
                <Container className='mt-4 col d-flex justify-content-center'>
                    <div className=' col-sm-7 col-md-5 col-lg-6 col-xl-4 '>
                        <Card>
                            <Card.Body>
                                <Form onSubmit={onFormSubmit}>
                                    <p className='lead'>
                                        Card Ending With {token?.last_four_digits}
                                    </p>
                                    <small>
                                        Please enter your CVV.
                                    </small>

                                    <Form.Group>
                                        <Form.Label className='float-left'>CVV </Form.Label>
                                        <Form.Control
                                            inputMode='numeric'
                                            type='tel'
                                            name='cvc'
                                            autoComplete='cc-csc'
                                            autoFocus="on"
                                            placeholder='CCV'
                                            className='shaow-sm  form-control '
                                            pattern='[0-9]*'
                                            value={cvv}
                                            minLength={3}
                                            maxLength={4}
                                            required
                                            onChange={(event) => {
                                                const value = event.target.value
                                                if (allowOnlyNumber(value)) setCvv(value)
                                            }}
                                        />
                                    </Form.Group>
                                    <Button
                                        className='btn btn-primary btn-block'
                                        value='proceed'
                                        type='submit'
                                        disabled={!(cvv.length >= 3)}
                                    >
                                        Pay &nbsp;{decodeHtml(data.currency_sign ? data.currency_sign : data.country_info.currency_sign)} {parseFloat(data.total).toFixed(2)}
                                    </Button>
                                </Form>
                            </Card.Body>

                        </Card>
                    </div>
                </Container>
            </>
    )
}
