import { useState } from "react";
import {createFestival, type FestivalResponse,} from "../services/api";
import "./NewFestivalModal.css";

interface NewFestivalModalProps {
    onClose: () => void;
    onCreated: (festival: FestivalResponse) => void;
}

function NewFestivalModal({onClose, onCreated,}: NewFestivalModalProps) {
    const [name, setName] = useState("");
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!name.trim()) {
            setError("Festival name is required.");
            return;
        }

        if (!year || Number(year) < 1900) {
            setError("Please enter a valid year.");
            return;
        }
        
        try {
            setSaving(true);
            setError("");

            const festival = await createFestival({
                name: name.trim(),
                year: Number(year),
                location: location.trim() || undefined,
                description:description.trim() || undefined,
            });
            onCreated(festival);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "Unable to create festival.");
        } finally {
            setSaving(false);
        }
    };

    const handleBackgroundClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget && !saving) {
            onClose();
        }
    };

    return (
        <div className="new-festival-modal-overlay" onMouseDown={handleBackgroundClick}>
            
            <div className="new-festival-modal">

                {/* HEADER */}
                <div className="new-festival-modal-header">
                    <div>
                        <span className="new-festival-modal-eyebrow">NEW FESTIVAL</span>
                        <h2>Create Festival</h2>
                    </div>
                    <button
                        type="button"
                        className="new-festival-modal-close"
                        onClick={onClose}
                        disabled={saving}>×
                    </button>
                </div>

                {/* FORM */}
                <form className="new-festival-form" onSubmit={handleSubmit}>

                    {/* NAME */}
                    <div className="new-festival-form-group">
                        <label>FESTIVAL NAME</label>

                        <input
                            type="text"
                            value={name}
                            onChange={(event) =>setName(event.target.value)}
                            placeholder="Enter festival name"
                            autoFocus
                            required
                        />

                    </div>

                    {/* YEAR */}
                    <div className="new-festival-form-group">
                        <label>YEAR</label>

                        <input
                            type="number"
                            min="1900"
                            max="2100"
                            value={year}
                            onChange={(event) =>setYear(event.target.value)}
                            required
                        />
                    </div>

                    {/* LOCATION */}
                    <div className="new-festival-form-group">
                        <label>LOCATION</label>
                        <input
                            type="text"
                            value={location}
                            onChange={(event) =>setLocation(event.target.value)}
                            placeholder="Enter festival location"
                        />
                    </div>

                    {/* DESCRIPTION */}
                    <div className="new-festival-form-group">
                        <label>DESCRIPTION</label>
                        <textarea
                            value={description}
                            onChange={(event) =>setDescription(event.target.value)}
                            placeholder="Enter festival description"
                        />
                    </div>

                    {/* ERROR */}
                    {error && (
                        <div className="new-festival-error">{error}</div>)
                    }

                    {/* FOOTER */}
                    <div className="new-festival-modal-footer">
                        <button
                            type="button"
                            className="new-festival-cancel-button"
                            onClick={onClose}
                            disabled={saving}>Cancel
                        </button>
                        <button
                            type="submit"
                            className="new-festival-submit-button"
                            disabled={saving}>{saving ? "Creating..." : "Create Festival"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
export default NewFestivalModal;