export default class Scoring {
  data

  constructor() {
    this.data = JSON.parse(localStorage.data || '[]')
  }

  get() {
    return this.data.sort((a, b) => +b.score - +a.score).slice(0, 4)
  }

  set(data) {
    const existingData = this.get()
    const newData = existingData.concat(data)
    this.data = newData
    localStorage.setItem('data', JSON.stringify(newData))
  }

  formatDate(ts) {
    return ts.split('T').join(' / ').slice(0, -5)
  }

  render() {
    const el = document.querySelector('#scores')
    const dom = this.data.reduce((acc, {score, timestamp}) => {
      return acc += `<li>${score} @ ${this.formatDate(timestamp)}</li>`
    }, '')
    el.innerHTML = dom
  }
}
