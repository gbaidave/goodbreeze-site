"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import Link from "next/link";

type ReportType = "Head to Head" | "Top 3 Competitors" | "Competitive Position";

interface FormData {
  userName: string;
  userEmail: string;
  targetCompany: string;
  targetWebsite?: string;
  reportType: ReportType;
  competitor1?: string;
  competitor1Website?: string;
  competitor2?: string;
  competitor2Website?: string;
  competitor3?: string;
  competitor3Website?: string;
}

export default function SalesAnalyzer() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [reportUrl, setReportUrl] = useState("");

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      reportType: "Head to Head",
    },
  });

  const reportType = watch("reportType");

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError("");

    try {
      const payload = {
        sessionId: `web-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        userName: data.userName,
        userEmail: data.userEmail,
        reportType: data.reportType,
        targetCompany: data.targetCompany,
        targetWebsite: data.targetWebsite || "",
        industry: "",
        location: "",
        competitor1: data.competitor1 || "",
        competitor1Website: data.competitor1Website || "",
        competitor2: data.competitor2 || "",
        competitor2Website: data.competitor2Website || "",
        competitor3: data.competitor3 || "",
        competitor3Website: data.competitor3Website || "",
      };

      const response = await fetch(process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL!, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success && result.pdf_url) {
        setSuccess(true);
        setReportUrl(result.pdf_url);
      } else {
        setError("Failed to generate report. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full p-8 rounded-2xl bg-dark-700 border border-primary"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">✓</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">Report Generated!</h2>
            <p className="text-gray-300 mb-8">
              Your competitive analysis report has been generated and emailed to you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={reportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/50 transition-all duration-300"
              >
                View Report
              </a>
              <button
                onClick={() => {
                  setSuccess(false);
                  setReportUrl("");
                }}
                className="px-8 py-4 border-2 border-primary text-primary font-semibold rounded-full hover:bg-primary hover:text-white transition-all duration-300"
              >
                Generate Another
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Link href="/" className="text-primary hover:underline mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-5xl font-bold mb-4 text-white">
            Sales Analyzer
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Get AI-powered competitive intelligence in minutes. Understand how you stack up against competitors and where you can win.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit(onSubmit)}
          className="bg-dark-700 rounded-2xl border border-primary/20 p-8 space-y-6"
        >
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
              {error}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Your Name *</label>
              <input
                {...register("userName", { required: "Name is required" })}
                className="w-full px-4 py-3 bg-dark rounded-lg border border-gray-700 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder="John Doe"
              />
              {errors.userName && (
                <p className="text-red-500 text-sm mt-1">{errors.userName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Your Email *</label>
              <input
                {...register("userEmail", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                type="email"
                className="w-full px-4 py-3 bg-dark rounded-lg border border-gray-700 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder="john@company.com"
              />
              {errors.userEmail && (
                <p className="text-red-500 text-sm mt-1">{errors.userEmail.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Report Type *</label>
            <select
              {...register("reportType")}
              className="w-full px-4 py-3 bg-dark text-white rounded-lg border border-gray-700 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            >
              <option value="Head to Head" className="bg-dark text-white">Head to Head (Compare 1-on-1)</option>
              <option value="Top 3 Competitors" className="bg-dark text-white">Top 3 Competitors</option>
              <option value="Competitive Position" className="bg-dark text-white">Competitive Position (Market Overview)</option>
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Your Company *</label>
              <input
                {...register("targetCompany", { required: "Company name is required" })}
                className="w-full px-4 py-3 bg-dark rounded-lg border border-gray-700 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder="Acme Inc"
              />
              {errors.targetCompany && (
                <p className="text-red-500 text-sm mt-1">{errors.targetCompany.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Your Website (Optional)</label>
              <input
                {...register("targetWebsite")}
                className="w-full px-4 py-3 bg-dark rounded-lg border border-gray-700 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder="https://acme.com"
              />
            </div>
          </div>

          {(reportType === "Head to Head" || reportType === "Top 3 Competitors") && (
            <div className="space-y-6 pt-4 border-t border-gray-700">
              <h3 className="text-lg font-semibold">
                Competitor Information
                {reportType === "Head to Head" && " (1 Required)"}
                {reportType === "Top 3 Competitors" && " (Up to 3)"}
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Competitor 1 {reportType === "Head to Head" && "*"}
                  </label>
                  <input
                    {...register("competitor1", {
                      required: reportType === "Head to Head" ? "At least one competitor is required" : false,
                    })}
                    className="w-full px-4 py-3 bg-dark rounded-lg border border-gray-700 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    placeholder="Competitor name"
                  />
                  {errors.competitor1 && (
                    <p className="text-red-500 text-sm mt-1">{errors.competitor1.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Competitor 1 Website (Optional)</label>
                  <input
                    {...register("competitor1Website")}
                    className="w-full px-4 py-3 bg-dark rounded-lg border border-gray-700 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    placeholder="https://competitor1.com"
                  />
                </div>
              </div>

              {reportType === "Top 3 Competitors" && (
                <>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Competitor 2</label>
                      <input
                        {...register("competitor2")}
                        className="w-full px-4 py-3 bg-dark rounded-lg border border-gray-700 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        placeholder="Competitor name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Competitor 2 Website (Optional)</label>
                      <input
                        {...register("competitor2Website")}
                        className="w-full px-4 py-3 bg-dark rounded-lg border border-gray-700 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        placeholder="https://competitor2.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Competitor 3</label>
                      <input
                        {...register("competitor3")}
                        className="w-full px-4 py-3 bg-dark rounded-lg border border-gray-700 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        placeholder="Competitor name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Competitor 3 Website (Optional)</label>
                      <input
                        {...register("competitor3Website")}
                        className="w-full px-4 py-3 bg-dark rounded-lg border border-gray-700 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        placeholder="https://competitor3.com"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-8 py-4 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? "Generating Report..." : "Generate Free Report"}
          </button>

          <p className="text-center text-sm text-gray-400">
            Your report will be emailed to you and displayed here when ready (typically 2-3 minutes).
          </p>
        </motion.form>
      </div>
    </div>
  );
}
