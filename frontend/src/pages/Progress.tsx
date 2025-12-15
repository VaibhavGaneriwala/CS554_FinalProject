import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { userService } from "../services/userService";
import { progressService } from "../services/progressService";

import "chart.js/auto";
import { Line } from "react-chartjs-2";

const Progress: React.FC = () => {
    const {user, logout, updateUser} = useAuth();
    const navigate = useNavigate();

    const [progressType, setProgressType] = useState<"weight" | "pr" | "measurements" | "photos">("weight");
    const [progressData, setProgressData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [goalWeight, setGoalWeight] = useState<number | null>(null);
    const [goalInput, setGoalInput] = useState("");
    const [savingGoal, setSavingGoal] = useState(false);

    const [newWeight, setNewWeight] = useState("");
    const [saving, setSaving] = useState(false);

    const [newExercise, setNewExercise] = useState("");
    const [newPRValue, setNewPRValue] = useState("");
    const [savingPR, setSavingPR] = useState(false);

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await progressService.getProgress(
                    undefined,
                    progressType
                );

                setProgressData(response.data?.progressEntries ?? []);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProgress();
    }, [progressType]);

    useEffect(() => {
        if (user?.goalWeight) {
            setGoalWeight(user.goalWeight);
            setGoalInput(user.goalWeight.toString());
        }
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleSaveGoalWeight = async () => {
        if (!goalInput) return;

        try {
            setSavingGoal(true);

            const response = await userService.updateWeightGoal(
                Number(goalInput)
            );

            if (response.data && user) {
                updateUser({
                    ...user,
                    goalWeight: response.data.goalWeight,
                });
            }

            alert("Goal weight updated!");
        } catch (err: any) {
            alert(err.message || "Failed to save goal weight");
        } finally {
            setSavingGoal(false);
        }
    };

    const handleAddWeight = async () => {
        if (!newWeight) return;
        try {
            setSaving(true);

            const response = await progressService.createProgress({
                type: "weight",
                weight: Number(newWeight),
            });

            if (response.data) {
                setProgressData((prev) => [response.data, ...prev]);
            }

            setNewWeight("");
        } catch (err: any) {
            alert(err.message || "Failed to add weight!");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteProgress = async (progressId: string) => {
        const confirmDelete = window.confirm("Delete this weight entry?");
        if (!confirmDelete) return;

        try {
            await progressService.deleteProgress(progressId);
            setProgressData((prev) =>
                prev.filter((entry) => entry._id !== progressId)
            );
        } catch (err: any) {
            alert(err.message || "Failed to delete entry!");
        }
    };

    const weightChartData = {
        labels: [...progressData]
            .reverse()
            .map((entry) => new Date(entry.date).toLocaleDateString()),
        datasets: [
            {
                label: "Weight (lbs)",
                data: [...progressData].reverse().map((entry) => entry.weight),
                borderColor: "rgb(54, 162, 235)",
                backgroundColor: "rgba(54, 162, 235, 0.2)",
                tension: 0.3,
                fill: true,
            },
            ...(goalWeight !== null
                ? [
                    {
                        label: "Goal Weight",
                        data: Array(progressData.length).fill(goalWeight),
                        borderColor: "rgb(255, 99, 132)",
                        borderDash: [6, 6],
                        pointRadius: 0,
                    },
                ]
                : []),
        ],
    };

    const weightChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: true,
            },
        },
        scales: {
            y: {
                beginAtZero: false,
                title: {
                    display: true,
                    text: "Weight (lbs)",
                },
            },
            x: {
                title: {
                    display: true,
                    text: "Date",
                },
            },
        },
    };

    const handleAddPR = async () => {
        if (!newExercise || !newPRValue) return;

        try {
            setSavingPR(true);

            const response = await progressService.createProgress({
                type: "pr",
                exercise: newExercise,
                prValue: Number(newPRValue),
            });

            if (response.data) {
                setProgressData((prev) => [response.data, ...prev]);
            }

            setNewExercise("");
            setNewPRValue("");
        } catch (err: any) {
            alert(err.message || "Failed to add PR");
        } finally {
            setSavingPR(false);
        }
    };


    return (
        <div>
            <Navbar isAuthenticated={true} onLogout={handleLogout} />
            <div style={{ marginBottom: "1rem" }}>
                <div style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem" }}>
                    <button onClick={() => setProgressType("weight")} disabled={progressType === "weight"}>Weight</button>
                    <button onClick={() => setProgressType("pr")} disabled={progressType === "pr"}>PRs</button>
                    <button onClick={() => setProgressType("measurements")} disabled={progressType === "measurements"}>Measurements</button>
                    <button onClick={() => setProgressType("photos")} disabled={progressType === "photos"}>Photos</button>
                </div>

                {/** Weight Section */}
                {progressType === "weight" && (
                    <div>
                        <h2>Weight Progress</h2>
                        <br/>

                        {/** Enter User's Weight Goal */}
                        <div style={{ marginBottom: "1rem" }}>
                            <h3>Weight Goal</h3>

                            <input
                                type="number"
                                placeholder="Set goal weight (lbs)"
                                value={goalInput}
                                onChange={(e) => setGoalInput(e.target.value)}
                                min="0"
                            />

                            <button
                                onClick={handleSaveGoalWeight}
                                disabled={!goalInput || savingGoal}
                                style={{ marginLeft: "0.5rem" }}
                            >
                                {savingGoal ? "Saving..." : "Save Goal"}
                            </button>

                            {goalWeight !== null && (
                                <p>Current goal: <strong>{goalWeight} lbs</strong></p>
                            )}
                        </div>

                        {/** Weight Chart */}
                        {progressData.length >= 1 && (
                            <div style={{ maxWidth: "700px", height: "350px", marginBottom: "1.5rem" }}>
                                <Line data={weightChartData} options={weightChartOptions} />
                            </div>
                        )}

                        {/** Enter current weight to be tracked */}
                        <div style={{ marginBottom: "1rem" }}>
                            <input
                                type="number"
                                placeholder="Enter weight (lbs)"
                                value={newWeight}
                                onChange={(e) => setNewWeight(e.target.value)}
                                min="0"
                            />

                            <button
                                onClick={handleAddWeight}
                                disabled={!newWeight || saving}
                                style={{ marginLeft: "0.5rem" }}
                            >
                                {saving ? "Saving..." : "Add Weight"}
                            </button>
                        </div>

                        {/** Tracked Weights */}
                        {loading && <p>Loading...</p>}

                        {progressData.length === 0 && !loading && (
                            <p>No weight entries yet.</p>
                        )}

                        <ul>
                            {progressData.map((entry) => (
                                <li key={entry._id}>
                                    <strong>{new Date(entry.date).toLocaleDateString()}</strong>
                                    {" - "}
                                    {entry.weight} lbs
                                    {entry.notes && ` (${entry.notes})`}
                                    {" "} <button onClick={() => handleDeleteProgress(entry._id)}>Delete</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {progressType === "pr" && (
                    <div>
                        <h2>Personal Records</h2>

                        {/* Add PR */}
                        <div style={{ marginBottom: "1rem" }}>
                        <input
                            type="text"
                            placeholder="Exercise (e.g. Bench Press)"
                            value={newExercise}
                            onChange={(e) => setNewExercise(e.target.value)}
                        />

                        <input
                            type="number"
                            placeholder="PR Value (lbs)"
                            value={newPRValue}
                            onChange={(e) => setNewPRValue(e.target.value)}
                            min="0"
                            style={{ marginLeft: "0.5rem" }}
                        />

                        <button
                            onClick={handleAddPR}
                            disabled={!newExercise || !newPRValue || savingPR}
                            style={{ marginLeft: "0.5rem" }}
                        >
                            {savingPR ? "Saving..." : "Add PR"}
                        </button>
                    </div>

                    {/* PR List */}
                    {loading && <p>Loading...</p>}

                    {progressData.length === 0 && !loading && (
                        <p>No PRs logged yet.</p>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1rem" }}>
                        {progressData.map((pr) => (
                            <div
                                key={pr._id}
                                style={{
                                    border: "1px solid #ddd",
                                    borderRadius: "8px",
                                    padding: "1rem",
                                    background: "#fafafa",
                                }}
                            >
                                <h3>{pr.exercise}</h3>
                                <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                                    {pr.prValue} lbs
                                </p>
                                <p>{new Date(pr.date).toLocaleDateString()}</p>
                                <button onClick={() => handleDeleteProgress(pr._id)}>Delete</button>
                            </div>
                        ))}
                    </div>

                </div>
                )}
            </div>
        </div>
    );
}

export default Progress;
