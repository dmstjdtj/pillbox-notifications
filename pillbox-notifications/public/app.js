const publicVapidKey = 'BMboslBz_1vDBoJQ3q2WaFTECODwk5truGvoCcbsawf1MjPVhZVtfOc28Mjx6_8OcZNbkk-lg6PjeLKtkzYNrpg';

// 페이지 로드 시 서비스 워커 등록 및 초기 상태 확인
window.addEventListener('load', () => {
    if ('serviceWorker' in navigator) {
        registerServiceWorker().catch(console.error);
    } else {
        console.error('Service Worker가 지원되지 않는 브라우저입니다.');
    }
});

async function registerServiceWorker() {
    const register = await navigator.serviceWorker.register('/sw.js', { scope: '/' });

    const subscription = await register.pushManager.getSubscription();
    if (subscription) {
        updateSubscriptionStatus(true); // 이미 구독된 상태라면 버튼 상태를 업데이트
    }
}

// 구독 및 구독 취소 제어
async function toggleSubscription() {
    const register = await navigator.serviceWorker.ready;
    const subscription = await register.pushManager.getSubscription();

    if (subscription) {
        // 구독 취소
        await subscription.unsubscribe();
        await fetch('/unsubscribe', {
            method: 'POST',
            body: JSON.stringify(subscription),
            headers: { 'Content-Type': 'application/json' }
        });
        console.log('구독이 취소되었습니다.');
        updateSubscriptionStatus(false);
    } else {
        // 구독 생성
        const newSubscription = await register.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
        });

        await fetch('/subscribe', {
            method: 'POST',
            body: JSON.stringify(newSubscription),
            headers: { 'Content-Type': 'application/json' }
        });
        console.log('구독이 성공적으로 서버에 등록되었습니다.');
        updateSubscriptionStatus(true);
    }
}

// 버튼 상태 업데이트
function updateSubscriptionStatus(isSubscribed) {
    const button = document.getElementById('subscribe-btn');
    if (isSubscribed) {
        button.textContent = '구독 취소';
        button.classList.add('subscribed');
    } else {
        button.textContent = '구독하기';
        button.classList.remove('subscribed');
    }
}

// VAPID 키 변환 함수
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}
