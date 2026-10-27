import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const gameScript = fs.readFileSync(new URL('../game.js', import.meta.url), 'utf8');
const page = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');

class TokenList {
  values = new Set();
  add(x) { this.values.add(x); }
  remove(x) { this.values.delete(x); }
  contains(x) { return this.values.has(x); }
  toggle(x, yes) {
    if (yes === undefined ? !this.values.has(x) : yes) this.add(x);
    else this.remove(x);
  }
}
class FakeNode {
  constructor(id = '', dataset = {}) {
    this.id = id;
    this.dataset = dataset;
    this.classList = new TokenList();
    this.style = {};
    this.children = [];
    this.handlers = new Map();
    this.attributes = {};
    this.textContent = '';
    this.disabled = false;
  }
  addEventListener(name, fn) {
    if (!this.handlers.has(name)) this.handlers.set(name, []);
    this.handlers.get(name).push(fn);
  }
  dispatch(name, attrs = {}) {
    const event = { preventDefault() {}, pointerId: 1, ...attrs };
    for (const fn of this.handlers.get(name) || []) fn(event);
  }
  append(child) { this.children.push(child); }
  replaceChildren(...children) { this.children = [...children]; }
  setAttribute(key, value) { this.attributes[key] = value; }
  setPointerCapture() {}
  getBoundingClientRect() { return { left: 0, width: 390 }; }
}
function makeHarness() {
  const nodes = new Map();
  const get = (id) => {
    if (!nodes.has(id)) nodes.set(id, new FakeNode(id));
    return nodes.get(id);
  };
  const teamButtons = ['13', '22'].map(team => new FakeNode('team-' + team, { team }));
  const durationButtons = [45, 90].map(seconds => new FakeNode('time-' + seconds, { seconds: String(seconds) }));
  let clock = 0, serial = 0;
  const frames = new Map();
  const storage = new Map();
  const noop = () => {};
  const ctx = new Proxy({ createLinearGradient: () => ({ addColorStop: noop }) },
    { get(target, key) { return key in target ? target[key] : noop; } });
  get('gameCanvas').getContext = () => ctx;
  const document = {
    hidden: false,
    getElementById: get,
    querySelectorAll(selector) {
      if (selector === '[data-team]') return teamButtons;
      if (selector === '[data-seconds]') return durationButtons;
      return [];
    },
    createElement: () => new FakeNode(),
    addEventListener: noop,
  };
  const math = Object.create(Math);
  math.random = () => 0.5; // Spawn valuable cases directly above centered player.
  const window = { addEventListener: noop };
  const environment = {
    document, window, Math: math, Image: class { complete = false; naturalWidth = 0; naturalHeight = 0; },
    navigator: {}, location: { href: 'https://example.test/arcade/' },
    localStorage: {
      getItem: key => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, String(value)),
    },
    performance: { now: () => clock },
    requestAnimationFrame(fn) { const id = ++serial; frames.set(id, fn); return id; },
    cancelAnimationFrame(id) { frames.delete(id); },
    console,
  };
  vm.runInNewContext(gameScript, environment, { filename: 'arcade/game.js' });
  const advance = (seconds) => {
    for (let t = 0; t < seconds * 20; t++) {
      if (!frames.size) return;
      const [id, fn] = frames.entries().next().value;
      frames.delete(id);
      clock += 50;
      fn(clock);
    }
  };
  return { get, teamButtons, durationButtons, advance, storage };
}

test('HTML declares special power controls and matching result stat', () => {
  for (const id of ['specialButton', 'specialCharge', 'hudPhase', 'abilityHint', 'resultPowers'])
    assert.match(page, new RegExp('id="' + id + '"'));
});
test('Four selectable protagonists, distinct descriptions, menu and tutorial', () => {
  const g = makeHarness();
  assert.equal(g.get('roster').children.length, 2);
  assert.match(g.get('abilityHint').textContent, /PALANQUE/);
  g.get('roster').children[1].dispatch('click');
  assert.match(g.get('abilityHint').textContent, /PLANO B/);
  g.teamButtons[1].dispatch('click');
  assert.equal(g.get('roster').children.length, 2);
  assert.match(g.get('abilityHint').textContent, /TURBO/);
  g.get('roster').children[1].dispatch('click');
  assert.match(g.get('abilityHint').textContent, /PASSAPORTE/);
  g.durationButtons[1].dispatch('click');
  assert.equal(g.durationButtons[1].attributes['aria-pressed'], 'true');
  g.get('howButton').dispatch('click');
  assert.equal(g.get('howOverlay').classList.contains('hidden'), false);
  g.get('gotItButton').dispatch('click');
  assert.equal(g.get('howOverlay').classList.contains('hidden'), true);
});
test('Collecting five maletas charges special; activation consumes power and appears in results', () => {
  const g = makeHarness();
  g.get('startButton').dispatch('click');
  assert.equal(g.get('gameScreen').classList.contains('hidden'), false);
  assert.equal(g.get('specialButton').disabled, true);
  g.advance(16);
  assert.equal(g.get('specialButton').disabled, false);
  assert.match(g.get('specialCharge').textContent, /PRONTO/);
  g.get('specialButton').dispatch('click');
  assert.equal(g.get('specialCharge').textContent, '0%');
  assert.equal(g.get('specialButton').disabled, true);
  g.advance(31);
  assert.equal(g.get('resultOverlay').classList.contains('hidden'), false);
  assert.equal(g.get('resultPowers').textContent, '1');
  assert.ok(Number(g.get('resultCases').textContent) >= 5);
  assert.match(g.get('hudPhase').textContent, /ATO III/);
});
test('Pause, resume, quit and restart reset the game safely', () => {
  const g = makeHarness();
  g.get('startButton').dispatch('click');
  g.advance(2);
  g.get('pauseButton').dispatch('click');
  assert.equal(g.get('pauseOverlay').classList.contains('hidden'), false);
  g.get('resumeButton').dispatch('click');
  assert.equal(g.get('pauseOverlay').classList.contains('hidden'), true);
  g.get('pauseButton').dispatch('click');
  g.get('quitButton').dispatch('click');
  assert.equal(g.get('menu').classList.contains('hidden'), false);
  g.get('startButton').dispatch('click');
  assert.equal(g.get('specialCharge').textContent, '0%');
});
