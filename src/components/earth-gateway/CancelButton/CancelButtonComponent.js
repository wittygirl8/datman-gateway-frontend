import React from 'react'
import { Button} from 'react-bootstrap'


const CancelButtonComponent = (props) => {
    const { loading, handleCancelEvent} = props;
    return( <div className=' mt-1'>
                    <Button
                        variant='primary'
                        block
                        type='submit'
                        disabled={loading}
                        data-loading-text='Processing, please wait...'
                        onClick={handleCancelEvent}
                    >
                        {!loading ? (
                            'Cancel'
                        ) : (
                            <>
                                <div
                                    className='spinner-border spinner-border-sm'
                                    role='status'
                                />
                                Please Wait...
                            </>
                        )}
                    </Button>
              
        </div>
    )
}

export default CancelButtonComponent
