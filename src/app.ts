import { App, ExpressReceiver, LogLevel } from '@slack/bolt';

// 환경 변수 로딩
const signingSecret = process.env.SLACK_SIGNING_SECRET!;
const botToken = process.env.SLACK_BOT_TOKEN!;
const channel = process.env.SLACK_CHANNEL!;
const port = Number(process.env.PORT || '3000');

// ExpressReceiver 생성: HTTP 서버로 요청 처리
const receiver = new ExpressReceiver({ signingSecret });
const app = new App({ token: botToken, receiver, logLevel: LogLevel.INFO });

// Slash Command '/익명' 처리
app.command('/익명', async ({ ack, payload, client }) => {
  await ack();
  const text = (payload as any).text;
  await client.chat.postMessage({
    channel,
    text,
  });
});

// 서버 시작
(async () => {
  try {
    await app.start(port);
    console.log(`⚡️ Bolt app is running on port ${port}`);
  } catch (error) {
    console.error('Unable to start App', error);
    process.exit(1);
  }
})();
