import Test from '@/components/web-custom/Test_c.vue'
import { createApp } from 'vue'
import { addAnchorELement, removeAnchorELement } from './store.ts'

const div = document.querySelector('#app')!
const app = createApp(Test)
app.mount(div)
document.addEventListener('DOMContentLoaded', () =>
  document.body.appendChild(div),
)

let cur: Element | null = null
let id: number

function handel(el: Element, event: 'mouseover' | 'mouseout') {
  if (event === 'mouseover') {
    if (cur === el) {
      /** 没有变化，等待时间就好了 */
    } else {
      clearTimeout(id)
      removeAnchorELement(cur! as HTMLAnchorElement)
      cur = el
      id = setTimeout(() => {
        console.log('悬停事件', cur)
        addAnchorELement(cur! as HTMLAnchorElement)
      }, 400) as unknown as number
    }
  } else {
    clearTimeout(id)
    removeAnchorELement(cur! as HTMLAnchorElement)
    cur = null
  }
}

// 添加鼠标悬停事件的监听器
document.addEventListener('mouseover', (event) => {
  if (event.target instanceof Element) {
    const target = event.target.closest('a')
    if (target) {
      handel(target, 'mouseover')
    }
  }
})
document.addEventListener('mouseout', (event) => {
  if (event.target instanceof Element) {
    const target = event.target.closest('a')
    if (target) {
      handel(target, 'mouseout')
    }
  }
})
