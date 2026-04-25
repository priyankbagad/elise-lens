'use client';
import { useEffect, useRef, useState } from 'react';
import { Howl } from 'howler';

const WORDS = [
  "Warm Conversations.",
  "Closed Deals.",
  "Real Results.",
];

const FINAL_WORD = "Real Results.";

export default function TypewriterSound() {
  const [displayed, setDisplayed] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [started, setStarted] = useState(false);
  const [hintVisible, setHintVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const soundRef = useRef<Howl | null>(null);
  const audioUnlocked = useRef(false);
  const soundReady = useRef(false);

  // Initialize Howl + audio unlock
  useEffect(() => {
    soundRef.current = new Howl({
      src: ['/sounds/sound.mp3', '/sounds/sound.ogg'],
      sprite: {
        k01: [3615, 137], k02: [4226, 125], k03: [4785, 123],
        k04: [5278, 130], k05: [5874, 109], k06: [7990, 105],
        k07: [8537, 112], k08: [9071, 115], k09: [9612, 113],
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
      },
      volume: 1.0,
      onload: () => { soundReady.current = true; },
      onloaderror: () => { soundReady.current = false; },
    });

    const unlock = () => {
      if (audioUnlocked.current || !soundRef.current || !soundReady.current) return;
      const id = soundRef.current.play('k01');
      soundRef.current.volume(0, id);
      setTimeout(() => soundRef.current?.stop(id), 50);
      audioUnlocked.current = true;
      setHintVisible(false);
      ['click', 'keydown', 'scroll', 'touchstart']
        .forEach(e => document.removeEventListener(e, unlock));
    };

    ['click', 'keydown', 'scroll', 'touchstart']
      .forEach(e => document.addEventListener(e, unlock, { passive: true }));

    return () => {
      soundRef.current?.unload();
      ['click', 'keydown', 'scroll', 'touchstart']
        .forEach(e => document.removeEventListener(e, unlock));
    };
  }, []);

  // Auto-hide hint after 3 seconds regardless of unlock
  useEffect(() => {
    const t = setTimeout(() => setHintVisible(false), 3000);
    return () => clearTimeout(t);
  }, []);

  // IntersectionObserver — 500ms grace period after entering view
  useEffect(() => {
    let fired = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !fired) {
          fired = true;
          observer.disconnect();
          setTimeout(() => setStarted(true), 500);
        }
      },
      { threshold: 0.1 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const keyIds = Array.from({ length: 58 }, (_, i) =>
    `k${String(i + 1).padStart(2, '0')}`
  );

  const playKey = () => {
    if (!soundRef.current || !audioUnlocked.current || !soundReady.current) return;
    const id = keyIds[Math.floor(Math.random() * keyIds.length)];
    soundRef.current.play(id);
  };

  const playBackspace = () => {
    if (!soundRef.current || !audioUnlocked.current || !soundReady.current) return;
    soundRef.current.play('backspace');
  };

  // Main typewriter loop
  useEffect(() => {
    if (!started || isDone) return;

    const currentWord = WORDS[wordIndex];
    const isFinalWord = currentWord === FINAL_WORD;

    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting) {
      if (displayed.length < currentWord.length) {
        timeout = setTimeout(() => {
          playKey();
          setDisplayed(currentWord.slice(0, displayed.length + 1));
        }, 60);
      } else {
        if (isFinalWord) {
          setIsDone(true);
          return;
        }
        timeout = setTimeout(() => {
          playBackspace();
          setIsDeleting(true);
        }, 1800);
      }
    } else {
      if (displayed.length > 0) {
        timeout = setTimeout(() => {
          playKey();
          setDisplayed(displayed.slice(0, -1));
        }, 30);
      } else {
        timeout = setTimeout(() => {
          setIsDeleting(false);
          setWordIndex(i => i + 1);
        }, 300);
      }
    }

    return () => clearTimeout(timeout);
  }, [started, displayed, isDeleting, wordIndex, isDone]); // eslint-disable-line react-hooks/exhaustive-deps

  const isFinal = WORDS[wordIndex] === "Real Results." && isDone;

  return (
    <div ref={containerRef}>
      <div className="flex items-center">
        <span
          className="text-[#7C3AED] text-5xl md:text-6xl lg:text-7xl font-bold leading-tight"
          style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)" }}
        >
          {displayed}
        </span>
        <span
          className="text-[#7C3AED] text-5xl md:text-6xl lg:text-7xl font-bold leading-tight ml-1 animate-[blink_530ms_step-end_infinite]"
          style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)" }}
        >
          |
        </span>
        {isFinal && null}
      </div>

      {hintVisible && !started && (
        <p className="text-xs text-[#9CA3AF] mt-2 animate-pulse">
          🔊 scroll or click to enable sound
        </p>
      )}
    </div>
  );
}
