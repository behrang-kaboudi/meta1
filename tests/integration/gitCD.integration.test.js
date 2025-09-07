import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../rout/server/app'; // مسیر را با ساختار خودت هماهنگ کن
import crypto from 'node:crypto';
let app;
beforeAll(() => {
  app = createApp(); // بدون listen
});
console.log('--- webhook.int.test.ts???????????????????? ---??');

describe('POST /api/data', () => {
  beforeEach(() => {
    process.env.GH_WEBHOOK_SECRET = '1234';
    process.env.DEPLOY_BRANCH = 'main';
  });
  //   it('should create resource', async () => {
  //     const res = await request(app)
  //       .post('/webhooks/git') // مسیر واقعی رو بگذار
  //       .set('Content-Type', 'application/json')
  //       .send({ name: 'Behrank', age: 30 });
  //     console.log('Response:', res.body);

  //     // expect(res.status).toBe(201); // با خروجی خودت هماهنگ کن
  //     expect(res.body).toMatchObject({ ok: true });
  //   });
  it('accepts valid signature', async () => {
    const payload = { ref: 'refs/heads/main' };
    const bodyStr = JSON.stringify(payload);
    const sig =
      'sha256=' +
      crypto.createHmac('sha256', process.env.GH_WEBHOOK_SECRET).update(bodyStr).digest('hex');

    await request(app)
      .post('/webhooks/git') // مسیر واقعی رو بگذار
      .set('Content-Type', 'application/json')
      .set('X-GitHub-Event', 'push')
      .set('X-Hub-Signature-256', sig)
      .send(bodyStr) // حتماً رشته؛ نه آبجکت!
      .expect(200);
  });
});

// describe('git test', () => {
//   it('works', () => {
//     console.log('--- webhook.int.test.ts ---??????????????????????');
//     expect(1 + 1).toBe(2);
//   });
//   it('rejects invalid signature', async () => {
//     const body = JSON.stringify({ ref: 'refs/heads/main' });
//     await request(app)
//       .post('/git/webhook/')
//       .set('Content-Type', 'application/json')
//       .set('X-GitHub-Event', 'push')
//       .set('X-Hub-Signature-256', 'sha256=deadbeef')
//       .send(body)
//       .expect(401);
//   });
// });

// import crypto from 'node:crypto';
// import * as child from 'node:child_process';

// function sign(secret, body) {
//   const h = crypto.createHmac('sha256', secret);
//   h.update(Buffer.from(body));
//   return 'sha256=' + h.digest('hex');
// }

// describe('POST /webhook', () => {

//   it('accepts valid push to main and triggers deploy', async () => {
//     const payload = {
//       ref: 'refs/heads/main',
//       repository: { id: 123 },
//       head_commit: { id: 'abc', message: 'test' },
//     };
//     const body = JSON.stringify(payload);
//     const sig = sign('testsecret', body);

//     const spy = vi
//       .spyOn(child, 'execFile')
//       // @ts-expect-error – ساده‌سازی امضای تایپی
//       .mockImplementation((file, args, opts, cb) => cb?.(null, 'ok', ''));

//     await request(app)
//       .post('/webhook')
//       .set('Content-Type', 'application/json') // لازم برای express.raw
//       .set('X-GitHub-Event', 'push')
//       .set('X-GitHub-Delivery', 'test-uuid')
//       .set('X-Hub-Signature-256', sig)
//       .send(body)
//       .expect(200);

//     expect(spy).toHaveBeenCalledWith(
//       '/bin/bash',
//       ['-lc', '/home/metaches/deploy.sh'],
//       expect.any(Object),
//       expect.any(Function),
//     );
//   });

//   it('ignores pushes to other branches', async () => {
//     const payload = { ref: 'refs/heads/feature-x' };
//     const body = JSON.stringify(payload);
//     const sig = sign('testsecret', body);

//     await request(app)
//       .post('/webhook')
//       .set('Content-Type', 'application/json')
//       .set('X-GitHub-Event', 'push')
//       .set('X-Hub-Signature-256', sig)
//       .send(body)
//       .expect(202);
//   });
// });
