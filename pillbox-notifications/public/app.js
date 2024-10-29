const publicVapidKey = 'BMboslBz_1vDBoJQ3q2WaFTECODwk5truGvoCcbsawf1MjPVhZVtfOc28Mjx6_8OcZNbkk-lg6PjeLKtkzYNrpg'; // 서버와 동일한 공개 VAPID 키 사용

// 서비스 워커 등록 및 구독
if ('serviceWorker' in navigator) {
    registerServiceWorkerAndSubscribe().catch(console.error);
}

async function registerServiceWorkerAndSubscribe() {
    // 서비스 워커 등록
    const register = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
    });

    // 푸시 구독 생성
    const subscription = await register.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
    });

    // 서버에 구독 전송
    await fetch('/subscribe', {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    console.log('구독이 성공적으로 서버에 등록되었습니다.');
}

// VAPID 키 변환 함수
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}
