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
app.command('/익명', async ({ ack, command, client }) => {
  await ack();
  const text = command.text;
  await client.chat.postMessage({ channel, text });
});

// Message Shortcut '익명으로 답장' 처리
app.shortcut('anon_reply', async ({ ack, body, client }) => {
  await ack();
  const message = (body.message as any);
  const threadTs = message.thread_ts || message.ts;
  await client.chat.postMessage({
    channel: body.channel!.id,
    text: message.text,
    thread_ts: threadTs,
  });
});

// 서버 시작
(async () => {
  try {
    await app.start(port);
    console.log(`⚡️ Bolt app is running on port ${port}`);
  } catch (error) {
    console.error('Unable to start app', error);
    process.exit(1);
  }
})();
