import React, { useState, useCallback, useEffect } from 'react';
import { CalculationResult, MonthlyBreakdown } from './types';

// --- HELPER FUNCTIONS & CONSTANTS ---

const MONTH_NAMES_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const getBusinessDaysInMonth = (year: number, month: number): number => {
  const date = new Date(Date.UTC(year, month, 1));
  let businessDays = 0;
  while (date.getUTCMonth() === month) {
    const day = date.getUTCDay();
    if (day > 0 && day < 6) { // Monday to Friday
      businessDays++;
    }
    date.setUTCDate(date.getUTCDate() + 1);
  }
  return businessDays;
};

const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const formatTime = (totalMinutes: number): string => {
    if (totalMinutes <= 0) return '0min';
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    let result = '';
    if (hours > 0) {
        result += `${hours}h`;
    }
    if (minutes > 0) {
        if (hours > 0) result += ' ';
        result += `${minutes}min`;
    }
    return result;
};


// --- SVG ICONS ---

const TargetIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 10c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
    </svg>
);

const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const CashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);


// --- UI COMPONENTS ---

interface CalculatorFormProps {
    goal: string;
    setGoal: (value: string) => void;
    startDate: string;
    setStartDate: (value: string) => void;
    endDate: string;
    setEndDate: (value: string) => void;
    adjustment: string;
    setAdjustment: (value: string) => void;
    saleValue: string;
    setSaleValue: (value: string) => void;
    timePerSale: string;
    setTimePerSale: (value: string) => void;
    onCalculate: () => void;
}

const CalculatorForm: React.FC<CalculatorFormProps> = ({ goal, setGoal, startDate, setStartDate, endDate, setEndDate, adjustment, setAdjustment, saleValue, setSaleValue, timePerSale, setTimePerSale, onCalculate }) => (
    <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 shadow-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
                <label htmlFor="goal" className="block text-sm font-medium text-slate-400 mb-2">Meta de Faturamento Mensal (R$)</label>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">R$</span>
                    <input
                        type="number"
                        id="goal"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                        placeholder="70000"
                    />
                </div>
            </div>
            <div>
                 <label htmlFor="saleValue" className="block text-sm font-medium text-slate-400 mb-2">Valor por Venda (R$)</label>
                 <div className="relative">
                     <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">R$</span>
                     <input
                         type="number"
                         id="saleValue"
                         value={saleValue}
                         onChange={(e) => setSaleValue(e.target.value)}
                         className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                         placeholder="250"
                     />
                 </div>
            </div>
            <div>
                <label htmlFor="timePerSale" className="block text-sm font-medium text-slate-400 mb-2">Tempo por Venda (min)</label>
                <div className="relative">
                    <input
                        type="number"
                        id="timePerSale"
                        value={timePerSale}
                        onChange={(e) => setTimePerSale(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                        placeholder="20"
                    />
                     <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500">min</span>
                </div>
            </div>
            <div>
                 <label htmlFor="adjustment" className="block text-sm font-medium text-slate-400 mb-2">Ajuste Diário (%)</label>
                 <div className="relative">
                     <input
                         type="number"
                         id="adjustment"
                         value={adjustment}
                         onChange={(e) => setAdjustment(e.target.value)}
                         className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                         placeholder="0"
                     />
                     <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500">%</span>
                 </div>
            </div>
            <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-slate-400 mb-2">Data de Início</label>
                <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                />
            </div>
            <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-slate-400 mb-2">Data de Fim</label>
                <input
                    type="date"
                    id="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                />
            </div>
        </div>
        <div className="mt-6 text-center">
            <button
                onClick={onCalculate}
                className="bg-emerald-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/50 transition-all duration-300 shadow-lg shadow-emerald-600/20"
            >
                Calcular Meta
            </button>
        </div>
    </div>
);

interface SummaryCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon }) => (
    <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl border border-slate-700 flex items-center space-x-4">
        <div className="p-3 bg-emerald-900/50 text-emerald-400 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-400">{title}</p>
            <p className="text-xl font-bold text-white">{value}</p>
        </div>
    </div>
);

interface ResultsDisplayProps {
    results: CalculationResult;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => (
    <div className="mt-8 space-y-8">
        <div>
            <h2 className="text-2xl font-bold text-center mb-6 text-emerald-400">Resumo da Meta</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <SummaryCard title="Meta Total (Ajustada)" value={formatCurrency(results.totalGoal)} icon={<TargetIcon />} />
                <SummaryCard title="Meta Mensal (Base)" value={formatCurrency(results.monthlyGoal)} icon={<CashIcon />} />
                <SummaryCard title="Período" value={`${results.breakdown.length} meses`} icon={<CalendarIcon />} />
                <SummaryCard title="Total de Dias Úteis" value={results.totalBusinessDays} icon={<CalendarIcon />} />
                <SummaryCard title="Meta Diária Média (Ajustada)" value={formatCurrency(results.averageDailyGoal)} icon={<TargetIcon />} />
            </div>
        </div>
        <div>
            <h2 className="text-2xl font-bold text-center mb-6 text-emerald-400">Detalhamento Mensal</h2>
            <div className="overflow-x-auto bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 shadow-lg">
                <table className="min-w-full text-sm text-left">
                    <thead className="bg-slate-900/70">
                        <tr>
                            <th scope="col" className="px-6 py-3 font-medium tracking-wider">Mês/Ano</th>
                            <th scope="col" className="px-6 py-3 font-medium tracking-wider">Dias Úteis</th>
                            <th scope="col" className="px-6 py-3 font-medium tracking-wider">Meta Mensal (Ajustada)</th>
                            <th scope="col" className="px-6 py-3 font-medium tracking-wider">Meta Diária (Ajustada)</th>
                            <th scope="col" className="px-6 py-3 font-medium tracking-wider">Vendas / Dia (mín.)</th>
                            <th scope="col" className="px-6 py-3 font-medium tracking-wider">Tempo / Dia</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {results.breakdown.map((item, index) => (
                            <tr key={index} className="hover:bg-slate-800 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap font-semibold">{`${item.month} ${item.year}`}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{item.businessDays}</td>
                                <td className="px-6 py-4 whitespace-nowrap font-semibold text-emerald-400">{formatCurrency(item.monthlyGoal)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(item.dailyGoal)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{item.salesPerDay}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{item.timePerDay}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);


// --- MAIN APP COMPONENT ---

function App() {
    const [goal, setGoal] = useState('70000');
    const [startDate, setStartDate] = useState('2025-11-01');
    const [endDate, setEndDate] = useState('2026-07-01');
    const [adjustment, setAdjustment] = useState('0');
    const [saleValue, setSaleValue] = useState('250');
    const [timePerSale, setTimePerSale] = useState('20');
    const [results, setResults] = useState<CalculationResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleCalculate = useCallback(() => {
        setError(null);
        setResults(null);

        const monthlyGoalValue = parseFloat(goal);
        const adjustmentValue = parseFloat(adjustment) || 0;
        const saleAmount = parseFloat(saleValue);
        const timePerSaleValue = parseFloat(timePerSale);

        if (isNaN(monthlyGoalValue) || monthlyGoalValue <= 0) {
            setError("Por favor, insira um valor de meta mensal válido e positivo.");
            return;
        }

        if (isNaN(saleAmount) || saleAmount <= 0) {
            setError("Por favor, insira um valor por venda válido e positivo.");
            return;
        }

        if (isNaN(timePerSaleValue) || timePerSaleValue <= 0) {
            setError("Por favor, insira um tempo por venda válido e positivo.");
            return;
        }

        const startParts = startDate.split('-').map(Number);
        const endParts = endDate.split('-').map(Number);
    
        if (startParts.length !== 3 || endParts.length !== 3 || startParts.some(isNaN) || endParts.some(isNaN)) {
            setError("Datas inválidas. Por favor, verifique as datas inseridas.");
            return;
        }

        const start = new Date(Date.UTC(startParts[0], startParts[1] - 1, startParts[2]));
        const end = new Date(Date.UTC(endParts[0], endParts[1] - 1, endParts[2]));
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            setError("Datas inválidas. Por favor, verifique as datas inseridas.");
            return;
        }

        if (start > end) {
            setError("A data de início não pode ser posterior à data de fim.");
            return;
        }

        let totalBusinessDays = 0;
        const monthlyData: { year: number; month: number; businessDays: number }[] = [];
        const current = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
        const finalMonth = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1));


        while (current <= finalMonth) {
            const year = current.getUTCFullYear();
            const month = current.getUTCMonth();
            const businessDays = getBusinessDaysInMonth(year, month);
            totalBusinessDays += businessDays;
            monthlyData.push({ year, month, businessDays });
            current.setUTCMonth(current.getUTCMonth() + 1);
        }

        if (monthlyData.length === 0) {
            setError("O período selecionado não resultou em meses para cálculo.");
            return;
        }

        if (totalBusinessDays === 0) {
            setError("O período selecionado não possui dias úteis para cálculo.");
            return;
        }

        const breakdown: MonthlyBreakdown[] = monthlyData.map(data => {
            const baseDailyGoal = data.businessDays > 0 ? monthlyGoalValue / data.businessDays : 0;
            const adjustedDailyGoal = baseDailyGoal * (1 + adjustmentValue / 100);
            const adjustedMonthlyGoal = adjustedDailyGoal * data.businessDays;
            const salesPerDay = adjustedDailyGoal > 0 ? Math.ceil(adjustedDailyGoal / saleAmount) : 0;
            const totalMinutesPerDay = salesPerDay * timePerSaleValue;
            
            return {
                month: MONTH_NAMES_PT[data.month],
                year: data.year,
                businessDays: data.businessDays,
                monthlyGoal: adjustedMonthlyGoal,
                dailyGoal: adjustedDailyGoal,
                salesPerDay,
                timePerDay: formatTime(totalMinutesPerDay),
            };
        });

        const totalGoal = breakdown.reduce((sum, item) => sum + item.monthlyGoal, 0);
        const averageDailyGoal = totalBusinessDays > 0 ? totalGoal / totalBusinessDays : 0;

        setResults({
            totalGoal: totalGoal,
            monthlyGoal: monthlyGoalValue,
            startDate,
            endDate,
            totalBusinessDays,
            averageDailyGoal,
            breakdown,
        });

    }, [goal, startDate, endDate, adjustment, saleValue, timePerSale]);
    
    useEffect(() => {
        handleCalculate();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="min-h-screen bg-slate-900 bg-grid-slate-700/[0.2] relative">
            <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-slate-900 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
            <main className="container mx-auto px-4 py-8 md:py-12 relative z-10">
                <header className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                        Calculadora de Metas
                    </h1>
                    <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
                        Planeje seu sucesso. Insira sua meta mensal, o período, e veja o faturamento necessário por mês com base nos dias úteis.
                    </p>
                </header>

                <CalculatorForm
                    goal={goal}
                    setGoal={setGoal}
                    startDate={startDate}
                    setStartDate={setStartDate}
                    endDate={endDate}
                    setEndDate={setEndDate}
                    adjustment={adjustment}
                    setAdjustment={setAdjustment}
                    saleValue={saleValue}
                    setSaleValue={setSaleValue}
                    timePerSale={timePerSale}
                    setTimePerSale={setTimePerSale}
                    onCalculate={handleCalculate}
                />

                {error && (
                    <div className="mt-6 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center">
                        {error}
                    </div>
                )}

                {results ? (
                    <ResultsDisplay results={results} />
                ) : (
                    !error && (
                        <div className="mt-8 text-center text-slate-500">
                            <p>Preencha os campos e clique em "Calcular Meta" para ver os resultados.</p>
                        </div>
                    )
                )}
            </main>
        </div>
    );
}

export default App;