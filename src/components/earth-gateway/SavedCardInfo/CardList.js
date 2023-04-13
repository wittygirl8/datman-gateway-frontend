import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import {baseUrl} from '../../../config/baseUrl'
import images from './images';
import { helpers } from '../../../helpers';


const CARD_TYPES = {
  mastercard: 'MasterCard',
  visa: 'Visa',
  amex: 'American E',
  dinner_club: 'Diners Clu',
  jcb: 'JCB',
  maestro: 'maestro'
};

const CardList = ({ token, data, encryptData, base64Data}) => {
  const [cardImage, setCardImage] = useState(images.placeholder);
  // const [DeleteCard, setdeleteCard] = useState('here');
  const [loading, setLoading] = useState(false);
  // const [isDeleted, setIsDeleted] = useState(false);
  const [providerName, setProviderName] = useState("");

  useEffect(() => {
    if (token.card_scheme === CARD_TYPES.mastercard) {
      setCardImage(images.mastercard);
    } else if (token.card_scheme === CARD_TYPES.visa) {
      setCardImage(images.visa);
    } else if (token.card_scheme === CARD_TYPES.amex) {
      setCardImage(images.amex);
    } else if (token.card_scheme === CARD_TYPES.dinner_club) {
      setCardImage(images.dinersclub);
    } else if (token.card_scheme === CARD_TYPES.jcb) {
      setCardImage(images.jcb);
    } else if (token.card_scheme === CARD_TYPES.maestro) {
      setCardImage(images.maestro);
    } else {
      setCardImage(images.placeholder);
    }

    var { name } = helpers.GetProviderConfig(data.provider)
    setProviderName(name)

  })
/*
  const deleteCard = async (token) => {
    console.log('token',token);
    setLoading(true);
    const url = `${baseUrl.earth}/cc-token/${token}`

      const response = await axios.post(url, { data: encryptData })

      if (response.status === 200) {
        setIsDeleted(true)
      }
  }
  if(isDeleted){
    return (<></>)
  }
  */
  return (
    
    <Card className='mb-2'>
      <Link to={{
            pathname: `/${providerName}/pay`,
            state: { data, token, encryptData, base64Data },
        }} className="nav-link">
          
          <Card.Body className='m-1'>
            <img style={{
                height: '1.5em',
                width: '2em'
              }} src={`${cardImage || images.placeholder}`}>
            </img>&nbsp;&nbsp;**** **** **** {token.last_four_digits}
            {/* <button onClick={(e) => { e.preventDefault();setdeleteCard(`delete-${token}`); }} className="btn btn-sm btn-light float-right"><i className='fa fa-trash float-right'></i></button> */}
            {/* <Link to="#" onClick={(e) => { e.preventDefault();setdeleteCard(`delete-${token}`); }}><i className='fa fa-trash float-right' style={{"color":"#a20b0b"}}></i></Link> */}
          </Card.Body>
          {
            /*
            DeleteCard === `delete-${token}` 
            ? 
              !loading ?
              <div className="float-right">
                <p className="text-muted" style={{"fontSize":"12px"}}>
                  Delete this card ?&nbsp;&nbsp;&nbsp;
                  <button onClick={(e) => { e.preventDefault();deleteCard(token.token); }} className="btn btn-danger btn-sm" type="button" style={{"padding":"0px 6px 0px 6px"}}> Yes</button>&nbsp;
                  <button onClick={(e) => { e.preventDefault();setdeleteCard(''); }} className="btn btn-light btn-sm" type="button" style={{"padding":"0px 6px 0px 6px"}}> No</button>
                </p>
              </div> 
              : <i className='fa fa-spinner fa-pulse float-right'></i>
          : null
              */
          } 
        </Link>
        
    </Card>
  )
}

export default CardList
