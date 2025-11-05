export interface MonthlyBreakdown {
  month: string;
  year: number;
  businessDays: number;
  monthlyGoal: number;
  dailyGoal: number;
  salesPerDay: number;
  timePerDay: string;
}

export interface CalculationResult {
  totalGoal: number;
  monthlyGoal: number;
  startDate: string;
  endDate: string;
  totalBusinessDays: number;
  averageDailyGoal: number;
  breakdown: MonthlyBreakdown[];
}