import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DashboardPage.css";
import {getMyFestivals, getCurrentUser, getDashboardStats, getMyDonors, getMyExpenses, type FestivalResponse, type CurrentUser, type DashboardStatsResponse, type DonorResponse, type ExpenseResponse, } from "../services/api";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, } from "recharts";
import NewFestivalModal from "../components/NewFestivalModal";

interface DashboardStats {
    netBalance: number;
    totalIncome: number;
    totalExpense: number;
    donors: number;
    expenseEntries: number;
    fundHealth: number;
}
interface TimelineEntry {
    id: string;
    type: "income" | "expense";
    date: string;
    amount: number;
    label: string;
}
interface TimelineChartData {
    date: string;
    income: number;
    expense: number;
}

interface ExpenseChartData {
    category: string;
    amount: number;
}

const emptyStats: DashboardStats = {
    netBalance: 0,
    totalIncome: 0,
    totalExpense: 0,
    donors: 0,
    expenseEntries: 0,
    fundHealth: 0,
};

function DashboardPage() {
    const navigate = useNavigate();
    const [showNewFestivalModal, setShowNewFestivalModal] = useState(false);
    const [festivals, setFestivals] = useState<FestivalResponse[]>([]);
    const [selectedFestivalId, setSelectedFestivalId] = useState<number | null>(null);
    const [stats, setStats] = useState<DashboardStats>(emptyStats);
    const [recentDonors, setRecentDonors] = useState<DonorResponse[]>([]);  
    const [recentExpenses, setRecentExpenses] = useState<ExpenseResponse[]>([]);
    const [timelineChartData, setTimelineChartData] = useState<TimelineChartData[]>([]);
    const [expenseChartData, setExpenseChartData] = useState<ExpenseChartData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [user, setUser] = useState<CurrentUser | null>(null);

    useEffect(() => {loadCurrentUser(); loadFestivals(); }, []);
    useEffect(() => {
        if (selectedFestivalId !== null) {
            loadDashboardStats(selectedFestivalId);
            loadRecentData(selectedFestivalId);
            loadTimeline(selectedFestivalId);
        } else {
            setRecentDonors([]);
            setRecentExpenses([]);
        }

    }, [selectedFestivalId]);

    const loadCurrentUser = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }
            const currentUser = await getCurrentUser(token);
            setUser(currentUser);
        } catch (error) {
            console.error("Failed to load current user:",error);
            localStorage.removeItem("token");
            navigate("/login");
        }
    };

    const loadFestivals = async (selectFestivalId?: number) => {
        try {
            
            setLoading(true);
            setError("");
            const data = await getMyFestivals();
            setFestivals(data);

            if (data.length === 0) {
                setSelectedFestivalId(null);
                setStats(emptyStats);
                return;
            }
            if (selectFestivalId) {
                const createdFestival = data.find((festival) => festival.id === selectFestivalId);

                if (createdFestival) {
                    setSelectedFestivalId(createdFestival.id);
                    return;
                }
            }

            const currentFestival = data.find((festival) => festival.id === selectedFestivalId);

            if (currentFestival) {
                setSelectedFestivalId(currentFestival.id);
                return;
            }
            setSelectedFestivalId(data[0].id);
        } catch (error) {
            console.error("Failed to load festivals:", error);
            setError("Unable to load festivals.");
        } finally {
            setLoading(false);
        }
    };
    
    const loadDashboardStats = async (festivalId: number) => {
        try {
            const data: DashboardStatsResponse = await getDashboardStats(festivalId);
            setStats({
                netBalance: data.netBalance,
                totalIncome: data.totalIncome,
                totalExpense: data.totalExpense,
                donors: data.donors,
                expenseEntries: data.expenseEntries,
                fundHealth: data.fundHealth,
            });
        } catch (error) {
            console.error("Failed to load dashboard statistics:", error);
        setStats(emptyStats);
    }};
    
    const loadTimeline = async (
    festivalId: number) => {
        try {
            const [donors, expenses] = await Promise.all([
                getMyDonors(festivalId),
                getMyExpenses(festivalId),
            ]);
            
            const timelineMap = new Map<string, TimelineChartData>();
            donors.forEach((donor) => {
                
                const date =donor.donationDate;
                if (!timelineMap.has(date)) {
                    timelineMap.set(
                        date, {
                            date,
                            income: 0,
                            expense: 0,
                        }
                    );
                }
                
                const entry = timelineMap.get(date)!;
                entry.income += Number(donor.amount || 0);
            });
            expenses.forEach((expense) => {
                const date = expense.expenseDate;
                if (!timelineMap.has(date)) {
                    timelineMap.set(
                        date, {
                            date,
                            income: 0,
                            expense: 0,
                        }
                    );
                }
                const entry = timelineMap.get(date)!;
                entry.expense += Number(expense.amount || 0);}
            );
            
            const timelineData = Array.from(timelineMap.values())
            .sort((a, b) => 
                new Date(a.date).getTime() -
                new Date(b.date).getTime()
            );
            
            setTimelineChartData(timelineData);
            
            const expenseMap = new Map<string, number>();
            expenses.forEach((expense) => {const category = expense.category?.trim() || "Other";
                const currentAmount = expenseMap.get(category) || 0;
                
                expenseMap.set(
                    category,
                    currentAmount + Number(expense.amount || 0)
                );
            });
            
            const expenseData = Array.from(expenseMap.entries())
            .map(([category, amount]) => ({
                    category,
                    amount,
                })
            )
            .sort((a, b) => b.amount - a.amount);
            setExpenseChartData(expenseData);
            
            const incomeEntries: TimelineEntry[] =
                donors.map(
                    (donor) => ({
                        id: `income-${donor.id}`,
                        type: "income",
                        date: donor.donationDate,
                        amount: Number(donor.amount),
                        label: donor.name,
                    })
                );
            const expenseEntries: TimelineEntry[] =
                expenses.map(
                    (expense) => ({
                        id: `expense-${expense.id}`,
                        type: "expense",
                        date: expense.expenseDate,
                        amount: Number(expense.amount),
                        label: expense.category,
                    })
                );
                const combinedEntries =
                [
                    ...incomeEntries,
                    ...expenseEntries,
                ].sort((a, b) =>
                    new Date(a.date).getTime() -
                    new Date(b.date).getTime()
                );
            } catch (error) {
                console.error("Failed to load dashboard charts:",error);
                setTimelineChartData([]);
                setExpenseChartData([]);
            }
        };
        const loadRecentData = async (festivalId: number) => {
            try {
                const [donors, expenses] = await Promise.all([
                    getMyDonors(festivalId),
                    getMyExpenses(festivalId),
                ]);
                const sortedDonors = [...donors].sort((a, b) => {
                    const dateA = a.createdAt || a.donationDate || "";
                    const dateB = b.createdAt || b.donationDate || "";
                    
                    return (
                        new Date(dateB).getTime() -
                        new Date(dateA).getTime()
                    );
                })
                .slice(0, 5);
                
                const sortedExpenses = [...expenses].sort((a, b) => {
                    const dateA = a.createdAt || a.expenseDate || "";
                    const dateB = b.createdAt || b.expenseDate || "";

                    return (
                        new Date(dateB).getTime() -
                        new Date(dateA).getTime()
                    );
                })
                .slice(0, 5);
                setRecentDonors(sortedDonors);
                setRecentExpenses(sortedExpenses);
            } catch (error) {
                console.error("Failed to load recent dashboard data:", error);
                setRecentDonors([]);
                setRecentExpenses([]);
            }
        };
        
        const handleFestivalCreated = async (festival: FestivalResponse) => {
            setShowNewFestivalModal(false);
            await loadFestivals(festival.id);
        };
        
        const handleFestivalChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
            const festivalId = Number(event.target.value);
            const festival = festivals.find((item) => item.id === festivalId);
            
            if (festival) {
            setSelectedFestivalId(festival.id);
        }};

        const handleSignOut = () => {
            localStorage.removeItem("token");
            navigate("/login");
        };

        const selectedFestival = festivals.find((festival) => festival.id === selectedFestivalId) || null;
        const formatCurrency = (value: number) => {
            return `₹${value.toLocaleString("en-IN")}`;
        };
        const formatTimelineDate = (date: string) => {
            return new Date(date).toLocaleDateString("en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                }
            );
        };
        if (loading) {
            return (<div className="dashboard-loading">Loading dashboard...</div>);
        }
        if (error) {
            return (<div className="dashboard-loading">{error}</div>);
        }
        
        return (
        <div className="dashboard-page">

            {/*SIDEBAR */}
            <aside className="dashboard-sidebar">

                {/* BRAND */}
                <div className="sidebar-brand">
                    <div className="brand-icon">♨</div>
                    <span>Kothareddypalem</span>
                </div>

                {/* NAVIGATION */}
                <nav className="sidebar-navigation">

                    {/* DASHBOARD */}
                    <button
                        className="sidebar-link active"
                        onClick={() => navigate("/dashboard")}>
                        <span className="sidebar-icon">▣</span>Dashboard
                    </button>

                    {/* DONORS */}
                    <button
                        className="sidebar-link"
                        onClick={() => navigate("/donors")}>
                            <span className="sidebar-icon">♙</span>Donors
                    </button>

                    {/* EXPENSES */}
                    <button
                        className="sidebar-link"
                        onClick={() => navigate("/expenses")}>
                            <span className="sidebar-icon">▤</span>Expenses
                    </button>

                    {/* REPORTS */}
                    <button
                        className="sidebar-link"
                        onClick={() => navigate("/reports")}>
                            <span className="sidebar-icon">▥</span>Reports
                    </button>
                </nav>

                {/* SIDEBAR BOTTOM */}
                <div className="sidebar-bottom">

                    {/* USER */}
                    <div className="user-profile">
                        <div className="user-avatar">
                            {user?.name ?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className="user-details">
                            <div className="user-name">
                                {user?.name || "User"}
                            </div>
                            <div className="user-email">
                                {user?.email || ""}
                            </div>
                        </div>
                    </div>

                    {/* SIGN OUT */}
                    <button
                        className="sign-out-button"
                        onClick={handleSignOut}>
                            <span>↪</span>Sign out
                    </button>
                </div>
            </aside>

            {/* MAIN */}
            <main className="dashboard-main">

                {/* HEADER */}
                <header className="dashboard-header">

                    {/* FESTIVAL SELECTOR */}
                    <div className="festival-selector-wrapper">
                        <label>FESTIVAL</label>
                        <select 
                            value={selectedFestivalId ?? ""}
                            onChange={handleFestivalChange}
                            disabled={festivals.length === 0}>
                                
                                {festivals.length === 0 ? (
                                    <option value="">No festivals </option>) : (
                                        festivals.map((festival) => (
                                            <option key={festival.id} value={festival.id}>
                                                {festival.name}
                                                {" — "}
                                                {festival.year}
                                            </option>
                                        )
                                    ))
                                }
                        </select>
                    </div>
                    {/* NEW FESTIVAL */}
                    <button
                        className="new-festival-button"
                        onClick={() =>setShowNewFestivalModal(true)}>+ New Festival
                    </button>
                </header>
                {/* CONTENT */}
                <section className="dashboard-content">

                    {/* PAGE LABEL */}
                    <div className="dashboard-label">DASHBOARD</div>

                    {/* PAGE TITLE */}
                    <h1 className="dashboard-title">
                        {selectedFestival ? selectedFestival.name : "Dashboard"}
                        {selectedFestival && (
                            <span>
                                {" — "}
                                {selectedFestival.year}
                            </span>
                        )}
                    </h1>

                    {/* PRIMARY STATS*/}
                    <div className="primary-stats">

                        {/* NET BALANCE */}
                        <div className="stat-card">
                            <div className="stat-label">
                                <span className="neutral-dot" />NET BALANCE
                            </div>
                            <div className="stat-value">
                                {formatCurrency(stats.netBalance)}
                            </div>
                        </div>

                        {/* TOTAL INCOME */}
                        <div className="stat-card">
                            <div className="stat-label">
                                <span className="income-dot" />TOTAL INCOME
                            </div>
                            <div className="stat-value income">
                                {formatCurrency(stats.totalIncome)}
                            </div>
                        </div>

                        {/* TOTAL EXPENSE */}
                        <div className="stat-card">
                            <div className="stat-label">
                                <span className="expense-dot" />TOTAL EXPENSE
                            </div>
                            <div className="stat-value expense">
                                {formatCurrency(stats.totalExpense)}
                            </div>
                        </div>
                    </div>

                    {/* SECONDARY STATS */}
                    <div className="secondary-stats">

                        {/* DONORS */}
                        <div className="small-stat-card">
                            <div className="small-stat-label">
                                DONORS
                            </div>
                            <div className="small-stat-value">
                                {stats.donors}
                            </div>
                        </div>

                        {/* EXPENSE ENTRIES */}
                        <div className="small-stat-card">
                            <div className="small-stat-label">
                                EXPENSE ENTRIES
                            </div>
                            <div className="small-stat-value">
                                {stats.expenseEntries}
                            </div>
                        </div>

                        {/* FUND HEALTH */}
                        <div className="fund-health-card">
                            <div className="small-stat-label">
                                FUND HEALTH
                            </div>
                            <div className="fund-health-value">
                                {stats.fundHealth.toFixed(2)}%
                                <span>{" "} funds remaining</span>
                            </div>
                            <div className="fund-health-bar">
                                <div
                                    className="fund-health-progress"
                                    style={{
                                        width: `${Math.min(stats.fundHealth, 100)}%`,
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* CHARTS */}
                    <div className="dashboard-grid">

                        {/* INCOME VS EXPENSE */}
                        <div className="dashboard-panel timeline-panel">
                        <div className="panel-title">INCOME VS EXPENSE — TIMELINE</div>
                        
                        {timelineChartData.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">↗</div>
                                <div>No transactions yet</div>
                            </div>
                        ) : (
                            <div className="dashboard-chart">
                                <ResponsiveContainer
                                    width="100%"
                                    height={300}>
                                    <BarChart
                                        data={timelineChartData}
                                        margin={{
                                        top: 10,
                                        right: 10,
                                        left: 0,
                                        bottom: 10,
                                        }}>
                                        <CartesianGrid strokeDasharray="3 3"/>
                                        <XAxis dataKey="date"/>
                                        <YAxis tickFormatter={
                                            (value) =>`₹${Number(value) / 1000}k`
                                            }
                                        />
                                        <Tooltip formatter={(value, name) => [
                                        `₹${Number(value).toLocaleString("en-IN")}`, name === "income" ? "Income" : "Expense", ]}
                                        />
                                        <Legend />
                        
                                        <Bar
                                            dataKey="income"
                                            name="Income"
                                            fill="#2f5d3d"
                                            radius={[4, 4, 0, 0, ]}
                                        />
                                        <Bar
                                            dataKey="expense"
                                            name="Expense"
                                            fill="#e9573f"
                                            radius={[4, 4, 0, 0, ]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                    
                    {/* EXPENSE BREAKDOWN */}
                    <div className="dashboard-panel">
                        <div className="panel-title">EXPENSE BREAKDOWN</div>
                            <div className="dashboard-panel">
                                <div className="panel-title">EXPENSE BREAKDOWN</div>
                                {expenseChartData.length === 0 ? (
                                    <div className="empty-state">
                                        <div className="empty-icon">◔</div>
                                        <div>No expenses yet</div>
                                    </div>
                                ) : (
                                    <div className="expense-chart-container">
                                    <ResponsiveContainer
                                        width="100%"
                                        height={250}
                                        >
                                        <PieChart>
                                            <Pie 
                                                data={expenseChartData}
                                                dataKey="amount"
                                                nameKey="category"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={65}
                                                outerRadius={95}
                                                paddingAngle={2}>
                                                    {expenseChartData.map((_, index) => (
                                                        <Cell key={`cell-${index}`}
                                                        fill={[
                                                            "#e9573f",
                                                            "#2f5d3d",
                                                            "#d9a441",
                                                            "#64748b",
                                                            "#8b5cf6",
                                                            "#0891b2",
                                                            ][index %6]}/>
                                                        ))
                                                    }
                                            </Pie>
                                            <Tooltip formatter={(value) =>`₹${Number(value).toLocaleString("en-IN")}`}/>
                                        </PieChart>
                                    </ResponsiveContainer>

                                    {/* EXPENSE LEGEND */}
                                    <div className="expense-legend">
                                        {expenseChartData.map((item, index) => (
                                            <div key={item.category} className="expense-legend-item">
                                                <div className="expense-legend-name">
                                                    <span className="expense-legend-dot" style={{
                                                        background:[
                                                        "#e9573f",
                                                        "#2f5d3d",
                                                        "#d9a441",
                                                        "#64748b",
                                                        "#8b5cf6",
                                                        "#0891b2",
                                                        ][index %6],
                                                    }}/>
                                                    {item.category}
                                                </div>
                                                <div className="expense-legend-amount">₹{item.amount.toLocaleString("en-IN")}</div>
                                            </div>
                                        ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/*RECENT DATA */}
                    <div className="dashboard-grid">

                        {/* RECENT DONORS */}
                        <div className="dashboard-panel recent-panel">
                            <div className="panel-title">RECENT DONORS</div>{recentDonors.length === 0 ? 
                            (
                                <div className="empty-state">
                                    <div className="empty-icon">♧</div>
                                    <div>Nothing here yet.</div>
                                </div>

                            ) : (
                                <div className="recent-list">
                                    {recentDonors.map((donor) => (
                                        <div className="recent-item" key={donor.id}>
                                            <div className="recent-item-main">
                                                <div className="recent-item-name">{donor.name}</div>
                                                <div className="recent-item-date">{donor.donationDate}</div>
                                            </div>
                                            <div className="recent-item-amount income">+{formatCurrency(donor.amount)}</div>
                                        </div>))
                                    }
                                </div>
                            )}
                            </div>
                                {/* RECENT EXPENSES */}
                                <div className="dashboard-panel recent-panel">
                                    <div className="panel-title">RECENT EXPENSES</div>
                                    {recentExpenses.length === 0 ? 
                                        (   <div className="empty-state">
                                                <div className="empty-icon">▱</div>
                                                <div>Nothing here yet.</div>
                                            </div>
                                        ) : (
                                            <div className="recent-list">
                                                {recentExpenses.map((expense) => (
                                                    <div className="recent-item" key={expense.id}>
                                                        <div className="recent-item-main">
                                                            <div className="recent-item-name">{expense.category}</div>
                                                            <div className="recent-item-date">{expense.expenseDate}</div>
                                                        </div>
                                                        <div className="recent-item-amount expense">-{formatCurrency(expense.amount)}</div>
                                                    </div>))
                                                }
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                </section>
            </main>

            {/* NEW FESTIVAL MODAL */}
            {showNewFestivalModal && (
                <NewFestivalModal 
                    onClose={() => setShowNewFestivalModal(false)}
                    onCreated={handleFestivalCreated}
                />
            )}
        </div>
    );
}
export default DashboardPage;