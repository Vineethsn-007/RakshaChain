export const CONTRACT_ADDRESS = "0x76699042BC14da770F21334cB67A0d0b00330eB4";

export const CONTRACT_ABI = [
  "function ADMIN_ROLE() view returns (bytes32)",
  "function CONTRACTOR_ROLE() view returns (bytes32)",
  "function AUDITOR_ROLE() view returns (bytes32)",
  "function grantUserRole(bytes32 role, address account) external",
  "function createProject(string _title, string _location, address _contractor, uint256 _totalBudget, string[] _milestoneDescriptions, uint256[] _milestoneAmounts) external",
  "function submitMilestone(uint256 _projectId, uint256 _milestoneId, string _proofCID) external",
  "function approveMilestone(uint256 _projectId, uint256 _milestoneId) external",
  "function rejectMilestone(uint256 _projectId, uint256 _milestoneId, string _reason) external",
  "function emergencyPause(uint256 _projectId) external",
  "function getProject(uint256 _id) external view returns (tuple(uint256 id, string title, string location, address contractor, uint256 totalBudget, uint256 releasedAmount, uint8 status, uint256 createdAt))",
  "function getAllProjects() external view returns (tuple(uint256 id, string title, string location, address contractor, uint256 totalBudget, uint256 releasedAmount, uint8 status, uint256 createdAt)[])",
  "function getMilestones(uint256 _projectId) external view returns (tuple(uint256 id, uint256 projectId, string description, string proofCID, uint256 amount, uint8 status, uint256 submittedAt, uint256 approvedAt)[])",
  "event ProjectCreated(uint256 indexed projectId, address indexed admin, uint256 budget, uint256 timestamp)",
  "event MilestoneSubmitted(uint256 indexed projectId, uint256 indexed milestoneId, address contractor, string proofCID)",
  "event MilestoneApproved(uint256 indexed projectId, uint256 indexed milestoneId, address auditor, uint256 amountReleased)",
  "event MilestoneRejected(uint256 indexed projectId, uint256 indexed milestoneId, address auditor, string reason)",
  "event FundsReleased(uint256 indexed projectId, address indexed contractor, uint256 amount)",
  "event SuspiciousActivity(uint256 indexed projectId, string flagType, address flaggedAddress)",
  "event RoleGrantedEvent(bytes32 role, address account, address grantor)"
];
