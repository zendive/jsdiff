import { proxyMessageGate, proxyMessageHandler } from '@/api/proxy';

window.addEventListener('message', proxyMessageGate(proxyMessageHandler));
