import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';
import caseService from '../services/caseService';
import sectionService from '../services/sectionService';
import suiteService from '../services/suiteService';
import projectService from '../services/projectService';
import './TestCaseFormPage.css';

export default function TestCaseFormPage() {
  const { projectId, suiteId, caseId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEdit = !!caseId;

  const [project, setProject] = useState(null);
  const [suite, setSuite] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [caseType, setCaseType] = useState('Functional');
  const [priority, setPriority] = useState('Medium');
  const [preconditions, setPreconditions] = useState('');
  const [expectedResult, setExpectedResult] = useState('');
  const [steps, setSteps] = useState([{ action: '', expected: '' }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [p, s, secs] = await Promise.all([
          projectService.getById(projectId),
          suiteService.getById(suiteId),
          sectionService.getBySuite(suiteId),
        ]);
        setProject(p);
        setSuite(s);
        setSections(secs);

        if (isEdit) {
          const tc = await caseService.getById(caseId);
          setTitle(tc.title);
          setSectionId(String(tc.section_id));
          setCaseType(tc.case_type || 'Functional');
          setPriority(tc.priority || 'Medium');
          setPreconditions(tc.preconditions || '');
          setExpectedResult(tc.expected_result || '');
          if (tc.steps && tc.steps.length > 0) {
            setSteps(tc.steps);
          }
        } else {
          const preselected = searchParams.get('sectionId');
          if (preselected) setSectionId(preselected);
          else if (secs.length > 0) setSectionId(String(secs[0].id));
        }
      } catch {
        navigate(`/projects/${projectId}/suites/${suiteId}`);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [caseId, suiteId]);

  const addStep = () => setSteps([...steps, { action: '', expected: '' }]);
  const removeStep = (i) => setSteps(steps.filter((_, idx) => idx !== i));
  const updateStep = (i, field, value) => {
    const updated = [...steps];
    updated[i] = { ...updated[i], [field]: value };
    setSteps(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        title,
        section_id: parseInt(sectionId),
        case_type: caseType,
        priority,
        preconditions,
        expected_result: expectedResult,
        steps: steps.filter((s) => s.action.trim()),
      };
      if (isEdit) {
        await caseService.update(caseId, data);
      } else {
        await caseService.create(data);
      }
      navigate(`/projects/${projectId}/suites/${suiteId}`);
    } catch {
      // handle error
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <><Header breadcrumbs={[{ label: 'Dashboard', path: '/' }]} /><LoadingSpinner /></>;

  return (
    <div>
      <Header breadcrumbs={[
        { label: 'Dashboard', path: '/' },
        { label: project?.name, path: `/projects/${projectId}` },
        { label: suite?.name, path: `/projects/${projectId}/suites/${suiteId}` },
        { label: isEdit ? 'Edit Test Case' : 'New Test Case' },
      ]} />
      <div className="page-content">
        <div className="card case-form-card">
          <h2 className="case-form-title">{isEdit ? 'Edit Test Case' : 'New Test Case'}</h2>
          <form onSubmit={handleSubmit} className="case-form">
            <div className="form-row">
              <div className="form-group flex-2">
                <label>Title *</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus placeholder="Enter test case title" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Section *</label>
                <select value={sectionId} onChange={(e) => setSectionId(e.target.value)} required>
                  {sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Type</label>
                <select value={caseType} onChange={(e) => setCaseType(e.target.value)}>
                  <option>Functional</option>
                  <option>Regression</option>
                  <option>Smoke</option>
                  <option>Performance</option>
                  <option>Security</option>
                  <option>Usability</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option>Critical</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Preconditions</label>
              <textarea value={preconditions} onChange={(e) => setPreconditions(e.target.value)} rows={3} placeholder="List any preconditions or setup required" />
            </div>

            <div className="form-group">
              <label>Steps</label>
              <div className="steps-list">
                {steps.map((step, i) => (
                  <div key={i} className="step-row">
                    <span className="step-num">{i + 1}</span>
                    <div className="step-fields">
                      <input
                        type="text"
                        value={step.action}
                        onChange={(e) => updateStep(i, 'action', e.target.value)}
                        placeholder="Step action"
                      />
                      <input
                        type="text"
                        value={step.expected}
                        onChange={(e) => updateStep(i, 'expected', e.target.value)}
                        placeholder="Expected result"
                      />
                    </div>
                    {steps.length > 1 && (
                      <button type="button" className="btn-icon danger" onClick={() => removeStep(i)}>&times;</button>
                    )}
                  </div>
                ))}
              </div>
              <button type="button" className="btn btn-secondary btn-sm" onClick={addStep}>+ Add Step</button>
            </div>

            <div className="form-group">
              <label>Expected Result</label>
              <textarea value={expectedResult} onChange={(e) => setExpectedResult(e.target.value)} rows={3} placeholder="Overall expected result" />
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => navigate(`/projects/${projectId}/suites/${suiteId}`)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Test Case')}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
