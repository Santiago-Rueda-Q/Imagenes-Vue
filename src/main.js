import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

// PrimeVue
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'

// PrimeVue Components
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Calendar from 'primevue/calendar'
import ColorPicker from 'primevue/colorpicker'
import FileUpload from 'primevue/fileupload'
import Card from 'primevue/card'
import Toast from 'primevue/toast'
import ToastService from 'primevue/toastservice'
import ConfirmDialog from 'primevue/confirmdialog'
import ConfirmationService from 'primevue/confirmationservice'
import Checkbox from 'primevue/checkbox'
import DataView from 'primevue/dataview'
import Tag from 'primevue/tag'
import Menubar from 'primevue/menubar'
import ProgressSpinner from 'primevue/progressspinner'

// PrimeVue styles
import 'primevue/resources/themes/aura-light-green/theme.css'
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'

// Tailwind CSS
import './style.css'

const app = createApp(App)

app.use(router)
app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
})
app.use(ToastService)
app.use(ConfirmationService)

// Register PrimeVue components
app.component('Button', Button)
app.component('InputText', InputText)
app.component('Textarea', Textarea)
app.component('Calendar', Calendar)
app.component('ColorPicker', ColorPicker)
app.component('FileUpload', FileUpload)
app.component('Card', Card)
app.component('Toast', Toast)
app.component('ConfirmDialog', ConfirmDialog)
app.component('Checkbox', Checkbox)
app.component('DataView', DataView)
app.component('Tag', Tag)
app.component('Menubar', Menubar)
app.component('ProgressSpinner', ProgressSpinner)

app.mount('#app')