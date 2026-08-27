import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {createDonor, getMyDonors, getMyFestivals, type DonorResponse, type FestivalResponse,} from "../services/api";
import NewFestivalModal from "../components/NewFestivalModal";
import "./DonorsPage.css";

function DonorsPage() {
    const navigate = useNavigate();
    const [festivals, setFestivals] = useState<FestivalResponse[]>([]);
    const [selectedFestivalId, setSelectedFestivalId] = useState<number | null>(null);
    const [showNewFestivalModal, setShowNewFestivalModal] = useState(false);
    const [donors, setDonors] = useState<DonorResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [donorsLoading, setDonorsLoading] = useState(false);
    const [error, setError] = useState("");
    const [showAddForm, setShowAddForm] = useState(false);
    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [paymentMode, setPaymentMode] = useState("Cash");
    const [donationDate, setDonationDate] = useState(new Date().toISOString().split("T")[0]);
    const [notes, setNotes] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {loadFestivals();}, []);

    useEffect(() => {
        if (selectedFestivalId !== null) {
            loadDonors(selectedFestivalId);
        }
    }, [selectedFestivalId]);

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
            setError("Unable to load festivals." );
        } finally {
            setLoading(false);
        }
    };

    const loadDonors = async (festivalId: number) => {
        try {
            setDonorsLoading(true);
            setError("");
            const data = await getMyDonors(festivalId);
            setDonors(data);
        } catch (err) {
            console.error(err);
            setError("Unable to load donors.");
        } finally {
            setDonorsLoading(false);
        }
    };

    const handleFestivalCreated = (festival: FestivalResponse) => {
        setFestivals((current) => [festival, ...current,]);
        setSelectedFestivalId(festival.id);
        setShowNewFestivalModal(false);
    };

    const handleFestivalChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const festivalId = Number(event.target.value);
        setSelectedFestivalId(festivalId);
        setShowAddForm(false);
    };

    const openAddDonorModal = () => {
        setError("");
        resetForm();
        setShowAddForm(true);
    };

    const closeAddDonorModal = () => {
        if (saving) {
            return;
        }

        setShowAddForm(false);
        resetForm();
        setError("");
    };

    const handleModalBackgroundClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (
            event.target === event.currentTarget &&
            !saving
        ) {
            closeAddDonorModal();
        }
    };

    const resetForm = () => {
        setName("");
        setAmount("");
        setPhone("");
        setAddress("");
        setPaymentMode("Cash");
        setDonationDate(new Date().toISOString().split("T")[0]);
        setNotes("");
    };

    const handleCreateDonor = async ( event: React.FormEvent) => { 
        event.preventDefault();

        if (selectedFestivalId === null) {
            setError("Please select a festival.");
            return;
        }
        if (!name.trim()) {
            setError("Donor name is required.");
            return;
        }

        if (!amount || Number(amount) <= 0) {
            setError("Amount must be greater than zero.");
            return;
        }

        if (!paymentMode) {
            setError("Payment mode is required.");
            return;
        }

        if (!donationDate) {
            setError("Donation date is required.");
            return;
        }

        try {
            setSaving(true);
            setError("");

            const donor =await createDonor(selectedFestivalId,{
                name: name.trim(),
                amount: Number(amount),
                phone: phone.trim() || undefined,
                address: address.trim() || undefined,
                paymentMode: paymentMode,
                donationDate: donationDate,
                notes: notes.trim() || undefined,}
            );

            setDonors((current) => [donor, ...current,]);
            resetForm();
            setShowAddForm(false);
        } catch (err) {
            console.error(err);
            setError( err instanceof Error ? err.message : "Unable to create donor.");
        } finally {
            setSaving(false);
        }
    };

    const handleSignOut = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const totalIncome = donors.reduce((total, donor) => total + Number(donor.amount),0);
    if (loading) {
        return (<div className="donors-loading">Loading donors...</div>);
    }

    return (
        <div className="donors-page">

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
                        className="sidebar-link active"
                        onClick={() => navigate("/donors")}>
                        <span className="sidebar-icon">♙</span>Donors
                    </button>
                    <button
                        className="sidebar-link"
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
                    <button
                        className="sign-out-button"
                        onClick={handleSignOut}>
                        <span>↪</span>Sign out
                    </button>
                </div>
            </aside>

            {/* MAIN */}
            <main className="donors-main">
                <header className="donors-header">
                    <div className="festival-selector-wrapper">
                        <label>FESTIVAL</label>
                        <select
                            value={selectedFestivalId ?? ""}
                            onChange={handleFestivalChange}>
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
                        onClick={() =>setShowNewFestivalModal(true)}>+ New Festival
                    </button>
                </header>
                <section className="donors-content">
                    <div className="donors-top">
                        <div>
                            <div className="dashboard-label">DONORS</div>
                            <h1>Donors</h1>
                            {selectedFestivalId && (
                                <p>
                                    {
                                        festivals.find(
                                            (festival) =>
                                                festival.id ===
                                                selectedFestivalId
                                        )?.name
                                    }
                                </p>
                            )}
                        </div>
                        <button
                            className="add-donor-button"
                            onClick={openAddDonorModal}>+ Add Donor
                        </button>
                    </div>
                    {error && !showAddForm && (
                        <div className="donor-error">{error}</div>
                    )}
                    <div className="donor-summary">
                        <div className="summary-card">
                            <span>TOTAL DONORS</span>
                            <strong>{donors.length}</strong>
                        </div>
                        <div className="summary-card">
                            <span>TOTAL INCOME</span>
                            <strong>₹{totalIncome.toLocaleString("en-IN")}</strong>
                        </div>
                    </div>
                    <div className="donor-list-panel">
                        <div className="panel-title">DONOR LIST</div>
                        {donorsLoading ? (
                            <div className="empty-state">Loading donors...</div>

                        ) : donors.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">♙</div>
                                <div>No donors added yet.</div>
                            </div>
                        ) : (
                            <div className="donor-table-wrapper">
                                <table className="donor-table">
                                    <thead>
                                        <tr>
                                            <th>NAME</th>
                                            <th>AMOUNT</th>
                                            <th>PAYMENT</th>
                                            <th>DONATION DATE</th>
                                            <th>PHONE</th>
                                            <th>ADDRESS</th>
                                            <th>ADDED</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {donors.map(
                                            (donor) => (
                                                <tr key={donor.id}>
                                                    <td>{donor.name}</td>
                                                    <td className="donor-amount">
                                                        ₹{Number(donor.amount).toLocaleString("en-IN")}
                                                    </td>
                                                    <td>{donor.paymentMode}</td>
                                                    <td>{donor.donationDate
                                                            ? new Date(donor.donationDate).toLocaleDateString("en-IN"): "—"}
                                                    </td>
                                                    <td>{donor.phone || "—"}</td>
                                                    <td>
                                                        {donor.address || "—"}</td>
                                                    <td>
                                                        {donor.createdAt
                                                                ? new Date(donor.createdAt).toLocaleDateString("en-IN"): "—"}
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

            {/* ADD DONOR MODAL */}
            {showAddForm && (
                <div
                    className="donor-modal-overlay"
                    onMouseDown={handleModalBackgroundClick}>
                    <div className="donor-modal">
                        <div className="donor-modal-header">
                            <div>
                                <span className="donor-modal-eyebrow">NEW CONTRIBUTION</span>
                                <h2>Add Donor</h2>
                            </div>
                            <button
                                type="button"
                                className="donor-modal-close"
                                onClick={closeAddDonorModal}
                                disabled={saving}>×
                            </button>
                        </div>
                        <form
                            className="donor-form"
                            onSubmit={handleCreateDonor}>
                            <div className="donor-form-group">
                                <label>DONOR NAME</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(event) =>setName(event.target.value)}
                                    placeholder="Enter donor name"
                                    autoFocus
                                    required
                                />
                            </div>
                            <div className="donor-form-row">
                                <div className="donor-form-group">
                                    <label>PHONE</label>
                                    <input
                                        type="text"
                                        value={phone}
                                        onChange={(event) =>setPhone(event.target.value)}
                                        placeholder="Phone number"
                                    />
                                </div>
                                <div className="donor-form-group">
                                    <label>AMOUNT</label>
                                    <input
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={amount}
                                        onChange={(event) =>setAmount(event.target.value)}
                                        placeholder="₹0.00"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="donor-form-group">
                                <label>PAYMENT MODE</label>
                                <select
                                    value={paymentMode}
                                    onChange={(event) =>setPaymentMode(event.target.value)}
                                    required>
                                    <option value="Cash">Cash</option>
                                    <option value="UPI">UPI</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="Cheque">Cheque</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="donor-form-group">
                                <label>DONATION DATE</label>
                                <input
                                    type="date"
                                    value={donationDate}
                                    onChange={(event) =>setDonationDate(event.target.value)}
                                    required
                                />
                            </div>
                            <div className="donor-form-group">
                                <label>ADDRESS</label>
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(event) =>setAddress(event.target.value)}
                                    placeholder="Address"
                                />
                            </div>
                            <div className="donor-form-group">
                                <label>NOTES</label>
                                <textarea
                                    value={notes}
                                    onChange={(event) =>setNotes(event.target.value)}
                                    placeholder="Optional notes"
                                />
                            </div>
                            {error && (<div className="donor-error">{error}</div>)}
                            <div className="donor-modal-footer">
                                <button
                                    type="button"
                                    className="donor-cancel-button"
                                    onClick={closeAddDonorModal}
                                    disabled={saving}>Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="donor-submit-button"
                                    disabled={saving}>{saving ? "Saving..." : "Add Donor"}
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
                    onCreated={handleFestivalCreated}
                />
            )}
        </div>
    );
}
export default DonorsPage;