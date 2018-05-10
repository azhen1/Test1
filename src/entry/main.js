import React from 'react'
import ReactDOM, {render} from 'react-dom'
import 'antd/dist/antd.css'
import { Router, Route, hashHistory, browserHistory, Redirect } from 'react-router'

import App from '../components/app/app'
import Login from '../components/user/login'
import defaultLogin from '../components/user/defaultLogin'
import Register from '../components/user/register'
import ForgetPassword from '../components/user/forgetPassword'
import PositionManager from '../components/positionManager/positionManager'
import PositionManagerEdit from '../components/positionManager/positionManagerEdit/positionManagerEdit'
import AuditionManager from '../components/auditionManager/auditionManager'
import AllCandidate from '../components/candidate/allCandidate'
import DownloadCandidate from '../components/candidate/downloadCandidate'
import MyAgentPage from '../components/agentPage/myAgentPage'
import LookAgentPage from '../components/agentPage/lookAgentPage'
import BusinessInfo from '../components/businessInfo/businessInfo'
import BalanceManager from '../components/balanceManager/balanceManager'
import Information from '../components/information/information'
import ModifiedInfo from '../components/modified/modifiedInfo'
import PositionDetails from '../components/positionManager/Details'
import AuditionDetails from '../components/auditionManager/auditionDetails'
import AgentDetails from '../components/agentPage/agentDetails'
import Certification from '../components/user/certification'
import ChatWindow from '../components/chatWindow/chatWindow'
import JCWebsite from '../components/JCWebsite/JCWebsite'
import AboutUs from '../components/JCWebsite/aboutUs'

render(<Router history={hashHistory}>
        <Route path="login" component={Login}/>
        <Route path="defaultLogin" component={defaultLogin}/>
        <Route path="register" component={Register}/>
        <Route path="forget" component={ForgetPassword}/>
        <Route path="certification" component={Certification}/>
        <Route path="jcWebsite" component={JCWebsite}/>
        <Route path="aboutUs" component={AboutUs} />
        <Redirect from="app" to="/positionManager"/>
        <Redirect from="/" to="/jcWebsite"/>
        <Route path="/" component={App}>
            <Redirect from="/positionManager" to="positionManager/recruitIng"/>
            <Route path="positionManager">
                <Route path="recruitIng" component={PositionManager}/>
                <Route path="recruitIngEdit" component={PositionManagerEdit}/>
            </Route>
            <Redirect from="/auditionManager" to="auditionManager/auditionManagerPar"/>
            <Route path="auditionManager">
                <Route path="auditionManagerPar" component={AuditionManager}/>
            </Route>
            <Route path="allCandidate" component={AllCandidate}/>
            <Route path="downloadCandidate" component={DownloadCandidate}/>
            <Route path="myAgentPage" component={MyAgentPage}/>
            <Route path="information" component={Information}/>
            <Route path="modifiedInfo" component={ModifiedInfo}/>
            <Route path="businessInfo" component={BusinessInfo}/>
            <Route path="agentDetails" component={AgentDetails}/>
            <Route path="chatWindow" component={ChatWindow}/>
            <Route path="auditionDetails" component={AuditionDetails}/>
            <Route path="positionDetails" component={PositionDetails}/>
            <Route path="balanceManager" component={BalanceManager}/>
            <Route path="lookAgentPage" component={LookAgentPage}/>
        </Route>

        <Redirect from="*" to="/"/>
    </Router>, document.getElementById('root')
)

