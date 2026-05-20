// @ts-nocheck
require('dotenv').config();

const { ENV_GROUPS, validateEnv } = require('./envValidator');

const SENSITIVE_TOKENS = [
  'SECRET',
  'KEY',
  'TOKEN',
  'PASSWORD',
  'PASS',
  'DATABASE_URL',
  'PRIVATE_KEY'
];

const isSensitive = (key) => (
  SENSITIVE_TOKENS.some((token) => key.toUpperCase().includes(token))
);

const maskValue = (key, value) => {
  if (!value) {
    return '[empty]';
  }

  if (!isSensitive(key)) {
    return value;
  }

  const stringValue = String(value);

  if (stringValue.length <= 6) {
    return '[redacted]';
  }

  return `${stringValue.slice(0, 3)}...${stringValue.slice(-3)}`;
};

const normalizeValue = (value) => {
  const stringValue = String(value || '').trim();

  if (!stringValue) {
    return null;
  }

  const placeholderPatterns = [
    /^YOUR_/i,
    /_HERE$/i,
    /^REPLACE/i,
    /^CHANGE_ME$/i,
    /^TODO$/i
  ];

  if (placeholderPatterns.some((pattern) => pattern.test(stringValue))) {
    return 'placeholder';
  }

  return stringValue;
};

const getVariableStatus = (key) => {
  const value = normalizeValue(process.env[key]);

  if (value === 'placeholder') {
    return {
      status: 'placeholder',
      label: 'PLACEHOLDER',
      icon: '[WARN]'
    };
  }

  if (!value) {
    return {
      status: 'missing',
      label: 'MISSING',
      icon: '[MISS]'
    };
  }

  return {
    status: 'configured',
    label: 'CONFIGURED',
    icon: '[OK]'
  };
};

const generateGroupReport = (groupName, config) => {
  const variables = [...config.required, ...config.optional].map((key) => {
    const status = getVariableStatus(key);

    return {
      key,
      value: maskValue(key, process.env[key]),
      required: config.required.includes(key),
      ...status
    };
  });
  const configured = variables.filter((variable) => variable.status === 'configured').length;
  const missing = variables.filter((variable) => variable.status === 'missing').length;
  const placeholders = variables.filter((variable) => variable.status === 'placeholder').length;

  return {
    name: groupName,
    variables,
    summary: {
      total: variables.length,
      configured,
      missing,
      placeholders,
      completeness: variables.length === 0 ? 100 : Math.round((configured / variables.length) * 100)
    }
  };
};

const generateEnvironmentReport = () => {
  try {
    const validation = validateEnv({ warn: () => {} });
    const groups = Object.entries(ENV_GROUPS).map(([groupName, config]) => (
      generateGroupReport(groupName, config)
    ));
    const total = groups.reduce((sum, group) => sum + group.summary.total, 0);
    const configured = groups.reduce((sum, group) => sum + group.summary.configured, 0);
    const missing = groups.reduce((sum, group) => sum + group.summary.missing, 0);
    const placeholders = groups.reduce((sum, group) => sum + group.summary.placeholders, 0);
    const isProductionReady = validation.missingRequired.length === 0;

    return {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      groups,
      summary: {
        total,
        configured,
        missing,
        placeholders,
        completeness: total === 0 ? 100 : Math.round((configured / total) * 100)
      },
      validation: {
        requiredMissing: validation.missingRequired,
        optionalMissing: validation.missingOptional
      },
      readiness: {
        isProductionReady,
        status: isProductionReady ? 'READY' : 'INCOMPLETE',
        notes: isProductionReady
          ? 'All critical environment variables are configured'
          : 'Critical environment variables are missing'
      }
    };
  } catch (error) {
    return {
      timestamp: new Date().toISOString(),
      error: error.message,
      status: 'FAILED_TO_GENERATE_REPORT'
    };
  }
};

const printReport = (report) => {
  console.log('\nRindaSeat Backend - Environment Configuration Report');
  console.log('----------------------------------------------------');
  console.log(`Generated: ${report.timestamp}`);
  console.log(`Environment: ${report.environment || 'unknown'}`);

  if (report.error) {
    console.error(`[FAIL] ${report.error}`);
    return;
  }

  console.log('\nSummary');
  console.log(`Total Variables: ${report.summary.total}`);
  console.log(`Configured: ${report.summary.configured}`);
  console.log(`Missing: ${report.summary.missing}`);
  console.log(`Placeholders: ${report.summary.placeholders}`);
  console.log(`Completeness: ${report.summary.completeness}%`);
  console.log(`Status: ${report.readiness.status}`);
  console.log(report.readiness.notes);

  report.groups.forEach((group) => {
    console.log(`\n${group.name}`);
    console.log(`Configured: ${group.summary.configured}/${group.summary.total} (${group.summary.completeness}%)`);

    group.variables.forEach((variable) => {
      console.log(`${variable.icon} ${variable.key}=${variable.value}`);
    });
  });
};

const getReportJson = () => JSON.stringify(generateEnvironmentReport(), null, 2);

if (require.main === module) {
  const report = generateEnvironmentReport();
  printReport(report);
  process.exitCode = report.readiness && report.readiness.isProductionReady ? 0 : 1;
}

module.exports = {
  generateEnvironmentReport,
  printReport,
  getReportJson,
  getVariableStatus
};
