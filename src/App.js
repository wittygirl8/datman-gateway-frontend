import React from 'react'
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom'

//importing components
//common components
import NotFound from './components/common/404'

//switch components
import SwitchPage from './components/switch'
import AcsRedirectPage from './components/common/AcsRedirect'

//dna components
import DnaHostedPage from './components/dna'

// antar component
import AntarPage from './components/antar';

//EG components
import CCard from './components/earth-gateway/CheckoutForm'
import SavedCardInfo from './components/earth-gateway/SavedCardInfo'
import CVVInfo from './components/earth-gateway/SavedCardInfo/CVVInfo'
import EarthError from './components/earth-gateway/Error'
import CheckoutHosted from './components/checkout/Redirects'
import SavedCard from './components/checkout/SavedCard';
import PaystackHosted from './components/paystack/Redirects'
import AddCardCs from './components/earth-gateway/AddCard'
import './App.css'
import './style.css'
function App() {
  return (
    <Router>
      <Switch>
        <Route path="/(earth|pluto)/"  exact component={SavedCardInfo} />
        <Route path='/(earth|pluto)/card' component={CCard} />
        <Route path='/(earth|pluto)/addcard' component={AddCardCs} />
        <Route path='/(earth|pluto)/pay' component={CVVInfo} />
        <Route path='/(checkout)/pay' component={CheckoutHosted} />
        <Route path='/(checkout)/save-card' component={SavedCard} />
        <Route path='/paystack/pay' component={PaystackHosted} />
        <Route path='/(earth|pluto)/error/:data/:base64Data?' component={EarthError} />
        <Route path='/earth/AcsRedirect/:data' component={AcsRedirectPage} />
        <Route path='/dna' component={DnaHostedPage} />
        <Route path='/antar' component={AntarPage} />
        <Route path='/:data' component={SwitchPage} />
        <Route component={NotFound} />
      </Switch>
    </Router>
  )
}

export default App

{/* <Route path='/earth/failure' exact component={FailurePage} /> */}

