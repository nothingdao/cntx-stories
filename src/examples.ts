import { StoriesDatabase, Story, Activity, Step } from './database.js';

export function createExampleStories(db: StoriesDatabase): void {
  // Example Story 1: Website Builder
  const websiteBuilderStory: Story = {
    id: 'website-builder',
    title: 'Website Builder',
    description: 'Build a complete website with frontend, styling, and testing',
    initial_state: {
      project_name: '',
      framework: 'react',
      styling: 'tailwind',
      testing: true
    },
    expected_outcomes: {
      frontend_created: true,
      styles_applied: true,
      tests_written: true,
      build_successful: true
    },
    completion_criteria: 'Website is fully functional with passing tests and successful build'
  };

  // Activities for Website Builder
  const scaffoldFrontendActivity: Activity = {
    id: 'scaffold-frontend',
    story_id: 'website-builder',
    title: 'Scaffold Frontend',
    description: 'Create the basic structure and components for the website',
    instructions: 'Generate a clean, modern website structure using React and TypeScript',
    prompt_template: 'generate-ui',
    state: {
      components_created: false,
      routing_setup: false
    },
    expected_outcome: 'Frontend structure created with main components and routing'
  };

  const applyStylesActivity: Activity = {
    id: 'apply-styles',
    story_id: 'website-builder',
    title: 'Apply Styles',
    description: 'Style the website using Tailwind CSS',
    instructions: 'Apply responsive, modern styling to all components',
    prompt_template: 'generate-ui',
    state: {
      styles_applied: false,
      responsive_design: false
    },
    expected_outcome: 'Website styled with Tailwind CSS and responsive design'
  };

  const writeTestsActivity: Activity = {
    id: 'write-tests',
    story_id: 'website-builder',
    title: 'Write Tests',
    description: 'Create comprehensive tests for all components',
    instructions: 'Write unit and integration tests using modern testing frameworks',
    prompt_template: 'write-tests',
    state: {
      unit_tests: false,
      integration_tests: false
    },
    expected_outcome: 'All components have comprehensive test coverage'
  };

  // Steps for Scaffold Frontend
  const scaffoldSteps: Step[] = [
    {
      id: 'create-app-structure',
      activity_id: 'scaffold-frontend',
      order_index: 1,
      prompt: 'Create the main App component with routing setup',
      input_request: 'Specify the main pages/routes needed',
      state_update_logic: '{"components_created": true}',
      outcome_check: 'App component exists and renders correctly'
    },
    {
      id: 'create-components',
      activity_id: 'scaffold-frontend',
      order_index: 2,
      prompt: 'Create reusable UI components (Header, Footer, etc.)',
      input_request: 'List of components needed',
      state_update_logic: '{"routing_setup": true}',
      outcome_check: 'All basic components created and importable'
    }
  ];

  // Steps for Apply Styles
  const styleSteps: Step[] = [
    {
      id: 'setup-tailwind',
      activity_id: 'apply-styles',
      order_index: 1,
      prompt: 'Configure Tailwind CSS and apply base styles',
      input_request: 'Design system preferences (colors, fonts, etc.)',
      state_update_logic: '{"styles_applied": true}',
      outcome_check: 'Tailwind is configured and base styles applied'
    },
    {
      id: 'responsive-design',
      activity_id: 'apply-styles',
      order_index: 2,
      prompt: 'Make all components responsive across device sizes',
      input_request: 'Breakpoint specifications',
      state_update_logic: '{"responsive_design": true}',
      outcome_check: 'Website looks good on mobile, tablet, and desktop'
    }
  ];

  // Steps for Write Tests
  const testSteps: Step[] = [
    {
      id: 'setup-testing',
      activity_id: 'write-tests',
      order_index: 1,
      prompt: 'Set up testing framework and write unit tests',
      input_request: 'Testing framework preference (Jest, Vitest, etc.)',
      state_update_logic: '{"unit_tests": true}',
      outcome_check: 'Unit tests pass for all components'
    },
    {
      id: 'integration-tests',
      activity_id: 'write-tests',
      order_index: 2,
      prompt: 'Write integration tests for user workflows',
      input_request: 'Key user journeys to test',
      state_update_logic: '{"integration_tests": true}',
      outcome_check: 'Integration tests cover main user flows'
    }
  ];

  // Example Story 2: Code Audit
  const codeAuditStory: Story = {
    id: 'code-audit',
    title: 'Code Audit',
    description: 'Perform comprehensive audit of existing codebase',
    initial_state: {
      codebase_path: '',
      audit_scope: 'full',
      fix_issues: true
    },
    expected_outcomes: {
      issues_identified: true,
      report_generated: true,
      critical_fixes_applied: true
    },
    completion_criteria: 'Codebase audited with report generated and critical issues fixed'
  };

  const analyzeCodeActivity: Activity = {
    id: 'analyze-code',
    story_id: 'code-audit',
    title: 'Analyze Code',
    description: 'Scan codebase for issues, vulnerabilities, and improvements',
    instructions: 'Perform static analysis and identify potential problems',
    prompt_template: 'lint-code',
    state: {
      static_analysis: false,
      security_scan: false
    },
    expected_outcome: 'Complete analysis of codebase with issues catalogued'
  };

  const analyzeSteps: Step[] = [
    {
      id: 'static-analysis',
      activity_id: 'analyze-code',
      order_index: 1,
      prompt: 'Run static analysis tools to identify code quality issues',
      input_request: 'Specify analysis tools and rules to use',
      state_update_logic: '{"static_analysis": true}',
      outcome_check: 'Static analysis completed with results catalogued'
    },
    {
      id: 'security-scan',
      activity_id: 'analyze-code',
      order_index: 2,
      prompt: 'Scan for security vulnerabilities and best practices',
      input_request: 'Security standards to check against',
      state_update_logic: '{"security_scan": true}',
      outcome_check: 'Security vulnerabilities identified and prioritized'
    }
  ];

  // Save everything to database
  db.createStory(websiteBuilderStory);
  db.createActivity(scaffoldFrontendActivity);
  db.createActivity(applyStylesActivity);
  db.createActivity(writeTestsActivity);

  for (const step of scaffoldSteps) {
    db.createStep(step);
  }
  for (const step of styleSteps) {
    db.createStep(step);
  }
  for (const step of testSteps) {
    db.createStep(step);
  }

  db.createStory(codeAuditStory);
  db.createActivity(analyzeCodeActivity);
  
  for (const step of analyzeSteps) {
    db.createStep(step);
  }
}