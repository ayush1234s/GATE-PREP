// src/data/defaultSubjects.js
// Standard GATE ECE Subjects list with dynamic unit & lecture counts from CURRICULUM_DATA.

import { CURRICULUM_DATA } from './curriculumData'

export const DEFAULT_SUBJECTS = Object.values(CURRICULUM_DATA).map(subject => {
  const units = subject.units || []
  const unitCount = units.length
  const lectureCount = units.reduce((sum, u) => sum + (u.lectures?.length || 0), 0)

  let description = ''
  if (subject.id === 'general-aptitude') description = 'Verbal Ability, Numerical Ability, Analytical Reasoning & Spatial Aptitude.'
  else if (subject.id === 'engineering-mathematics') description = 'Linear Algebra, Calculus, Differential Equations, Probability & Complex Variables.'
  else if (subject.id === 'networks') description = 'Network Fundamentals, Analysis, First/Second Order Circuits, AC Networks & Functions.'
  else if (subject.id === 'signals-and-systems') description = 'Signals, LTI Systems, Fourier Analysis, Laplace/Z-Transform & Sampling.'
  else if (subject.id === 'electronic-devices') description = 'Semiconductor Physics, Diodes, BJT, MOSFET & Semiconductor Devices.'
  else if (subject.id === 'analog-circuits') description = 'Diode Circuits, BJT/MOS Amplifiers, Feedback & Op-Amps.'
  else if (subject.id === 'digital-circuits') description = 'Number Systems, Combinational & Sequential Circuits, Memories, ADC/DAC.'
  else if (subject.id === 'control-systems') description = 'Mathematical Modeling, Time/Frequency Domain Analysis, Stability & State Space.'
  else if (subject.id === 'communications') description = 'Analog/Digital Communication, Digital Modulation, Information Theory & Noise.'
  else if (subject.id === 'electromagnetics') description = 'Vector Analysis, Electrostatics, Magnetostatics, Maxwell Equations & Transmission Lines.'

  return {
    id: subject.id,
    name: subject.name,
    description,
    icon: subject.icon,
    color: subject.color,
    order: units.length > 0 ? (subject.order || 1) : 10,
    unitCount,
    lectureCount,
  }
})
