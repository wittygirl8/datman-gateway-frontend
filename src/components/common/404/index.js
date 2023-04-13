import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Notfound extends Component {
  componentDidMount() {
    document.title = 'Datman - 404';
    document.body.classList.add('bg-auth');
    document.body.classList.add('d-flex');
    document.body.classList.add('align-items-center');
    document.body.classList.add('border-top');
    document.body.classList.add('border-top-2');
    document.body.classList.add('border-primary');
    document.getElementById('root').className = 'container';
  }

  componentWillUnmount() {
    document.body.classList.remove('bg-auth');
    document.body.classList.remove('d-flex');
    document.body.classList.remove('align-items-center');
    document.body.classList.remove('border-top');
    document.body.classList.remove('border-top-2');
    document.body.classList.remove('border-primary');
    document.getElementById('root').className = '';
  }

  render() {
    return (
      <>
        <div className='container'>
          <div className='row justify-content-center'>
            <div className='col-12 col-md-5 col-xl-4 my-5'>
              <div className='text-center'>
                <h6 className='text-uppercase text-muted mb-4'>404 error</h6>

                <h1 className='display-4 mb-3'>
                  There’s no page here{' '}
                  {/* <span aria-label='jsx-a11y/accessible-emoji' role='img'>
                    😭
                  </span> */}
                </h1>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default Notfound;
