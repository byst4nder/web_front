import config from 'community/config'

const {apiHost} = config

let API = {}

API.list = {
    url: `${apiHost}/wechats/friends/apply`,
    type: 'GET'
}

export default API
