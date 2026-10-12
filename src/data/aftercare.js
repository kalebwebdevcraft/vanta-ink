// Aftercare timeline + FAQ content. Edit freely for each artist.
// General guidance only: the artist's own instructions always come first.

export const STAGES = [
  {
    id: 'fresh',
    from: 0,
    to: 1,
    title: 'Fresh',
    range: 'Day 0 – 1',
    look: 'Red, warm and a little swollen. Clear fluid and extra ink may seep out. This is normal.',
    do: ['Keep the wrap on for as long as your artist told you', 'Wash gently with unscented soap and lukewarm water', 'Pat dry with a clean paper towel'],
    dont: ['Re-wrap with cling film', 'Soak, swim or use a sauna', 'Pick, scratch or peel anything'],
  },
  {
    id: 'peel',
    from: 2,
    to: 6,
    title: 'Tight & peeling',
    range: 'Day 2 – 6',
    look: 'Redness fades. The skin feels tight, then starts to flake like a sunburn.',
    do: ['Wash twice a day, pat dry', 'Apply a very thin layer of the ointment your artist recommended', 'Wear loose, clean clothes over it'],
    dont: ['Use thick layers of cream (it suffocates the skin)', 'Pull off flakes', 'Expose it to direct sun'],
  },
  {
    id: 'itch',
    from: 7,
    to: 14,
    title: 'Flaky & itchy',
    range: 'Day 7 – 14',
    look: 'Flaking continues and the itch peaks. The tattoo can look dull or patchy.',
    do: ['Slap or gently pat the itch instead of scratching', 'Switch to unscented lotion once flaking starts', 'Keep it clean and dry'],
    dont: ['Scratch, even in your sleep', 'Shave over it', 'Panic about the dull look, it is temporary'],
  },
  {
    id: 'cloudy',
    from: 15,
    to: 30,
    title: 'Cloudy layer',
    range: 'Day 15 – 30',
    look: 'A milky film sits over the ink while the deeper skin finishes healing. Colours look muted.',
    do: ['Moisturise once or twice a day', 'Keep it out of strong sun', 'Stay hydrated'],
    dont: ['Judge the final result yet', 'Go for long swims or hot baths', 'Skip sunscreen when it is exposed'],
  },
  {
    id: 'healed',
    from: 31,
    to: 42,
    title: 'Settled',
    range: 'Day 31 – 42',
    look: 'The film clears and the lines sharpen. This is how the tattoo will look from now on.',
    do: ['Use sunscreen on it for life', 'Book your free touch-up check if you want one', 'Send your artist a healed photo'],
    dont: ['Ignore a spot that still looks uneven, show your artist', 'Tan it without protection'],
  },
];

export const WARNING =
  'See a doctor straight away if you notice spreading redness, increasing heat or pain, pus, a bad smell, or you develop a fever.';

export const FAQ = [
  {
    q: 'How much will it hurt?',
    a: 'It depends on the spot and on you. Fleshy areas like the outer thigh and upper arm are easier. Ribs, spine, hands, feet and the neck are more intense. The body map on the booking page shows a pain rating for every zone.',
  },
  {
    q: 'Can I bring my own design?',
    a: 'Yes. Upload your references in the booking flow. Your artist redraws the idea in their own style, so it is a one-of-one piece and not a copy of someone else’s work.',
  },
  {
    q: 'How do deposits work?',
    a: 'Your deposit secures your date and is taken off the final price. After you send a request, the studio confirms the design and price and sends a payment link.',
  },
  {
    q: 'What if I need to reschedule?',
    a: 'Tell the studio at least 48 hours before your session and your deposit moves to the new date. Later than that, the deposit may be lost.',
  },
  {
    q: 'Do you do cover-ups and reworks?',
    a: 'Yes. Choose Cover-up in the booking flow and upload a clear photo of the existing tattoo. Cover-ups usually need a larger design and a consultation first.',
  },
  {
    q: 'Is there a free touch-up?',
    a: 'One touch-up check is included within the first few months. It covers healing issues like patchy spots, not changes to the design.',
  },
  {
    q: 'Can I bring a friend?',
    a: 'One guest is welcome. The studio is private, so please keep it to one person.',
  },
  {
    q: 'Do you tattoo under 18?',
    a: 'No. You need to be 18 or older and show valid ID at your session.',
  },
];