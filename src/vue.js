class Vue extends EventTarget {
  constructor(option) {
    // console.log(option)
    super()
    this._el = option.el
    this._data = option.data
    // this.observe(this._data);
    let nodes = document.querySelectorAll(this._el)
    // console.log(nodes)
    this.compileNode(nodes)
    this.observe(this._data)
  }

  compileNode(nodes) {
    console.log(Array.from(nodes))
    let _this = this
    nodes.forEach((item) => {
      if (item.nodeType === 3) {
        console.log('this is 文本节点', item.textContent)
        let reg = /\{\{\s*([^\s\{\}]+)\s*\}\}/g
        if (reg.test(item.textContent)) {
          console.log('ssss', RegExp.$1)
          let $1 = RegExp.$1
          let text = item.textContent
          item.textContent = text.replace(reg, this._data[$1])
          _this.addEventListener($1, (e) => {
            console.log('event receive', e.detail)
            item.textContent = text.replace(reg, e.detail)
          })
        }
      } else if (item.nodeType === 1) {
        console.log('item.attributes', item.attributes)
        if (item.attributes.hasOwnProperty('v-model')) {
          console.log('v-modal', item.attributes['v-model'].value)
          let key = item.attributes['v-model'].value
          item.addEventListener('input', (e) => {
            console.log('input event', e.target.value)
            _this._data[key] = e.target.value
          })
        }
        this.compileNode(item.childNodes)
      }
    })
  }

  observe(data) {
    console.log('dafafadfta', data)
    let _this = this
    for (let p in data) {
      Object.defineProperty(data, p, {
        set(newVal) {
          console.log('set newVal', newVal)
          let event = new CustomEvent(p, { detail: newVal })
          _this.dispatchEvent(event)
        },
      })
    }
  }
}
