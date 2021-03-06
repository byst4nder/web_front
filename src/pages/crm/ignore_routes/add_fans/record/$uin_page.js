/** @description 加粉记录
 * @author liyan
 * @date 2018/12/17
 */
import React, {Component} from 'react'
import {Form, Select, Input, Button, Row, Col, Table, Badge} from 'antd'
import {connect} from 'dva'
import moment from 'moment'
import ContentHeader from 'business/ContentHeader'
import documentTitleDecorator from "hoc/documentTitle"
import config from 'crm/common/config'
import DateRange from 'components/DateRange'
import PlatformSelect from '../components/PlatformSelect'
import ShopSelect from '../components/ShopSelect'
import {addedStatus} from '../config'
import utils from '../utils'
import styles from './index.scss'

const FormItem = Form.Item
const Search = Input.Search
const Option = Select.Option

const {pageSizeOptions, DateFormat} = config

@documentTitleDecorator({
    title: '加粉记录',
})
@connect(({base, loading, crm_add_fans_record}) => ({
    base,
    crm_add_fans_record,
    listLoading: loading.effects['crm_add_fans_record/singleRecordList']
}))
export default class extends Component {
    constructor(props) {
        super(props)
        this.state = {
            id: 0,
            params: this.getInitialState(),
            list: [],
            total: 0,
            current: 1,
        }
        this._isMounted = false
    }

    getInitialState = () => {
        return {
            keyword: '',
            platform_type: '',
            shop_id: '',
            status: '',
            create_time_start: '',
            create_time_end: '',
            data_from: undefined,
            limit: 10,
            offset: 0,
        }
    }

    componentDidMount() {
        this._isMounted = true
        this.handleSearch()
    }

    componentWillUnmount() {
        this._isMounted = false
    }

    handleChange = (key, e) => {
        let val = ''
        if(e && e.target) {
            val = e.target.value
        }else {
            val = e
        }
        let params = {...this.state.params}
        params[key] = val
        if (key === 'platform_type') {
            if (val === 999) {
                params['data_from'] = 1
            } else {
                params['data_from'] = undefined
            }
            params['shop_id'] = undefined
        }
        this.setState({
            params: params
        })
    }

    handleChangeDate = (prefix, startValue, endValue) => {
        let params = {...this.state.params}
        params[`${prefix}_start`] = startValue ? moment(startValue).format(DateFormat) + ' 00:00:00' : ''
        params[`${prefix}_end`] = endValue ? moment(endValue).format(DateFormat) + ' 23:59:59' : ''
        this.setState({
            params: params
        })
    }

    handleSearch = () => {
        this.goPage(1)
    }

    goPage = (page) => {
        const uin = this.props.match.params.uin
        if (uin) {
            let params = {...this.state.params}
            if (page) {
                params.offset = params.limit * (page - 1)
            }
            let platformType
            if (params.platform_type) {
                platformType = utils.shopToPlatform(params.platform_type)
            }
            const payload = {
                params: {...params, ...{uin: uin}},
                platform_type: platformType
            }
            this.props.dispatch({
                type: 'crm_add_fans_record/singleRecordList',
                payload: payload,
                callback: ({data, pagination}) => {
                    if(this._isMounted) {
                        this.setState({
                            list: data,
                            params: params,
                            total: pagination.rows_found,
                            current: parseInt(pagination.offset / pagination.limit, 10) + 1,
                        })
                    }
                }
            })
        }
    }

    handleChangeSize = (current, size) => {
        let params = {...this.state.params}
        params.limit = size
        this.setState({
            params: params
        }, () => {
            this.goPage(1)
        })
    }

    resetParams = () => {
        this.setState({
            params: this.getInitialState()
        })
        this.createTime.setDate(null, null)
    }

    resetSearch = () => {
        this.resetParams()
        setTimeout(() => {
            this.handleSearch()
        }, 0)
    }

    render () {
        const {params, list, total, current} = this.state
        const {listLoading} = this.props

        const columns = [
            {
                title: '来源',
                dataIndex: 'data_from',
                render: (from) => {
                    return utils.getDataFormText(from)
                }
            },
            {
                title: '姓名',
                dataIndex: 'name'
            },
            {
                title: '手机号',
                dataIndex: 'phone',
            },
            {
                title: '购物账号',
                dataIndex: 'buyer_username',
            },
            {
                title: '所属店铺',
                dataIndex: 'shop_name',
            },
            {
                title: '目标微信',
                dataIndex: 'remark',
                render: (remark, record) => {
                    return remark || record.nickname
                }
            },
            {
                title: '创建时间',
                dataIndex: 'create_time',
                render: (timestamp) => {
                    return moment(timestamp*1000).format('YYYY-MM-DD HH:mm')
                }
            },
            {
                title: '状态',
                dataIndex: 'status',
                render: (status) => {
                    const text = utils.getAddedStatusText(status)
                    if (status === addedStatus.success.status) {
                        return <Badge status="success" text={text}/>
                    } else if (status === addedStatus.fail.status) {
                        return <Badge status="error" text={text}/>
                    } else if (status === addedStatus.processing.status) {
                        return <Badge status="processing" text={text}/>
                    } else if(status === addedStatus.successExecuted.status){
                        return <Badge status="success" text={text}/>
                    } else if (status === addedStatus.failedExecuted.status) {
                        return <Badge status="error" text={text}/>
                    }
                }
            },
            {
                title: '说明',
                dataIndex: 'code',
                render: (code, record) => {
                    return utils.getMessage(code, record)
                }
            },
            {
                title: '更新时间',
                dataIndex: 'update_time',
                render: (timestamp) => {
                    if(timestamp) {
                        return moment(timestamp * 1000).format('YYYY-MM-DD HH:mm')
                    }
                }
            },
        ]

        const formItemLayout = {
            labelCol: {span: 6},
            wrapperCol: {span: 18},
        }

        return (
            <div className={styles.recordWrapper}>
                <ContentHeader
                    contentType={'breadcrumb'}
                    content={
                        [
                            {
                                name: '主动加粉',
                                path: '/crm/add_fans',
                            },
                            {
                                name: '加粉记录',
                            },
                        ]
                    }
                />
                <Form className={styles.searchWrap}>
                    <Row gutter={20}>
                        <Col span={8}>
                            <FormItem {...formItemLayout}
                                label="搜索用户："
                                colon={false}
                            >
                                <Search
                                    placeholder="输入姓名或手机号"
                                    value={params.query}
                                    onChange={(e)=>{this.handleChange('query', e)}}
                                    onSearch={this.handleSearch}
                                />
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem {...formItemLayout}
                                label="平台："
                                colon={false}
                            >
                                <PlatformSelect
                                    placeholder="请选择"
                                    platform={params.platform_type}
                                    onChange={(value)=>{this.handleChange('platform_type', value)}}
                                />
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem {...formItemLayout}
                                label="店铺："
                                colon={false}
                            >
                                <ShopSelect
                                    placeholder="请选择"
                                    platform={params.platform_type || undefined}
                                    shopId={params.shop_id}
                                    onChange={(value)=>{this.handleChange('shop_id', value)}}
                                />
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={20}>
                        <Col span={8}>
                            <FormItem {...formItemLayout}
                                label="状态："
                                colon={false}
                            >
                                <Select
                                    placeholder="请选择"
                                    value={params.status}
                                    onChange={(e)=>{this.handleChange('status', e)}}
                                >
                                    <Option value="">全部状态</Option>
                                    {
                                        Object.keys(addedStatus).map((key, index)=>{
                                            const {status, text} = addedStatus[key]
                                            return <Option key={index} value={status}>{text}</Option>
                                        })
                                    }
                                </Select>
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem {...formItemLayout}
                                label="创建时间："
                                colon={false}
                                className={styles.dateRange}
                            >
                                <DateRange {...this.props}
                                    ref={(ref)=>{this.createTime = ref}}
                                    startValue={params.create_time_start ? moment(params.create_time_start, DateFormat) : ''}
                                    endValue={params.create_time_end ? moment(params.create_time_end, DateFormat) : ''}
                                    onChange={(startValue, endValue)=>{this.handleChangeDate('create_time', startValue, endValue)}}
                                    maxToday={true}/>
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={20} className={styles.searchBtn}>
                        <Col span={8}>
                            <Col offset={6}>
                                <Button type="primary" icon="search" onClick={this.handleSearch}>搜索</Button>
                                <Button onClick={this.resetSearch}>重置</Button>
                            </Col>
                        </Col>
                    </Row>
                </Form>

                <div className={styles.tableWrap}>
                    <Table
                        columns={columns}
                        dataSource={list}
                        size="middle"
                        loading={listLoading}
                        rowKey={(record, index) => index}
                        onExpand={this.handleExpand}
                        pagination={
                            list.length ? {
                                size: 'middle',
                                total: total,
                                current: current,
                                showQuickJumper: true,
                                pageSizeOptions: pageSizeOptions,
                                showTotal: total => `共${total}条记录`,
                                pageSize: params.limit,
                                showSizeChanger: true,
                                onShowSizeChange: this.handleChangeSize,
                                onChange: this.goPage,
                            } : false
                        }
                    />
                </div>
            </div>
        )
    }
}
