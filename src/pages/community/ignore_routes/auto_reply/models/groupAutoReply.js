import {
    autoReply,
    category,
    categoryDelete,
} from 'community/services/groupAutoReply'
import _ from 'lodash'
import {safeJsonParse} from "utils"

function getInitState() {
    return {
        reply_categories: [],
        current: 1,
        params: {
            limit: 10,
            offset: 0,
        },
        total: 0,
        match_contents: {
            table: [],
            current: 1,
            limit: 10,
        },
    }
}

function generateId(table, cb) {
    let id = 0
    table.forEach((item) => {
        item.id = id++
        if(cb) {
            cb(item)
        }
    })
    return table
}


export default {
    namespace: 'community_groupCompanyAutoReply',

    state: getInitState(),

    effects: {
        * category({payload, callback}, {call, put}) {
            const {data} = yield call(category, {category_id: payload})

            if(data) {
                generateId(data.auto_reply_reply_contents, (item) => {
                    item.common_msg_content = {
                        type: item.common_msg_content_type,
                        values: safeJsonParse(item.common_msg_content_values),
                        source_type: item.common_msg_content_source_type,
                    }
                })

                callback && callback(data)
            }
        },
        * getMatchContents({payload, callback}, {call, put}) {
            const {data} = yield call(category, {category_id: payload})

            if(data) {
                generateId(data.match_contents)

                yield put({
                    type: 'setProperty',
                    payload: {
                        match_contents: {
                            table: data.match_contents,
                            current: 1,
                            limit: 10,
                        },
                    },
                })
            }
        },
        * categoryDelete({payload, callback}, {call, put}) {
            const {meta} = yield call(categoryDelete, payload)
            if(meta && meta.code === 200) {
                callback && callback()
            }
        },
        * autoReply({payload}, {call, put, select}) {
            let params = yield select(({community_groupCompanyAutoReply}) => community_groupCompanyAutoReply.params)
            params = {...params, ...payload}
            if(payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }

            const data = yield call(autoReply, params)
            if(data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        reply_categories: data.data.reply_categories,
                        params,
                        total: _.get(data, 'pagination.rows_found', 0),
                        current: payload.page === undefined ? 1 : payload.page,
                    },
                })
            }
        },
    },

    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
        assignStateByPath(state, action) {
            const payload = action.payload
            const oldValue = _.get(state, payload.path, {})
            _.set(state, payload.path, Object.assign(oldValue, payload.value))

            return _.cloneDeep(state)
        },
        setStateByPath(state, action) {
            const payload = action.payload
            _.set(state, payload.path, payload.value)

            return _.cloneDeep(state)
        },
        resetState() {
            return getInitState()
        },
    },
}
