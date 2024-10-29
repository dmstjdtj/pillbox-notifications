const publicVapidKey = 'BMboslBz_1vDBoJQ3q2WaFTECODwk5truGvoCcbsawf1MjPVhZVtfOc28Mjx6_8OcZNbkk-lg6PjeLKtkzYNrpg';

if ('serviceWorker' in navigator) {
    registerServiceWorkerAndSubscribe().catch(console.error);
}

async function registerServiceWorkerAndSubscribe() {
    const register = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
    });

    const subscription = await register.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
    });

    await fetch('/subscribe', {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    console.log('구독이 성공적으로 서버에 등록되었습니다.');
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}
