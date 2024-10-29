const publicVapidKey = 'BMboslBz_1vDBoJQ3q2WaFTECODwk5truGvoCcbsawf1MjPVhZVtfOc28Mjx6_8OcZNbkk-lg6PjeLKtkzYNrpg'; // 서버와 동일한 공개 VAPID 키 사용

// 페이지가 로드될 때 구독 요청
window.addEventListener('load', () => {
    if ('serviceWorker' in navigator) {
        registerServiceWorkerAndSubscribe().catch(console.error);
    } else {
        console.error('Service Worker가 지원되지 않는 브라우저입니다.');
    }
});

async function registerServiceWorkerAndSubscribe() {
    try {
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
    } catch (error) {
        console.error('구독 요청 중 오류 발생:', error);
    }
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
