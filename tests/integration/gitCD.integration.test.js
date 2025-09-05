// // test/integration/webhook.int.test.js
// import { describe, it, expect, beforeEach, vi } from 'vitest';
// import request from 'supertest';

// import { app } from '../../rout/mainRout';
// import { root } from '../../rout/git';
// console.log('--- webhook.int.test.ts ---??');

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
//   beforeEach(() => {
//     process.env.NODE_ENV = 'test';
//     process.env.GH_WEBHOOK_SECRET = 'testsecret';
//     process.env.DEPLOY_BRANCH = 'main';
//   });

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
