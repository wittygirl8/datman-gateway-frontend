import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as Sentry from '@sentry/react';
// If taking advantage of automatic instrumentation (highly recommended)
import { BrowserTracing } from "@sentry/tracing";


Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DNS,
  // This enables automatic instrumentation (highly recommended), but is not
  // necessary for purely manual usage
  integrations: [new BrowserTracing()],

  // To set a uniform sample rate
  tracesSampleRate: 0.2


});

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
try {
  localStorage.setItem("REACT_APP_SENTRY_DNS", process.env.REACT_APP_SENTRY_DNS)
}
catch (e) {
  console.error("some issue encounted in setting REACT_APP_SENTRY_DNS")
}
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
