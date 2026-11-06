import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {createExpense, getCurrentUser, getMyExpenses, getMyFestivals, type CurrentUser, type ExpenseResponse, type FestivalResponse, } from "../services/api";
import NewFestivalModal from "../components/NewFestivalModal";
import "./ExpensesPage.css";

function ExpensesPage() {
    const navigate = useNavigate();
    const [festivals, setFestivals] = useState<FestivalResponse[]>([]);
    const [selectedFestivalId, setSelectedFestivalId] = useState<number | null>(null);
    const [showNewFestivalModal, setShowNewFestivalModal] = useState(false);
    const [expenses, setExpenses] = useState<ExpenseResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [expensesLoading, setExpensesLoading] = useState(false);
    const [error, setError] = useState("");
    const [showAddForm, setShowAddForm] = useState(false);
    const [category, setCategory] = useState("");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split("T")[0]);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<CurrentUser | null>(null);

    useEffect(() => {loadCurrentUser(); loadFestivals();}, []);
    useEffect(() => {
        if (selectedFestivalId !== null) {
            loadExpenses(selectedFestivalId);
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

    const loadFestivals = async () => {
        try {
            setLoading(true);
            setError("");
            const data = await getMyFestivals();
            setFestivals(data);
            if (data.length > 0) {
                setSelectedFestivalId(data[0].id);
            }
        } catch (err) {
            console.error(err);
            setError("Unable to load festivals.");
        } finally {
            setLoading(false);
        }
    };

    const loadExpenses = async (festivalId: number) => {
        try {
            setExpensesLoading(true);
            setError("");
            const data = await getMyExpenses(festivalId);
            setExpenses(data);
        } catch (err) {
            console.error(err);
            setError("Unable to load expenses.");
        } finally {
            setExpensesLoading(false);
        }
    };

    const handleFestivalCreated = (festival: FestivalResponse) => {
        setFestivals((current) => [festival, ...current, ]);
        setSelectedFestivalId(festival.id);
        setShowNewFestivalModal(false);
    };

    const handleFestivalChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const festivalId = Number(event.target.value);
        setSelectedFestivalId(festivalId);
        setShowAddForm(false);
    };

    const openAddExpenseModal = () => {
        setError("");
        resetForm();
        setShowAddForm(true);
    };

    const closeAddExpenseModal = () => {
        if (saving) {
            return;
        }
        setShowAddForm(false);
        resetForm();
        setError("");
    };

    const handleModalBackgroundClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget && !saving) {
            closeAddExpenseModal();
        }
    };

    const resetForm = () => {
        setCategory("");
        setAmount("");
        setDescription("");
        setExpenseDate(new Date().toISOString().split("T")[0]);
    };

    const handleCreateExpense = async (event: React.FormEvent) => {
        event.preventDefault();
        if (selectedFestivalId === null) {
            setError("Please select a festival.");
            return;
        }

        if (!category.trim()) {
            setError("Expense category is required.");
            return;
        }

        if (!amount || Number(amount) <= 0) {
            setError("Amount must be greater than zero.");
            return;
        }

        if (!expenseDate) {
            setError("Expense date is required.");
            return;
        }

        try {
            setSaving(true);
            setError("");
            const expense = await createExpense(selectedFestivalId,
                {
                    category: category.trim(),
                    amount: Number(amount),
                    description: description.trim(),
                    expenseDate: expenseDate,
                });
            setExpenses((current) => [ expense, ...current,]);
            resetForm();
            setShowAddForm(false);
        } catch (err) {
            console.error(err);
            setError( err instanceof Error ? err.message : "Unable to create expense.");
        } finally {
            setSaving(false);
        }
    };

    const handleSignOut = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const totalExpense = expenses.reduce(
        (total, expense) => total + Number(expense.amount), 0
    );

    if (loading) {
        return (<div className="expenses-loading">Loading expenses...</div>);
    }

    return (
        <div className="expenses-page">

            {/* SIDEBAR */}
            <aside className="dashboard-sidebar">
                <div className="sidebar-brand">
                    <div className="brand-icon">♨</div>
                    <span>Kothareddypalem</span>
                </div>
                <nav className="sidebar-navigation">
                    <button
                        className="sidebar-link"
                        onClick={() => navigate("/dashboard")}>
                        <span className="sidebar-icon">▣</span>Dashboard
                    </button>
                    <button
                        className="sidebar-link"
                        onClick={() => navigate("/donors")}>
                        <span className="sidebar-icon">♙</span>Donors
                    </button>
                    <button
                        className="sidebar-link active"
                        onClick={() => navigate("/expenses")}>
                        <span className="sidebar-icon">▤</span>Expenses
                    </button>
                    <button
                        className="sidebar-link"
                        onClick={() => navigate("/reports")}>
                        <span className="sidebar-icon">▥</span>Reports
                    </button>
                </nav>
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

            <main className="expenses-main">
                <header className="expenses-header">
                    <div className="festival-selector-wrapper">
                        <label>FESTIVAL</label>
                        <select
                            value={selectedFestivalId ?? ""}
                            onChange={ handleFestivalChange
                            }>

                            {festivals.map(
                                (festival) => (
                                    <option key={festival.id} value={festival.id}>
                                        {festival.name}
                                        {" — "}
                                        {festival.year}
                                    </option>
                                )
                            )}
                        </select>
                    </div>
                    <button
                        className="new-festival-button"
                        onClick={() => setShowNewFestivalModal(true)}>+ New Festival
                    </button>
                </header>
                <section className="expenses-content">
                    <div className="expenses-top">
                        <div>
                            <div className="dashboard-label">EXPENSES</div>
                            <h1>Expenses</h1>
                            {selectedFestivalId && (
                                <p>{festivals.find((festival) => festival.id === selectedFestivalId)?.name}</p>
                            )}
                        </div>
                        <button
                            className="add-expense-button"
                            onClick={openAddExpenseModal}>+ Add Expense
                        </button>
                    </div>
                    {error && !showAddForm && (<div className="expense-error">{error}</div>)}

                    <div className="expense-summary">
                        <div className="summary-card">
                            <span>EXPENSE ENTRIES</span>
                            <strong>{expenses.length}</strong>
                        </div>
                        <div className="summary-card">
                            <span>TOTAL EXPENSE</span>
                            <strong>
                                ₹{totalExpense.toLocaleString("en-IN")}
                            </strong>
                        </div>
                    </div>
                    <div className="expense-list-panel">
                        <div className="panel-title">EXPENSE LIST</div>
                        {expensesLoading ? (
                            <div className="empty-state">Loading expenses...</div>
                        ) : expenses.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">▤</div>
                                <div>No expenses added yet.</div>
                            </div>
                        ) : (
                            <div className="expense-table-wrapper">
                                <table className="expense-table">
                                    <thead>
                                        <tr>
                                            <th>CATEGORY</th>
                                            <th>AMOUNT</th>
                                            <th>DESCRIPTION</th>
                                            <th>EXPENSE DATE</th>
                                            <th>ADDED</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {expenses.map(
                                            (expense) => (
                                                <tr key={expense.id}>
                                                    <td>
                                                        {expense.category}
                                                    </td>
                                                    <td className="expense-amount">
                                                        ₹{Number(expense.amount).toLocaleString("en-IN")}
                                                    </td>
                                                    <td>
                                                        {expense.description || "—"}
                                                    </td>
                                                    <td>
                                                        {expense.expenseDate
                                                            ? new Date(expense.expenseDate).toLocaleDateString("en-IN") : "—"}
                                                    </td>
                                                    <td>
                                                        {expense.createdAt
                                                            ? new Date(expense.createdAt).toLocaleDateString("en-IN") : "—"}
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            {/* ADD EXPENSE MODAL */}
            {showAddForm && (
                <div
                    className="expense-modal-overlay"
                    onMouseDown={handleModalBackgroundClick}>
                    <div className="expense-modal">
                        <div className="expense-modal-header">
                            <div>
                                <span className="expense-modal-eyebrow">NEW EXPENSE</span>
                                <h2>Add Expense</h2>
                            </div>
                            <button
                                type="button"
                                className="expense-modal-close"
                                onClick={closeAddExpenseModal}
                                disabled={saving}>×
                            </button>
                        </div>
                        <form
                            className="expense-form"
                            onSubmit={handleCreateExpense}>
                            <div className="expense-form-group">
                                <label>CATEGORY</label>
                                <input
                                    type="text"
                                    value={category}
                                    onChange={(event) =>setCategory(event.target.value)}
                                    placeholder="Enter expense category"
                                    autoFocus
                                    required
                                />
                            </div>
                            <div className="expense-form-row">
                                <div className="expense-form-group">
                                    <label>AMOUNT</label>
                                    <input
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={amount}
                                        onChange={(event) => setAmount(event.target.value)}
                                        placeholder="₹0.00"
                                        required
                                    />
                                </div>
                                <div className="expense-form-group">
                                    <label>EXPENSE DATE</label>
                                    <input
                                        type="date"
                                        value={expenseDate}
                                        onChange={(event) => setExpenseDate(event.target.value)}
                                        required/>
                                </div>
                            </div>
                            <div className="expense-form-group">
                                <label>DESCRIPTION</label>
                                <textarea
                                    value={description}
                                    onChange={(event) => setDescription(event.target.value)}
                                    placeholder="Enter expense description"/>
                            </div>
                            {error && (<div className="expense-error">{error}</div>)}
                            <div className="expense-modal-footer">
                                <button
                                    type="button"
                                    className="expense-cancel-button"
                                    onClick={closeAddExpenseModal}
                                    disabled={saving}>Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="expense-submit-button"
                                    disabled={saving}>{saving ? "Saving..." : "Add Expense"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* NEW FESTIVAL MODAL */}
            {showNewFestivalModal && (
                <NewFestivalModal
                    onClose={() =>setShowNewFestivalModal(false)}
                    onCreated={handleFestivalCreated}/>
                )}
        </div>
    );
}
export default ExpensesPage;