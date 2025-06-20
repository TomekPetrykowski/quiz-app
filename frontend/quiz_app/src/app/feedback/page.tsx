"use client";
import { useState, useEffect } from "react";

interface Feedback {
  _id: string;
  message: string;
  createdAt: string;
}

export default function FeedbackPage() {
  const [message, setMessage] = useState("");
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchFeedbacks = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/feedback`);
      if (!res.ok) throw new Error("Failed to fetch feedback");
      const data = await res.json();
      setFeedbacks(data);
    } catch (err) {
      setError("Failed to load feedback.");
      console.error("Error fetching feedback:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (message.length < 5) {
      setError("Message must be at least 5 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) throw new Error("Failed to submit feedback");
      setSuccess("Feedback submitted!");
      setMessage("");
      fetchFeedbacks();
    } catch (err) {
      setError("Failed to submit feedback.");
      console.error("Error submitting feedback:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-xl mx-auto mt-12 font-sans">
      <h1 className="text-2xl font-bold mb-4">Feedback</h1>
      <form onSubmit={handleSubmit} className="mb-8 flex flex-col gap-2">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="w-full p-2 border rounded"
          placeholder="Your feedback..."
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded mt-2">
          {loading ? "Submitting..." : "Submit"}
        </button>
        {error && <div className="text-red-600 mt-1">{error}</div>}
        {success && <div className="text-green-600 mt-1">{success}</div>}
      </form>
      <h2 className="text-xl font-semibold mb-2">All Feedback</h2>
      {loading && <p>Loading...</p>}
      <ul className="space-y-4">
        {feedbacks.map((fb) => (
          <li key={fb._id} className="border-b pb-2">
            <div>{fb.message}</div>
            <small className="text-gray-500">
              {new Date(fb.createdAt).toLocaleString()}
            </small>
          </li>
        ))}
      </ul>
    </main>
  );
}
