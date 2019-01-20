import axios from 'axios'
import moment from 'moment'
import store from '@/store'

class CryptoCompareService {
  async price(currency) {
    const response = await axios.get(`https://apiv2.bitz.com/Market/coinRate?coins=xph`)
    const key = currency.toLowerCase()

    if (response.data.data.xph && response.data.data.xph.hasOwnProperty(key)) {
      return Number(response.data.data.xph[key])
    }
  }

  async day() {
    return this.sendRequest('day', 1, 'HH:mm')
  }

  async week() {
    return this.sendRequest('day', 7, 'DD.MM')
  }

  async month() {
    return this.sendRequest('day', 30, 'DD.MM')
  }

  async quarter() {
    return this.sendRequest('day', 120, 'DD.MM')
  }

  async year() {
    return this.sendRequest('day', 365, 'DD.MM')
  }

  async sendRequest(type, days, dateTimeFormat) {
    const date = Math.round(new Date().getTime() / 1000)

    let targetCurrency = 'USD'
    if (store.getters['currency/name'] !== store.getters['network/token']) {
      targetCurrency = store.getters['currency/name']
    }

    const response = await axios
      .get(`https://api.coingecko.com/api/v3/coins/phantom/market_chart`, {
        params: {
          vs_currency: targetCurrency,
          days
        }
      })

      console.log(this.transform(response.data.market_caps, dateTimeFormat))
    return this.transform(response.data.prices, dateTimeFormat)
  }

  async dailyAverage(timestamp) {
    const networkAlias = store.getters['network/alias']
    if (networkAlias !== 'Main') {
      return null
    }

    let ts = moment()
      .utc()
      .set({
        year: 2019,
        month: 0,
        date: 3,
        hour: 12,
        minute: 0,
        second: 0
      })
      .add(timestamp, 'seconds')
      .unix()

    // get last second of the day as unix timestamp
    ts = ts - (ts % 86400) + 86400 - 1

    const targetCurrency = store.getters['currency/name']
    const lastConversion = store.getters['currency/lastConversion']

    if (lastConversion.to === targetCurrency && lastConversion.timestamp === ts) {
      return lastConversion.rate
    }

    const token = store.getters['network/token']
    const cache = JSON.parse(localStorage.getItem(`rates_${targetCurrency}`))

    if (cache && cache.hasOwnProperty(timestamp)) {
      store.dispatch('currency/setLastConversion', {
        to: targetCurrency,
        timestamp: timestamp,
        rate: cache[timestamp]
      })

      return cache[timestamp]
    }

    const response = await axios
      .get('https://min-api.cryptocompare.com/data/dayAvg', {
        params: {
          fsym: token,
          tsym: targetCurrency,
          toTs: ts
        }
      })

    if (response.data.Response === 'Error') {
      return null
    }

    const rate = response.data[targetCurrency]

    store.dispatch('currency/setLastConversion', {
      to: targetCurrency,
      timestamp: ts,
      rate: rate
    })

    return rate
  }

  transform(response, dateTimeFormat) {
    return {
      labels: response.map(value => {
        return moment(value[0]).format(dateTimeFormat)
      }),
      datasets: response.map(value => {
        return value[1]
      })
    }
  }
}

export default new CryptoCompareService()
