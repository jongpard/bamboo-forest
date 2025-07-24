import { App, ExpressReceiver, LogLevel, ViewSubmitAction } from '@slack/bolt';

// 환경 변수 로딩
const signingSecret = process.env.SLACK_SIGNING_SECRET!;
const botToken       = process.env.SLACK_BOT_TOKEN!;
const defaultChannel = process.env.SLACK_CHANNEL!;
const port           = Number(process.env.PORT || '3000');

// ExpressReceiver 생성
const receiver = new ExpressReceiver({ signingSecret });
const app = new App({ token: botToken, receiver, logLevel: LogLevel.INFO });

// 1️⃣ Slash Command '/익명' 처리
app.command('/익명', async ({ ack, command, client }) => {
  await ack();
  const text = command.text;
  await client.chat.postMessage({ channel: defaultChannel, text });
});

// 2️⃣ Message Shortcut '익명으로 답장' 클릭 시 모달 띄우기
app.shortcut('anon_reply', async ({ ack, body, client }) => {
  await ack();

  const payload: any = body;
  const message = payload.message;
  const threadTs = message.thread_ts || message.ts;
  const channelId = payload.channel.id;

  await client.views.open({
    trigger_id: payload.trigger_id,
    view: {
      type: 'modal',
      callback_id: 'anon_modal',
      private_metadata: JSON.stringify({ channel: channelId, threadTs }),
      title: { type: 'plain_text', text: '익명으로 답장' },
      submit: { type: 'plain_text', text: '전송' },
      close:  { type: 'plain_text', text: '취소' },
      blocks: [
        {
          type: 'input',
          block_id: 'anon_input',
          label: { type: 'plain_text', text: '메시지 내용' },
          element: { type: 'plain_text_input', action_id: 'message', multiline: true }
        }
      ]
    }
  });
});

// 3️⃣ 모달 제출 처리
app.view('anon_modal', async ({ ack, view, client }) => {
  await ack();
  const { channel, threadTs } = JSON.parse(view.private_metadata);
  const text = (view.state.values['anon_input']['message'] as any).value;

  await client.chat.postMessage({ channel, text, thread_ts: threadTs });
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
