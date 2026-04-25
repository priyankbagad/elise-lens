"use client";

import { useEffect, useRef, useState } from "react";
import type { Howl } from "howler";

/* ─── Config ─────────────────────────────────────────────────────────────────── */

const WORDS = [
  "cold leads.",
  "manual research.",
  "generic outreach.",
  "wasted pipeline.",
  "Elise Lens.",
] as const;

const FINAL_IDX = WORDS.length - 1;
const TYPE_SPEED = 80;
const DELETE_SPEED = 45;
const PAUSE_AFTER_WORD = 1200;
const PAUSE_BEFORE_DELETE = 800;
const CURSOR_BLINK = 530;

const SPRITE: Record<string, [number, number]> = {
  k01: [3615, 137],  k02: [4226, 125],  k03: [4785, 123],
  k04: [5278, 130],  k05: [5874, 109],  k06: [7990, 105],
  k07: [8537, 112],  k08: [9071, 115],  k09: [9612, 113],
  k10: [10157, 116], k11: [10765, 129], k12: [11303, 126],
  k13: [12512, 116], k14: [12981, 116], k15: [13477, 145],
  k16: [13998, 125], k17: [14514, 126], k18: [15030, 130],
  k19: [15524, 150], k20: [16027, 116], k21: [16556, 117],
  k22: [17053, 125], k23: [17585, 117], k24: [18085, 124],
  k25: [18587, 118], k26: [19071, 152], k27: [19669, 114],
  k28: [20178, 126], k29: [20676, 108],
  backspace: [21483, 423],
  k30: [22252, 144], k31: [22797, 142], k32: [23326, 132],
  k33: [23848, 124], k34: [24304, 148], k35: [24825, 141],
  k36: [25348, 123], k37: [25800, 147], k38: [26330, 118],
  k39: [26811, 133], k40: [27345, 131], k41: [27905, 141],
  k42: [28431, 117], k43: [28952, 117], k44: [29452, 134],
  k45: [29958, 108], k46: [31047, 148], k47: [31567, 114],
  k48: [32039, 143], k49: [32496, 151], k50: [33013, 116],
  k51: [33460, 147], k52: [33990, 151], k53: [34431, 142],
  k54: [34965, 122], k55: [35444, 132], k56: [35951, 123],
  k57: [36435, 146], k58: [36904, 149],
};

const KEY_IDS = Array.from({ length: 58 }, (_, i) =>
  `k${String(i + 1).padStart(2, "0")}`
);

type Phase = "idle" | "typing" | "pause" | "pre-delete" | "deleting" | "done";

/* ─── Component ──────────────────────────────────────────────────────────────── */

export function TypewriterSound() {
  const [displayed, setDisplayed] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [cursorOn, setCursorOn] = useState(true);

  const howlRef = useRef<Howl | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Lazy-init Howl on client only
  useEffect(() => {
    import("howler").then(({ Howl }) => {
      howlRef.current = new Howl({
        src: ["/sounds/sound.ogg"],
        sprite: SPRITE,
        volume: 0.6,
      });
    });
  }, []);

  // Cursor blink
  useEffect(() => {
    const id = setInterval(() => setCursorOn((v) => !v), CURSOR_BLINK);
    return () => clearInterval(id);
  }, []);

  // IntersectionObserver — trigger once on viewport entry
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setPhase("typing");
        observer.disconnect();
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // State machine
  useEffect(() => {
    if (phase === "idle" || phase === "done") return;

    const sound = howlRef.current;
    const word = WORDS[wordIndex];

    function playKey() {
      const id = KEY_IDS[Math.floor(Math.random() * KEY_IDS.length)];
      sound?.play(id);
    }

    if (phase === "typing") {
      if (displayed.length < word.length) {
        const t = setTimeout(() => {
          playKey();
          setDisplayed(word.slice(0, displayed.length + 1));
        }, TYPE_SPEED);
        return () => clearTimeout(t);
      }
      // Word complete
      setPhase(wordIndex === FINAL_IDX ? "done" : "pause");
      return;
    }

    if (phase === "pause") {
      const t = setTimeout(() => setPhase("pre-delete"), PAUSE_AFTER_WORD);
      return () => clearTimeout(t);
    }

    if (phase === "pre-delete") {
      const t = setTimeout(() => {
        sound?.play("backspace");
        setPhase("deleting");
      }, PAUSE_BEFORE_DELETE);
      return () => clearTimeout(t);
    }

    if (phase === "deleting") {
      if (displayed.length > 0) {
        const t = setTimeout(() => {
          playKey();
          setDisplayed((d) => d.slice(0, -1));
        }, DELETE_SPEED);
        return () => clearTimeout(t);
      }
      // Word erased — advance
      setWordIndex((i) => i + 1);
      setPhase("typing");
    }
  }, [phase, displayed, wordIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const isFinal = wordIndex === FINAL_IDX;

  return (
    <div
      ref={containerRef}
      className="flex items-center justify-center font-mono text-2xl"
    >
      <span className={isFinal ? "text-[#7C3AED]" : "text-[#1A1A2E]"}>
        {displayed}
      </span>
      {/* Blinking cursor — hidden once "Elise Lens." is fully typed */}
      {phase !== "done" && (
        <span
          className="ml-px text-[#7C3AED] select-none"
          style={{ opacity: cursorOn ? 1 : 0 }}
        >
          |
        </span>
      )}
    </div>
  );
}
