import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {getMyFestivals, getFestivalReport, type FestivalResponse, type ReportResponse,} from "../services/api";
import NewFestivalModal from "../components/NewFestivalModal";
import "./ReportsPage.css";

function ReportsPage() {
    const navigate = useNavigate();
    const [festivals, setFestivals] = useState<FestivalResponse[]>([]);
    const [selectedFestivalId, setSelectedFestivalId] = useState<number | null>(null);
    const [showNewFestivalModal, setShowNewFestivalModal] = useState(false);
    const [report, setReport] = useState<ReportResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [reportLoading, setReportLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        loadFestivals();
    }, []);

    useEffect(() => {
        if (selectedFestivalId !== null) {
            loadReport(selectedFestivalId);
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
            setError("Unable to load festivals.");
        } finally {
            setLoading(false);
        }
    };

    const loadReport = async (festivalId: number) => {
        try {
            setReportLoading(true);
            setError("");
            const data = await getFestivalReport(festivalId);
            setReport(data);
        } catch (err) {
            console.error(err);
            setReport(null);
            setError(err instanceof Error ? err.message : "Unable to load report.");
        } finally {
            setReportLoading(false);
        }
    };

    const handleFestivalCreated = (festival: FestivalResponse) => {
        setFestivals((current) => [festival, ...current,]);
        setSelectedFestivalId(festival.id);
        setReport(null);
        setShowNewFestivalModal(false);
    };

    const handleFestivalChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const festivalId = Number(event.target.value);
        setSelectedFestivalId(festivalId);
        setReport(null);
    };

    const handleSignOut = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };
    const handleExportPdf = () => {
        if (!report) {
            return;
        }
        const doc = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a4",
        });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 12;
        const contentWidth = pageWidth - margin * 2;
        const COLORS = {
            background: [247, 245, 241] as [ number, number, number],
            white: [255, 255, 255] as [ number, number, number],
            coral: [244, 81, 61] as [number, number, number],
            coralDark: [229, 72, 53] as [number, number, number],
            text: [32, 33, 36] as [number, number, number],
            muted: [142, 138, 134] as [number, number, number],
            lightMuted: [153, 153, 153] as [number, number, number],
            header: [250, 249, 247] as [number, number, number],
            border: [226, 222, 217] as [number, number, number],
            innerBorder: [235, 231, 227] as [number, number, number],
            green: [92, 174, 120] as [number, number, number],
            redText: [244, 81, 61] as [ number, number, number],
            grayText: [85, 85, 85] as [number, number, number],
        };
        doc.setFillColor(...COLORS.background);
        doc.rect(0, 0, pageWidth, pageHeight, "F");
        doc.setFillColor(...COLORS.white);
        doc.roundedRect( margin, 10, contentWidth, pageHeight - 20, 2, 2, "F");
        doc.setFont( "helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(...COLORS.text);
        doc.text("Utsav Ledger - Festival Report", margin + 6, 20);
        doc.setFont( "helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(...COLORS.grayText);
        doc.text(`Festival: ${report.festivalName}`, margin + 6, 29);
        doc.text(`Year: ${report.festivalYear}`, margin + 6, 35);
        doc.text(`Location: ${report.festivalLocation || "—"}`, margin + 6, 41);
        autoTable(doc, {
            startY: 48,
            margin: {
                left: margin + 6,
                right: margin + 6,
            },
            tableWidth: contentWidth - 12,
            theme: "grid",
            styles: {
                font: "helvetica",
                fontSize: 8,
                cellPadding: 3.5,
                overflow: "linebreak",
                valign: "middle",
                textColor: COLORS.text,
                lineColor: COLORS.border,
                lineWidth: 0.25,
            },

            headStyles: {
                fillColor: COLORS.header,
                textColor: COLORS.muted,
                fontStyle: "bold",
                fontSize: 7.5,
                lineColor: COLORS.border,
                lineWidth: 0.25,
            },

            bodyStyles: {
                fillColor: COLORS.white,
                textColor: COLORS.text,
            },

            columnStyles: {
                0: {cellWidth: 51,},
                1: {cellWidth: 51,},
                2: {cellWidth: 51,},
                3: {cellWidth: 51,},
                4: {cellWidth: 51,},
            },
            head: [[
                "TOTAL DONORS",
                "TOTAL INCOME",
                "TOTAL EXPENSES",
                "TOTAL EXPENSE AMOUNT",
                "BALANCE",
            ]],

            body: [[
                String(report.totalDonors),
                `Rs. ${Number(report.totalIncome).toLocaleString("en-IN")}`,
                String(report.totalExpenses),
                `Rs. ${Number(report.totalExpenseAmount).toLocaleString("en-IN")}`,
                `Rs. ${Number(report.balance).toLocaleString("en-IN")}`,
            ]],

            didParseCell: (data) => {
                if (
                    data.section === "body" &&
                    data.column.index === 3
                ) {
                    data.cell.styles.textColor =
                        COLORS.redText;
                }
            },
        });
        let currentY =
            (doc as any)
                .lastAutoTable
                .finalY + 10;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...COLORS.text);
        doc.text("FESTIVAL DETAILS", margin + 6, currentY);
        currentY += 4;
        autoTable(doc, {
            startY: currentY,
            margin: {
                left: margin + 6,
                right: margin + 6,
            },
            tableWidth: contentWidth - 12,
            theme: "grid",
            styles: {
                font: "helvetica",
                fontSize: 8,
                cellPadding: 3.5,
                overflow: "linebreak",
                valign: "middle",
                textColor: COLORS.text,
                lineColor: COLORS.border,
                lineWidth: 0.25,
            },

            headStyles: {
                fillColor: COLORS.header,
                textColor: COLORS.muted,
                fontStyle: "bold",
                fontSize: 7.5,
                lineColor: COLORS.border,
                lineWidth: 0.25,
            },

            bodyStyles: {
                fillColor: COLORS.white,
                textColor: COLORS.text,
            },
            columnStyles: {
                0: {cellWidth: 89,},
                1: {cellWidth: 89,},
                2: {cellWidth: 89,},
            },
            head: [[
                "FESTIVAL",
                "YEAR",
                "LOCATION",
            ]],

            body: [[
                report.festivalName,
                String(report.festivalYear),
                report.festivalLocation || "—",
            ]],
        });

        currentY =
            (doc as any)
                .lastAutoTable
                .finalY + 10;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...COLORS.text);
        doc.text("DONOR SUMMARY", margin + 6, currentY);
        currentY += 4;
        const donorRows =
            report.donors.map(
                (donor) => [
                    donor.name || "—",
                    `Rs. ${Number(donor.amount).toLocaleString("en-IN")}`,
                    donor.paymentMode || "—",
                    donor.donationDate ? new Date(donor.donationDate).toLocaleDateString("en-IN") : "—",
                ]
            );
        autoTable(doc, {
            startY: currentY,
            margin: {
                left: margin + 6,
                right: margin + 6,
            },
            tableWidth: contentWidth - 12,
            theme: "grid",
            styles: {
                font: "helvetica",
                fontSize: 8,
                cellPadding: 3.5,
                overflow: "linebreak",
                valign: "middle",
                textColor: COLORS.grayText,
                lineColor: COLORS.border,
                lineWidth: 0.25,
            },

            headStyles: {
                fillColor: COLORS.header,
                textColor: COLORS.muted,
                fontStyle: "bold",
                fontSize: 7,
                lineColor: COLORS.border,
                lineWidth: 0.25,
            },

            bodyStyles: {
                fillColor: COLORS.white,
                textColor: COLORS.grayText,
            },

            columnStyles: {
                0: {cellWidth: 82,},
                1: {cellWidth: 55, halign: "right",},
                2: {cellWidth: 65,},
                3: {cellWidth: 65,},
            },
            head: [[
                "NAME",
                "AMOUNT",
                "PAYMENT MODE",
                "DONATION DATE",
            ]],

            body: donorRows.length > 0 ? donorRows : [["No donors added yet.", "", "", "",],],
            didParseCell: (data) => {
                if (
                    data.section === "body" &&
                    donorRows.length === 0
                ) {
                    data.cell.colSpan = 4;
                    data.cell.styles.halign = "center";
                }

                if (
                    data.section === "body" &&
                    data.column.index === 1
                ) {

                    data.cell.styles.textColor = COLORS.text;
                    data.cell.styles.fontStyle = "bold";
                }
            },
        });

        currentY =
            (doc as any)
                .lastAutoTable
                .finalY + 10;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...COLORS.text);
        doc.text("EXPENSE SUMMARY", margin + 6, currentY);
        currentY += 4;
        const expenseRows =
            report.expenses.map(
                (expense) => [
                    expense.category || "—",
                    `Rs. ${Number(expense.amount).toLocaleString("en-IN")}`,
                    expense.description || "—",
                    expense.expenseDate
                        ? new Date(expense.expenseDate).toLocaleDateString("en-IN") : "—",
                ]
            );

        autoTable(doc, {
            startY: currentY,
            margin: {left: margin + 6, right: margin + 6,},
            tableWidth: contentWidth - 12,
            theme: "grid",
            styles: {
                font: "helvetica",
                fontSize: 8,
                cellPadding: 3.5,
                overflow: "linebreak",
                valign: "middle",
                textColor: COLORS.grayText,
                lineColor: COLORS.border,
                lineWidth: 0.25,
            },
            headStyles: {
                fillColor: COLORS.header,
                textColor: COLORS.muted,
                fontStyle: "bold",
                fontSize: 7,
                lineColor: COLORS.border,
                lineWidth: 0.25,
            },
            bodyStyles: {
                fillColor: COLORS.white,
                textColor: COLORS.grayText,
            },
            columnStyles: {
                0: {cellWidth: 52,},
                1: {cellWidth: 48, halign: "right",},
                2: {cellWidth: 105,},
                3: {cellWidth: 56,},
            },
            head: [[
                "CATEGORY",
                "AMOUNT",
                "DESCRIPTION",
                "EXPENSE DATE",
            ]],

            body: expenseRows.length > 0 ? expenseRows : [["No expenses added yet.", "", "", "",],],
            didParseCell: (data) => {
                if (data.section === "body" && expenseRows.length === 0) {
                    data.cell.colSpan = 4;
                    data.cell.styles.halign = "center";
                }
                if (data.section === "body" && data.column.index === 1) {
                    data.cell.styles.textColor = COLORS.redText;
                    data.cell.styles.fontStyle = "bold";
                }
            },
        });

        const totalPages = doc.getNumberOfPages();
        for (let page = 1; page <= totalPages; page++) {
            doc.setPage(page);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7);
            doc.setTextColor(...COLORS.lightMuted);
            doc.text(`Kothareddypalem • ${report.festivalName}`, margin + 6, pageHeight - 8);
            doc.text(`Page ${page} of ${totalPages}`, pageWidth - margin - 6, pageHeight - 8, {align: "right",});
        }

        const safeFestivalName =
            report.festivalName
                .replace(/[^a-z0-9]/gi, "_")
                .replace(/_+/g, "_");
        doc.save(
            `${safeFestivalName}_Report.pdf`
        );
    };

    if (loading) {
        return (<div className="reports-loading">Loading reports...</div>);
    }
    return (
        <div className="reports-page">

            {/* SIDEBAR */}
            <aside className="dashboard-sidebar">
                <div className="sidebar-brand">
                    <div className="brand-icon">♨</div>
                    <span>Kothareddypalem</span>
                </div>
                <nav className="sidebar-navigation">
                    <button
                        className="sidebar-link"
                        onClick={() =>navigate("/dashboard")}>
                        <span className="sidebar-icon">▣</span>Dashboard
                    </button>
                    <button
                        className="sidebar-link"
                        onClick={() => navigate("/donors")}>
                        <span className="sidebar-icon">♙</span>Donors
                    </button>
                    <button
                        className="sidebar-link"
                        onClick={() => navigate("/expenses")}>
                        <span className="sidebar-icon">▤</span>Expenses
                    </button>
                    <button
                        className="sidebar-link active"
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
            <main className="reports-main">
                <header className="reports-header">
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
                <section className="reports-content">
                    <div className="reports-top">
                        <div>
                            <div className="dashboard-label">REPORTS</div>
                            <h1>Reports</h1>
                            {report && (<p>{report.festivalName}</p>)}
                        </div>
                        {report && (
                            <button
                                className="reports-export-button"
                                onClick={handleExportPdf}>Export PDF
                            </button>
                        )}
                    </div>
                    {error && (<div className="report-error">{error}</div>)}
                    {festivals.length === 0 &&
                        !error && (
                            <div className="report-empty-state">
                                <div className="empty-icon">▥</div>
                                <div>No festivals available.</div>
                            </div>
                        )}
                    {reportLoading && (<div className="report-empty-state">Loading report...</div>)}
                    {!reportLoading &&
                        report && (
                            <>
                                <div className="report-summary">
                                    <div className="summary-card">
                                        <span>TOTAL DONORS</span>
                                        <strong>{report.totalDonors}</strong>
                                    </div>
                                    <div className="summary-card income-card">
                                        <span>TOTAL INCOME</span>
                                        <strong>
                                            ₹{Number(report.totalIncome).toLocaleString("en-IN")}
                                        </strong>
                                    </div>
                                    <div className="summary-card">
                                        <span>TOTAL EXPENSES</span>
                                        <strong>
                                            {report.totalExpenses}
                                        </strong>
                                    </div>
                                    <div className="summary-card expense-card">
                                        <span>TOTAL EXPENSE AMOUNT</span>
                                        <strong>
                                            ₹{Number(report.totalExpenseAmount).toLocaleString("en-IN")}
                                        </strong>
                                    </div>
                                    <div className="summary-card balance-card">
                                        <span>BALANCE</span>
                                        <strong>
                                            ₹{Number(report.balance).toLocaleString("en-IN")}
                                        </strong>
                                    </div>
                                </div>
                                <div className="report-panel">
                                    <div className="panel-title">FESTIVAL DETAILS</div>
                                    <div className="report-details">
                                        <div>
                                            <span>FESTIVAL</span>
                                            <strong>
                                                {report.festivalName}
                                            </strong>
                                        </div>
                                        <div>
                                            <span>YEAR</span>
                                            <strong>
                                                {report.festivalYear}
                                            </strong>
                                        </div>
                                        <div>
                                            <span>LOCATION</span>
                                            <strong>
                                                {report.festivalLocation || "—"}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                                <div className="report-panel">
                                    <div className="panel-title">DONOR SUMMARY</div>
                                    {report.donors.length === 0 ? (
                                        <div className="report-empty-state">No donors added yet.</div>
                                    ) : (
                                        <div className="report-table-wrapper">
                                            <table className="report-table">
                                                <thead>
                                                    <tr>
                                                        <th>NAME</th>
                                                        <th>AMOUNT</th>
                                                        <th>PAYMENT MODE</th>
                                                        <th>DONATION DATE</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {report.donors.map(
                                                        (donor) => (

                                                            <tr key={donor.id}>
                                                                <td>
                                                                    {donor.name}
                                                                </td>
                                                                <td className="report-amount">
                                                                    ₹{Number(donor.amount).toLocaleString("en-IN")}
                                                                </td>
                                                                <td>
                                                                    {donor.paymentMode}
                                                                </td>
                                                                <td>
                                                                    {donor.donationDate
                                                                        ? new Date(donor.donationDate).toLocaleDateString("en-IN") : "—"}
                                                                </td>
                                                            </tr>
                                                        )
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                                <div className="report-panel">
                                    <div className="panel-title">EXPENSE SUMMARY</div>
                                    {report.expenses.length === 0 ? (
                                        <div className="report-empty-state">No expenses added yet.</div>
                                    ) : (
                                        <div className="report-table-wrapper">
                                            <table className="report-table">
                                                <thead>
                                                    <tr>
                                                        <th>CATEGORY</th>
                                                        <th>AMOUNT</th>
                                                        <th>DESCRIPTION</th>
                                                        <th>EXPENSE DATE</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {report.expenses.map(
                                                        (expense) => (
                                                            <tr key={expense.id}>
                                                                <td>
                                                                    {expense.category}
                                                                </td>
                                                                <td className="report-amount">
                                                                    ₹{Number(expense.amount).toLocaleString("en-IN")}
                                                                </td>
                                                                <td>
                                                                    {expense.description || "—"}
                                                                </td>
                                                                <td>
                                                                    {expense.expenseDate
                                                                    ? new Date(expense.expenseDate).toLocaleDateString("en-IN") : "—"}
                                                                </td>
                                                            </tr>
                                                        )
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
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
export default ReportsPage;