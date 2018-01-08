import React from 'react'
import {Input, Upload, Icon, Modal, message} from 'antd'
import {getRequest, postRequest} from '../../common/ajax'
import './certification.less'

let Certification = React.createClass({
    getInitialState () {
        return {
            previewVisible: false,
            previewImage: '',
            fileList: [],
            formList: {
                userName: '',
                zhiWei: '',
                companyName: '',
                companyJian: ''
            },
            hasSave: false,
            isLookThrough: false,
            picName: '',
            memberId: ''
        }
    },
    componentDidMount () {
        let hash = window.location.hash
        hash = hash.split('?')[1].split('=')[1]
        this.setState({
            memberId: hash
        })
    },
    handleCancel () {
        this.setState({
            previewVisible: false
        })
    },
    handlePreview (file) {
        this.setState({
            previewImage: file.url || file.thumbUrl,
            previewVisible: true
        })
    },
    handleChange ({ fileList }) {
        let result = ''
        fileList.forEach((v, index) => {
            if (v.response !== undefined) {
                result = v.response.data
            }
        })
        this.setState({
            fileList: fileList,
            picName: result
        })
    },
    formListChangeFn (e, type) {
        let {formList} = this.state
        let val = e.target.value
        formList[type] = val
        this.setState({
            formList: formList
        })
    },
    onSave () {
        this.setState({
            hasSave: true
        }, () => {
            let {formList, picName, memberId} = this.state
            let values = Object.values(formList)
            let hasNull = false
            let formData = {}
            values.map((v, index) => {
                if (v === '') {
                    hasNull = true
                }
            })
            if (picName === '') {
                hasNull = true
            }
            if (hasNull) {
                message.warning('你有信息尚未填写或者未上传企业执照片，请完善信息！')
            } else {
                formData.userName = formList.userName
                formData.userPosition = formList.zhiWei
                formData.name = formList.companyName
                formData.shortName = formList.companyJian
                formData.licencePic = picName
                formData.memberId = memberId
                this.reqShenHe(formData)
            }
        })
    },
    // 提交审核
    reqShenHe (formData) {
        let URL = 'member/company/updateCheckInformation'
        let _th = this
        postRequest(true, URL, JSON.stringify(formData), true).then(function (res) {
            let code = res.code
            if (code === 0) {
                message.success('提交成功，正在审核中...!')
                _th.setState({
                    isLookThrough: true
                })
            } else {
                message.error('系统错误!')
            }
        })
    },
    render () {
        let {previewVisible, previewImage, fileList, formList, hasSave, isLookThrough, picName} = this.state
        let inputStyle = {width: '500px', backgroundColor: '#E6F5FF'}
        let imgsURL = 'http://dingyi.oss-cn-hangzhou.aliyuncs.com/images/'
        const uploadButton = (
            <div>
                <Icon type="plus" style={{fontSize: '24px'}}/>
                <div className="ant-upload-text">Upload</div>
            </div>
        )
        return (
            <div className='Certification'>
                <div className="content">
                    <div className='header'>
                        资质认证
                    </div>
                    <div className='form'>
                        <div className='leftBox'>
                            <div className='inputBox'>
                                <label className='lable'>账号使用者</label>
                                {isLookThrough && formList.userName !== '' ? <span className='isLookThroughText'>{formList.userName}</span> : <Input placeholder="请输入姓名"
                                       style={hasSave && formList.userName === '' ? {...inputStyle, borderColor: 'red'} : inputStyle} size='large'
                                       onChange={(e) => this.formListChangeFn(e, 'userName')} value={formList.userName}/>}
                            </div>
                            <div className='inputBox'>
                                <label className='lable'>职位</label>
                                {isLookThrough && formList.zhiWei !== '' ? <span className='isLookThroughText'>{formList.zhiWei}</span> : <Input placeholder="请输入职位"
                                       style={hasSave && formList.zhiWei === '' ? {...inputStyle, borderColor: 'red'} : inputStyle} size='large'
                                       onChange={(e) => this.formListChangeFn(e, 'zhiWei')} value={formList.zhiWei}/>}
                            </div>
                            <div className='inputBox'>
                                <label className='lable'>公司名称</label>
                                {isLookThrough && formList.companyName !== '' ? <span className='isLookThroughText'>{formList.companyName}</span> : <Input placeholder="请输入公司名称"
                                       style={hasSave && formList.companyName === '' ? {...inputStyle, borderColor: 'red'} : inputStyle} size='large'
                                       onChange={(e) => this.formListChangeFn(e, 'companyName')} value={formList.companyName}/>}
                            </div>
                            <div className='inputBox'>
                                <label className='lable'>公司简称</label>
                                {isLookThrough && formList.companyJian !== '' ? <span className='isLookThroughText'>{formList.companyJian}</span> : <Input placeholder="请输入公司简称"
                                       style={hasSave && formList.companyJian === '' ? {...inputStyle, borderColor: 'red'} : inputStyle} size='large'
                                       onChange={(e) => this.formListChangeFn(e, 'companyJian')} value={formList.companyJian}/>}
                            </div>
                            {!isLookThrough ? <div className='upLoad'>
                                <div className='lable'>上传营业执照</div>
                                <span className='upLoadChild'>
                                    <Upload
                                        action="member/platformMember/upload"
                                        listType="picture-card"
                                        fileList={fileList}
                                        onPreview={this.handlePreview}
                                        onChange={this.handleChange}
                                    >
                                      {fileList.length >= 1 ? null : uploadButton}
                                    </Upload>
                                    <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
                                      <img alt="example" style={{ width: '100%' }} src={previewImage} />
                                    </Modal>
                                </span>
                            </div> : <span className='showLogo' style={{background: `url(${imgsURL}${picName}) no-repeat`}}></span>}
                            <div className='takeCare'>
                                <label className='lable'>注意：</label>
                                <span className='val'>
                                    <div>不支持电子版营业执照，要求文字清晰可辨识</div>
                                    <div>不支持电子版营业执照，要求文字清晰可辨识</div>
                                    <div>不支持电子版营业执照，要求文字清晰可辨识</div>
                                    <div>不支持电子版营业执照，要求文字清晰可辨识</div>
                                    <div>不支持电子版营业执照，要求文字清晰可辨识</div>
                                </span>
                            </div>
                            <div className='comfirm' onClick={this.onSave}>
                                <span>{isLookThrough ? '审核中...' : '提交审核'}</span>
                            </div>
                        </div>
                        <div className='rightBox'>
                            <div className='pic'>
                                <span></span>
                            </div>
                            <div className='val'>完成企业认证，享受更多权益</div>
                            <div className='val'>完成企业认证，享受更多权益</div>
                            <div className='val'>完成企业认证，享受更多权益</div>
                            <div className='val'>完成企业认证，享受更多权益</div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
})

export default Certification
