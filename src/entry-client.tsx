// @refresh reload
import '~/features/identity-access/application/init'

import { mount, StartClient } from '@solidjs/start/client'

mount(() => <StartClient />, document.getElementById('app')!)
