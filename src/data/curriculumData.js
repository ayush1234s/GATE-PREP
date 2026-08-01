// src/data/curriculumData.js
// Complete GATE ECE Curriculum Data — 10 Subjects, 49 Units, 200+ Lectures.
// Serves as static fallback data so the entire curriculum works out-of-the-box,
// and as seed data to push into Firestore in real time.

export const CURRICULUM_DATA = {
  'general-aptitude': {
    id: 'general-aptitude',
    name: 'General Aptitude',
    icon: '🧠',
    color: 'amber',
    units: [
      {
        id: 'unit-1-verbal-ability',
        name: 'Unit 1: Verbal Ability',
        order: 1,
        lectures: [
          { id: 'lec-ga-1-1', title: 'English Grammar & Sentence Structure', order: 1, youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
          { id: 'lec-ga-1-2', title: 'Vocabulary & Synonyms/Antonyms', order: 2, youtubeUrl: '' },
          { id: 'lec-ga-1-3', title: 'Reading Comprehension', order: 3, youtubeUrl: '' },
        ]
      },
      {
        id: 'unit-2-numerical-ability',
        name: 'Unit 2: Numerical Ability',
        order: 2,
        lectures: [
          { id: 'lec-ga-2-1', title: 'Arithmetic & Number Systems', order: 1, youtubeUrl: '' },
          { id: 'lec-ga-2-2', title: 'Algebra & Equations', order: 2, youtubeUrl: '' },
          { id: 'lec-ga-2-3', title: 'Geometry & Mensuration', order: 3, youtubeUrl: '' },
          { id: 'lec-ga-2-4', title: 'Data Interpretation', order: 4, youtubeUrl: '' },
        ]
      },
      {
        id: 'unit-3-analytical-aptitude',
        name: 'Unit 3: Analytical Aptitude',
        order: 3,
        lectures: [
          { id: 'lec-ga-3-1', title: 'Deductive & Inductive Reasoning', order: 1, youtubeUrl: '' },
          { id: 'lec-ga-3-2', title: 'Logical Relations & Syllogisms', order: 2, youtubeUrl: '' },
        ]
      },
      {
        id: 'unit-4-spatial-aptitude',
        name: 'Unit 4: Spatial Aptitude',
        order: 4,
        lectures: [
          { id: 'lec-ga-4-1', title: 'Transformation of Shapes', order: 1, youtubeUrl: '' },
          { id: 'lec-ga-4-2', title: 'Paper Folding & Pattern Recognition', order: 2, youtubeUrl: '' },
        ]
      }
    ]
  },

  'engineering-mathematics': {
    id: 'engineering-mathematics',
    name: 'Engineering Mathematics',
    icon: '📐',
    color: 'indigo',
    units: [
      {
        id: 'unit-1-linear-algebra',
        name: 'Unit 1: Linear Algebra',
        order: 1,
        lectures: [
          { id: 'lec-em-1-1', title: 'Matrices', order: 1, youtubeUrl: '' },
          { id: 'lec-em-1-2', title: 'Determinants', order: 2, youtubeUrl: '' },
          { id: 'lec-em-1-3', title: 'Eigenvalues & Eigenvectors', order: 3, youtubeUrl: '' },
          { id: 'lec-em-1-4', title: 'Rank of Matrix', order: 4, youtubeUrl: '' },
          { id: 'lec-em-1-5', title: 'System of Linear Equations', order: 5, youtubeUrl: '' },
        ]
      },
      {
        id: 'unit-2-calculus',
        name: 'Unit 2: Calculus',
        order: 2,
        lectures: [
          { id: 'lec-em-2-1', title: 'Limits & Continuity', order: 1, youtubeUrl: '' },
          { id: 'lec-em-2-2', title: 'Differentiation', order: 2, youtubeUrl: '' },
          { id: 'lec-em-2-3', title: 'Maxima & Minima', order: 3, youtubeUrl: '' },
          { id: 'lec-em-2-4', title: 'Partial Derivatives', order: 4, youtubeUrl: '' },
          { id: 'lec-em-2-5', title: 'Multiple Integrals', order: 5, youtubeUrl: '' },
        ]
      },
      {
        id: 'unit-3-differential-equations',
        name: 'Unit 3: Differential Equations',
        order: 3,
        lectures: [
          { id: 'lec-em-3-1', title: 'First Order Differential Equations', order: 1, youtubeUrl: '' },
          { id: 'lec-em-3-2', title: 'Higher Order Differential Equations', order: 2, youtubeUrl: '' },
          { id: 'lec-em-3-3', title: 'Homogeneous & Non-Homogeneous Equations', order: 3, youtubeUrl: '' },
          { id: 'lec-em-3-4', title: 'Initial & Boundary Value Problems', order: 4, youtubeUrl: '' },
        ]
      },
      {
        id: 'unit-4-probability-and-statistics',
        name: 'Unit 4: Probability and Statistics',
        order: 4,
        lectures: [
          { id: 'lec-em-4-1', title: 'Probability', order: 1, youtubeUrl: '' },
          { id: 'lec-em-4-2', title: 'Random Variables', order: 2, youtubeUrl: '' },
          { id: 'lec-em-4-3', title: 'Mean & Variance', order: 3, youtubeUrl: '' },
          { id: 'lec-em-4-4', title: 'Bayes Theorem', order: 4, youtubeUrl: '' },
          { id: 'lec-em-4-5', title: 'Normal Distribution', order: 5, youtubeUrl: '' },
        ]
      },
      {
        id: 'unit-5-vector-calculus-complex-variables',
        name: 'Unit 5: Vector Calculus & Complex Variables',
        order: 5,
        lectures: [
          { id: 'lec-em-5-1', title: 'Gradient', order: 1, youtubeUrl: '' },
          { id: 'lec-em-5-2', title: 'Divergence', order: 2, youtubeUrl: '' },
          { id: 'lec-em-5-3', title: 'Curl', order: 3, youtubeUrl: '' },
          { id: 'lec-em-5-4', title: 'Line & Surface Integrals', order: 4, youtubeUrl: '' },
          { id: 'lec-em-5-5', title: 'Complex Numbers', order: 5, youtubeUrl: '' },
          { id: 'lec-em-5-6', title: 'Analytic Functions', order: 6, youtubeUrl: '' },
        ]
      }
    ]
  },

  'networks': {
    id: 'networks',
    name: 'Networks',
    icon: '⚡',
    color: 'blue',
    units: [
      {
        id: 'unit-1-network-fundamentals',
        name: 'Unit 1: Network Fundamentals',
        order: 1,
        lectures: [
          { id: 'lec-net-1-1', title: 'Circuit Laws', order: 1, youtubeUrl: '' },
          { id: 'lec-net-1-2', title: 'KCL', order: 2, youtubeUrl: '' },
          { id: 'lec-net-1-3', title: 'KVL', order: 3, youtubeUrl: '' },
          { id: 'lec-net-1-4', title: 'Source Transformation', order: 4, youtubeUrl: '' },
          { id: 'lec-net-1-5', title: 'Network Theorems', order: 5, youtubeUrl: '' },
        ]
      },
      {
        id: 'unit-2-network-analysis',
        name: 'Unit 2: Network Analysis',
        order: 2,
        lectures: [
          { id: 'lec-net-2-1', title: 'Mesh Analysis', order: 1, youtubeUrl: '' },
          { id: 'lec-net-2-2', title: 'Nodal Analysis', order: 2, youtubeUrl: '' },
          { id: 'lec-net-2-3', title: 'Superposition', order: 3, youtubeUrl: '' },
          { id: 'lec-net-2-4', title: 'Thevenin', order: 4, youtubeUrl: '' },
          { id: 'lec-net-2-5', title: 'Norton', order: 5, youtubeUrl: '' },
        ]
      },
      {
        id: 'unit-3-first-second-order-circuits',
        name: 'Unit 3: First & Second Order Circuits',
        order: 3,
        lectures: [
          { id: 'lec-net-3-1', title: 'RL Circuits', order: 1, youtubeUrl: '' },
          { id: 'lec-net-3-2', title: 'RC Circuits', order: 2, youtubeUrl: '' },
          { id: 'lec-net-3-3', title: 'RLC Circuits', order: 3, youtubeUrl: '' },
          { id: 'lec-net-3-4', title: 'Natural Response', order: 4, youtubeUrl: '' },
          { id: 'lec-net-3-5', title: 'Forced Response', order: 5, youtubeUrl: '' },
        ]
      },
      {
        id: 'unit-4-ac-networks',
        name: 'Unit 4: AC Networks',
        order: 4,
        lectures: [
          { id: 'lec-net-4-1', title: 'Phasors', order: 1, youtubeUrl: '' },
          { id: 'lec-net-4-2', title: 'Resonance', order: 2, youtubeUrl: '' },
          { id: 'lec-net-4-3', title: 'Three Phase Circuits', order: 3, youtubeUrl: '' },
          { id: 'lec-net-4-4', title: 'Power', order: 4, youtubeUrl: '' },
          { id: 'lec-net-4-5', title: 'Maximum Power Transfer', order: 5, youtubeUrl: '' },
        ]
      },
      {
        id: 'unit-5-network-functions',
        name: 'Unit 5: Network Functions',
        order: 5,
        lectures: [
          { id: 'lec-net-5-1', title: 'Laplace Transform', order: 1, youtubeUrl: '' },
          { id: 'lec-net-5-2', title: 'Transfer Function', order: 2, youtubeUrl: '' },
          { id: 'lec-net-5-3', title: 'Two-Port Networks', order: 3, youtubeUrl: '' },
          { id: 'lec-net-5-4', title: 'Frequency Response', order: 4, youtubeUrl: '' },
          { id: 'lec-net-5-5', title: 'Filters', order: 5, youtubeUrl: '' },
        ]
      }
    ]
  },

  'signals-and-systems': {
    id: 'signals-and-systems',
    name: 'Signals and Systems',
    icon: '📡',
    color: 'purple',
    units: [
      {
        id: 'unit-1-signals',
        name: 'Unit 1: Signals',
        order: 1,
        lectures: [
          { id: 'lec-sig-1-1', title: 'Continuous Signals', order: 1, youtubeUrl: '' },
          { id: 'lec-sig-1-2', title: 'Discrete Signals', order: 2, youtubeUrl: '' },
          { id: 'lec-sig-1-3', title: 'Basic Signal Operations', order: 3, youtubeUrl: '' },
          { id: 'lec-sig-1-4', title: 'Energy & Power Signals', order: 4, youtubeUrl: '' },
        ]
      },
      {
        id: 'unit-2-systems',
        name: 'Unit 2: Systems',
        order: 2,
        lectures: [
          { id: 'lec-sig-2-1', title: 'LTI Systems', order: 1, youtubeUrl: '' },
          { id: 'lec-sig-2-2', title: 'Time Invariant Systems', order: 2, youtubeUrl: '' },
          { id: 'lec-sig-2-3', title: 'Causality', order: 3, youtubeUrl: '' },
          { id: 'lec-sig-2-4', title: 'Stability', order: 4, youtubeUrl: '' },
          { id: 'lec-sig-2-5', title: 'Convolution', order: 5, youtubeUrl: '' },
        ]
      },
      {
        id: 'unit-3-fourier-analysis',
        name: 'Unit 3: Fourier Analysis',
        order: 3,
        lectures: [
          { id: 'lec-sig-3-1', title: 'Fourier Series', order: 1, youtubeUrl: '' },
          { id: 'lec-sig-3-2', title: 'Continuous Fourier Transform', order: 2, youtubeUrl: '' },
          { id: 'lec-sig-3-3', title: 'Discrete Fourier Transform', order: 3, youtubeUrl: '' },
          { id: 'lec-sig-3-4', title: 'FFT', order: 4, youtubeUrl: '' },
        ]
      },
      {
        id: 'unit-4-laplace-z-transform',
        name: 'Unit 4: Laplace & Z-Transform',
        order: 4,
        lectures: [
          { id: 'lec-sig-4-1', title: 'Laplace Transform', order: 1, youtubeUrl: '' },
          { id: 'lec-sig-4-2', title: 'ROC', order: 2, youtubeUrl: '' },
          { id: 'lec-sig-4-3', title: 'Z Transform', order: 3, youtubeUrl: '' },
          { id: 'lec-sig-4-4', title: 'Inverse Z Transform', order: 4, youtubeUrl: '' },
        ]
      },
      {
        id: 'unit-5-sampling',
        name: 'Unit 5: Sampling',
        order: 5,
        lectures: [
          { id: 'lec-sig-5-1', title: 'Sampling Theorem', order: 1, youtubeUrl: '' },
          { id: 'lec-sig-5-2', title: 'Aliasing', order: 2, youtubeUrl: '' },
          { id: 'lec-sig-5-3', title: 'Reconstruction', order: 3, youtubeUrl: '' },
          { id: 'lec-sig-5-4', title: 'Frequency Response', order: 4, youtubeUrl: '' },
        ]
      }
    ]
  },

  'electronic-devices': {
    id: 'electronic-devices',
    name: 'Electronic Devices',
    icon: '💡',
    color: 'rose',
    units: [
      {
        id: 'unit-1-semiconductor-physics',
        name: 'Unit 1: Semiconductor Physics',
        order: 1,
        lectures: [
          { id: 'lec-ed-1-1', title: 'Energy Bands', order: 1, youtubeUrl: '' },
          { id: 'lec-ed-1-2', title: 'PN Junction', order: 2, youtubeUrl: '' },
          { id: 'lec-ed-1-3', title: 'Drift & Diffusion', order: 3, youtubeUrl: '' },
          { id: 'lec-ed-1-4', title: 'Carrier Transport', order: 4, youtubeUrl: '' },
        ]
      },
      {
        id: 'unit-2-diodes',
        name: 'Unit 2: Diodes',
        order: 2,
        lectures: [
          { id: 'lec-ed-2-1', title: 'Rectifiers', order: 1, youtubeUrl: '' },
          { id: 'lec-ed-2-2', title: 'Clippers', order: 2, youtubeUrl: '' },
          { id: 'lec-ed-2-3', title: 'Clampers', order: 3, youtubeUrl: '' },
          { id: 'lec-ed-2-4', title: 'Zener Diode', order: 4, youtubeUrl: '' },
          { id: 'lec-ed-2-5', title: 'Special Diodes', order: 5, youtubeUrl: '' },
        ]
      },
      {
        id: 'unit-3-bjt',
        name: 'Unit 3: BJT',
        order: 3,
        lectures: [
          { id: 'lec-ed-3-1', title: 'Construction', order: 1, youtubeUrl: '' },
          { id: 'lec-ed-3-2', title: 'Characteristics', order: 2, youtubeUrl: '' },
          { id: 'lec-ed-3-3', title: 'Biasing', order: 3, youtubeUrl: '' },
          { id: 'lec-ed-3-4', title: 'Small Signal Model', order: 4, youtubeUrl: '' },
          { id: 'lec-ed-3-5', title: 'Switching', order: 5, youtubeUrl: '' },
        ]
      },
      {
        id: 'unit-4-mosfet',
        name: 'Unit 4: MOSFET',
        order: 4,
        lectures: [
          { id: 'lec-ed-4-1', title: 'Structure', order: 1, youtubeUrl: '' },
          { id: 'lec-ed-4-2', title: 'Characteristics', order: 2, youtubeUrl: '' },
          { id: 'lec-ed-4-3', title: 'Biasing', order: 3, youtubeUrl: '' },
          { id: 'lec-ed-4-4', title: 'Enhancement & Depletion MOSFET', order: 4, youtubeUrl: '' },
        ]
      },
      {
        id: 'unit-5-semiconductor-devices',
        name: 'Unit 5: Semiconductor Devices',
        order: 5,
        lectures: [
          { id: 'lec-ed-5-1', title: 'JFET', order: 1, youtubeUrl: '' },
          { id: 'lec-ed-5-2', title: 'UJT', order: 2, youtubeUrl: '' },
          { id: 'lec-ed-5-3', title: 'SCR', order: 3, youtubeUrl: '' },
          { id: 'lec-ed-5-4', title: 'LED', order: 4, youtubeUrl: '' },
          { id: 'lec-ed-5-5', title: 'Photodiode', order: 5, youtubeUrl: '' },
          { id: 'lec-ed-5-6', title: 'Solar Cell', order: 6, youtubeUrl: '' },
        ]
      }
    ]
  },

  'analog-circuits': {
    id: 'analog-circuits',
    name: 'Analog Circuits',
    icon: '🔌',
    color: 'pink',
    units: [
      {
        id: 'unit-1-diode-circuits',
        name: 'Unit 1: Diode Circuits',
        order: 1,
        lectures: [
          { id: 'lec-an-1-1', title: 'Rectifiers', order: 1, youtubeUrl: '' },
          { id: 'lec-an-1-2', title: 'Clippers', order: 2, youtubeUrl: '' },
          { id: 'lec-an-1-3', title: 'Clampers', order: 3, youtubeUrl: '' },
          { id: 'lec-an-1-4', title: 'Voltage Regulators', order: 4, youtubeUrl: '' },
        ]
      },
      {
        id: 'unit-2-bjt-amplifiers',
        name: 'Unit 2: BJT Amplifiers',
        order: 2,
        lectures: [
          { id: 'lec-an-2-1', title: 'CE Amplifier', order: 1, youtubeUrl: '' },
          { id: 'lec-an-2-2', title: 'CB Amplifier', order: 2, youtubeUrl: '' },
          { id: 'lec-an-2-3', title: 'CC Amplifier', order: 3, youtubeUrl: '' },
          { id: 'lec-an-2-4', title: 'Frequency Response', order: 4, youtubeUrl: '' },
        ]
      },
      {
        id: 'unit-3-mos-amplifiers',
        name: 'Unit 3: MOS Amplifiers',
        order: 3,
        lectures: [
          { id: 'lec-an-3-1', title: 'Common Source', order: 1, youtubeUrl: '' },
          { id: 'lec-an-3-2', title: 'Common Drain', order: 2, youtubeUrl: '' },
          { id: 'lec-an-3-3', title: 'Common Gate', order: 3, youtubeUrl: '' },
          { id: 'lec-an-3-4', title: 'Differential Amplifier', order: 4, youtubeUrl: '' },
        ]
      },
      {
        id: 'unit-4-feedback-oscillators',
        name: 'Unit 4: Feedback & Oscillators',
        order: 4,
        lectures: [
          { id: 'lec-an-4-1', title: 'Negative Feedback', order: 1, youtubeUrl: '' },
          { id: 'lec-an-4-2', title: 'Positive Feedback', order: 2, youtubeUrl: '' },
          { id: 'lec-an-4-3', title: 'RC Oscillator', order: 3, youtubeUrl: '' },
          { id: 'lec-an-4-4', title: 'LC Oscillator', order: 4, youtubeUrl: '' },
          { id: 'lec-an-4-5', title: 'Crystal Oscillator', order: 5, youtubeUrl: '' },
        ]
      },
      {
        id: 'unit-5-operational-amplifiers',
        name: 'Unit 5: Operational Amplifiers',
        order: 5,
        lectures: [
          { id: 'lec-an-5-1', title: 'Ideal Op-Amp', order: 1, youtubeUrl: '' },
          { id: 'lec-an-5-2', title: 'Applications', order: 2, youtubeUrl: '' },
          { id: 'lec-an-5-3', title: 'Active Filters', order: 3, youtubeUrl: '' },
          { id: 'lec-an-5-4', title: 'Comparator', order: 4, youtubeUrl: '' },
          { id: 'lec-an-5-5', title: 'Multivibrator', order: 5, youtubeUrl: '' },
        ]
      }
    ]
  },

  'digital-circuits': {
    id: 'digital-circuits',
    name: 'Digital Circuits',
    icon: '💻',
    color: 'green',
    units: [
      {
        id: 'unit-1-number-systems',
        name: 'Unit 1: Number Systems',
        order: 1,
        lectures: [
          { id: 'lec-dig-1-1', title: 'Binary, Octal, Hexadecimal', order: 1, youtubeUrl: '' },
          { id: 'lec-dig-1-2', title: 'Boolean Algebra', order: 2, youtubeUrl: '' },
          { id: 'lec-dig-1-3', title: 'Logic Gates', order: 3, youtubeUrl: '' },
        ]
      },
      {
        id: 'unit-2-combinational-circuits',
        name: 'Unit 2: Combinational Circuits',
        order: 2,
        lectures: [
          { id: 'lec-dig-2-1', title: 'K-Map', order: 1, youtubeUrl: '' },
          { id: 'lec-dig-2-2', title: 'Multiplexer', order: 2, youtubeUrl: '' },
          { id: 'lec-dig-2-3', title: 'Decoder', order: 3, youtubeUrl: '' },
          { id: 'lec-dig-2-4', title: 'Encoder', order: 4, youtubeUrl: '' },
          { id: 'lec-dig-2-5', title: 'Comparator', order: 5, youtubeUrl: '' },
        ]
      },
      {
        id: 'unit-3-sequential-circuits',
        name: 'Unit 3: Sequential Circuits',
        order: 3,
        lectures: [
          { id: 'lec-dig-3-1', title: 'Flip-Flops', order: 1, youtubeUrl: '' },
          { id: 'lec-dig-3-2', title: 'Registers', order: 2, youtubeUrl: '' },
          { id: 'lec-dig-3-3', title: 'Counters', order: 3, youtubeUrl: '' },
          { id: 'lec-dig-3-4', title: 'Shift Registers', order: 4, youtubeUrl: '' },
        ]
      },
      {
        id: 'unit-4-memories',
        name: 'Unit 4: Memories',
        order: 4,
        lectures: [
          { id: 'lec-dig-4-1', title: 'RAM & ROM', order: 1, youtubeUrl: '' },
          { id: 'lec-dig-4-2', title: 'PLA & PAL', order: 2, youtubeUrl: '' },
          { id: 'lec-dig-4-3', title: 'FPGA Basics', order: 3, youtubeUrl: '' },
        ]
      },
      {
        id: 'unit-5-adc-dac',
        name: 'Unit 5: ADC & DAC',
        order: 5,
        lectures: [
          { id: 'lec-dig-5-1', title: 'ADC Types', order: 1, youtubeUrl: '' },
          { id: 'lec-dig-5-2', title: 'DAC Types', order: 2, youtubeUrl: '' },
          { id: 'lec-dig-5-3', title: 'Sample & Hold', order: 3, youtubeUrl: '' },
          { id: 'lec-dig-5-4', title: 'Digital Logic Families', order: 4, youtubeUrl: '' },
        ]
      }
    ]
  },

  'control-systems': {
    id: 'control-systems',
    name: 'Control Systems',
    icon: '🎛️',
    color: 'teal',
    units: [
      {
        id: 'unit-1-mathematical-modeling',
        name: 'Unit 1: Mathematical Modeling',
        order: 1,
        lectures: [
          { id: 'lec-cs-1-1', title: 'Transfer Function', order: 1, youtubeUrl: '' },
          { id: 'lec-cs-1-2', title: 'Block Diagram', order: 2, youtubeUrl: '' },
          { id: 'lec-cs-1-3', title: 'Signal Flow Graph', order: 3, youtubeUrl: '' },
        ]
      },
      {
        id: 'unit-2-time-domain-analysis',
        name: 'Unit 2: Time Domain Analysis',
        order: 2,
        lectures: [
          { id: 'lec-cs-2-1', title: 'First Order System', order: 1, youtubeUrl: '' },
          { id: 'lec-cs-2-2', title: 'Second Order System', order: 2, youtubeUrl: '' },
          { id: 'lec-cs-2-3', title: 'Steady State Error', order: 3, youtubeUrl: '' },
          { id: 'lec-cs-2-4', title: 'Performance Specifications', order: 4, youtubeUrl: '' },
        ]
      },
      {
        id: 'unit-3-stability',
        name: 'Unit 3: Stability',
        order: 3,
        lectures: [
          { id: 'lec-cs-3-1', title: 'Routh Hurwitz', order: 1, youtubeUrl: '' },
          { id: 'lec-cs-3-2', title: 'Root Locus', order: 2, youtubeUrl: '' },
          { id: 'lec-cs-3-3', title: 'Nyquist Criterion', order: 3, youtubeUrl: '' },
          { id: 'lec-cs-3-4', title: 'Bode Plot', order: 4, youtubeUrl: '' },
        ]
      },
      {
        id: 'unit-4-frequency-response',
        name: 'Unit 4: Frequency Response',
        order: 4,
        lectures: [
          { id: 'lec-cs-4-1', title: 'Polar Plot', order: 1, youtubeUrl: '' },
          { id: 'lec-cs-4-2', title: 'Nichols Chart', order: 2, youtubeUrl: '' },
          { id: 'lec-cs-4-3', title: 'Gain Margin & Phase Margin', order: 3, youtubeUrl: '' },
        ]
      },
      {
        id: 'unit-5-state-space-analysis',
        name: 'Unit 5: State Space Analysis',
        order: 5,
        lectures: [
          { id: 'lec-cs-5-1', title: 'State Variables & State Equation', order: 1, youtubeUrl: '' },
          { id: 'lec-cs-5-2', title: 'Controllability', order: 2, youtubeUrl: '' },
          { id: 'lec-cs-5-3', title: 'Observability', order: 3, youtubeUrl: '' },
        ]
      }
    ]
  },

  'communications': {
    id: 'communications',
    name: 'Communications',
    icon: '📶',
    color: 'red',
    units: [
      {
        id: 'unit-1-analog-communication',
        name: 'Unit 1: Analog Communication',
        order: 1,
        lectures: [
          { id: 'lec-comm-1-1', title: 'AM (Amplitude Modulation)', order: 1, youtubeUrl: '' },
          { id: 'lec-comm-1-2', title: 'FM (Frequency Modulation)', order: 2, youtubeUrl: '' },
          { id: 'lec-comm-1-3', title: 'PM (Phase Modulation)', order: 3, youtubeUrl: '' },
          { id: 'lec-comm-1-4', title: 'Modulation Index', order: 4, youtubeUrl: '' },
          { id: 'lec-comm-1-5', title: 'Noise in Analog Communication', order: 5, youtubeUrl: '' },
        ]
      },
      {
        id: 'unit-2-digital-communication',
        name: 'Unit 2: Digital Communication',
        order: 2,
        lectures: [
          { id: 'lec-comm-2-1', title: 'PCM (Pulse Code Modulation)', order: 1, youtubeUrl: '' },
          { id: 'lec-comm-2-2', title: 'DPCM', order: 2, youtubeUrl: '' },
          { id: 'lec-comm-2-3', title: 'Delta Modulation', order: 3, youtubeUrl: '' },
          { id: 'lec-comm-2-4', title: 'Line Coding', order: 4, youtubeUrl: '' },
        ]
      },
      {
        id: 'unit-3-digital-modulation',
        name: 'Unit 3: Digital Modulation',
        order: 3,
        lectures: [
          { id: 'lec-comm-3-1', title: 'ASK & FSK', order: 1, youtubeUrl: '' },
          { id: 'lec-comm-3-2', title: 'PSK & QPSK', order: 2, youtubeUrl: '' },
          { id: 'lec-comm-3-3', title: 'QAM', order: 3, youtubeUrl: '' },
        ]
      },
      {
        id: 'unit-4-information-theory',
        name: 'Unit 4: Information Theory',
        order: 4,
        lectures: [
          { id: 'lec-comm-4-1', title: 'Entropy', order: 1, youtubeUrl: '' },
          { id: 'lec-comm-4-2', title: 'Source Coding & Huffman Coding', order: 2, youtubeUrl: '' },
          { id: 'lec-comm-4-3', title: 'Channel Capacity & Shannon Theorem', order: 3, youtubeUrl: '' },
        ]
      },
      {
        id: 'unit-5-random-processes-noise',
        name: 'Unit 5: Random Processes & Noise',
        order: 5,
        lectures: [
          { id: 'lec-comm-5-1', title: 'Random Variables', order: 1, youtubeUrl: '' },
          { id: 'lec-comm-5-2', title: 'AWGN', order: 2, youtubeUrl: '' },
          { id: 'lec-comm-5-3', title: 'Noise Figure & Error Probability', order: 3, youtubeUrl: '' },
        ]
      }
    ]
  },

  'electromagnetics': {
    id: 'electromagnetics',
    name: 'Electromagnetics',
    icon: '🧲',
    color: 'slate',
    units: [
      {
        id: 'unit-1-vector-analysis',
        name: 'Unit 1: Vector Analysis',
        order: 1,
        lectures: [
          { id: 'lec-em-v-1-1', title: 'Coordinate Systems', order: 1, youtubeUrl: '' },
          { id: 'lec-em-v-1-2', title: 'Gradient, Divergence & Curl', order: 2, youtubeUrl: '' },
        ]
      },
      {
        id: 'unit-2-electrostatics',
        name: 'Unit 2: Electrostatics',
        order: 2,
        lectures: [
          { id: 'lec-em-v-2-1', title: "Coulomb's Law & Electric Field", order: 1, youtubeUrl: '' },
          { id: 'lec-em-v-2-2', title: "Gauss Law & Capacitance", order: 2, youtubeUrl: '' },
        ]
      },
      {
        id: 'unit-3-magnetostatics',
        name: 'Unit 3: Magnetostatics',
        order: 3,
        lectures: [
          { id: 'lec-em-v-3-1', title: "Biot-Savart Law", order: 1, youtubeUrl: '' },
          { id: 'lec-em-v-3-2', title: "Ampere's Law & Inductance", order: 2, youtubeUrl: '' },
          { id: 'lec-em-v-3-3', title: "Magnetic Flux", order: 3, youtubeUrl: '' },
        ]
      },
      {
        id: 'unit-4-maxwells-equations',
        name: 'Unit 4: Maxwell\'s Equations',
        order: 4,
        lectures: [
          { id: 'lec-em-v-4-1', title: "Maxwell Equations", order: 1, youtubeUrl: '' },
          { id: 'lec-em-v-4-2', title: "Boundary Conditions", order: 2, youtubeUrl: '' },
          { id: 'lec-em-v-4-3', title: "Poynting Theorem & Electromagnetic Waves", order: 3, youtubeUrl: '' },
        ]
      },
      {
        id: 'unit-5-transmission-lines-waveguides',
        name: 'Unit 5: Transmission Lines & Waveguides',
        order: 5,
        lectures: [
          { id: 'lec-em-v-5-1', title: "Transmission Lines & Smith Chart", order: 1, youtubeUrl: '' },
          { id: 'lec-em-v-5-2', title: "Reflection Coefficient", order: 2, youtubeUrl: '' },
          { id: 'lec-em-v-5-3', title: "Waveguides & Antennas (Basics)", order: 3, youtubeUrl: '' },
        ]
      }
    ]
  }
}
