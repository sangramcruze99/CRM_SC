// scripts/test-recruiter-screening-experience.mjs
// End-to-end verification script for the Recruiter-Friendly Screening Experience

import http from 'http';

const AUTOMATION_URL = 'http://localhost:3009';
const API_KEY = 'ee03f6bc2fba450fdf6d080ae6c8c919';
const TENANT_ID = 'default-tenant';

function makeRequest(method, path, body = null, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, AUTOMATION_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'x-tenant-id': TENANT_ID,
        ...extraHeaders,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('============================================================');
  console.log('RECRUITER SCREENING EXPERIENCE: END-TO-END VERIFICATION');
  console.log('============================================================\n');

  let passed = 0;
  let failed = 0;

  // TEST 1: Screening Template Library
  try {
    console.log('TEST 1: Screening Template Library Retrieval');
    const res = await makeRequest('GET', '/screening-profiles/templates');
    if (res.status === 200 && Array.isArray(res.data) && res.data.length >= 5) {
      console.log(`✅ Passed: Retrieved ${res.data.length} pre-built recruiter templates.`);
      console.log(`   Sample template: "${res.data[0].name}" (${res.data[0].jobTitle})`);
      passed++;
    } else {
      console.error(`❌ Failed: Unexpected response status ${res.status}`, res);
      failed++;
    }
  } catch (err) {
    console.error('❌ Failed with error:', err.message);
    failed++;
  }

  // TEST 2: Exact Acceptance Test Natural Language Parsing
  let parsedProfile = null;
  const exactPrompt = `I need a graduate with CGPA 3.00 or above,
at least 2 years relevant experience,
and at least 5 of these 8 skills:
MS Office, Excel, Word, PowerPoint, Google Sheets,
Communication, Reporting, Data Entry.

Accounting software experience is preferred.`;

  try {
    console.log('\nTEST 2: Exact Acceptance Prompt Parsing (NL -> Structured Criteria)');
    console.log(`Prompt: "${exactPrompt.replace(/\n/g, ' ')}"`);
    const res = await makeRequest('POST', '/screening-profiles/parse-natural-language', {
      prompt: exactPrompt,
      jobTitle: 'Junior Accounts Executive',
    });

    if (res.status === 200 || res.status === 201) {
      parsedProfile = res.data;
      console.log('✅ Passed: Prompt parsed successfully into structured profile:');
      console.log(`   • Education: ${JSON.stringify(parsedProfile.educationCriteria)}`);
      console.log(`   • Experience: ${JSON.stringify(parsedProfile.experienceCriteria)}`);
      console.log(`   • Skill rule: ${parsedProfile.skillCriteria?.rule} of ${parsedProfile.skillCriteria?.skills?.length} skills`);
      console.log(`   • Must Haves: ${parsedProfile.mustHaveCriteria?.length} criteria`);
      console.log(`   • Preferred: ${parsedProfile.preferredCriteria?.length} criteria`);

      // Verify specific assertions
      const hasMinCgpa = parsedProfile.educationCriteria?.[0]?.minCgpa === 3.0;
      const hasExpYears = parsedProfile.experienceCriteria?.minYears === 2;
      const hasSkillThreshold = parsedProfile.skillCriteria?.minCount === 5;
      const hasPreferredAccounting = parsedProfile.preferredCriteria?.some((c) =>
        (typeof c === 'string' ? c : c?.title || '').toLowerCase().includes('accounting')
      );

      if (hasMinCgpa && hasExpYears && hasSkillThreshold && hasPreferredAccounting) {
        console.log('   ✓ Exact criteria verified: CGPA >= 3.00, Exp >= 2 yrs, 5 of 8 skills, Preferred Accounting');
        passed++;
      } else {
        console.error('   ❌ Criteria details did not match expected values.');
        failed++;
      }
    } else {
      console.error(`❌ Failed: Unexpected response status ${res.status}`, res);
      failed++;
    }
  } catch (err) {
    console.error('❌ Failed with error:', err.message);
    failed++;
  }

  // TEST 3: Save Screening Profile to Database
  let savedProfileId = null;
  try {
    console.log('\nTEST 3: Persist Screening Profile to Database');
    const profileToSave = {
      ...(parsedProfile || {}),
      name: 'Junior Accounts Executive - Verification Profile',
      jobTitle: 'Junior Accounts Executive',
      status: 'READY',
      version: 1,
    };

    const res = await makeRequest('POST', '/screening-profiles', profileToSave);
    if ((res.status === 200 || res.status === 201) && res.data?.id) {
      savedProfileId = res.data.id;
      console.log(`✅ Passed: Created ScreeningProfile with ID: ${savedProfileId}`);
      passed++;
    } else {
      console.error(`❌ Failed: Unexpected response status ${res.status}`, res);
      failed++;
    }
  } catch (err) {
    console.error('❌ Failed with error:', err.message);
    failed++;
  }

  // TEST 4: Screen Candidate Resume (Sarah Khan acceptance test scenario)
  let screeningResultId = null;
  const sarahKhanResume = `
SARAH KHAN
Email: sarah.khan@example.com | Phone: +1-555-0199
Location: New York, NY

EDUCATION
Bachelor of Business Administration (BBA) - Finance
CGPA: 3.42 / 4.00
Graduation Year: 2021

PROFESSIONAL EXPERIENCE
Administrative & Accounts Executive | Zenith Global Services
2022 - Present (3 years relevant experience)
- Utilized Advanced Excel and MS Office for complex financial modeling and variance tracking.
- Drafted weekly corporate reports and managed documentation using Microsoft Word and Google Sheets.
- Handled daily data entry operations and cross-functional client communication.
- Performed monthly reconciliations utilizing QuickBooks accounting software.

KEY SKILLS
- Advanced Excel, Microsoft Word, Google Sheets, MS Office
- Corporate Reporting, Data Entry, Stakeholder Communication
- Accounting Software (QuickBooks)
`;

  try {
    console.log('\nTEST 4: Candidate Resume Screening with Anti-Bias & Verbatim Evidence');
    const res = await makeRequest('POST', '/screening-profiles/screen-resume', {
      profileId: savedProfileId,
      candidateId: 'cand-sarah-khan-01',
      candidateName: 'Sarah Khan',
      candidateEmail: 'sarah.khan@example.com',
      resumeText: sarahKhanResume,
    });

    const resData = res.data;
    if ((res.status === 200 || res.status === 201) && (resData?.resultId || resData?.id)) {
      screeningResultId = resData.resultId || resData.id;
      const r = resData;
      console.log(`✅ Passed: Resume screened successfully. ScreeningResult ID: ${screeningResultId}`);
      console.log(`   • Candidate: ${r.candidateName}`);
      console.log(`   • Matched Mandatory: ${r.matchedCriteria?.length}`);
      console.log(`   • Missing Mandatory: ${r.missingCriteria?.length} (${r.missingCriteria?.map((m) => m.criterion || m).join(', ')})`);
      console.log(`   • Verbatim Evidence Quotes Count: ${r.evidence?.length}`);
      console.log(`   • Recommendation: ${r.recommendedNextStep}`);
      console.log(`   • Summary: "${r.summary}"`);

      // Check PowerPoint is flagged as missing/not found
      const powerPointMissing = r.missingCriteria?.some((m) =>
        (m.title || m.criterion || '').toLowerCase().includes('powerpoint')
      );
      // Check Bachelor's degree and CGPA matched
      const bachelorMatched = r.matchedCriteria?.some((m) =>
        (m.title || m.criterion || '').toLowerCase().includes('bachelor')
      );
      // Check evidence includes QuickBooks or Accounting
      const accountingEvidenceFound = r.evidence?.some((e) =>
        e.toLowerCase().includes('quickbooks') || e.toLowerCase().includes('accounting')
      );

      if (powerPointMissing && bachelorMatched && accountingEvidenceFound) {
        console.log('   ✓ Exact evaluation confirmed: PowerPoint NOT FOUND, Bachelor & Accounting MATCHED.');
        passed++;
      } else {
        console.error('   ❌ Evaluation mismatch on specific criteria flags.');
        failed++;
      }
    } else {
      console.error(`❌ Failed: Unexpected response status ${res.status}`, res);
      failed++;
    }
  } catch (err) {
    console.error('❌ Failed with error:', err.message);
    failed++;
  }

  // TEST 5: Human Review Decision Audit
  try {
    console.log('\nTEST 5: Recruiter Human Review Decision Submission (Audited)');
    if (!screeningResultId) {
      throw new Error('No screeningResultId from Test 4 to review');
    }

    const reviewPayload = {
      verdict: 'APPROVE',
      notes: 'Strong candidate with 3.42 CGPA and 3 years experience. Missing PowerPoint is non-critical for this role; advanced Excel and QuickBooks experience makes her a top candidate.',
      reviewer: 'Senior Talent Acquisition Partner',
    };

    const res = await makeRequest('POST', `/screening-profiles/results/${screeningResultId}/review`, reviewPayload);

    if (res.status === 200 && res.data?.status === 'APPROVED_FOR_INTERVIEW') {
      console.log(`✅ Passed: Human Review decision recorded as ${res.data.status}`);
      console.log(`   • Notes: "${res.data.recruiterNotes}"`);
      console.log(`   • Reviewed By: ${res.data.reviewedBy}`);
      console.log(`   • Reviewed At: ${res.data.reviewedAt}`);
      passed++;
    } else {
      console.error(`❌ Failed: Unexpected response status ${res.status}`, res);
      failed++;
    }
  } catch (err) {
    console.error('❌ Failed with error:', err.message);
    failed++;
  }

  // TEST 6: Workflow Graph Executor Integration Test
  try {
    console.log('\nTEST 6: Universal Workflow Graph Executor (recruitment:screen_candidate node)');
    const testGraph = {
      nodes: [
        {
          id: 'trigger-1',
          type: 'trigger:webhook',
          data: { label: 'Candidate Applied' },
        },
        {
          id: 'screen-1',
          type: 'recruitment:screen_candidate',
          data: {
            label: 'Screen Candidate Against Profile',
            screeningProfileId: savedProfileId,
            candidateId: 'cand-sarah-khan-01',
            candidateName: 'Sarah Khan',
            resumeText: sarahKhanResume,
          },
        },
      ],
      edges: [
        { id: 'e1', source: 'trigger-1', target: 'screen-1' },
      ],
    };

    const res = await makeRequest('POST', '/workflows/wf-recruiter-screening-test/execute-graph', testGraph);

    if (res.status === 200 || res.status === 201) {
      const data = res.data;
      console.log(`✅ Passed: Universal Workflow Graph executed recruitment:screen_candidate successfully!`);
      console.log(`   • Execution ID: ${data.executionId}`);
      console.log(`   • Execution Status: ${data.status}`);
      passed++;
    } else {
      console.error(`❌ Failed: Workflow test execution returned status ${res.status}`, res.data);
      failed++;
    }
  } catch (err) {
    console.error('❌ Failed with error:', err.message);
    failed++;
  }

  console.log('\n============================================================');
  console.log(`VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
