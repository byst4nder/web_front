import {list} from 'data/services/moments/heat'
import config from "data/common/config"
import moment from 'moment'
const {DateFormat} = config

function getInitParams() {
    return {
        department_id: undefined,
        user_id: undefined,
        uin: undefined,
        order_by: 'like', // like | comment
        start_time: moment().subtract(6, 'days').format(DateFormat) + ' 00:00:00',
        end_time: moment().format(DateFormat) + ' 23:59:59',
        limit: 10,
        offset: 0,
    }
}

export default {
    namespace: 'data_stat_moments_heat',
    state: {
        params: getInitParams(),
        list: [],
        line: [],
        current: 1,
        total: 0,
        loading: false,
        summary: [],
        range: 'week',
    },
    subscriptions: {},
    effects: {
        * list({payload, callback}, {select, call, put}) {
            let params = yield select(({data_stat_moments_heat}) => data_stat_moments_heat.params)
            params = {...params, ...payload.params}
            if (payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }
            const res = yield call(list, params)
            if (res && res.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        list: res.data,
                        params: params,
                        total: res.pagination.rows_found,
                        current: parseInt(res.pagination.offset / res.pagination.limit, 10) + 1
                    }
                })
            }
        },
    },

    reducers: {
        setParams(state, action) {
            let params = {...state.params, ...action.payload.params}
            return {...state, params}
        },
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
        resetParams(state, action) {
            return {...state, params: getInitParams()}
        },
        resetRange(state, action) {
            return {...state, ...{range: 'week'}}
        },
    }
}