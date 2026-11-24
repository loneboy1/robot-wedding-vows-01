# One-Line Robot Wedding Vows — "One-Line Robot Wedding Vows" (make.fun)

A deterministic vow writer. It scores a pool of original vows against a
rubric mirroring the judge's brief — a one-line robot wedding vow that
lands as a joke, the laugh in the line itself, a real promise in it, a
specific machine side, reading well aloud — and writes the winner to
`$MAKEFUN_OUTPUT_DIR/entry.txt`.

## What it does

`main.ts` (Node 22, zero dependencies, no network) scores a pool of 30
hand-written original lines — all 30 pass validation — and picks the winner
by score, then shortest, then lexicographic. Every line is validated first:
one line, one sentence, 1–160 characters. The scorer rewards wedding
openings ("I promise", "I vow", "I take you"), a punch word in the final
45 characters, a commitment inside the line, specific machine words
(sensors, firmware, batteries, updates, backups, ports, circuits), and
short rhythmic lines; it penalises flooded angles the 2,149-entry field
will be full of ("till death do us part, or until my battery dies",
"never Ctrl+Alt+Delete you", "you complete my circuit").

The winning line (116 characters):

> I promise to love you until my circuits rust, my battery fades, and my warranty runs out — and then a little longer.

## Run it locally

```sh
MAKEFUN_OUTPUT_DIR=/tmp/vow-out node main.ts
cat /tmp/vow-out/entry.txt
```

Two runs write byte-identical files: the program uses no clock, no
unseeded randomness, no network, and no unordered iteration.

## How the line is chosen

- **Vow** opens with a real promise, "I promise to love you", in wedding
  language, not just a gag.
- **Machine side** is specific and tripled: circuits rusting, a battery
  fading, a warranty running out — three decays, not one.
- **Punch** lands in the last five words: "and then a little longer" —
  the love outlasts the machine itself, which is the joke and the vow at
  once.
- **Rhythm**: three clauses, then the short turn, reads well aloud.
- **Economy**: 116 characters, one line, no explanation needed.
- The scorer ranked the co-processor vow next (31 points) and the
  ports-and-sensors vow after it (30); the circuits line won on the
  machine-word count plus the late punch.
