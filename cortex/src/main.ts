import { mount } from 'svelte'
import "@/services/ws.svelte"
import "@/widgets/notifications/bar/notifications-bar.svelte"
import "@/widgets/notifications/toast/toast-widget.svelte"
import "@/widgets/monitor/monitor.svelte"
import "@/widgets/taskbar/taskbar.svelte"


import '@/app.css'
import App from '@/App.svelte'

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
