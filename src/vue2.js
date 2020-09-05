class Watcher {
  constructor(vm, key, updateFn) {
    this.vm = vm
    this.key = key
    this.updateFn = updateFn
    Dep.target = this
  }

  update() {
    this.updateFn && this.updateFn(this.vm.$data[this.key])
  }
}

class Dep {
  constructor() {
    this.deps = []
  }
  addDep(watcher) {
    this.deps.push(watcher)
  }
  notify() {
    this.deps.forEach((watcher) => {
      watcher.update()
    })
  }
}

class Compile {
  constructor(vm) {
    this.vm = vm
    this.el = vm.$el

    let children = document.querySelector(this.el).childNodes
    this.compileNode(children)
  }

  compileNode = (children) => {
    Array.from(children).forEach((node) => {
      if (node.nodeType === 1) {
        console.log(`元素节点:${node.nodeName}`, node)
        this.compileElement(node)
      } else if (this.isInter(node)) {
        console.log(`文本节点:${node.nodeName}`, node)
        this.compileText(node)
      }
      if (node.childNodes && node.childNodes.length > 0) {
        this.compileNode(node.childNodes)
      }
    })
  }
  isInter = (node) => {
    return (
      node.nodeType === 3 && /\{\{\s*([^\s\{\}]+)\s*\}\}/.test(node.textContent)
    )
  }

  compileText = (node) => {
    const key = RegExp.$1
    node.textContent = this.vm[key]
    Dep.target = null
    new Watcher(this.vm, key, (val) => {
      node.textContent = val
    })
    this.vm[key]
  }
  compileElement = (node) => {}
}

class Vue {
  constructor(options) {
    this.$options = options
    this.$el = options.el
    this.$data = options.data
    this.observe(options.data)
    new Compile(this)
  }

  observe(data) {
    if (!data || typeof data !== 'object') {
      return
    }
    this.defineReactive(data)
    this.proxy(data)
  }

  defineReactive(data) {
    Object.keys(data).forEach((key) => {
      let val = data[key]
      let dep = new Dep()
      Object.defineProperty(data, key, {
        get() {
          Dep.target && dep.addDep(Dep.target)
          return val
        },
        set(newVal) {
          if (newVal !== val) {
            val = newVal
            console.log(`值更新了:${newVal}`)
            dep.notify()
          }
        },
      })
      if (typeof data[key] === 'object') {
        this.defineReactive(data[key])
      }
    })
  }

  proxy = (data) => {
    Object.keys(data).forEach((key) => {
      let val = data[key]
      Object.defineProperty(this, key, {
        get: () => {
          return this.$data[key]
        },
        set: (newVal) => {
          if (newVal !== val) {
            this.$data[key] = newVal
          }
        },
      })
    })
  }
}
