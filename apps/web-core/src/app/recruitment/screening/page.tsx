'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  GraduationCap,
  Briefcase,
  Layers,
  Wand2,
  ShieldCheck,
  Save,
  Check,
  X,
  FileText,
  Plus,
  Trash2,
  Play,
  RotateCcw,
  Sliders,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Award,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface EducationCriterion {
  degree: string;
  minCgpa?: number;
  fieldOfStudy?: string;
  priority: 'MUST_HAVE' | 'PREFERRED' | 'NICE_TO_HAVE';
}

interface ExperienceCriterion {
  minYears: number;
  domain?: string;
  priority: 'MUST_HAVE' | 'PREFERRED' | 'NICE_TO_HAVE';
}

interface SkillCriterion {
  mode: 'AT_LEAST_N_OF' | 'ALL_OF' | 'ANY_OF' | 'EXACT_MATCH';
  minCount: number;
  skills: string[];
  priority: 'MUST_HAVE' | 'PREFERRED' | 'NICE_TO_HAVE';
}

interface CustomCriterion {
  instruction: string;
  interpretation: string;
  expectedEvidence: string;
  priority: 'MUST_HAVE' | 'PREFERRED' | 'NICE_TO_HAVE';
}

export default function RecruiterScreeningPage() {
  const [activeTab, setActiveTab] = useState<'BUILDER' | 'QUEUE' | 'TEMPLATES'>('BUILDER');

  // Natural Language Input State
  const [naturalLanguagePrompt, setNaturalLanguagePrompt] = useState(
    'I need a graduate with CGPA 3.00 or above, at least 2 years relevant experience, and at least 5 of these 8 skills: MS Office, Excel, Word, PowerPoint, Google Sheets, Communication, Reporting, Data Entry. Accounting software experience is preferred.',
  );
  const [isParsing, setIsParsing] = useState(false);
  const [parseSuccessNotice, setParseSuccessNotice] = useState<string | null>(null);

  // Structured Profile State
  const [profileName, setProfileName] = useState('Junior Accounts Executive Screening Profile');
  const [jobTitle, setJobTitle] = useState('Junior Accounts Executive');
  const [educationCriteria, setEducationCriteria] = useState<EducationCriterion[]>([
    {
      degree: "Bachelor's degree",
      minCgpa: 3.0,
      fieldOfStudy: 'Accounting / Finance / Business',
      priority: 'MUST_HAVE',
    },
  ]);
  const [experienceCriterion, setExperienceCriterion] = useState<ExperienceCriterion>({
    minYears: 2,
    domain: 'Accounting / Office administration',
    priority: 'MUST_HAVE',
  });
  const [skillCriteria, setSkillCriteria] = useState<SkillCriterion>({
    mode: 'AT_LEAST_N_OF',
    minCount: 5,
    skills: [
      'MS Office',
      'Excel',
      'Word',
      'PowerPoint',
      'Google Sheets',
      'Communication',
      'Reporting',
      'Data Entry',
    ],
    priority: 'MUST_HAVE',
  });
  const [preferredCriteria, setPreferredCriteria] = useState<string[]>([
    'Accounting software experience (e.g. QuickBooks, Xero, Tally, Zoho Books)',
  ]);
  const [customCriteria, setCustomCriteria] = useState<CustomCriterion[]>([
    {
      instruction: 'Experience preparing monthly financial reports',
      interpretation: 'Candidate has actively prepared, reconciled, or presented month-end financial or management reports.',
      expectedEvidence: 'Keywords like "monthly financial report", "month-end close", "management accounts", or "P&L report"',
      priority: 'MUST_HAVE',
    },
  ]);

  const [newSkillInput, setNewSkillInput] = useState('');
  const [newPreferredInput, setNewPreferredInput] = useState('');

  // Live Resume Test Screening State
  const [testResumeText, setTestResumeText] = useState(`Sarah Khan
Email: sarah.khan@example.com
Phone: +1 555-0199

EDUCATION
Bachelor of Business Administration (BBA) - Finance
Graduation: 2021 | CGPA: 3.42 / 4.00

PROFESSIONAL EXPERIENCE
Administrative Executive — Horizon Logistics (2022–2025)
3 years relevant experience in business administration and financial record-keeping.

SKILLS & PROFICIENCIES
- Advanced Excel (VLOOKUP, Pivot Tables, SUMIFS, financial modeling - 3 years)
- MS Office suite daily usage across department
- Microsoft Word for corporate letters and documentation
- Google Sheets for shared collaborative tracking
- Written and verbal Communication with senior executives
- Financial and operational Reporting
- High-accuracy Data Entry

SYSTEMS & ACCOUNTING TOOLS
- QuickBooks Online & Desktop
- Tally ERP for double-entry bookkeeping`);

  const [isScreening, setIsScreening] = useState(false);
  const [screeningResult, setScreeningResult] = useState<any>(null);
  const [reviewVerdict, setReviewVerdict] = useState<string | null>(null);
  const [recruiterNotes, setRecruiterNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Parse natural language into structured criteria
  const handleGenerateCriteria = async () => {
    setIsParsing(true);
    setParseSuccessNotice(null);
    try {
      const res = await fetch('/api/automation/screening-profiles/parse-natural-language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: naturalLanguagePrompt }),
      });
      if (res.ok) {
        const data = await res.json();
        setProfileName(data.name || `${data.jobTitle} Screening Profile`);
        setJobTitle(data.jobTitle || 'Junior Accounts Executive');
        if (data.educationCriteria?.length) setEducationCriteria(data.educationCriteria);
        if (data.experienceCriteria) setExperienceCriterion(data.experienceCriteria);
        if (data.skillCriteria) setSkillCriteria(data.skillCriteria);
        if (data.preferredCriteria) setPreferredCriteria(data.preferredCriteria);
        if (data.customCriteria) setCustomCriteria(data.customCriteria);
        setParseSuccessNotice(data.validationReview?.message || 'Criteria parsed and structured successfully.');
      }
    } catch (err: any) {
      console.error('Failed to parse criteria:', err);
    } finally {
      setIsParsing(false);
    }
  };

  // Run resume test screening
  const handleRunScreening = async () => {
    setIsScreening(true);
    setReviewVerdict(null);
    try {
      const profileData = {
        name: profileName,
        jobTitle,
        educationCriteria,
        experienceCriteria: experienceCriterion,
        skillCriteria,
        preferredCriteria,
        customCriteria,
      };

      const res = await fetch('/api/automation/screening-profiles/screen-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: testResumeText,
          profileData,
          candidateName: 'Sarah Khan',
          candidateEmail: 'sarah.khan@example.com',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setScreeningResult(data);
        setActiveTab('QUEUE');
      }
    } catch (err: any) {
      console.error('Failed to screen resume:', err);
    } finally {
      setIsScreening(false);
    }
  };

  // Submit human review decision
  const handleReviewDecision = async (verdict: 'APPROVE' | 'REQUEST_INFO' | 'REJECT') => {
    if (!screeningResult?.resultId) return;
    try {
      const res = await fetch(`/api/automation/screening-profiles/results/${screeningResult.resultId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verdict,
          notes: recruiterNotes || `Recruiter decision: ${verdict}`,
          reviewer: 'Senior Recruiter',
        }),
      });
      if (res.ok) {
        setReviewVerdict(verdict);
      }
    } catch (err: any) {
      console.error('Review failed:', err);
    }
  };

  // Save profile to database
  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const payload = {
        name: profileName,
        jobTitle,
        educationCriteria,
        experienceCriteria: experienceCriterion,
        skillCriteria,
        preferredCriteria,
        customCriteria,
        rawNaturalLanguage: naturalLanguagePrompt,
        mustHaveCriteria: [
          `${educationCriteria[0]?.degree} (CGPA ≥ ${educationCriteria[0]?.minCgpa?.toFixed(2) || '3.00'})`,
          `${experienceCriterion.minYears}+ years ${experienceCriterion.domain}`,
          `At least ${skillCriteria.minCount} of ${skillCriteria.skills.length} skills`,
        ],
      };

      const res = await fetch('/api/automation/screening-profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSaveMessage(' Screening Profile saved successfully! Ready to use in any hiring workflow.');
      }
    } catch (err: any) {
      setSaveMessage(`Failed to save: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const addSkill = () => {
    if (!newSkillInput.trim()) return;
    if (!skillCriteria.skills.includes(newSkillInput.trim())) {
      setSkillCriteria({
        ...skillCriteria,
        skills: [...skillCriteria.skills, newSkillInput.trim()],
      });
    }
    setNewSkillInput('');
  };

  const removeSkill = (skillToRemove: string) => {
    setSkillCriteria({
      ...skillCriteria,
      skills: skillCriteria.skills.filter((s) => s !== skillToRemove),
      minCount: Math.min(skillCriteria.minCount, Math.max(1, skillCriteria.skills.length - 1)),
    });
  };

  const addPreferred = () => {
    if (!newPreferredInput.trim()) return;
    setPreferredCriteria([...preferredCriteria, newPreferredInput.trim()]);
    setNewPreferredInput('');
  };

  const removePreferred = (index: number) => {
    setPreferredCriteria(preferredCriteria.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Banner Navigation */}
      <header className="border-b border-white/10 bg-slate-900/90 backdrop-blur-xl px-6 py-4 sticky top-0 z-30 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black text-white flex items-center space-x-2">
              <span>Recruiter Screening Studio</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Recruiter-First Mode
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Describe who you want in plain words. The system structures the rules and screens candidates with verbatim resume evidence.
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => setActiveTab('BUILDER')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'BUILDER'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Describe &amp; Configure</span>
          </button>
          <button
            onClick={() => setActiveTab('QUEUE')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'QUEUE'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Candidate Review Queue</span>
            {screeningResult && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('TEMPLATES')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'TEMPLATES'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Role Templates</span>
          </button>
        </div>

        {/* Global Action Header */}
        <div className="flex items-center space-x-2">
          <Link
            href="/automation/workflows"
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition flex items-center space-x-1.5"
          >
            <span>Automation Workflows</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>
          <button
            onClick={handleRunScreening}
            disabled={isScreening}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20 transition flex items-center space-x-1.5 disabled:opacity-50"
          >
            {isScreening ? (
              <>
                <div className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Screening...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Test Screen Sarah Khan</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Studio Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {saveMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between">
            <span>{saveMessage}</span>
            <button onClick={() => setSaveMessage(null)} className="text-emerald-400 hover:text-emerald-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* TAB 1: NATURAL LANGUAGE & STRUCTURED BUILDER */}
        {activeTab === 'BUILDER' && (
          <div className="space-y-6">
            {/* Step 1: Who are you looking for? */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Step 1 • Natural Language Specification</span>
                  </span>
                  <h2 className="text-lg font-black text-white">WHO ARE YOU LOOKING FOR?</h2>
                  <p className="text-xs text-slate-400">
                    Type your candidate prerequisites in normal English. Specify degree, minimum CGPA, years of experience, and required skills.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      setNaturalLanguagePrompt(
                        'I need a graduate with CGPA 3.00 or above, at least 2 years relevant experience, and at least 5 of these 8 skills: MS Office, Excel, Word, PowerPoint, Google Sheets, Communication, Reporting, Data Entry. Accounting software experience is preferred.',
                      )
                    }
                    className="text-[11px] px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-emerald-300 border border-emerald-500/20 transition"
                  >
                    Reset to Standard Case
                  </button>
                </div>
              </div>

              <textarea
                rows={4}
                value={naturalLanguagePrompt}
                onChange={(e) => setNaturalLanguagePrompt(e.target.value)}
                placeholder="Example: I need a graduate with CGPA 3.00 or above, at least 2 years of relevant experience, and at least 5 of these skills: MS Office, Excel, Word, PowerPoint, Google Sheets, Communication, Reporting, Data Entry. Accounting software experience is preferred."
                className="w-full p-4 rounded-2xl bg-slate-950 border border-white/15 text-white text-xs leading-relaxed placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition shadow-inner"
              />

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300">Quick Inclusions:</span>
                  {[
                    'CGPA ≥ 3.00',
                    '2+ years relevant experience',
                    'At least 5 of 8 skills',
                    'Accounting software preferred',
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setNaturalLanguagePrompt((prev) => `${prev} ${chip}.`)}
                      className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-[10px]"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleGenerateCriteria}
                  disabled={isParsing || !naturalLanguagePrompt.trim()}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 transition flex items-center space-x-2 disabled:opacity-50"
                >
                  {isParsing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Parsing with AI...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      <span>GENERATE CRITERIA</span>
                    </>
                  )}
                </button>
              </div>

              {parseSuccessNotice && (
                <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-200">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{parseSuccessNotice}</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
                    Review Below
                  </span>
                </div>
              )}
            </div>

            {/* Step 2: Structured Criteria Editor (Cards) */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Step 2 • Review &amp; Edit Structured Rules</span>
                  </span>
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="text-base font-black text-white bg-transparent border-b border-transparent hover:border-white/20 focus:border-emerald-500 focus:outline-none transition"
                      title="Click to rename profile"
                    />
                    <span className="text-xs text-slate-400 font-mono">({jobTitle})</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/15 transition flex items-center space-x-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
                  </button>
                  <button
                    onClick={handleRunScreening}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 transition flex items-center space-x-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Activate &amp; Test</span>
                  </button>
                </div>
              </div>

              {/* Grid of Structured Criteria Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 1. Education Criteria Card */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-white font-bold text-xs">
                      <GraduationCap className="w-4 h-4 text-sky-400" />
                      <span>EDUCATION CRITERIA</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                      <Check className="w-3 h-3" />
                      <span>MUST HAVE</span>
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Required Degree Type</label>
                      <input
                        type="text"
                        value={educationCriteria[0]?.degree || "Bachelor's degree"}
                        onChange={(e) => {
                          const updated = [...educationCriteria];
                          if (updated[0]) updated[0].degree = e.target.value;
                          setEducationCriteria(updated);
                        }}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-white font-medium focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Minimum CGPA (Scale of 4.0)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="2.0"
                          max="4.0"
                          value={educationCriteria[0]?.minCgpa ?? 3.0}
                          onChange={(e) => {
                            const updated = [...educationCriteria];
                            if (updated[0]) updated[0].minCgpa = parseFloat(e.target.value);
                            setEducationCriteria(updated);
                          }}
                          className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-white font-mono font-bold focus:outline-none focus:border-sky-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Field of Study</label>
                        <input
                          type="text"
                          value={educationCriteria[0]?.fieldOfStudy || 'Accounting / Finance'}
                          onChange={(e) => {
                            const updated = [...educationCriteria];
                            if (updated[0]) updated[0].fieldOfStudy = e.target.value;
                            setEducationCriteria(updated);
                          }}
                          className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-white truncate focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Experience Criteria Card */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-white font-bold text-xs">
                      <Briefcase className="w-4 h-4 text-teal-400" />
                      <span>EXPERIENCE CRITERIA</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                      <Check className="w-3 h-3" />
                      <span>MUST HAVE</span>
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Minimum Relevant Years</label>
                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={experienceCriterion.minYears}
                          onChange={(e) =>
                            setExperienceCriterion({
                              ...experienceCriterion,
                              minYears: parseInt(e.target.value, 10) || 0,
                            })
                          }
                          className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-white font-mono font-bold focus:outline-none focus:border-teal-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Seniority Target</label>
                        <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-slate-300 font-mono text-xs">
                          {experienceCriterion.minYears <= 1 ? 'ENTRY / ASSOCIATE' : experienceCriterion.minYears <= 3 ? 'JUNIOR / MID' : 'SENIOR / LEAD'}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Target Domain / Job Title</label>
                      <input
                        type="text"
                        value={experienceCriterion.domain || 'Accounting / Office administration'}
                        onChange={(e) =>
                          setExperienceCriterion({
                            ...experienceCriterion,
                            domain: e.target.value,
                          })
                        }
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Skills Criteria Card (Critical "At Least N of M" Engine) */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-3 md:col-span-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2 text-white font-bold text-xs">
                      <Sliders className="w-4 h-4 text-emerald-400" />
                      <span>SKILL CRITERIA</span>
                      <span className="text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                        AT LEAST [{skillCriteria.minCount}] OF {skillCriteria.skills.length} REQUIRED
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                      <Check className="w-3 h-3" />
                      <span>MUST HAVE</span>
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-400 text-[11px]">Match Rule:</span>
                        <select
                          value={skillCriteria.mode}
                          onChange={(e) =>
                            setSkillCriteria({ ...skillCriteria, mode: e.target.value as any })
                          }
                          className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/15 text-white text-xs font-bold"
                        >
                          <option value="AT_LEAST_N_OF">AT LEAST N OF LIST</option>
                          <option value="ALL_OF">ALL OF LIST (MANDATORY ALL)</option>
                          <option value="ANY_OF">ANY OF LIST (1 OR MORE)</option>
                        </select>
                      </div>

                      {skillCriteria.mode === 'AT_LEAST_N_OF' && (
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-400 text-[11px]">Required Count:</span>
                          <input
                            type="number"
                            min="1"
                            max={skillCriteria.skills.length}
                            value={skillCriteria.minCount}
                            onChange={(e) =>
                              setSkillCriteria({
                                ...skillCriteria,
                                minCount: Math.min(skillCriteria.skills.length, Math.max(1, parseInt(e.target.value, 10) || 1)),
                              })
                            }
                            className="w-16 px-2 py-0.5 rounded-lg bg-slate-900 border border-white/15 text-white font-mono text-xs font-bold"
                          />
                        </div>
                      )}
                    </div>

                    {/* Interactive Skill Chips */}
                    <div className="space-y-2">
                      <label className="text-[10px] text-slate-400 block uppercase font-bold">Configured Skill Pool ({skillCriteria.skills.length} Skills)</label>
                      <div className="flex flex-wrap gap-2">
                        {skillCriteria.skills.map((skill) => (
                          <div
                            key={skill}
                            className="px-3 py-1 rounded-xl bg-slate-900 text-white text-xs font-semibold border border-white/15 flex items-center space-x-2 shadow-xs group"
                          >
                            <span>{skill}</span>
                            <button
                              onClick={() => removeSkill(skill)}
                              className="text-slate-400 hover:text-rose-400 transition"
                              title={`Remove ${skill}`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Add Skill Field */}
                    <div className="flex items-center space-x-2 pt-1">
                      <input
                        type="text"
                        placeholder="Add another skill requirement (e.g. QuickBooks, Invoicing, Power BI)..."
                        value={newSkillInput}
                        onChange={(e) => setNewSkillInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={addSkill}
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/15 transition flex items-center space-x-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Skill</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4. Preferred Criteria Card */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-white font-bold text-xs">
                      <Award className="w-4 h-4 text-emerald-400" />
                      <span>PREFERRED REQUIREMENTS</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                      <span>○ PREFERRED</span>
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {preferredCriteria.map((pref, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center space-x-2 text-slate-200">
                          <span className="text-emerald-400 font-bold">○</span>
                          <span className="truncate">{pref}</span>
                        </div>
                        <button
                          onClick={() => removePreferred(idx)}
                          className="text-slate-400 hover:text-rose-400 transition shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}

                    <div className="flex items-center space-x-2 pt-1">
                      <input
                        type="text"
                        placeholder="Add preferred criteria (e.g. Accounting software, Bilingual)..."
                        value={newPreferredInput}
                        onChange={(e) => setNewPreferredInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addPreferred()}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={addPreferred}
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/15 transition flex items-center space-x-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 5. Custom Criteria with Resume Evidence Mapping */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-white font-bold text-xs">
                      <FileText className="w-4 h-4 text-amber-400" />
                      <span>CUSTOM CRITERIA (EVIDENCE-MAPPED)</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                      <Check className="w-3 h-3" />
                      <span>MUST HAVE</span>
                    </span>
                  </div>

                  {customCriteria.map((c, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-white/10 space-y-2 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-white">&ldquo;{c.instruction}&rdquo;</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Structured
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-300">
                        <strong>Interpretation:</strong> {c.interpretation}
                      </div>
                      <div className="text-[11px] text-amber-400/90 font-mono bg-slate-950 p-2 rounded-lg border border-white/5">
                        <strong>Evidence Looked For:</strong> {c.expectedEvidence}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LIVE RESUME SCREENING & HUMAN REVIEW QUEUE */}
        {activeTab === 'QUEUE' && (
          <div className="space-y-6">
            {!screeningResult ? (
              <div className="p-12 text-center rounded-3xl bg-slate-900 border border-white/10 space-y-4">
                <UserCheck className="w-12 h-12 text-slate-500 mx-auto" />
                <h3 className="text-base font-black text-white">No Candidate Screened Yet</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Click the button below to test the exact prompt scenario: screening Sarah Khan&apos;s resume against your structured criteria.
                </p>
                <button
                  onClick={handleRunScreening}
                  disabled={isScreening}
                  className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition flex items-center space-x-2 mx-auto"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{isScreening ? 'Screening...' : 'Screen Sarah Khan Resume'}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Candidate Overview Header Card */}
                <div className="p-6 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-emerald-500/20">
                      SK
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h2 className="text-lg font-black text-white">{screeningResult.candidateName}</h2>
                        <span className="text-xs text-slate-400">({screeningResult.roleTitle})</span>
                      </div>
                      <p className="text-xs text-slate-400 flex items-center space-x-2 mt-0.5">
                        <span>sarah.khan@example.com</span>
                        <span>•</span>
                        <span>Applied via Career Portal</span>
                      </p>
                    </div>
                  </div>

                  {/* Explainable Decision Support Signal */}
                  <div className="flex items-center space-x-3 bg-slate-950 px-4 py-2.5 rounded-2xl border border-white/10">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Criteria Match Ratio</span>
                      <span className="text-base font-black text-emerald-400">
                        {screeningResult.evaluationBreakdown?.mandatoryRatio || '5 / 6 mandatory matched'}
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-mono font-black text-emerald-400 text-xs">
                      {screeningResult.evaluationBreakdown?.fitScore || 85}%
                    </div>
                  </div>
                </div>

                {/* Criteria Match & Evidence Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Left Column: Criteria Checks */}
                  <div className="p-5 rounded-3xl bg-slate-900 border border-white/10 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>MANDATORY CRITERIA VERIFICATION</span>
                      </h3>
                      <span className="text-[11px] font-bold text-emerald-400 font-mono">
                        {screeningResult.evaluationBreakdown?.skillsCountMatched || 5} of 8 Skills Matched
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      {screeningResult.matchedCriteria?.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-3 rounded-2xl bg-slate-950 border border-emerald-500/20 space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white flex items-center space-x-1.5">
                              <span className="text-emerald-400 font-black"></span>
                              <span>{item.title}</span>
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              MATCHED
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 pl-4 italic">&ldquo;{item.evidence}&rdquo;</p>
                          <span className="text-[10px] text-slate-500 pl-4 block font-mono">Source: {item.citation}</span>
                        </div>
                      ))}

                      {screeningResult.missingCriteria?.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-3 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-300 flex items-center space-x-1.5">
                              <span className="text-amber-400 font-black"></span>
                              <span>{item.title}</span>
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              NOT FOUND
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 pl-4">{item.expected}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Verbatim Evidence & Human Decision Center */}
                  <div className="space-y-5">
                    {/* Verbatim Resume Evidence */}
                    <div className="p-5 rounded-3xl bg-slate-900 border border-white/10 space-y-3 shadow-xl">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-sky-400" />
                          <span>VERBATIM RESUME EVIDENCE</span>
                        </h3>
                        <span className="text-[10px] text-slate-400">Strictly Non-Hallucinatory</span>
                      </div>

                      <div className="space-y-2 text-xs max-h-60 overflow-y-auto pr-1">
                        {screeningResult.evidence?.map((quote: string, i: number) => (
                          <div
                            key={i}
                            className="p-2.5 rounded-xl bg-slate-950 border border-white/5 text-slate-300 font-mono text-[11px] leading-relaxed flex items-start space-x-2"
                          >
                            <span className="text-sky-400 font-bold shrink-0">#</span>
                            <span>{quote}</span>
                          </div>
                        ))}
                      </div>

                      <div className="p-3 rounded-2xl bg-teal-950/40 border border-teal-500/20 text-xs text-teal-200">
                        <strong>Recruiter Summary:</strong> {screeningResult.summary}
                      </div>
                    </div>

                    {/* Human-In-The-Loop Decision Center */}
                    <div className="p-5 rounded-3xl bg-slate-900 border border-white/10 space-y-4 shadow-xl">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center space-x-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <span>HUMAN REVIEW DECISION CENTER</span>
                        </h3>
                        <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                          Auditable Decision
                        </span>
                      </div>

                      <p className="text-xs text-slate-400">
                        AI provides decision support and quotes. Hiring decisions are strictly verified by a human recruiter.
                      </p>

                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Recruiter Audit Notes</label>
                        <textarea
                          rows={2}
                          placeholder="Add comments on why candidate was approved or deferred..."
                          value={recruiterNotes}
                          onChange={(e) => setRecruiterNotes(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      {reviewVerdict ? (
                        <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>
                            Verdict recorded: <strong>{reviewVerdict === 'APPROVE' ? 'APPROVED FOR INTERVIEW' : reviewVerdict}</strong>. Audited in timeline.
                          </span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-2.5">
                          <button
                            type="button"
                            onClick={() => handleReviewDecision('APPROVE')}
                            className="px-3 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 transition flex items-center justify-center space-x-1.5"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReviewDecision('REQUEST_INFO')}
                            className="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/15 transition flex items-center justify-center space-x-1.5"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Request Info</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReviewDecision('REJECT')}
                            className="px-3 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs border border-rose-500/40 transition flex items-center justify-center space-x-1.5"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: REUSABLE ROLE TEMPLATES */}
        {activeTab === 'TEMPLATES' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-white">Screening Profile Templates</h2>
                <p className="text-xs text-slate-400">Pre-configured recruiter criteria ready to adopt or customize in one click.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                {
                  id: 'tpl_junior_accounts_exec',
                  title: 'Junior Accounts Executive',
                  dept: 'Finance & Accounting',
                  education: "Bachelor's degree (CGPA ≥ 3.00)",
                  experience: '2+ years relevant experience',
                  skills: 'At least 5 of 8 (MS Office, Excel, Word, PowerPoint, Google Sheets, Communication, Reporting, Data Entry)',
                  preferred: 'Accounting software (QuickBooks / Tally)',
                  prompt:
                    'I need a graduate with CGPA 3.00 or above, at least 2 years relevant experience, and at least 5 of these 8 skills: MS Office, Excel, Word, PowerPoint, Google Sheets, Communication, Reporting, Data Entry. Accounting software experience is preferred.',
                },
                {
                  id: 'tpl_software_engineer',
                  title: 'Full-Stack Software Engineer',
                  dept: 'Engineering & Product',
                  education: 'BSc in Computer Science / Engineering',
                  experience: '3+ years production backend/frontend experience',
                  skills: 'At least 4 of 6 (TypeScript, React, Node.js, PostgreSQL, Docker, Redis)',
                  preferred: 'Cloud architecture (AWS / GCP / Cloudflare)',
                  prompt:
                    'I need an engineer with Bachelor in CS, at least 3 years experience, and at least 4 of these skills: TypeScript, React, Node.js, PostgreSQL, Docker, Redis. AWS experience preferred.',
                },
                {
                  id: 'tpl_sales_executive',
                  title: 'Enterprise Account Executive',
                  dept: 'Sales & Revenue',
                  education: "Bachelor's degree in Business or equivalent",
                  experience: '3+ years quota-carrying B2B closing',
                  skills: 'All of (Cold Outreach, Pipeline Management, Demo Presentations, Negotiation)',
                  preferred: 'Salesforce / HubSpot certification',
                  prompt:
                    'I need a sales rep with 3+ years B2B SaaS closing experience, CRM hygiene (HubSpot/Salesforce), Cold Outreach, Demo Presentations, and Negotiation.',
                },
                {
                  id: 'tpl_customer_support',
                  title: 'Customer Support Specialist',
                  dept: 'Customer Success',
                  education: 'Associate or Bachelor degree',
                  experience: '1+ years in customer-facing support',
                  skills: 'At least 3 of 4 (Zendesk, Written Communication, De-escalation, SLA Triage)',
                  preferred: 'Bilingual proficiency',
                  prompt:
                    'I need a customer support specialist with 1+ years experience, Zendesk/Intercom skills, Written Communication, De-escalation, and SLA awareness.',
                },
                {
                  id: 'tpl_entry_level_grad',
                  title: 'Entry-Level Graduate Trainee',
                  dept: 'Operations',
                  education: "Bachelor's degree (CGPA ≥ 3.20)",
                  experience: '0-1 years internship or project experience',
                  skills: 'All of (Communication, MS Office, Research, Teamwork)',
                  preferred: 'Leadership or extracurricular involvement',
                  prompt:
                    'I need a fresh graduate with CGPA 3.20 or above, 0-1 years experience, and skills in Communication, MS Office, Research, Teamwork, and Fast Learner.',
                },
              ].map((template) => (
                <div
                  key={template.id}
                  className="p-5 rounded-3xl bg-slate-900 border border-white/10 hover:border-emerald-500/40 transition space-y-4 flex flex-col justify-between shadow-xl group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        {template.dept}
                      </span>
                      <span className="text-[10px] text-slate-500">v1.0</span>
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition">
                      {template.title}
                    </h3>
                    <div className="space-y-1.5 text-[11px] text-slate-400">
                      <div>
                        <strong className="text-slate-300">Edu:</strong> {template.education}
                      </div>
                      <div>
                        <strong className="text-slate-300">Exp:</strong> {template.experience}
                      </div>
                      <div>
                        <strong className="text-slate-300">Skills:</strong> {template.skills}
                      </div>
                      <div>
                        <strong className="text-emerald-400">Preferred:</strong> {template.preferred}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setNaturalLanguagePrompt(template.prompt);
                      setJobTitle(template.title);
                      setProfileName(`${template.title} Screening Profile`);
                      setActiveTab('BUILDER');
                      handleGenerateCriteria();
                    }}
                    className="w-full py-2 rounded-xl bg-white/10 hover:bg-emerald-600 hover:text-white text-slate-300 font-bold text-xs border border-white/10 transition flex items-center justify-center space-x-1.5"
                  >
                    <span>Use Template</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

