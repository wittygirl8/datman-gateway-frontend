import React from 'react';

const Spinner = (props) => (
  <>
    <div className='container'>
      <div className='row justify-content-center'>
        <div className='col-12 col-md-5 col-xl-4 my-5'>
          <div className='text-center'>
            <h6 className='text-uppercase text-muted mb-4'>{props.greeting}</h6>

            <h2 className='display-4 mb-3'>
              <div
                className='spinner-grow'
                role='status'
                style={{ width: '2rem', height: '2rem' }}
              >
                <span className='sr-only'>Loading...</span>
              </div>
            </h2>

            <p className='text-muted mb-4'>{props.message}</p>
          </div>
        </div>
      </div>
    </div>
  </>
);

export default Spinner;
