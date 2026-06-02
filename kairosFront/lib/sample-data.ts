import { Company, WatchlistCompany, Export, getTimingStage } from './types'

const mockToday = new Date('2026-06-02T12:00:00.000Z')

function deterministicScore(seed: string, max: number, offset = 0) {
  const total = [...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return (total % max) + offset
}

function createCompany(
  id: string,
  name: string,
  state: string,
  city: string,
  industry: string,
  ageInDays: number,
  timingScore: number,
  source: string = 'State Registry'
): Company {
  const registeredDate = new Date(mockToday)
  registeredDate.setDate(registeredDate.getDate() - ageInDays)
  
  const stage = getTimingStage(ageInDays)
  
  let recommendedAction: string
  switch (stage) {
    case 'too-early':
      recommendedAction = 'Monitor for now'
      break
    case 'warming-up':
      recommendedAction = 'Add to watchlist'
      break
    case 'best-window':
      recommendedAction = 'Reach out this week'
      break
    case 'cooling-down':
      recommendedAction = 'Contact soon'
      break
    case 'old-lead':
      recommendedAction = 'Standard outreach'
      break
  }
  
  return {
    id,
    name,
    location: { state, city },
    industry,
    registeredDate,
    ageInDays,
    timingStage: stage,
    timingScore,
    source,
    recommendedAction,
    scoreBreakdown: {
      ageWindow: Math.min(100, Math.max(0, timingScore - 10 + deterministicScore(id, 12))),
      businessFit: deterministicScore(name, 15, 5),
      contactability: deterministicScore(city, 10, 3),
      dataConfidence: deterministicScore(industry, 8, 2),
    },
  }
}

export const sampleCompanies: Company[] = [
  createCompany('1', 'Bright Smile Dental LLC', 'Florida', 'Miami', 'Healthcare - Dental', 27, 87),
  createCompany('2', 'Nova Clean Services LLC', 'Florida', 'Orlando', 'Cleaning Services', 14, 62),
  createCompany('3', 'Peak Fitness Studio LLC', 'Florida', 'Tampa', 'Fitness & Wellness', 35, 78),
  createCompany('4', 'Urban Bloom Marketing LLC', 'California', 'Los Angeles', 'Marketing Agency', 5, 28),
  createCompany('5', 'FreshBite Cafe LLC', 'Texas', 'Austin', 'Food & Beverage', 42, 71),
  createCompany('6', 'ClearPath Accounting LLC', 'New York', 'New York City', 'Accounting Services', 19, 58),
  createCompany('7', 'BloomCare Clinic LLC', 'Florida', 'Jacksonville', 'Healthcare - General', 31, 84),
  createCompany('8', 'TechFlow Solutions Inc', 'California', 'San Francisco', 'Software Development', 8, 45),
  createCompany('9', 'GreenLeaf Landscaping LLC', 'Texas', 'Houston', 'Landscaping', 52, 65),
  createCompany('10', 'Swift Logistics Co', 'Georgia', 'Atlanta', 'Logistics', 3, 22),
  createCompany('11', 'Precision Auto Repair LLC', 'Florida', 'Miami', 'Automotive Services', 28, 82),
  createCompany('12', 'Harmony Yoga Studio', 'California', 'San Diego', 'Fitness & Wellness', 67, 48),
  createCompany('13', 'Blue Ocean Consulting', 'New York', 'New York City', 'Business Consulting', 24, 79),
  createCompany('14', 'Sunrise Bakery LLC', 'Florida', 'Tampa', 'Food & Beverage', 11, 51),
  createCompany('15', 'CloudNine IT Services', 'Texas', 'Dallas', 'IT Services', 95, 35),
]

export const watchlistCompanies: WatchlistCompany[] = [
  {
    ...sampleCompanies[0],
    watchlistStatus: 'ready-to-contact',
    expectedStageChange: 'Cooling Down in 18 days',
    alertEnabled: true,
  },
  {
    ...sampleCompanies[2],
    watchlistStatus: 'waiting',
    expectedStageChange: 'Cooling Down in 10 days',
    alertEnabled: true,
  },
  {
    ...sampleCompanies[6],
    watchlistStatus: 'contacted',
    expectedStageChange: 'Cooling Down in 14 days',
    alertEnabled: false,
    notes: 'Sent intro email on Monday',
  },
  {
    ...sampleCompanies[10],
    watchlistStatus: 'ready-to-contact',
    expectedStageChange: 'Cooling Down in 17 days',
    alertEnabled: true,
  },
  {
    ...sampleCompanies[12],
    watchlistStatus: 'waiting',
    expectedStageChange: 'Cooling Down in 21 days',
    alertEnabled: true,
  },
]

export const sampleExports: Export[] = [
  {
    id: '1',
    date: new Date('2026-05-31T12:00:00.000Z'),
    fileName: 'florida-dental-clinics-may-2024.csv',
    recordCount: 47,
    filters: 'Florida, Healthcare - Dental, Best Window',
  },
  {
    id: '2',
    date: new Date('2026-05-26T12:00:00.000Z'),
    fileName: 'texas-all-industries-apr-2024.csv',
    recordCount: 128,
    filters: 'Texas, All Industries, All Stages',
  },
  {
    id: '3',
    date: new Date('2026-05-19T12:00:00.000Z'),
    fileName: 'california-tech-startups-apr-2024.csv',
    recordCount: 63,
    filters: 'California, Software Development, Warming Up + Best Window',
  },
]

export const dashboardStats = {
  newToday: 23,
  enteringBestWindow: 12,
  savedCompanies: 47,
  avgReadiness: 72,
}

export const industries = [
  'Healthcare - Dental',
  'Healthcare - General',
  'Cleaning Services',
  'Fitness & Wellness',
  'Marketing Agency',
  'Food & Beverage',
  'Accounting Services',
  'Software Development',
  'Landscaping',
  'Logistics',
  'Automotive Services',
  'Business Consulting',
  'IT Services',
  'Real Estate',
  'Legal Services',
]

export const states = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California',
  'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia',
  'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
  'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri',
  'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
  'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
  'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming',
]
