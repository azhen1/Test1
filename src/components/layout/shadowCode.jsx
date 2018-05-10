import React from 'react'
import './layout.less'

const shadowCode = React.createClass({
    getInitialState () {
        return {

        }
    },
    pushPop () {
        let popElem = document.getElementsByClassName('popMain')[0]
        popElem.classList.remove('pull')
        popElem.classList.add('push')
    },
    render () {
        return (
            <div className='popMain'>
                <div className="popImg">
                    <div className='closeBtn' onClick={() => this.pushPop()}></div>
                </div>
            </div>
        )
    }
})

export default shadowCode
