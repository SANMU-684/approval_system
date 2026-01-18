const fs = require('fs');
const crypto = require('crypto');

// Configuration
const USER_IDS = Array.from({ length: 19 }, (_, i) => i + 1); // IDs 1 to 19
const MANAGERS = [1, 2, 3, 4, 5]; // Admin/Managers
const TYPES = ['LEAVE', 'EXPENSE', 'PURCHASE', 'BUSINESS_TRIP', 'OVERTIME', 'CONTRACT'];
const WORKFLOW_MAP = {
    'LEAVE': 1,
    'EXPENSE': 2,
    'PURCHASE': 3,
    'BUSINESS_TRIP': 4,
    'OVERTIME': 5,
    'CONTRACT': 6
};

// Date Util
function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function formatDate(date) {
    if (!date) return 'NULL';
    return `'${date.toISOString().slice(0, 19).replace('T', ' ')}'`;
}

function uuidv4() {
    return crypto.randomUUID().replace(/-/g, '');
}

const START_DATE = new Date();
START_DATE.setDate(START_DATE.getDate() - 90);
const END_DATE = new Date();

const sqlStatements = [];

function getStatusLifecycle() {
    const r = Math.random();
    if (r < 0.6) return { status: 3, steps: ['SUBMIT', 'APPROVE_1', 'APPROVE_2'] }; // Approved
    if (r < 0.7) return { status: 4, steps: ['SUBMIT', 'APPROVE_1', 'REJECT'] };    // Rejected
    if (r < 0.9) return { status: 1, steps: ['SUBMIT'] };                           // Pending
    return { status: 2, steps: ['SUBMIT', 'APPROVE_1'] };                          // In Progress
}

function generateRecord() {
    const recordId = uuidv4();
    const initiator = USER_IDS[Math.floor(Math.random() * USER_IDS.length)];
    const approvalType = TYPES[Math.floor(Math.random() * TYPES.length)];
    const workflowId = WORKFLOW_MAP[approvalType];

    // Timing
    const createdAt = randomDate(START_DATE, END_DATE);

    const { status: finalStatus, steps } = getStatusLifecycle();

    // Determine completion time
    let completedAt = null;
    if (finalStatus === 3 || finalStatus === 4) {
        const durationHours = Math.random() * 72 + 0.1; // 6 mins to 3 days
        completedAt = new Date(createdAt.getTime() + durationHours * 3600000);
        if (completedAt > new Date()) {
            completedAt = new Date(); // Cap at now
        }
    }

    // Insert Record
    sqlStatements.push(`INSERT INTO \`approval_record\` (\`id\`, \`title\`, \`type_code\`, \`content\`, \`initiator_id\`, \`priority\`, \`status\`, \`current_node_order\`, \`workflow_id\`, \`created_at\`, \`completed_at\`) VALUES ('${recordId}', '${approvalType} - Generated', '${approvalType}', '{}', ${initiator}, ${Math.floor(Math.random() * 3)}, ${finalStatus}, ${steps.length}, ${workflowId}, ${formatDate(createdAt)}, ${formatDate(completedAt)});`);

    // Insert Nodes & Logs based on steps
    let currentTime = new Date(createdAt);
    steps.forEach((step, idx) => {
        // Increment time
        currentTime = new Date(currentTime.getTime() + (Math.random() * 3.5 + 0.5) * 3600000);

        const nodeOrder = idx + 1;
        const approver = MANAGERS[Math.floor(Math.random() * MANAGERS.length)];

        let nodeStatus = 0;
        let comment = 'NULL';
        let approvedAt = 'NULL';

        if (step === 'SUBMIT') {
            // Log submit
            sqlStatements.push(`INSERT INTO \`operation_log\` (\`user_id\`, \`module\`, \`operation\`, \`target_id\`, \`detail\`, \`user_agent\`, \`created_at\`) VALUES (${initiator}, 'APPROVAL', 'SUBMIT', '${recordId}', 'Initiated Request', 'Generated Script', ${formatDate(createdAt)});`);
            return;
        }

        if (step.startsWith('APPROVE')) {
            nodeStatus = 1;
            comment = "'Approved'";
            approvedAt = formatDate(currentTime);
            // Log
            sqlStatements.push(`INSERT INTO \`operation_log\` (\`user_id\`, \`module\`, \`operation\`, \`target_id\`, \`detail\`, \`user_agent\`, \`created_at\`) VALUES (${approver}, 'APPROVAL', 'APPROVE', '${recordId}', 'Approved node ${nodeOrder}', 'Generated Script', ${formatDate(currentTime)});`);
        }

        if (step === 'REJECT') {
            nodeStatus = 2;
            comment = "'Rejected'";
            approvedAt = formatDate(currentTime);
            // Log
            sqlStatements.push(`INSERT INTO \`operation_log\` (\`user_id\`, \`module\`, \`operation\`, \`target_id\`, \`detail\`, \`user_agent\`, \`created_at\`) VALUES (${approver}, 'APPROVAL', 'REJECT', '${recordId}', 'Rejected node ${nodeOrder}', 'Generated Script', ${formatDate(currentTime)});`);
        }

        // Insert Node
        sqlStatements.push(`INSERT INTO \`approval_node\` (\`approval_id\`, \`node_name\`, \`approver_id\`, \`node_order\`, \`status\`, \`comment\`, \`approved_at\`, \`created_at\`) VALUES ('${recordId}', 'Node ${nodeOrder}', ${approver}, ${nodeOrder}, ${nodeStatus}, ${comment}, ${approvedAt}, ${formatDate(createdAt)});`);
    });
}

console.log("Starting generation...");
for (let i = 0; i < 300; i++) {
    generateRecord();
}

const header = "-- Generated Test Data\n-- Generated at: " + new Date().toISOString() + "\n\n";
const content = header + sqlStatements.join('\n');

try {
    fs.writeFileSync('generated_test_data.sql', content, 'utf8');
    console.log("Success! Generated " + sqlStatements.length + " statements.");
} catch (err) {
    console.error("Error writing file:", err);
    process.exit(1);
}
