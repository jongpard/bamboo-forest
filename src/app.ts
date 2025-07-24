import { App, ExpressReceiver, LogLevel } from '@slack/bolt';
import * as messageCommand from './commands/message';
import * as threadCommand from './commands/thread';
import * as commonModule from './commands/common';

// 환경변수 로딩 (.env 파일 또는 Render의 환경변수)
const signingSecret = process.env.SLACK_SIGNING_SECRET!;
const botToken = process.env.SLACK_BOT_TOKEN!;
const port = parseInt(process.env.PORT || '3000', 10);

// ExpressReceiver 생성 (HTTP 서버)
const receiver = new ExpressReceiver({ signingSecret });

// Bolt App 초기화
const app = new App({
  token: botToken,
  receiver,
  logLevel: LogLevel.INFO,
});

// 공통 미들웨어 적용
if (commonModule.applyBambooCommon) {
  commonModule.applyBambooCommon(app);
}

// 메시지 커맨드 등록
if (messageCommand.message) {
  app.command('/익명', messageCommand.message);
}

// 스레드 커맨드(필요 시)
if (threadCommand.thread) {
  app.command('/익명스레드', threadCommand.thread);
}

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
