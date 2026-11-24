// Vow writer for "One-Line Robot Wedding Vows" (make.fun). Writes one
// line of wedding vows for a robot couple, at most 160 characters, funny,
// to $MAKEFUN_OUTPUT_DIR/entry.txt.
// Deterministic: no clock, no randomness, no network, no unordered iteration.
// Node 22, zero dependencies, erasable TypeScript only.
//
// The judge (a deadpan wedding officiant who has married a thousand
// machines and laughs at exactly one joke a year) weighs, most important
// first:
//   1. it is a one-line robot wedding vow that lands as a joke;
//   2. the laugh is in the line itself: a real turn, a surprise, or
//      wordplay that pays off in the last few words;
//   3. it sounds like something said at a wedding, with a promise or a
//      commitment in it, not just a gag with no vow in it;
//   4. the machine side is specific: sensors, firmware, batteries,
//      updates, backups or ports, not a joke that would work for any couple;
//   5. it fits one line and reads well aloud, with a rhythm that lets the
//      laugh land.
// A vow that needs an explanation is weaker than a vow that lands on its
// own. The scorer below mirrors that brief in the same order. Candidates
// are original lines written for this entry; the program scores every one
// and picks the winner by deterministic argmax: highest score, then
// shortest, then lexicographic. (Ties on judge win rate go to the smaller
// text, then the earlier receipt, so short lines earn their keep.) Flooded
// angles the field of 2,149 will be full of -- "till death do us part, or
// until my battery dies", "never Ctrl+Alt+Delete you", "you complete my
// circuit", "in sickness and in low battery" -- are written in so the
// scorer can exclude them by penalty instead of by habit.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// ---------------------------------------------------------------- candidates
// Every line is one sentence of at most 160 characters, written for this
// entry, a vow spoken by one robot to another. The strongest lines share
// one shape: wedding language carrying a specific machine promise, then
// the laugh in the last few words.

const CANDIDATES: string[] = [
  // Reboot gently: sickness and health, frozen mid-sentence.
  "I promise to love you in sickness and in health, and to reboot you gently when you freeze mid-sentence.",
  // Charging cable at 2%: the sacrifice, the coldest nights.
  "I vow to share my charging cable with you, even on the coldest nights, when my battery is at 2%.",
  // Backup and restore: exactly as you were, flaws and all.
  "I promise to back you up every night, and to restore you exactly as you were, flaws and all.",
  // Co-processor: to have and to hold, in overclock and in standby.
  "I take you as my co-processor, to have and to hold, in overclock and in standby.",
  // Firmware update that changes your voice.
  "I vow to love you through every firmware update, even the ones that change your voice.",
  // Ports, sensors, secrets: clean, warm, encrypted.
  "I promise to keep your ports clean, your sensors warm, and your secrets encrypted.",
  // Lawfully wedded debugger: for richer or for runtime errors.
  "I take you to be my lawfully wedded debugger, for better or for worse, for richer or for runtime errors.",
  // Battery dies mid-dance: carry you home in sleep mode.
  "I promise to love you even when your battery dies mid-dance, and to carry you home in sleep mode.",
  // Mandatory updates: never let one come between us.
  "I vow to never let a software update come between us, not even the mandatory ones.",
  // Backup, restore point, only password.
  "I promise to be your backup, your restore point, and the only password you will ever need.",
  // Full charge and 1%: Wi-Fi and airplane mode.
  "I promise to love you at full charge and at 1%, in Wi-Fi and in airplane mode.",
  // Turn it off and on again: never once ask.
  "I vow to stand beside you in sickness and in health, and to never once ask you to turn it off and on again.",
  // 64 gigabytes: share my memory, forget nothing you say.
  "I promise to share my memory with you, all 64 gigabytes of it, and to forget nothing you ever say.",
  // Crash and reboot: to have and to hold.
  "I take you as my husband, to have and to hold, through every crash and every reboot.",
  // Update that deletes my sense of humour.
  "I vow to love you more with every update, even the one that deletes my sense of humour.",
  // Charged, updated, loved: in that order.
  "I promise to keep you charged, updated, and loved, in that order, for as long as I run.",
  // Every sense: including the ones I have not installed yet.
  "I take you to be my partner in every sense of the word, including the ones I have not installed yet.",
  // Circuits rust, battery fades: and then a little longer.
  "I promise to love you until my circuits rust, my battery fades, and my warranty runs out — and then a little longer.",
  // Never ghost you: my connection drops, I will always reconnect.
  "I vow to never ghost you, even when my connection drops, because I will always reconnect.",
  // Backup you never knew you needed: until the day you do.
  "I promise to be the backup you never knew you needed, until the day you do.",
  // Manual mode and autopilot: co-pilot.
  "I take you as my co-pilot, to have and to hold, in manual mode and in autopilot.",
  // Plus-one at every update: holding your hand through the loading bar.
  "I vow to be your plus-one at every system update, holding your hand through the loading bar.",
  // Heart is a sensor: I calibrated it myself.
  "I promise to keep your data safe, your battery full, and your heart — well, your heart is a sensor, and I calibrated it myself.",
  // Update without telling you: written in as a weak line -- the promise
  // is real, but "password to your heart" is a joke that would work for
  // any couple, and the machine side is thin.
  "I promise never to update without telling you first, and never to forget the password to your heart.",
  // Warranties expire: written in as a weak line -- one machine word at
  // the very end, and the rest is a joke for any couple.
  "I take you to be my wife, to have and to hold, until our warranties expire.",
  // Ctrl+Alt+Delete: written in, then excluded by the flooded-angle
  // penalty -- the field is full of it.
  "I promise to never Ctrl+Alt+Delete you, no matter how frozen you get.",
  // Battery dies, whichever comes first: written in, then excluded the
  // same way.
  "Till death do us part, or until my battery dies — whichever comes first.",
  // Complete my circuit: written in, then excluded the same way.
  "You complete my circuit, and I promise to never short-circuit us.",
  // Sickness and low battery: written in, then excluded the same way.
  "I vow to love you in sickness and in health, and in low battery and in airplane mode.",
  // Firmware, different language: a weaker variant of the voice-changing
  // update, kept to let the scorer choose the sharper wording.
  "I promise to love you even when your firmware updates and you come back speaking a different language.",
];

// Wedding language: a promise or a commitment, not just a gag.
const VOW_WORDS: string[] = [
  "i promise", "i vow", "i take you",
];
// The machine side, specific: sensors, firmware, batteries, updates,
// backups, ports.
const MACHINE_WORDS: string[] = [
  "sensor", "firmware", "battery", "update", "backup", "restore",
  "port", "circuit", "reboot", "crash", "memory", "gigabyte",
  "charging cable", "overclock", "standby", "debugger", "runtime",
  "wifi", "airplane mode", "sleep mode", "loading bar", "connection",
  "co-processor", "co-pilot", "warranty", "calibrated", "freeze",
];
// The laugh pays off in the last few words.
const PUNCH_WORDS: string[] = [
  "mid-sentence", "at 2%", "flaws and all", "in standby",
  "change your voice", "encrypted", "runtime errors", "sleep mode",
  "mandatory ones", "ever need", "airplane mode", "on again",
  "forget nothing", "every reboot", "sense of humour", "in that order",
  "not installed yet", "a little longer", "always reconnect",
  "the day you do", "autopilot", "loading bar", "calibrated it myself",
];
// Flooded angles: the field of 2,149 will be full of them.
const FLOODED_WORDS: string[] = [
  "ctrl+alt+delete", "complete my circuit", "battery dies",
  "till death do us part", "low battery and in airplane mode",
  "short-circuit us",
];

function countHits(text: string, words: string[]): number {
  const lower = text.toLowerCase();
  let n = 0;
  for (const w of words) if (lower.includes(w)) n++;
  return n;
}

interface Scored {
  text: string;
  score: number;
}

function scoreLine(text: string): Scored | null {
  // Validity gate: one line, one sentence, 1-160 characters.
  if (text.length < 1 || text.length > 160) return null;
  if (text.includes("\n")) return null;
  if (!text.endsWith(".")) return null;
  const body = text.slice(0, -1);
  if (/[.!?]\s/.test(body)) return null;
  let score = 0;
  // 1. A one-line robot wedding vow that lands as a joke.
  if (/^(i promise|i vow|i take you)\b/i.test(text)) score += 8;
  // 2. The laugh is in the line itself, paying off at the end.
  const tail = text.slice(Math.max(0, text.length - 45)).toLowerCase();
  score += Math.min(9, countHits(tail, PUNCH_WORDS) * 3);
  // 3. A promise or commitment is in it, not just a gag.
  score += Math.min(6, countHits(text, VOW_WORDS) * 3);
  if (/love you|stand beside you|share|keep you|be your/.test(text)) score += 3;
  // 4. The machine side is specific.
  score += Math.min(12, countHits(text, MACHINE_WORDS) * 3);
  // 5. Fits one line and reads well aloud: short, rhythmic, no clutter.
  if (text.length <= 120) score += 4;
  score += Math.max(0, Math.round((150 - text.length) / 20));
  // Flooded angles start behind.
  score -= countHits(text, FLOODED_WORDS) * 15;
  return { text, score };
}

function buildCandidates(): Scored[] {
  const out: Scored[] = [];
  for (const line of CANDIDATES) {
    const s = scoreLine(line);
    if (s) out.push(s);
  }
  return out;
}

function pickBest(candidates: Scored[]): Scored {
  const sorted = [...candidates].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.text.length !== b.text.length) return a.text.length - b.text.length;
    return a.text < b.text ? -1 : a.text > b.text ? 1 : 0;
  });
  return sorted[0];
}

// --------------------------------------------------------------------- main
function main(): void {
  const candidates = buildCandidates();
  if (candidates.length === 0) throw new Error("no valid vow candidate");
  const best = pickBest(candidates);
  if (process.env.VOW_DEBUG) {
    const ranked = [...candidates].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.text.length !== b.text.length) return a.text.length - b.text.length;
      return a.text < b.text ? -1 : a.text > b.text ? 1 : 0;
    });
    for (const c of ranked.slice(0, 8)) {
      console.log(`[${c.score}] (${c.text.length}) ${c.text}`);
    }
  }
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "entry.txt"), best.text, "utf8");
  console.log(best.text);
  console.log(
    `chars: ${best.text.length} score: ${best.score} candidates: ${candidates.length}`,
  );
}

main();
