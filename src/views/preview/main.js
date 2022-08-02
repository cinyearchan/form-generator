import Vue from 'vue'
import { loadScriptQueue } from '@/utils/loadScript'
import axios from 'axios'
import Tinymce from '@/components/tinymce/index.vue'

// 这些代码需要与 vue.config.js 中的 external 配合
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

Vue.use(ElementUI)

Vue.component('tinymce', Tinymce)
Vue.prototype.$axios = axios

const $previewApp = document.getElementById('previewApp')
const childAttrs = {
  file: '',
  dialog: ' width="600px" class="dialog-width" v-if="visible" :visible.sync="visible" :modal-append-to-body="false" '
}

// preview 这个页面不仅仅是一个单独的页面，也会在 form-generator 里执行的时候作为 iframe 的填充内容，展示生成的代码运行的效果
window.addEventListener('message', init, false)

function buildLinks(links) {
  let strs = ''
  links.forEach(url => {
    strs += `<link href="${url}" rel="stylesheet">`
  })
  return strs
}

function init(event) {
  if (event.data.type === 'refreshFrame') {
    console.log('refreshFrame')
    const code = event.data.data
    const attrs = childAttrs[code.generateConf.type]
    let links = ''

    if (Array.isArray(code.links) && code.links.length > 0) {
      links = buildLinks(code.links)
    }

    $previewApp.innerHTML = `${links}<style>${code.css}</style><div id="app"></div>`

    if (Array.isArray(code.scripts) && code.scripts.length > 0) {
      loadScriptQueue(code.scripts, () => {
        newVue(attrs, code.js, code.html)
      })
    } else {
      newVue(attrs, code.js, code.html)
    }
  }
}

function newVue(attrs, main, html) {
  main = eval(`(${main})`)
  main.template = `<div>${html}</div>`
  new Vue({
    components: {
      child: main
    },
    data() {
      return {
        visible: true
      }
    },
    template: `<div><child ${attrs}/></div>`
  }).$mount('#app')
}
