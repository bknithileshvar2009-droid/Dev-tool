/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Flocus Dashboard — Unique Daily Motivational Quote System
 * 137 Unique Daily Quotes from 17 October 2026 through 2 March 2027 inclusive.
 * Each calendar date has its own distinct, non-generic quote aligned with
 * exam countdown preparation (Target 550+, Physics 100, Chemistry 100, Maths 100, etc.).
 */

export interface DailyMotivationQuote {
  date: string; // YYYY-MM-DD
  dayNumber: number; // 1 to 137
  daysRemaining: number; // Days to Public Exam start (March 3, 2027)
  category: string;
  theme: string;
  quote: string;
}

// Legacy compatibility interface
export interface MotivationQuote {
  id: string;
  quote: string;
  author: string;
  category: string;
}

export const DAILY_MOTIVATION_QUOTES: DailyMotivationQuote[] = [
  {
    "date": "2026-10-17",
    "dayNumber": 1,
    "daysRemaining": 137,
    "category": "Mindset & Goal Setting",
    "theme": "Target 550+ Clarity",
    "quote": "A 550+ aggregate is built not in the final week, but in the ordinary hours you choose to study right now."
  },
  {
    "date": "2026-10-18",
    "dayNumber": 2,
    "daysRemaining": 136,
    "category": "Physics 100 Target",
    "theme": "Conceptual Understanding",
    "quote": "Treat every physics derivation like an unbroken logical chain. When step three is obvious, the hundred marks become natural."
  },
  {
    "date": "2026-10-19",
    "dayNumber": 3,
    "daysRemaining": 135,
    "category": "Chemistry 100 Target",
    "theme": "Organic Mechanisms",
    "quote": "Master the electron flow and reagents rather than memorizing reactions blindly; organic chemistry rewards structural clarity."
  },
  {
    "date": "2026-10-20",
    "dayNumber": 4,
    "daysRemaining": 134,
    "category": "Maths Accuracy",
    "theme": "Calculus Precision",
    "quote": "In mathematics, speed follows neatness. Write down every intermediate integral step and let accuracy protect your Centum."
  },
  {
    "date": "2026-10-21",
    "dayNumber": 5,
    "daysRemaining": 133,
    "category": "Deep Focus",
    "theme": "Distraction Elimination",
    "quote": "Put the phone outside the room for this 90-minute sprint. An undisturbed mind learns twice as much in half the time."
  },
  {
    "date": "2026-10-22",
    "dayNumber": 6,
    "daysRemaining": 132,
    "category": "Biology Revision",
    "theme": "Diagrams & Recall",
    "quote": "Practice sketching biology diagrams with sharp pencil lines and complete labels. Visual precision guarantees full credit."
  },
  {
    "date": "2026-10-23",
    "dayNumber": 7,
    "daysRemaining": 131,
    "category": "Language Excellence",
    "theme": "Tamil & English Strategy",
    "quote": "Do not neglect language papers: well-structured essays and clean handwriting in Tamil and English safeguard your 550+ total."
  },
  {
    "date": "2026-10-24",
    "dayNumber": 8,
    "daysRemaining": 130,
    "category": "Active Recall",
    "theme": "Closed-Book Testing",
    "quote": "Close the textbook and explain the concept on a blank sheet of paper. Real retention is proven only when you can reproduce it from memory."
  },
  {
    "date": "2026-10-25",
    "dayNumber": 9,
    "daysRemaining": 129,
    "category": "Mistake Analysis",
    "theme": "Error Log Notebook",
    "quote": "Every error identified in today's mock drill is one fewer mistake waiting to happen in March. Cherish your correction notebook."
  },
  {
    "date": "2026-10-26",
    "dayNumber": 10,
    "daysRemaining": 128,
    "category": "Daily Discipline",
    "theme": "Routine Execution",
    "quote": "Motivation gets you to your study desk, but adherence to your daily timetable keeps you there until the syllabus is conquered."
  },
  {
    "date": "2026-10-27",
    "dayNumber": 11,
    "daysRemaining": 127,
    "category": "Time Management",
    "theme": "Timed Question Practice",
    "quote": "Solve your 5-mark physics questions against a stopwatch. Managing your exam minutes now removes the panic later."
  },
  {
    "date": "2026-10-28",
    "dayNumber": 12,
    "daysRemaining": 126,
    "category": "Calmness & Poise",
    "theme": "Emotional Balance",
    "quote": "Patience turns a difficult problem into an understandable one. Take one deep breath and re-read the question carefully."
  },
  {
    "date": "2026-10-29",
    "dayNumber": 13,
    "daysRemaining": 125,
    "category": "Physical Recovery",
    "theme": "Sleep & Brain Function",
    "quote": "A tired brain makes avoidable arithmetic errors. Protect seven hours of quality sleep to cement everything studied today."
  },
  {
    "date": "2026-10-30",
    "dayNumber": 14,
    "daysRemaining": 124,
    "category": "Mock Test Practice",
    "theme": "Exam Hall Simulation",
    "quote": "Treat this practice paper exactly like the public board exam: strictly timed, quiet room, and zero peeking at the answer key."
  },
  {
    "date": "2026-10-31",
    "dayNumber": 15,
    "daysRemaining": 123,
    "category": "October Wrap-up",
    "theme": "Progress Milestone",
    "quote": "October closes with solid groundwork completed. Celebrate the chapters you have conquered and carry this momentum into November."
  },
  {
    "date": "2026-11-01",
    "dayNumber": 16,
    "daysRemaining": 122,
    "category": "New Month Drive",
    "theme": "Fresh Focus Sprint",
    "quote": "Welcome November with high standards. A fresh month gives you thirty new opportunities to solidify your 100/100 foundations."
  },
  {
    "date": "2026-11-02",
    "dayNumber": 17,
    "daysRemaining": 121,
    "category": "Physics Numericals",
    "theme": "Units & Dimensions",
    "quote": "Never rush the final numerical answer without checking the SI units; that final check is what preserves the full mark."
  },
  {
    "date": "2026-11-03",
    "dayNumber": 18,
    "daysRemaining": 120,
    "category": "Chemistry Equations",
    "theme": "Stoichiometry & Balance",
    "quote": "Always balance your chemical equations immediately. Unbalanced coefficients are unforced errors you cannot afford."
  },
  {
    "date": "2026-11-04",
    "dayNumber": 19,
    "daysRemaining": 119,
    "category": "Maths Trigonometry",
    "theme": "Identity Fluency",
    "quote": "When trigonometric transformations feel instinctive, complex calculus problems unravel in just three clean lines."
  },
  {
    "date": "2026-11-05",
    "dayNumber": 20,
    "daysRemaining": 118,
    "category": "Spaced Repetition",
    "theme": "Flashcard Review",
    "quote": "Revisit the formula sheet you drafted two weeks ago. Reviewing old material prevents the quiet decay of hard-earned concepts."
  },
  {
    "date": "2026-11-06",
    "dayNumber": 21,
    "daysRemaining": 117,
    "category": "Deep Work Habit",
    "theme": "Single-Tasking",
    "quote": "One subject at a time, one concept at a time. Multi-tasking is an illusion that drains cognitive stamina."
  },
  {
    "date": "2026-11-07",
    "dayNumber": 22,
    "daysRemaining": 116,
    "category": "Biology Genetics",
    "theme": "Punnett Squares & Laws",
    "quote": "Draw out the genetic crosses clearly with genotypes and phenotypes stated. Precision in genetics leaves examiners no room to deduct marks."
  },
  {
    "date": "2026-11-08",
    "dayNumber": 23,
    "daysRemaining": 115,
    "category": "English Comprehension",
    "theme": "Answer Conciseness",
    "quote": "Answer precisely what the literature question asks. Clear point-wise answers always score higher than wandering paragraphs."
  },
  {
    "date": "2026-11-09",
    "dayNumber": 24,
    "daysRemaining": 114,
    "category": "Mindset & Resilience",
    "theme": "Tough Topic Breakthrough",
    "quote": "When a chapter feels overwhelming, break it down into four sub-topics and conquer one before lunch."
  },
  {
    "date": "2026-11-10",
    "dayNumber": 25,
    "daysRemaining": 113,
    "category": "Discipline",
    "theme": "Early Morning Start",
    "quote": "The quiet clarity of early morning tuition and dawn study sets a victorious tone for your entire day."
  },
  {
    "date": "2026-11-11",
    "dayNumber": 26,
    "daysRemaining": 112,
    "category": "Physics Optics",
    "theme": "Ray Diagrams",
    "quote": "Draw arrows on every light ray in optics. A correct ray without directional arrows loses the mark you worked so hard for."
  },
  {
    "date": "2026-11-12",
    "dayNumber": 27,
    "daysRemaining": 111,
    "category": "Chemistry Inorganic",
    "theme": "Periodic Trends & Coordination",
    "quote": "Organize transition metals and coordination compounds into comparative tables; visual contrast locks the properties into memory."
  },
  {
    "date": "2026-11-13",
    "dayNumber": 28,
    "daysRemaining": 110,
    "category": "Maths Vectors",
    "theme": "3D Geometry & Dot Products",
    "quote": "Visualize the planes and lines before writing the equation. Clear geometric intuition turns 3D geometry into simple algebra."
  },
  {
    "date": "2026-11-14",
    "dayNumber": 29,
    "daysRemaining": 109,
    "category": "Self-Belief",
    "theme": "Confidence from Effort",
    "quote": "Confidence is not an accident of mood; it is the natural consequence of having solved fifty problems with your own hands."
  },
  {
    "date": "2026-11-15",
    "dayNumber": 30,
    "daysRemaining": 108,
    "category": "Mid-Term Reflection",
    "theme": "Mid-November Audit",
    "quote": "Look back at the topics you mastered this past fortnight. You are steadily closing the gap between your baseline and your Centum goal."
  },
  {
    "date": "2026-11-16",
    "dayNumber": 31,
    "daysRemaining": 107,
    "category": "Focus Stamina",
    "theme": "Pomodoro Rhythm",
    "quote": "Work with twenty-five minutes of fierce concentration, step away for five, and return sharp. Quality always beats mindless staring."
  },
  {
    "date": "2026-11-17",
    "dayNumber": 32,
    "daysRemaining": 106,
    "category": "Tamil Language",
    "theme": "Poetry & Grammar Accuracy",
    "quote": "Master the grammatical rules in Tamil sandhi and thodargal. Flawless grammar forms the bedrock of a ninety-plus language score."
  },
  {
    "date": "2026-11-18",
    "dayNumber": 33,
    "daysRemaining": 105,
    "category": "Physics Electromagnetism",
    "theme": "Right-Hand Rule & Field Lines",
    "quote": "In electromagnetic induction, state Lenz's law with exact terminology. Examiner rubrics look for key scientific phrases."
  },
  {
    "date": "2026-11-19",
    "dayNumber": 34,
    "daysRemaining": 104,
    "category": "Chemistry Physical",
    "theme": "Electrochemistry & Kinetics",
    "quote": "Write down the given parameters with units before substituting into the Nernst equation. Orderly inputs yield correct outputs."
  },
  {
    "date": "2026-11-20",
    "dayNumber": 35,
    "daysRemaining": 103,
    "category": "Maths Probability",
    "theme": "Bayes Theorem & Distributions",
    "quote": "Clearly state your events E1, E2, and A before applying Bayes theorem. Structure makes conditional probability easy to grade."
  },
  {
    "date": "2026-11-21",
    "dayNumber": 36,
    "daysRemaining": 102,
    "category": "Active Recall",
    "theme": "Teach to Learn",
    "quote": "If you want to test whether you truly understand a concept, explain it aloud as if teaching a younger classmate."
  },
  {
    "date": "2026-11-22",
    "dayNumber": 37,
    "daysRemaining": 101,
    "category": "Rest & Wellness",
    "theme": "Active Recovery",
    "quote": "A fifteen-minute brisk walk and deep hydration restore mental alertness far better than browsing social media during breaks."
  },
  {
    "date": "2026-11-23",
    "dayNumber": 38,
    "daysRemaining": 100,
    "category": "Answer Presentation",
    "theme": "Underlining & Margin Notes",
    "quote": "Draw neat bounding boxes around your final answers in numerical subjects. Make it effortless for the examiner to award top marks."
  },
  {
    "date": "2026-11-24",
    "dayNumber": 39,
    "daysRemaining": 99,
    "category": "Daily Consistency",
    "theme": "No Zero Days",
    "quote": "Even on days when energy is modest, solve five challenging problems. Keeping the habit unbroken is what compounds into brilliance."
  },
  {
    "date": "2026-11-25",
    "dayNumber": 40,
    "daysRemaining": 98,
    "category": "Biology Ecology",
    "theme": "Definitions & Case Studies",
    "quote": "Memorize textbook definitions verbatim in ecology. Exact terminology demonstrates mastery that examiners recognize in seconds."
  },
  {
    "date": "2026-11-26",
    "dayNumber": 41,
    "daysRemaining": 97,
    "category": "Maths Matrices",
    "theme": "Determinants & Inverses",
    "quote": "Double-check your cofactor calculations. A single sign error in matrix inversion is too costly to let slide through careless haste."
  },
  {
    "date": "2026-11-27",
    "dayNumber": 42,
    "daysRemaining": 96,
    "category": "Physics Modern Physics",
    "theme": "Photoelectric & De Broglie",
    "quote": "Modern physics is a goldmine for direct Centum marks: master Einstein's photoelectric equation and Planck's constant calculations."
  },
  {
    "date": "2026-11-28",
    "dayNumber": 43,
    "daysRemaining": 95,
    "category": "Chemistry Biomolecules",
    "theme": "Polymers & Vitamins",
    "quote": "Revise linkage bonds—peptide, glycosidic, and phosphodiester. Quick short-answer chemistry marks accumulate into your Centum."
  },
  {
    "date": "2026-11-29",
    "dayNumber": 44,
    "daysRemaining": 94,
    "category": "Revision Strategy",
    "theme": "Three-Tier Problem Sorting",
    "quote": "Categorize problems into Easy, Tricky, and Re-try. Dedicate today to conquering the ones that stumped you last week."
  },
  {
    "date": "2026-11-30",
    "dayNumber": 45,
    "daysRemaining": 93,
    "category": "November Milestone",
    "theme": "One-Third Distance",
    "quote": "November is in the books. Over forty days of steady, focused study have deepened your command across all six subjects."
  },
  {
    "date": "2026-12-01",
    "dayNumber": 46,
    "daysRemaining": 92,
    "category": "December Acceleration",
    "theme": "Winter Revision Push",
    "quote": "December begins now. As the weather cools, let your dedication intensify. This winter marks your transition from revision to mastery."
  },
  {
    "date": "2026-12-02",
    "dayNumber": 47,
    "daysRemaining": 91,
    "category": "Physics Current Electricity",
    "theme": "Kirchhoff Laws & Bridges",
    "quote": "Label junction currents and loop directions clearly in Kirchhoff problems. A transparent circuit diagram is half the solution."
  },
  {
    "date": "2026-12-03",
    "dayNumber": 48,
    "daysRemaining": 90,
    "category": "Chemistry Solutions",
    "theme": "Colligative Properties & Van't Hoff",
    "quote": "Never forget the Van't Hoff factor 'i' when dealing with electrolyte solutions. Precision in details separates 95 from 100."
  },
  {
    "date": "2026-12-04",
    "dayNumber": 49,
    "daysRemaining": 89,
    "category": "Maths Differential Equations",
    "theme": "Integrating Factors",
    "quote": "Identify the differential equation type immediately—separable, homogeneous, or linear. The right diagnosis makes the integration trivial."
  },
  {
    "date": "2026-12-05",
    "dayNumber": 50,
    "daysRemaining": 88,
    "category": "English Writing Skills",
    "theme": "Notice & Report Formats",
    "quote": "Review formal letter, notice, and report writing formats. Format accuracy guarantees easy, free marks in English board papers."
  },
  {
    "date": "2026-12-06",
    "dayNumber": 51,
    "daysRemaining": 87,
    "category": "Biology Physiology",
    "theme": "Hormones & Feedback Loops",
    "quote": "Use flowcharts for hormonal pathways and neural conduction. Sequential arrows make physiological recall swift and reliable."
  },
  {
    "date": "2026-12-07",
    "dayNumber": 52,
    "daysRemaining": 86,
    "category": "Distraction Control",
    "theme": "Environment Architecture",
    "quote": "Clear your desk of everything except the subject you are currently studying. An uncluttered workspace creates an uncluttered intellect."
  },
  {
    "date": "2026-12-08",
    "dayNumber": 53,
    "daysRemaining": 85,
    "category": "Mock Paper Analysis",
    "theme": "Negative Space Audit",
    "quote": "Examine not just where you scored, but exactly why marks slipped in your recent test. Fix that specific gap before nightfall."
  },
  {
    "date": "2026-12-09",
    "dayNumber": 54,
    "daysRemaining": 84,
    "category": "Physics Wave Optics",
    "theme": "Interference & Diffraction",
    "quote": "Distinguish clearly between interference fringes and diffraction patterns: fringe width equality vs central maximum intensity."
  },
  {
    "date": "2026-12-10",
    "dayNumber": 55,
    "daysRemaining": 83,
    "category": "Chemistry Aldehydes & Ketones",
    "theme": "Named Condensations",
    "quote": "Write out Aldol and Cannizzaro mechanisms three times without reference notes. Mastery comes from repeated hand-drawn derivations."
  },
  {
    "date": "2026-12-11",
    "dayNumber": 56,
    "daysRemaining": 82,
    "category": "Maths Maxima & Minima",
    "theme": "First & Second Derivative Tests",
    "quote": "Always state the conclusion clearly with the second derivative test sign. Show the examiner why the value is truly a maximum."
  },
  {
    "date": "2026-12-12",
    "dayNumber": 57,
    "daysRemaining": 81,
    "category": "Tamil Literature",
    "theme": "Thirukkural Meaning & Context",
    "quote": "Review the prescribed Thirukkural couplets and their ethical context. Seamless quotations in your Tamil answers reflect deep scholarship."
  },
  {
    "date": "2026-12-13",
    "dayNumber": 58,
    "daysRemaining": 80,
    "category": "Patience & Growth",
    "theme": "Compound Progress",
    "quote": "Do not demand instant transformation every afternoon. Knowledge accumulates like sediment: thin layers building into solid bedrock."
  },
  {
    "date": "2026-12-14",
    "dayNumber": 59,
    "daysRemaining": 79,
    "category": "Formula Sheet Audit",
    "theme": "Daily Formula Flash",
    "quote": "Spend ten minutes reciting all thermodynamic formulas and electric flux laws before starting your evening study session."
  },
  {
    "date": "2026-12-15",
    "dayNumber": 60,
    "daysRemaining": 78,
    "category": "Mid-December Milestone",
    "theme": "Sixty Days of Resolve",
    "quote": "Sixty consecutive days of preparation behind you. You have proved your staying power; trust the work you have already put in."
  },
  {
    "date": "2026-12-16",
    "dayNumber": 61,
    "daysRemaining": 77,
    "category": "Physics Semiconductor",
    "theme": "Logic Gates & Diodes",
    "quote": "Draw clean truth tables and circuit diagrams for rectifiers. Semiconductors are predictable, high-scoring questions if prepared cleanly."
  },
  {
    "date": "2026-12-17",
    "dayNumber": 62,
    "daysRemaining": 76,
    "category": "Chemistry Solid State",
    "theme": "Bragg Law & Packing Efficiency",
    "quote": "Calculate density and unit cell edge length with careful scientific notation. Exponent mistakes are easy to prevent with calm review."
  },
  {
    "date": "2026-12-18",
    "dayNumber": 63,
    "daysRemaining": 75,
    "category": "Maths Definite Integrals",
    "theme": "Properties of Integrals",
    "quote": "Use properties like integral from 0 to 'a' of f(x) equals f(a-x) to collapse formidable equations into one-step arithmetic."
  },
  {
    "date": "2026-12-19",
    "dayNumber": 64,
    "daysRemaining": 74,
    "category": "Biology Evolution",
    "theme": "Homology vs Analogy",
    "quote": "Cite textbook examples for divergent and convergent evolution. Anatomical examples give your answers indisputable factual weight."
  },
  {
    "date": "2026-12-20",
    "dayNumber": 65,
    "daysRemaining": 73,
    "category": "Endurance & Will",
    "theme": "Final Hour Stamina",
    "quote": "When fatigue whispers that you have studied enough, push through one more derivation. That extra rep builds genuine academic grit."
  },
  {
    "date": "2026-12-21",
    "dayNumber": 66,
    "daysRemaining": 72,
    "category": "Solitary Reflection",
    "theme": "Winter Solstice Focus",
    "quote": "The shortest day of the year offers the longest evening for quiet, uninterrupted focus. Light up your desk with pure intent."
  },
  {
    "date": "2026-12-22",
    "dayNumber": 67,
    "daysRemaining": 71,
    "category": "Ramanujan Inspiration",
    "theme": "National Mathematics Day",
    "quote": "Honor Ramanujan today by approaching mathematics not as a chore, but as an elegant exploration where every pattern makes sense."
  },
  {
    "date": "2026-12-23",
    "dayNumber": 68,
    "daysRemaining": 70,
    "category": "Chemistry p-Block",
    "theme": "Oxoacids & Trends",
    "quote": "Draw the structures of phosphorus and sulfur oxoacids with proper lone pairs and multiple bonds. Visual clarity earns full credit."
  },
  {
    "date": "2026-12-24",
    "dayNumber": 69,
    "daysRemaining": 69,
    "category": "Physics Magnetism",
    "theme": "Biot-Savart & Solenoids",
    "quote": "State Biot-Savart law in vector form first, then integrate along the axis. Rigorous mathematics impresses board paper evaluators."
  },
  {
    "date": "2026-12-25",
    "dayNumber": 70,
    "daysRemaining": 68,
    "category": "Calm Consistency",
    "theme": "Holiday Focus",
    "quote": "While the world takes holiday ease, spend two solid hours reviewing your high-yield summary sheets. Quiet dedication pays dividends."
  },
  {
    "date": "2026-12-26",
    "dayNumber": 71,
    "daysRemaining": 67,
    "category": "Exam Speed Drills",
    "theme": "One-Mark Section Speed",
    "quote": "Practice tackling twenty objective multiple-choice questions in under fifteen minutes. Saving time early gives breathing room for 5-markers."
  },
  {
    "date": "2026-12-27",
    "dayNumber": 72,
    "daysRemaining": 66,
    "category": "Maths Linear Programming",
    "theme": "Feasible Region Shading",
    "quote": "Shade your feasible region cleanly with a ruler and test all corner points in the objective function. A flawless five marks."
  },
  {
    "date": "2026-12-28",
    "dayNumber": 73,
    "daysRemaining": 65,
    "category": "English Essay Skills",
    "theme": "Transitions & Cohesion",
    "quote": "Use logical transition words between paragraphs in your essays. Cohesion and mature vocabulary distinguish top-percentile papers."
  },
  {
    "date": "2026-12-29",
    "dayNumber": 74,
    "daysRemaining": 64,
    "category": "Biology Microbes",
    "theme": "Biotech & Applications",
    "quote": "Write down the scientific names with binomial nomenclature underlined. It takes two seconds and shows an evaluator true scientific discipline."
  },
  {
    "date": "2026-12-30",
    "dayNumber": 75,
    "daysRemaining": 63,
    "category": "Year-End Review",
    "theme": "2026 Preparation Reflection",
    "quote": "Take thirty minutes to review what you have accomplished in 2026. The discipline you forged these past months is ready for 2027."
  },
  {
    "date": "2026-12-31",
    "dayNumber": 76,
    "daysRemaining": 62,
    "category": "New Year Eve Resolve",
    "theme": "Commitment to Excellence",
    "quote": "As the year turns, make one silent promise to yourself: no half-measures, no excuses, just disciplined daily execution toward 550+."
  },
  {
    "date": "2027-01-01",
    "dayNumber": 77,
    "daysRemaining": 61,
    "category": "January Kickoff",
    "theme": "Board Exam Year Begins",
    "quote": "Welcome 2027—your examination year. Every single page turned from today forward carries you closer to your academic summit."
  },
  {
    "date": "2027-01-02",
    "dayNumber": 78,
    "daysRemaining": 60,
    "category": "Physics Electrostatics",
    "theme": "Gauss Law Applications",
    "quote": "State the Gaussian surface symmetry clearly before applying the electric flux integral. Clear assumptions make derivations airtight."
  },
  {
    "date": "2027-01-03",
    "dayNumber": 79,
    "daysRemaining": 59,
    "category": "Chemistry Amines",
    "theme": "Diazonium Salts & Basic Strength",
    "quote": "Explain basicity trends of amines in aqueous vs gaseous phase with inductive, steric, and solvation factors clearly delineated."
  },
  {
    "date": "2027-01-04",
    "dayNumber": 80,
    "daysRemaining": 58,
    "category": "Maths Differential Equations",
    "theme": "Homogeneous Substitution",
    "quote": "When substituting y = vx, remember to differentiate both sides with the product rule. Systematic algebra prevents careless blunders."
  },
  {
    "date": "2027-01-05",
    "dayNumber": 81,
    "daysRemaining": 57,
    "category": "Active Recall",
    "theme": "The 3-Day Rule",
    "quote": "A concept revised three days after first learning it stays with you for three weeks. Keep your spaced revision cycle rotating."
  },
  {
    "date": "2027-01-06",
    "dayNumber": 82,
    "daysRemaining": 56,
    "category": "Distraction Defense",
    "theme": "Micro-Temptation Awareness",
    "quote": "Resist opening that browser tab for a 'quick look'. A five-second distraction costs fifteen minutes of deep mental flow."
  },
  {
    "date": "2027-01-07",
    "dayNumber": 83,
    "daysRemaining": 55,
    "category": "Tamil Prose & Grammar",
    "theme": "Concise Summaries",
    "quote": "Write answers in Tamil with legible handwriting and crisp punctuation. Clarity of thought shines directly through neat script."
  },
  {
    "date": "2027-01-08",
    "dayNumber": 84,
    "daysRemaining": 54,
    "category": "Physics AC Circuits",
    "theme": "Phasor Diagrams & Resonance",
    "quote": "Draw phasors with clear phase angle markers. Visualizing the voltage-current lead and lag makes RLC impedance calculations foolproof."
  },
  {
    "date": "2027-01-09",
    "dayNumber": 85,
    "daysRemaining": 53,
    "category": "Chemistry Coordination",
    "theme": "Crystal Field Splitting",
    "quote": "Draw crystal field splitting diagrams for octahedral and tetrahedral complexes with pairing energy vs delta-o explicitly compared."
  },
  {
    "date": "2027-01-10",
    "dayNumber": 86,
    "daysRemaining": 52,
    "category": "Rest & Reset",
    "theme": "Weekly Energy Recharge",
    "quote": "Take a restful evening walk and eat nourishing meals. Sustainable peak study performance requires a well-tended body."
  },
  {
    "date": "2027-01-11",
    "dayNumber": 87,
    "daysRemaining": 51,
    "category": "Maths Continuity",
    "theme": "Limits & Differentiability",
    "quote": "Always evaluate both left-hand and right-hand limits separately before declaring continuity. Rigor is the hallmark of a Centum student."
  },
  {
    "date": "2027-01-12",
    "dayNumber": 88,
    "daysRemaining": 50,
    "category": "Youth Day Energy",
    "theme": "Swami Vivekananda Inspiration",
    "quote": "'Arise, awake, and stop not till the goal is reached.' Channel that unbounded energy into completing today's syllabus checklist."
  },
  {
    "date": "2027-01-13",
    "dayNumber": 89,
    "daysRemaining": 49,
    "category": "Biology Reproduction",
    "theme": "Embryology & Gametogenesis",
    "quote": "Draw the steps of spermatogenesis and oogenesis side-by-side. Comparative charts highlight the chronological distinctions perfectly."
  },
  {
    "date": "2027-01-14",
    "dayNumber": 90,
    "daysRemaining": 48,
    "category": "Harvest Festival",
    "theme": "Pongal Joy & Discipline",
    "quote": "Celebrate Pongal with family warmth, then return to your books with fresh gratitude and clear purpose. Harmony fuels focus."
  },
  {
    "date": "2027-01-15",
    "dayNumber": 91,
    "daysRemaining": 47,
    "category": "Physics Ray Optics",
    "theme": "Lens Maker Formula",
    "quote": "Derive the lens maker's formula step by step with sign conventions rigorously defined at each spherical refracting surface."
  },
  {
    "date": "2027-01-16",
    "dayNumber": 92,
    "daysRemaining": 46,
    "category": "Chemistry Surface",
    "theme": "Adsorption & Colloids",
    "quote": "Memorize the distinguishing features between physisorption and chemisorption: enthalpy values, reversibility, and layer thickness."
  },
  {
    "date": "2027-01-17",
    "dayNumber": 93,
    "daysRemaining": 45,
    "category": "Maths Application of Integrals",
    "theme": "Area Under Curves",
    "quote": "Always sketch the intersecting curves first to identify the correct upper and lower functions. A rough sketch prevents inverted signs."
  },
  {
    "date": "2027-01-18",
    "dayNumber": 94,
    "daysRemaining": 44,
    "category": "Time Management",
    "theme": "Paper Section Allocation",
    "quote": "Pre-allocate exact time blocks for Sections A, B, C, and D. Sticking to your schedule ensures fifteen minutes of buffer at the end."
  },
  {
    "date": "2027-01-19",
    "dayNumber": 95,
    "daysRemaining": 43,
    "category": "Deep Revision",
    "theme": "High-Yield Chapter Sweeps",
    "quote": "Sweep through your high-weightage chapters today with focused question-solving. Maximizing scoring efficiency builds immense confidence."
  },
  {
    "date": "2027-01-20",
    "dayNumber": 96,
    "daysRemaining": 42,
    "category": "English Poetic Devices",
    "theme": "Metaphors & Imagery",
    "quote": "Identify and name poetic devices accurately in literature questions: alliteration, personification, and synecdoche carry specific marks."
  },
  {
    "date": "2027-01-21",
    "dayNumber": 97,
    "daysRemaining": 41,
    "category": "Physics Dual Nature",
    "theme": "Stopping Potential & Frequency",
    "quote": "Graph stopping potential versus frequency with slope equal to h/e. Coordinate geometry meets quantum physics cleanly in board exams."
  },
  {
    "date": "2027-01-22",
    "dayNumber": 98,
    "daysRemaining": 40,
    "category": "Chemistry Haloalkanes",
    "theme": "SN1 vs SN2 Mechanisms",
    "quote": "Contrast SN1 and SN2 pathways across carbocation stability, steric hindrance, inversion of configuration, and polar solvent effects."
  },
  {
    "date": "2027-01-23",
    "dayNumber": 99,
    "daysRemaining": 39,
    "category": "Courage & Resolve",
    "theme": "Netaji Spirit",
    "quote": "Face challenging question papers with courage. A fearless mindset tackles unfamiliar sub-parts with calm, analytical logic."
  },
  {
    "date": "2027-01-24",
    "dayNumber": 100,
    "daysRemaining": 38,
    "category": "Centum Century Milestone",
    "theme": "100 Consecutive Days",
    "quote": "One hundred days of unwavering daily focus behind you. What once felt intimidating is now familiar terrain. Keep marching forward."
  },
  {
    "date": "2027-01-25",
    "dayNumber": 101,
    "daysRemaining": 37,
    "category": "Maths Inverse Trig",
    "theme": "Principal Value Branches",
    "quote": "Check that your inverse trigonometric output lies strictly within the principal branch. Range checks protect precious marks."
  },
  {
    "date": "2027-01-26",
    "dayNumber": 102,
    "daysRemaining": 36,
    "category": "Republic Day Pride",
    "theme": "Duty to Your Potential",
    "quote": "Dedication to your studies is your personal contribution to excellence. Honor your potential with a focused three-hour revision sprint."
  },
  {
    "date": "2027-01-27",
    "dayNumber": 103,
    "daysRemaining": 35,
    "category": "Biology Biotechnology",
    "theme": "PCR & Recombinant DNA",
    "quote": "Summarize PCR cycles—denaturation, annealing, and extension—with specific temperatures and enzymes named. Textbook accuracy wins."
  },
  {
    "date": "2027-01-28",
    "dayNumber": 104,
    "daysRemaining": 34,
    "category": "Error Elimination",
    "theme": "Silencing Reckless Rushing",
    "quote": "Slow down by just five percent on calculations. Deliberate, measured pen strokes prevent mistakes that take ten minutes to debug."
  },
  {
    "date": "2027-01-29",
    "dayNumber": 105,
    "daysRemaining": 33,
    "category": "Physics Galvanometer",
    "theme": "Conversion to Ammeter & Voltmeter",
    "quote": "Derive shunt resistance for ammeters and high series resistance for voltmeters. Clean circuit diagrams ensure full five marks."
  },
  {
    "date": "2027-01-30",
    "dayNumber": 106,
    "daysRemaining": 32,
    "category": "Chemistry Organic Synthesis",
    "theme": "Multi-Step Conversions",
    "quote": "In conversion problems, work backwards from the target product to identify the key functional group transformations required."
  },
  {
    "date": "2027-01-31",
    "dayNumber": 107,
    "daysRemaining": 31,
    "category": "January Completion",
    "theme": "Pre-Board Readiness",
    "quote": "January concludes with syllabus mastery well in hand. February is the month of surgical polishing, timing perfection, and mock tests."
  },
  {
    "date": "2027-02-01",
    "dayNumber": 108,
    "daysRemaining": 30,
    "category": "February Sprint",
    "theme": "One Month Countdown",
    "quote": "Exactly one month until March exams. Narrow your focus to high-frequency question patterns, model papers, and error eradication."
  },
  {
    "date": "2027-02-02",
    "dayNumber": 109,
    "daysRemaining": 29,
    "category": "Full Mock Test",
    "theme": "Three-Hour Endurance",
    "quote": "Sit for a complete 3-hour mock paper from 10:00 AM to 1:00 PM. Condition your body and mind for the real examination schedule."
  },
  {
    "date": "2027-02-03",
    "dayNumber": 110,
    "daysRemaining": 28,
    "category": "Physics Wave Optics",
    "theme": "Huygens Principle",
    "quote": "Derive laws of reflection and refraction using secondary wavelets. State wave theory postulates cleanly at the outset."
  },
  {
    "date": "2027-02-04",
    "dayNumber": 111,
    "daysRemaining": 27,
    "category": "Chemistry Kinetics",
    "theme": "Arrhenius Equation & Activation Energy",
    "quote": "Plot log k versus 1/T and determine activation energy from the slope (-Ea / 2.303R). Master the graphical interpretation."
  },
  {
    "date": "2027-02-05",
    "dayNumber": 112,
    "daysRemaining": 26,
    "category": "Maths Vectors & 3D",
    "theme": "Shortest Distance Between Skew Lines",
    "quote": "Execute the shortest distance formula between skew lines with methodical cross products and dot products. A guaranteed 5-mark score."
  },
  {
    "date": "2027-02-06",
    "dayNumber": 113,
    "daysRemaining": 25,
    "category": "Tamil Language",
    "theme": "Memorization & Rhyme Scheme",
    "quote": "Recite the memory poems in Tamil without stumbling. Flawless recall of verses provides easy and reliable marks."
  },
  {
    "date": "2027-02-07",
    "dayNumber": 114,
    "daysRemaining": 24,
    "category": "Biology Human Health",
    "theme": "Immunity & Antibody Structure",
    "quote": "Draw the immunoglobulin Y-structure with heavy and light chains, disulfide bonds, and antigen-binding sites crisply labeled."
  },
  {
    "date": "2027-02-08",
    "dayNumber": 115,
    "daysRemaining": 23,
    "category": "Calmness Under Pressure",
    "theme": "Equanimity",
    "quote": "Exam anxiety dissolves the moment you pick up your pen and start writing. Action is the ultimate antidote to nervous anticipation."
  },
  {
    "date": "2027-02-09",
    "dayNumber": 116,
    "daysRemaining": 22,
    "category": "Physics Nuclei",
    "theme": "Binding Energy & Mass Defect",
    "quote": "Calculate mass defect in atomic mass units and convert directly to MeV using 931.5. Clean arithmetic keeps numericals painless."
  },
  {
    "date": "2027-02-10",
    "dayNumber": 117,
    "daysRemaining": 21,
    "category": "Chemistry Phenols",
    "theme": "Kolbe & Reimer-Tiemann",
    "quote": "Write down conditions, intermediate complexes, and electrophiles (like dichlorocarbene) for Kolbe and Reimer-Tiemann reactions."
  },
  {
    "date": "2027-02-11",
    "dayNumber": 118,
    "daysRemaining": 20,
    "category": "Maths Continuity & Differentiability",
    "theme": "Rolle's & Mean Value Theorems",
    "quote": "Verify continuity on closed intervals and differentiability on open intervals before calculating the value 'c'. Rigorous proofs prevail."
  },
  {
    "date": "2027-02-12",
    "dayNumber": 119,
    "daysRemaining": 19,
    "category": "Answer Sheet Handwriting",
    "theme": "Legibility & Spacing",
    "quote": "Leave two blank lines between questions and rule neat divider lines. An orderly answer booklet immediately biases evaluators favorably."
  },
  {
    "date": "2027-02-13",
    "dayNumber": 120,
    "daysRemaining": 18,
    "category": "Active Recall",
    "theme": "Rapid Formula Blitz",
    "quote": "Write out every single formula from all six Physics units on two A4 sheets from memory. If you stumble on one, review it immediately."
  },
  {
    "date": "2027-02-14",
    "dayNumber": 121,
    "daysRemaining": 17,
    "category": "Focus on the Goal",
    "theme": "Single-Minded Devotion",
    "quote": "Channel all your passion into mastering your subjects today. Your future self will look back on this season with deep pride."
  },
  {
    "date": "2027-02-15",
    "dayNumber": 122,
    "daysRemaining": 16,
    "category": "Fortnight Countdown",
    "theme": "Two Weeks of Polish",
    "quote": "Just fifteen days remain. This is the championship stretch where past revisions crystallize into effortless automatic recall."
  },
  {
    "date": "2027-02-16",
    "dayNumber": 123,
    "daysRemaining": 15,
    "category": "English Comprehension",
    "theme": "Time Allocation",
    "quote": "Read comprehension passages with a pen in hand, underlining key facts. Target answering the entire reading section in forty minutes."
  },
  {
    "date": "2027-02-17",
    "dayNumber": 124,
    "daysRemaining": 14,
    "category": "Physics Transformers",
    "theme": "Efficiency & Energy Losses",
    "quote": "Explain transformer energy losses—eddy currents, hysteresis, flux leakage, and copper loss—with mitigation techniques alongside each."
  },
  {
    "date": "2027-02-18",
    "dayNumber": 125,
    "daysRemaining": 13,
    "category": "Chemistry Polymers",
    "theme": "Monomer Identification",
    "quote": "Review monomers and polymerization types for Dacron, Nylon 6,6, Buna-S, and Bakelite. Quick factual recall seals perfect scores."
  },
  {
    "date": "2027-02-19",
    "dayNumber": 126,
    "daysRemaining": 12,
    "category": "Maths Integration by Parts",
    "theme": "ILATE Rule Execution",
    "quote": "Apply the ILATE order methodically and keep track of negative signs through repeated integrations. Calm calculation produces the Centum."
  },
  {
    "date": "2027-02-20",
    "dayNumber": 127,
    "daysRemaining": 11,
    "category": "Ten-Day Horizon",
    "theme": "Confidence from Thoroughness",
    "quote": "Ten days to the starting line. You have solved past years' questions, reviewed derivations, and polished mistakes. Walk tall."
  },
  {
    "date": "2027-02-21",
    "dayNumber": 128,
    "daysRemaining": 10,
    "category": "Biology Complete Sweep",
    "theme": "Diagram Gallery Review",
    "quote": "Flip through every diagram in your biology textbook in sequence. Ensure you can visualize every organelle and cross-section in your mind's eye."
  },
  {
    "date": "2027-02-22",
    "dayNumber": 129,
    "daysRemaining": 9,
    "category": "Physics Cyclotron & Magnetics",
    "theme": "Resonance Frequency",
    "quote": "State cyclotron resonance frequency formula and explain why relativistic speeds place an upper bound on particle acceleration."
  },
  {
    "date": "2027-02-23",
    "dayNumber": 130,
    "daysRemaining": 8,
    "category": "Chemistry Coordination & IUPAC",
    "theme": "Nomenclature Rules",
    "quote": "Review coordination IUPAC naming rules: alphabetical order of ligands, oxidation states in Roman numerals, and anionic metal suffixes."
  },
  {
    "date": "2027-02-24",
    "dayNumber": 131,
    "daysRemaining": 7,
    "category": "Rest & Nervous Balance",
    "theme": "Quiet Mind",
    "quote": "Keep your evenings calm and avoid last-minute frenzy. A steady, unruffled mind accesses memories far more rapidly during tests."
  },
  {
    "date": "2027-02-25",
    "dayNumber": 132,
    "daysRemaining": 6,
    "category": "Five-Day Final Polish",
    "theme": "Short Notes Only",
    "quote": "Transition from heavy problem volumes to your concise summary sheets. Reinforce core formulas, key diagrams, and critical definitions."
  },
  {
    "date": "2027-02-26",
    "dayNumber": 133,
    "daysRemaining": 5,
    "category": "Tamil & English Polish",
    "theme": "Format & Grammar Check",
    "quote": "Spend two hours reviewing essay blueprints, poetry summaries, and formal letter layouts for your upcoming language examinations."
  },
  {
    "date": "2027-02-27",
    "dayNumber": 134,
    "daysRemaining": 4,
    "category": "Three-Day Countdown",
    "theme": "Hall Ticket & Stationery Kit",
    "quote": "Prepare your examination kit: hall ticket, pens, pencils, eraser, geometry instruments. Removing practical worries frees your mental bandwidth."
  },
  {
    "date": "2027-02-28",
    "dayNumber": 135,
    "daysRemaining": 3,
    "category": "February Finale",
    "theme": "Complete Preparation Review",
    "quote": "February closes with every subject reviewed, tested, and reinforced. You have worked tirelessly; trust your comprehensive preparation."
  },
  {
    "date": "2027-03-01",
    "dayNumber": 136,
    "daysRemaining": 2,
    "category": "Eve of Exam Season",
    "theme": "Serenity & Readiness",
    "quote": "Tomorrow brings the culmination of months of disciplined labor. Sleep early, breathe deeply, and hold unwavering faith in your abilities."
  },
  {
    "date": "2027-03-02",
    "dayNumber": 137,
    "daysRemaining": 1,
    "category": "Final-Day Special Message",
    "theme": "Culmination & Trust",
    "quote": "Your preparation has brought you this far. Stay calm, trust what you have learned, and give your best."
  }
];

export const DAILY_MOTIVATION_MAP: Record<string, DailyMotivationQuote> = DAILY_MOTIVATION_QUOTES.reduce(
  (acc, item) => {
    acc[item.date] = item;
    return acc;
  },
  {} as Record<string, DailyMotivationQuote>
);

// Backward-compatible export for any legacy code
export const MOTIVATION_QUOTES: MotivationQuote[] = DAILY_MOTIVATION_QUOTES.map(q => ({
  id: q.date,
  quote: q.quote,
  author: q.category,
  category: q.theme.toLowerCase().includes('discipline') ? 'discipline' :
            q.theme.toLowerCase().includes('focus') ? 'focus' :
            q.theme.toLowerCase().includes('100') || q.theme.toLowerCase().includes('550') ? 'centum' : 'consistency',
}));

export const DEFAULT_FALLBACK_QUOTE: DailyMotivationQuote = {
  date: '2026-10-17',
  dayNumber: 1,
  daysRemaining: 137,
  category: 'Daily Motivation',
  theme: 'Consistent Focus',
  quote: 'Every focused study hour brings you closer to your goal. Maintain discipline, solve with precision, and believe in your daily progress.',
};

/**
 * Returns today's date formatted as YYYY-MM-DD using the device's local calendar.
 * Prevents UTC timezone conversion bugs.
 */
export function getTodayLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Retrieves the unique quote assigned to a given date string (YYYY-MM-DD).
 * Returns fallback if the date is outside the 137-day span.
 */
export function getQuoteForDate(dateStr: string): DailyMotivationQuote {
  if (DAILY_MOTIVATION_MAP[dateStr]) {
    return DAILY_MOTIVATION_MAP[dateStr];
  }
  return {
    ...DEFAULT_FALLBACK_QUOTE,
    date: dateStr,
    quote: `No assigned quote for ${dateStr}. Stay focused on your daily preparation!`,
  };
}

/**
 * Retrieves an adjacent quote (offset: -1 for previous day, +1 for next day).
 */
export function getAdjacentQuoteDate(currentDateStr: string, offset: number): string {
  const parts = currentDateStr.split('-').map(Number);
  if (parts.length !== 3 || isNaN(parts[0])) {
    return getTodayLocalDateString();
  }
  const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
  dateObj.setDate(dateObj.getDate() + offset);
  return getTodayLocalDateString(dateObj);
}
