const express = require('express');
const bodyParser = require('body-parser');
const webPush = require('web-push');
const path = require('path');
const cors = require('cors'); // CORS 미들웨어 추가

const app = express();
const port = 3002;

app.use(cors()); // 모든 요청을 허용하는 CORS 설정
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

webPush.setVapidDetails(
    'mailto:your-email@example.com',
    'BMboslBz_1vDBoJQ3q2WaFTECODwk5truGvoCcbsawf1MjPVhZVtfOc28Mjx6_8OcZNbkk-lg6PjeLKtkzYNrpg', // 공개 VAPID 키 (교체 필요)
    'EYd5EZ96quzp0LEDQJef8vW9fKLNghfdfw5GOdOmb80' // 개인 VAPID 키 (교체 필요)
);

let subscriptions = [];

// 구독 요청 처리
app.post('/subscribe', (req, res) => {
    const subscription = req.body;
    subscriptions.push(subscription);
    res.status(201).json({ message: '구독이 성공적으로 추가되었습니다.' });

    // 구독 성공 알림 전송
    const payload = JSON.stringify({ title: '구독 성공', body: '푸시 알림 구독이 성공적으로 완료되었습니다.' });
    webPush.sendNotification(subscription, payload)
        .then(response => console.log('구독 성공 알림 전송:', response))
        .catch(error => console.error('알림 전송 오류:', error));
});

// 구독 취소 요청 처리
app.post('/unsubscribe', (req, res) => {
    const subscription = req.body;
    subscriptions = subscriptions.filter(sub => sub.endpoint !== subscription.endpoint);
    res.status(200).json({ message: '구독이 취소되었습니다.' });
});

// 알림 전송 요청
app.post('/send-notification', (req, res) => {
    const message = req.body;
    const payload = JSON.stringify({ title: '약통 알람', body: message });

    subscriptions.forEach(subscription => {
        webPush.sendNotification(subscription, payload)
            .then(response => console.log('알림 전송 성공:', response))
            .catch(error => console.error('알림 전송 중 오류:', error));
    });

    res.status(200).send('알림이 전송되었습니다.');
});

app.listen(port, () => {
    console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});