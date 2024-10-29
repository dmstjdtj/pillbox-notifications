const publicVapidKey = 'BMboslBz_1vDBoJQ3q2WaFTECODwk5truGvoCcbsawf1MjPVhZVtfOc28Mjx6_8OcZNbkk-lg6PjeLKtkzYNrpg';

// 페이지 로드 시 구독 상태 확인 및 구독 요청
window.addEventListener('load', () => {
    if ('serviceWorker' in navigator) {
        registerServiceWorkerAndCheckSubscription().catch(console.error);
    } else {
        console.error('Service Worker가 지원되지 않는 브라우저입니다.');
    }
});

async function registerServiceWorkerAndCheckSubscription() {
    try {
        // 서비스 워커 등록
        const register = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
        });

        // 현재 구독 상태 확인
        const existingSubscription = await register.pushManager.getSubscription();

        // 기존 구독이 없는 경우에만 구독 요청
        if (!existingSubscription) {
            const newSubscription = await register.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
            });

            // 서버에 구독 정보 전송
            await fetch('/subscribe', {
                method: 'POST',
                body: JSON.stringify(newSubscription),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('구독이 성공적으로 서버에 등록되었습니다.');
        } else {
            console.log('이미 구독된 상태입니다.');
        }
    } catch (error) {
        console.error('구독 확인 또는 요청 중 오류 발생:', error);
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
