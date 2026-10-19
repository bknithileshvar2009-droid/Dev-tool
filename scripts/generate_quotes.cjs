// Generator and Validator for 137 Unique Daily Motivational Quotes
// Range: 2026-10-17 through 2027-03-02 (inclusive)

const fs = require('fs');
const path = require('path');

// Calculate all dates
const dates = [];
let cur = new Date(2026, 9, 17); // Month 9 is October
const end = new Date(2027, 2, 2); // Month 2 is March

while (cur <= end) {
  const y = cur.getFullYear();
  const m = String(cur.getMonth() + 1).padStart(2, '0');
  const d = String(cur.getDate()).padStart(2, '0');
  dates.push(`${y}-${m}-${d}`);
  cur.setDate(cur.getDate() + 1);
}

if (dates.length !== 137) {
  throw new Error(`Expected 137 dates, got ${dates.length}`);
}

// 137 completely distinct, carefully written quotes
const quoteDefinitions = [
  // Day 1: 2026-10-17
  {
    category: "Mindset & Goal Setting",
    theme: "Target 550+ Clarity",
    quote: "A 550+ aggregate is built not in the final week, but in the ordinary hours you choose to study right now."
  },
  // Day 2: 2026-10-18
  {
    category: "Physics 100 Target",
    theme: "Conceptual Understanding",
    quote: "Treat every physics derivation like an unbroken logical chain. When step three is obvious, the hundred marks become natural."
  },
  // Day 3: 2026-10-19
  {
    category: "Chemistry 100 Target",
    theme: "Organic Mechanisms",
    quote: "Master the electron flow and reagents rather than memorizing reactions blindly; organic chemistry rewards structural clarity."
  },
  // Day 4: 2026-10-20
  {
    category: "Maths Accuracy",
    theme: "Calculus Precision",
    quote: "In mathematics, speed follows neatness. Write down every intermediate integral step and let accuracy protect your Centum."
  },
  // Day 5: 2026-10-21
  {
    category: "Deep Focus",
    theme: "Distraction Elimination",
    quote: "Put the phone outside the room for this 90-minute sprint. An undisturbed mind learns twice as much in half the time."
  },
  // Day 6: 2026-10-22
  {
    category: "Biology Revision",
    theme: "Diagrams & Recall",
    quote: "Practice sketching biology diagrams with sharp pencil lines and complete labels. Visual precision guarantees full credit."
  },
  // Day 7: 2026-10-23
  {
    category: "Language Excellence",
    theme: "Tamil & English Strategy",
    quote: "Do not neglect language papers: well-structured essays and clean handwriting in Tamil and English safeguard your 550+ total."
  },
  // Day 8: 2026-10-24
  {
    category: "Active Recall",
    theme: "Closed-Book Testing",
    quote: "Close the textbook and explain the concept on a blank sheet of paper. Real retention is proven only when you can reproduce it from memory."
  },
  // Day 9: 2026-10-25
  {
    category: "Mistake Analysis",
    theme: "Error Log Notebook",
    quote: "Every error identified in today's mock drill is one fewer mistake waiting to happen in March. Cherish your correction notebook."
  },
  // Day 10: 2026-10-26
  {
    category: "Daily Discipline",
    theme: "Routine Execution",
    quote: "Motivation gets you to your study desk, but adherence to your daily timetable keeps you there until the syllabus is conquered."
  },
  // Day 11: 2026-10-27
  {
    category: "Time Management",
    theme: "Timed Question Practice",
    quote: "Solve your 5-mark physics questions against a stopwatch. Managing your exam minutes now removes the panic later."
  },
  // Day 12: 2026-10-28
  {
    category: "Calmness & Poise",
    theme: "Emotional Balance",
    quote: "Patience turns a difficult problem into an understandable one. Take one deep breath and re-read the question carefully."
  },
  // Day 13: 2026-10-29
  {
    category: "Physical Recovery",
    theme: "Sleep & Brain Function",
    quote: "A tired brain makes avoidable arithmetic errors. Protect seven hours of quality sleep to cement everything studied today."
  },
  // Day 14: 2026-10-30
  {
    category: "Mock Test Practice",
    theme: "Exam Hall Simulation",
    quote: "Treat this practice paper exactly like the public board exam: strictly timed, quiet room, and zero peeking at the answer key."
  },
  // Day 15: 2026-10-31
  {
    category: "October Wrap-up",
    theme: "Progress Milestone",
    quote: "October closes with solid groundwork completed. Celebrate the chapters you have conquered and carry this momentum into November."
  },
  // Day 16: 2026-11-01
  {
    category: "New Month Drive",
    theme: "Fresh Focus Sprint",
    quote: "Welcome November with high standards. A fresh month gives you thirty new opportunities to solidify your 100/100 foundations."
  },
  // Day 17: 2026-11-02
  {
    category: "Physics Numericals",
    theme: "Units & Dimensions",
    quote: "Never rush the final numerical answer without checking the SI units; that final check is what preserves the full mark."
  },
  // Day 18: 2026-11-03
  {
    category: "Chemistry Equations",
    theme: "Stoichiometry & Balance",
    quote: "Always balance your chemical equations immediately. Unbalanced coefficients are unforced errors you cannot afford."
  },
  // Day 19: 2026-11-04
  {
    category: "Maths Trigonometry",
    theme: "Identity Fluency",
    quote: "When trigonometric transformations feel instinctive, complex calculus problems unravel in just three clean lines."
  },
  // Day 20: 2026-11-05
  {
    category: "Spaced Repetition",
    theme: "Flashcard Review",
    quote: "Revisit the formula sheet you drafted two weeks ago. Reviewing old material prevents the quiet decay of hard-earned concepts."
  },
  // Day 21: 2026-11-06
  {
    category: "Deep Work Habit",
    theme: "Single-Tasking",
    quote: "One subject at a time, one concept at a time. Multi-tasking is an illusion that drains cognitive stamina."
  },
  // Day 22: 2026-11-07
  {
    category: "Biology Genetics",
    theme: "Punnett Squares & Laws",
    quote: "Draw out the genetic crosses clearly with genotypes and phenotypes stated. Precision in genetics leaves examiners no room to deduct marks."
  },
  // Day 23: 2026-11-08
  {
    category: "English Comprehension",
    theme: "Answer Conciseness",
    quote: "Answer precisely what the literature question asks. Clear point-wise answers always score higher than wandering paragraphs."
  },
  // Day 24: 2026-11-09
  {
    category: "Mindset & Resilience",
    theme: "Tough Topic Breakthrough",
    quote: "When a chapter feels overwhelming, break it down into four sub-topics and conquer one before lunch."
  },
  // Day 25: 2026-11-10
  {
    category: "Discipline",
    theme: "Early Morning Start",
    quote: "The quiet clarity of early morning tuition and dawn study sets a victorious tone for your entire day."
  },
  // Day 26: 2026-11-11
  {
    category: "Physics Optics",
    theme: "Ray Diagrams",
    quote: "Draw arrows on every light ray in optics. A correct ray without directional arrows loses the mark you worked so hard for."
  },
  // Day 27: 2026-11-12
  {
    category: "Chemistry Inorganic",
    theme: "Periodic Trends & Coordination",
    quote: "Organize transition metals and coordination compounds into comparative tables; visual contrast locks the properties into memory."
  },
  // Day 28: 2026-11-13
  {
    category: "Maths Vectors",
    theme: "3D Geometry & Dot Products",
    quote: "Visualize the planes and lines before writing the equation. Clear geometric intuition turns 3D geometry into simple algebra."
  },
  // Day 29: 2026-11-14
  {
    category: "Self-Belief",
    theme: "Confidence from Effort",
    quote: "Confidence is not an accident of mood; it is the natural consequence of having solved fifty problems with your own hands."
  },
  // Day 30: 2026-11-15
  {
    category: "Mid-Term Reflection",
    theme: "Mid-November Audit",
    quote: "Look back at the topics you mastered this past fortnight. You are steadily closing the gap between your baseline and your Centum goal."
  },
  // Day 31: 2026-11-16
  {
    category: "Focus Stamina",
    theme: "Pomodoro Rhythm",
    quote: "Work with twenty-five minutes of fierce concentration, step away for five, and return sharp. Quality always beats mindless staring."
  },
  // Day 32: 2026-11-17
  {
    category: "Tamil Language",
    theme: "Poetry & Grammar Accuracy",
    quote: "Master the grammatical rules in Tamil sandhi and thodargal. Flawless grammar forms the bedrock of a ninety-plus language score."
  },
  // Day 33: 2026-11-18
  {
    category: "Physics Electromagnetism",
    theme: "Right-Hand Rule & Field Lines",
    quote: "In electromagnetic induction, state Lenz's law with exact terminology. Examiner rubrics look for key scientific phrases."
  },
  // Day 34: 2026-11-19
  {
    category: "Chemistry Physical",
    theme: "Electrochemistry & Kinetics",
    quote: "Write down the given parameters with units before substituting into the Nernst equation. Orderly inputs yield correct outputs."
  },
  // Day 35: 2026-11-20
  {
    category: "Maths Probability",
    theme: "Bayes Theorem & Distributions",
    quote: "Clearly state your events E1, E2, and A before applying Bayes theorem. Structure makes conditional probability easy to grade."
  },
  // Day 36: 2026-11-21
  {
    category: "Active Recall",
    theme: "Teach to Learn",
    quote: "If you want to test whether you truly understand a concept, explain it aloud as if teaching a younger classmate."
  },
  // Day 37: 2026-11-22
  {
    category: "Rest & Wellness",
    theme: "Active Recovery",
    quote: "A fifteen-minute brisk walk and deep hydration restore mental alertness far better than browsing social media during breaks."
  },
  // Day 38: 2026-11-23
  {
    category: "Answer Presentation",
    theme: "Underlining & Margin Notes",
    quote: "Draw neat bounding boxes around your final answers in numerical subjects. Make it effortless for the examiner to award top marks."
  },
  // Day 39: 2026-11-24
  {
    category: "Daily Consistency",
    theme: "No Zero Days",
    quote: "Even on days when energy is modest, solve five challenging problems. Keeping the habit unbroken is what compounds into brilliance."
  },
  // Day 40: 2026-11-25
  {
    category: "Biology Ecology",
    theme: "Definitions & Case Studies",
    quote: "Memorize textbook definitions verbatim in ecology. Exact terminology demonstrates mastery that examiners recognize in seconds."
  },
  // Day 41: 2026-11-26
  {
    category: "Maths Matrices",
    theme: "Determinants & Inverses",
    quote: "Double-check your cofactor calculations. A single sign error in matrix inversion is too costly to let slide through careless haste."
  },
  // Day 42: 2026-11-27
  {
    category: "Physics Modern Physics",
    theme: "Photoelectric & De Broglie",
    quote: "Modern physics is a goldmine for direct Centum marks: master Einstein's photoelectric equation and Planck's constant calculations."
  },
  // Day 43: 2026-11-28
  {
    category: "Chemistry Biomolecules",
    theme: "Polymers & Vitamins",
    quote: "Revise linkage bonds—peptide, glycosidic, and phosphodiester. Quick short-answer chemistry marks accumulate into your Centum."
  },
  // Day 44: 2026-11-29
  {
    category: "Revision Strategy",
    theme: "Three-Tier Problem Sorting",
    quote: "Categorize problems into Easy, Tricky, and Re-try. Dedicate today to conquering the ones that stumped you last week."
  },
  // Day 45: 2026-11-30
  {
    category: "November Milestone",
    theme: "One-Third Distance",
    quote: "November is in the books. Over forty days of steady, focused study have deepened your command across all six subjects."
  },
  // Day 46: 2026-12-01
  {
    category: "December Acceleration",
    theme: "Winter Revision Push",
    quote: "December begins now. As the weather cools, let your dedication intensify. This winter marks your transition from revision to mastery."
  },
  // Day 47: 2026-12-02
  {
    category: "Physics Current Electricity",
    theme: "Kirchhoff Laws & Bridges",
    quote: "Label junction currents and loop directions clearly in Kirchhoff problems. A transparent circuit diagram is half the solution."
  },
  // Day 48: 2026-12-03
  {
    category: "Chemistry Solutions",
    theme: "Colligative Properties & Van't Hoff",
    quote: "Never forget the Van't Hoff factor 'i' when dealing with electrolyte solutions. Precision in details separates 95 from 100."
  },
  // Day 49: 2026-12-04
  {
    category: "Maths Differential Equations",
    theme: "Integrating Factors",
    quote: "Identify the differential equation type immediately—separable, homogeneous, or linear. The right diagnosis makes the integration trivial."
  },
  // Day 50: 2026-12-05
  {
    category: "English Writing Skills",
    theme: "Notice & Report Formats",
    quote: "Review formal letter, notice, and report writing formats. Format accuracy guarantees easy, free marks in English board papers."
  },
  // Day 51: 2026-12-06
  {
    category: "Biology Physiology",
    theme: "Hormones & Feedback Loops",
    quote: "Use flowcharts for hormonal pathways and neural conduction. Sequential arrows make physiological recall swift and reliable."
  },
  // Day 52: 2026-12-07
  {
    category: "Distraction Control",
    theme: "Environment Architecture",
    quote: "Clear your desk of everything except the subject you are currently studying. An uncluttered workspace creates an uncluttered intellect."
  },
  // Day 53: 2026-12-08
  {
    category: "Mock Paper Analysis",
    theme: "Negative Space Audit",
    quote: "Examine not just where you scored, but exactly why marks slipped in your recent test. Fix that specific gap before nightfall."
  },
  // Day 54: 2026-12-09
  {
    category: "Physics Wave Optics",
    theme: "Interference & Diffraction",
    quote: "Distinguish clearly between interference fringes and diffraction patterns: fringe width equality vs central maximum intensity."
  },
  // Day 55: 2026-12-10
  {
    category: "Chemistry Aldehydes & Ketones",
    theme: "Named Condensations",
    quote: "Write out Aldol and Cannizzaro mechanisms three times without reference notes. Mastery comes from repeated hand-drawn derivations."
  },
  // Day 56: 2026-12-11
  {
    category: "Maths Maxima & Minima",
    theme: "First & Second Derivative Tests",
    quote: "Always state the conclusion clearly with the second derivative test sign. Show the examiner why the value is truly a maximum."
  },
  // Day 57: 2026-12-12
  {
    category: "Tamil Literature",
    theme: "Thirukkural Meaning & Context",
    quote: "Review the prescribed Thirukkural couplets and their ethical context. Seamless quotations in your Tamil answers reflect deep scholarship."
  },
  // Day 58: 2026-12-13
  {
    category: "Patience & Growth",
    theme: "Compound Progress",
    quote: "Do not demand instant transformation every afternoon. Knowledge accumulates like sediment: thin layers building into solid bedrock."
  },
  // Day 59: 2026-12-14
  {
    category: "Formula Sheet Audit",
    theme: "Daily Formula Flash",
    quote: "Spend ten minutes reciting all thermodynamic formulas and electric flux laws before starting your evening study session."
  },
  // Day 60: 2026-12-15
  {
    category: "Mid-December Milestone",
    theme: "Sixty Days of Resolve",
    quote: "Sixty consecutive days of preparation behind you. You have proved your staying power; trust the work you have already put in."
  },
  // Day 61: 2026-12-16
  {
    category: "Physics Semiconductor",
    theme: "Logic Gates & Diodes",
    quote: "Draw clean truth tables and circuit diagrams for rectifiers. Semiconductors are predictable, high-scoring questions if prepared cleanly."
  },
  // Day 62: 2026-12-17
  {
    category: "Chemistry Solid State",
    theme: "Bragg Law & Packing Efficiency",
    quote: "Calculate density and unit cell edge length with careful scientific notation. Exponent mistakes are easy to prevent with calm review."
  },
  // Day 63: 2026-12-18
  {
    category: "Maths Definite Integrals",
    theme: "Properties of Integrals",
    quote: "Use properties like integral from 0 to 'a' of f(x) equals f(a-x) to collapse formidable equations into one-step arithmetic."
  },
  // Day 64: 2026-12-19
  {
    category: "Biology Evolution",
    theme: "Homology vs Analogy",
    quote: "Cite textbook examples for divergent and convergent evolution. Anatomical examples give your answers indisputable factual weight."
  },
  // Day 65: 2026-12-20
  {
    category: "Endurance & Will",
    theme: "Final Hour Stamina",
    quote: "When fatigue whispers that you have studied enough, push through one more derivation. That extra rep builds genuine academic grit."
  },
  // Day 66: 2026-12-21
  {
    category: "Solitary Reflection",
    theme: "Winter Solstice Focus",
    quote: "The shortest day of the year offers the longest evening for quiet, uninterrupted focus. Light up your desk with pure intent."
  },
  // Day 67: 2026-12-22
  {
    category: "Ramanujan Inspiration",
    theme: "National Mathematics Day",
    quote: "Honor Ramanujan today by approaching mathematics not as a chore, but as an elegant exploration where every pattern makes sense."
  },
  // Day 68: 2026-12-23
  {
    category: "Chemistry p-Block",
    theme: "Oxoacids & Trends",
    quote: "Draw the structures of phosphorus and sulfur oxoacids with proper lone pairs and multiple bonds. Visual clarity earns full credit."
  },
  // Day 69: 2026-12-24
  {
    category: "Physics Magnetism",
    theme: "Biot-Savart & Solenoids",
    quote: "State Biot-Savart law in vector form first, then integrate along the axis. Rigorous mathematics impresses board paper evaluators."
  },
  // Day 70: 2026-12-25
  {
    category: "Calm Consistency",
    theme: "Holiday Focus",
    quote: "While the world takes holiday ease, spend two solid hours reviewing your high-yield summary sheets. Quiet dedication pays dividends."
  },
  // Day 71: 2026-12-26
  {
    category: "Exam Speed Drills",
    theme: "One-Mark Section Speed",
    quote: "Practice tackling twenty objective multiple-choice questions in under fifteen minutes. Saving time early gives breathing room for 5-markers."
  },
  // Day 72: 2026-12-27
  {
    category: "Maths Linear Programming",
    theme: "Feasible Region Shading",
    quote: "Shade your feasible region cleanly with a ruler and test all corner points in the objective function. A flawless five marks."
  },
  // Day 73: 2026-12-28
  {
    category: "English Essay Skills",
    theme: "Transitions & Cohesion",
    quote: "Use logical transition words between paragraphs in your essays. Cohesion and mature vocabulary distinguish top-percentile papers."
  },
  // Day 74: 2026-12-29
  {
    category: "Biology Microbes",
    theme: "Biotech & Applications",
    quote: "Write down the scientific names with binomial nomenclature underlined. It takes two seconds and shows an evaluator true scientific discipline."
  },
  // Day 75: 2026-12-30
  {
    category: "Year-End Review",
    theme: "2026 Preparation Reflection",
    quote: "Take thirty minutes to review what you have accomplished in 2026. The discipline you forged these past months is ready for 2027."
  },
  // Day 76: 2026-12-31
  {
    category: "New Year Eve Resolve",
    theme: "Commitment to Excellence",
    quote: "As the year turns, make one silent promise to yourself: no half-measures, no excuses, just disciplined daily execution toward 550+."
  },
  // Day 77: 2027-01-01
  {
    category: "January Kickoff",
    theme: "Board Exam Year Begins",
    quote: "Welcome 2027—your examination year. Every single page turned from today forward carries you closer to your academic summit."
  },
  // Day 78: 2027-01-02
  {
    category: "Physics Electrostatics",
    theme: "Gauss Law Applications",
    quote: "State the Gaussian surface symmetry clearly before applying the electric flux integral. Clear assumptions make derivations airtight."
  },
  // Day 79: 2027-01-03
  {
    category: "Chemistry Amines",
    theme: "Diazonium Salts & Basic Strength",
    quote: "Explain basicity trends of amines in aqueous vs gaseous phase with inductive, steric, and solvation factors clearly delineated."
  },
  // Day 80: 2027-01-04
  {
    category: "Maths Differential Equations",
    theme: "Homogeneous Substitution",
    quote: "When substituting y = vx, remember to differentiate both sides with the product rule. Systematic algebra prevents careless blunders."
  },
  // Day 81: 2027-01-05
  {
    category: "Active Recall",
    theme: "The 3-Day Rule",
    quote: "A concept revised three days after first learning it stays with you for three weeks. Keep your spaced revision cycle rotating."
  },
  // Day 82: 2027-01-06
  {
    category: "Distraction Defense",
    theme: "Micro-Temptation Awareness",
    quote: "Resist opening that browser tab for a 'quick look'. A five-second distraction costs fifteen minutes of deep mental flow."
  },
  // Day 83: 2027-01-07
  {
    category: "Tamil Prose & Grammar",
    theme: "Concise Summaries",
    quote: "Write answers in Tamil with legible handwriting and crisp punctuation. Clarity of thought shines directly through neat script."
  },
  // Day 84: 2027-01-08
  {
    category: "Physics AC Circuits",
    theme: "Phasor Diagrams & Resonance",
    quote: "Draw phasors with clear phase angle markers. Visualizing the voltage-current lead and lag makes RLC impedance calculations foolproof."
  },
  // Day 85: 2027-01-09
  {
    category: "Chemistry Coordination",
    theme: "Crystal Field Splitting",
    quote: "Draw crystal field splitting diagrams for octahedral and tetrahedral complexes with pairing energy vs delta-o explicitly compared."
  },
  // Day 86: 2027-01-10
  {
    category: "Rest & Reset",
    theme: "Weekly Energy Recharge",
    quote: "Take a restful evening walk and eat nourishing meals. Sustainable peak study performance requires a well-tended body."
  },
  // Day 87: 2027-01-11
  {
    category: "Maths Continuity",
    theme: "Limits & Differentiability",
    quote: "Always evaluate both left-hand and right-hand limits separately before declaring continuity. Rigor is the hallmark of a Centum student."
  },
  // Day 88: 2027-01-12
  {
    category: "Youth Day Energy",
    theme: "Swami Vivekananda Inspiration",
    quote: "'Arise, awake, and stop not till the goal is reached.' Channel that unbounded energy into completing today's syllabus checklist."
  },
  // Day 89: 2027-01-13
  {
    category: "Biology Reproduction",
    theme: "Embryology & Gametogenesis",
    quote: "Draw the steps of spermatogenesis and oogenesis side-by-side. Comparative charts highlight the chronological distinctions perfectly."
  },
  // Day 90: 2027-01-14
  {
    category: "Harvest Festival",
    theme: "Pongal Joy & Discipline",
    quote: "Celebrate Pongal with family warmth, then return to your books with fresh gratitude and clear purpose. Harmony fuels focus."
  },
  // Day 91: 2027-01-15
  {
    category: "Physics Ray Optics",
    theme: "Lens Maker Formula",
    quote: "Derive the lens maker's formula step by step with sign conventions rigorously defined at each spherical refracting surface."
  },
  // Day 92: 2027-01-16
  {
    category: "Chemistry Surface",
    theme: "Adsorption & Colloids",
    quote: "Memorize the distinguishing features between physisorption and chemisorption: enthalpy values, reversibility, and layer thickness."
  },
  // Day 93: 2027-01-17
  {
    category: "Maths Application of Integrals",
    theme: "Area Under Curves",
    quote: "Always sketch the intersecting curves first to identify the correct upper and lower functions. A rough sketch prevents inverted signs."
  },
  // Day 94: 2027-01-18
  {
    category: "Time Management",
    theme: "Paper Section Allocation",
    quote: "Pre-allocate exact time blocks for Sections A, B, C, and D. Sticking to your schedule ensures fifteen minutes of buffer at the end."
  },
  // Day 95: 2027-01-19
  {
    category: "Deep Revision",
    theme: "High-Yield Chapter Sweeps",
    quote: "Sweep through your high-weightage chapters today with focused question-solving. Maximizing scoring efficiency builds immense confidence."
  },
  // Day 96: 2027-01-20
  {
    category: "English Poetic Devices",
    theme: "Metaphors & Imagery",
    quote: "Identify and name poetic devices accurately in literature questions: alliteration, personification, and synecdoche carry specific marks."
  },
  // Day 97: 2027-01-21
  {
    category: "Physics Dual Nature",
    theme: "Stopping Potential & Frequency",
    quote: "Graph stopping potential versus frequency with slope equal to h/e. Coordinate geometry meets quantum physics cleanly in board exams."
  },
  // Day 98: 2027-01-22
  {
    category: "Chemistry Haloalkanes",
    theme: "SN1 vs SN2 Mechanisms",
    quote: "Contrast SN1 and SN2 pathways across carbocation stability, steric hindrance, inversion of configuration, and polar solvent effects."
  },
  // Day 99: 2027-01-23
  {
    category: "Courage & Resolve",
    theme: "Netaji Spirit",
    quote: "Face challenging question papers with courage. A fearless mindset tackles unfamiliar sub-parts with calm, analytical logic."
  },
  // Day 100: 2027-01-24
  {
    category: "Centum Century Milestone",
    theme: "100 Consecutive Days",
    quote: "One hundred days of unwavering daily focus behind you. What once felt intimidating is now familiar terrain. Keep marching forward."
  },
  // Day 101: 2027-01-25
  {
    category: "Maths Inverse Trig",
    theme: "Principal Value Branches",
    quote: "Check that your inverse trigonometric output lies strictly within the principal branch. Range checks protect precious marks."
  },
  // Day 102: 2027-01-26
  {
    category: "Republic Day Pride",
    theme: "Duty to Your Potential",
    quote: "Dedication to your studies is your personal contribution to excellence. Honor your potential with a focused three-hour revision sprint."
  },
  // Day 103: 2027-01-27
  {
    category: "Biology Biotechnology",
    theme: "PCR & Recombinant DNA",
    quote: "Summarize PCR cycles—denaturation, annealing, and extension—with specific temperatures and enzymes named. Textbook accuracy wins."
  },
  // Day 104: 2027-01-28
  {
    category: "Error Elimination",
    theme: "Silencing Reckless Rushing",
    quote: "Slow down by just five percent on calculations. Deliberate, measured pen strokes prevent mistakes that take ten minutes to debug."
  },
  // Day 105: 2027-01-29
  {
    category: "Physics Galvanometer",
    theme: "Conversion to Ammeter & Voltmeter",
    quote: "Derive shunt resistance for ammeters and high series resistance for voltmeters. Clean circuit diagrams ensure full five marks."
  },
  // Day 106: 2027-01-30
  {
    category: "Chemistry Organic Synthesis",
    theme: "Multi-Step Conversions",
    quote: "In conversion problems, work backwards from the target product to identify the key functional group transformations required."
  },
  // Day 107: 2027-01-31
  {
    category: "January Completion",
    theme: "Pre-Board Readiness",
    quote: "January concludes with syllabus mastery well in hand. February is the month of surgical polishing, timing perfection, and mock tests."
  },
  // Day 108: 2027-02-01
  {
    category: "February Sprint",
    theme: "One Month Countdown",
    quote: "Exactly one month until March exams. Narrow your focus to high-frequency question patterns, model papers, and error eradication."
  },
  // Day 109: 2027-02-02
  {
    category: "Full Mock Test",
    theme: "Three-Hour Endurance",
    quote: "Sit for a complete 3-hour mock paper from 10:00 AM to 1:00 PM. Condition your body and mind for the real examination schedule."
  },
  // Day 110: 2027-02-03
  {
    category: "Physics Wave Optics",
    theme: "Huygens Principle",
    quote: "Derive laws of reflection and refraction using secondary wavelets. State wave theory postulates cleanly at the outset."
  },
  // Day 111: 2027-02-04
  {
    category: "Chemistry Kinetics",
    theme: "Arrhenius Equation & Activation Energy",
    quote: "Plot log k versus 1/T and determine activation energy from the slope (-Ea / 2.303R). Master the graphical interpretation."
  },
  // Day 112: 2027-02-05
  {
    category: "Maths Vectors & 3D",
    theme: "Shortest Distance Between Skew Lines",
    quote: "Execute the shortest distance formula between skew lines with methodical cross products and dot products. A guaranteed 5-mark score."
  },
  // Day 113: 2027-02-06
  {
    category: "Tamil Language",
    theme: "Memorization & Rhyme Scheme",
    quote: "Recite the memory poems in Tamil without stumbling. Flawless recall of verses provides easy and reliable marks."
  },
  // Day 114: 2027-02-07
  {
    category: "Biology Human Health",
    theme: "Immunity & Antibody Structure",
    quote: "Draw the immunoglobulin Y-structure with heavy and light chains, disulfide bonds, and antigen-binding sites crisply labeled."
  },
  // Day 115: 2027-02-08
  {
    category: "Calmness Under Pressure",
    theme: "Equanimity",
    quote: "Exam anxiety dissolves the moment you pick up your pen and start writing. Action is the ultimate antidote to nervous anticipation."
  },
  // Day 116: 2027-02-09
  {
    category: "Physics Nuclei",
    theme: "Binding Energy & Mass Defect",
    quote: "Calculate mass defect in atomic mass units and convert directly to MeV using 931.5. Clean arithmetic keeps numericals painless."
  },
  // Day 117: 2027-02-10
  {
    category: "Chemistry Phenols",
    theme: "Kolbe & Reimer-Tiemann",
    quote: "Write down conditions, intermediate complexes, and electrophiles (like dichlorocarbene) for Kolbe and Reimer-Tiemann reactions."
  },
  // Day 118: 2027-02-11
  {
    category: "Maths Continuity & Differentiability",
    theme: "Rolle's & Mean Value Theorems",
    quote: "Verify continuity on closed intervals and differentiability on open intervals before calculating the value 'c'. Rigorous proofs prevail."
  },
  // Day 119: 2027-02-12
  {
    category: "Answer Sheet Handwriting",
    theme: "Legibility & Spacing",
    quote: "Leave two blank lines between questions and rule neat divider lines. An orderly answer booklet immediately biases evaluators favorably."
  },
  // Day 120: 2027-02-13
  {
    category: "Active Recall",
    theme: "Rapid Formula Blitz",
    quote: "Write out every single formula from all six Physics units on two A4 sheets from memory. If you stumble on one, review it immediately."
  },
  // Day 121: 2027-02-14
  {
    category: "Focus on the Goal",
    theme: "Single-Minded Devotion",
    quote: "Channel all your passion into mastering your subjects today. Your future self will look back on this season with deep pride."
  },
  // Day 122: 2027-02-15
  {
    category: "Fortnight Countdown",
    theme: "Two Weeks of Polish",
    quote: "Just fifteen days remain. This is the championship stretch where past revisions crystallize into effortless automatic recall."
  },
  // Day 123: 2027-02-16
  {
    category: "English Comprehension",
    theme: "Time Allocation",
    quote: "Read comprehension passages with a pen in hand, underlining key facts. Target answering the entire reading section in forty minutes."
  },
  // Day 124: 2027-02-17
  {
    category: "Physics Transformers",
    theme: "Efficiency & Energy Losses",
    quote: "Explain transformer energy losses—eddy currents, hysteresis, flux leakage, and copper loss—with mitigation techniques alongside each."
  },
  // Day 125: 2027-02-18
  {
    category: "Chemistry Polymers",
    theme: "Monomer Identification",
    quote: "Review monomers and polymerization types for Dacron, Nylon 6,6, Buna-S, and Bakelite. Quick factual recall seals perfect scores."
  },
  // Day 126: 2027-02-19
  {
    category: "Maths Integration by Parts",
    theme: "ILATE Rule Execution",
    quote: "Apply the ILATE order methodically and keep track of negative signs through repeated integrations. Calm calculation produces the Centum."
  },
  // Day 127: 2027-02-20
  {
    category: "Ten-Day Horizon",
    theme: "Confidence from Thoroughness",
    quote: "Ten days to the starting line. You have solved past years' questions, reviewed derivations, and polished mistakes. Walk tall."
  },
  // Day 128: 2027-02-21
  {
    category: "Biology Complete Sweep",
    theme: "Diagram Gallery Review",
    quote: "Flip through every diagram in your biology textbook in sequence. Ensure you can visualize every organelle and cross-section in your mind's eye."
  },
  // Day 129: 2027-02-22
  {
    category: "Physics Cyclotron & Magnetics",
    theme: "Resonance Frequency",
    quote: "State cyclotron resonance frequency formula and explain why relativistic speeds place an upper bound on particle acceleration."
  },
  // Day 130: 2027-02-23
  {
    category: "Chemistry Coordination & IUPAC",
    theme: "Nomenclature Rules",
    quote: "Review coordination IUPAC naming rules: alphabetical order of ligands, oxidation states in Roman numerals, and anionic metal suffixes."
  },
  // Day 131: 2027-02-24
  {
    category: "Rest & Nervous Balance",
    theme: "Quiet Mind",
    quote: "Keep your evenings calm and avoid last-minute frenzy. A steady, unruffled mind accesses memories far more rapidly during tests."
  },
  // Day 132: 2027-02-25
  {
    category: "Five-Day Final Polish",
    theme: "Short Notes Only",
    quote: "Transition from heavy problem volumes to your concise summary sheets. Reinforce core formulas, key diagrams, and critical definitions."
  },
  // Day 133: 2027-02-26
  {
    category: "Tamil & English Polish",
    theme: "Format & Grammar Check",
    quote: "Spend two hours reviewing essay blueprints, poetry summaries, and formal letter layouts for your upcoming language examinations."
  },
  // Day 134: 2027-02-27
  {
    category: "Three-Day Countdown",
    theme: "Hall Ticket & Stationery Kit",
    quote: "Prepare your examination kit: hall ticket, pens, pencils, eraser, geometry instruments. Removing practical worries frees your mental bandwidth."
  },
  // Day 135: 2027-02-28
  {
    category: "February Finale",
    theme: "Complete Preparation Review",
    quote: "February closes with every subject reviewed, tested, and reinforced. You have worked tirelessly; trust your comprehensive preparation."
  },
  // Day 136: 2027-03-01
  {
    category: "Eve of Exam Season",
    theme: "Serenity & Readiness",
    quote: "Tomorrow brings the culmination of months of disciplined labor. Sleep early, breathe deeply, and hold unwavering faith in your abilities."
  },
  // Day 137: 2027-03-02
  {
    category: "Final-Day Special Message",
    theme: "Culmination & Trust",
    // Verbatim requirement:
    // “Your preparation has brought you this far. Stay calm, trust what you have learned, and give your best.”
    quote: "Your preparation has brought you this far. Stay calm, trust what you have learned, and give your best."
  }
];

if (quoteDefinitions.length !== 137) {
  throw new Error(`Expected 137 quote definitions, but got ${quoteDefinitions.length}`);
}

// Assemble full entries with dates and validation
const fullQuotes = [];
const quoteSet = new Set();
const dateSet = new Set();

for (let i = 0; i < 137; i++) {
  const dateStr = dates[i];
  const def = quoteDefinitions[i];

  if (dateSet.has(dateStr)) {
    throw new Error(`Duplicate date detected: ${dateStr}`);
  }
  dateSet.add(dateStr);

  const cleanQuote = def.quote.trim();
  if (!cleanQuote) {
    throw new Error(`Empty quote detected on date ${dateStr}`);
  }

  const normalized = cleanQuote.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (quoteSet.has(normalized)) {
    throw new Error(`Duplicate or superficial match detected for quote: "${cleanQuote}"`);
  }
  quoteSet.add(normalized);

  // Calculate days remaining to March 3 exam start
  const examStart = new Date(2027, 2, 3).getTime();
  const [yy, mm, dd] = dateStr.split('-').map(Number);
  const thisDate = new Date(yy, mm - 1, dd).getTime();
  const daysLeft = Math.max(0, Math.ceil((examStart - thisDate) / (1000 * 60 * 60 * 24)));

  fullQuotes.push({
    date: dateStr,
    dayNumber: i + 1,
    daysRemaining: daysLeft,
    category: def.category,
    theme: def.theme,
    quote: cleanQuote,
  });
}

// Verify day 137 (2027-03-02) matches requirement verbatim
const finalQuote = fullQuotes.find(q => q.date === '2027-03-02');
if (!finalQuote || finalQuote.quote !== "Your preparation has brought you this far. Stay calm, trust what you have learned, and give your best.") {
  throw new Error(`Day 2027-03-02 quote does not match the exact requirement! Got: ${finalQuote?.quote}`);
}

console.log(`Validation passed! All 137 quotes are strictly distinct, non-empty, and mapped to dates from ${dates[0]} to ${dates[136]}.`);

// Generate TypeScript file content
const tsContent = `/**
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

export const DAILY_MOTIVATION_QUOTES: DailyMotivationQuote[] = ${JSON.stringify(fullQuotes, null, 2)};

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
  return \`\${year}-\${month}-\${day}\`;
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
    quote: \`No assigned quote for \${dateStr}. Stay focused on your daily preparation!\`,
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
`;

const targetFile = path.resolve(__dirname, '../src/utils/quotes.ts');
fs.writeFileSync(targetFile, tsContent, 'utf-8');
console.log(`Successfully wrote ${fullQuotes.length} quotes to ${targetFile}`);
