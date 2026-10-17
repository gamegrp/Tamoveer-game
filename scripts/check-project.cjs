const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const opts = JSON.parse(fs.readFileSync(path.join(root, 'settings.json'), 'utf8'));
assert.equal(pkg.name, 'tamoveer', 'package.name must be tamoveer');
assert.equal(pkg.build.productName, 'Tamoveer', 'productName must be Tamoveer');
assert.equal(pkg.build.appId, 'com.tamoveer.nitaistudio', 'appId incorrect');
assert.ok(fs.existsSync(path.join(root, 'web/index.html')), 'web/index.html missing');
assert.match(fs.readFileSync(path.join(root, 'web/index.html'), 'utf8').slice(0, 6000), /Tamoveer/, 'Tamoveer PWA game not found');
assert.equal(opts.windowTitle, 'Tamoveer', 'windowTitle incorrect');
assert.ok(fs.existsSync(path.join(root, 'web/manifest.webmanifest')), 'PWA manifest missing');
assert.ok(fs.existsSync(path.join(root, 'web/icons/icon-512.png')), 'Tamoveer icon missing');
assert.ok(fs.existsSync(path.join(root, 'build/icon.icns')), 'build/icon.icns missing');
for (const size of [16, 32, 64, 128, 256, 512]) {
  assert.ok(fs.existsSync(path.join(root, `build/icons/${size}x${size}.png`)), `Linux icon ${size}px missing`);
}
if (opts.mode === 'remote') {
  const u = new URL(opts.remoteUrl);
  assert.equal(u.protocol, 'https:', 'Remote URL must be HTTPS');
} else {
  assert.equal(opts.mode, 'local', 'mode must be local or remote');
}
console.log('Tamoveer source, branding and build configuration look valid.');
