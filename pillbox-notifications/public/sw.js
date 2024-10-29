self.addEventListener('push', event => {
    const data = event.data.json();
    console.log('푸시 알림 수신:', data);
    const options = {
        body: data.body,
        icon: 'icons/icon.png'
    };
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});