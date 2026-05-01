// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract RakshaChain is AccessControl, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant CONTRACTOR_ROLE = keccak256("CONTRACTOR_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");

    enum ProjectStatus { Tendering, Active, MilestoneReview, Completed, Paused }
    enum MilestoneStatus { Pending, Submitted, Approved, Rejected }

    struct Project {
        uint256 id;
        string title;
        string location;
        address contractor;
        uint256 totalBudget;      // Just a number (e.g. INR)
        uint256 releasedAmount;
        ProjectStatus status;
        uint256 createdAt;
    }

    struct Milestone {
        uint256 id;
        uint256 projectId;
        string description;
        string proofCID;
        uint256 amount;
        MilestoneStatus status;
        uint256 submittedAt;
        uint256 approvedAt;
    }

    uint256 public projectCounter;
    mapping(uint256 => Project) public projects;
    mapping(uint256 => mapping(uint256 => Milestone)) public milestones;
    mapping(uint256 => uint256) public projectMilestoneCount;

    event ProjectCreated(uint256 indexed projectId, address indexed admin, uint256 budget, uint256 timestamp);
    event MilestoneSubmitted(uint256 indexed projectId, uint256 indexed milestoneId, address contractor, string proofCID);
    event MilestoneApproved(uint256 indexed projectId, uint256 indexed milestoneId, address auditor, uint256 amountReleased);
    event MilestoneRejected(uint256 indexed projectId, uint256 indexed milestoneId, address auditor, string reason);
    event FundsReleased(uint256 indexed projectId, address indexed contractor, uint256 amount);
    event SuspiciousActivity(uint256 indexed projectId, string flagType, address flaggedAddress);
    event RoleGrantedEvent(bytes32 role, address account, address grantor);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    function grantUserRole(bytes32 role, address account) external onlyRole(ADMIN_ROLE) {
        grantRole(role, account);
        emit RoleGrantedEvent(role, account, msg.sender);
    }

    function createProject(
        string memory _title,
        string memory _location,
        address _contractor,
        uint256 _totalBudget,
        string[] memory _milestoneDescriptions,
        uint256[] memory _milestoneAmounts
    ) external onlyRole(ADMIN_ROLE) {
        require(_milestoneDescriptions.length == _milestoneAmounts.length, "Mismatched milestones arrays");
        
        uint256 sumAmounts = 0;
        for (uint i = 0; i < _milestoneAmounts.length; i++) {
            sumAmounts += _milestoneAmounts[i];
        }
        require(_totalBudget >= sumAmounts, "Budget is less than milestone sum");

        projectCounter++;
        uint256 projectId = projectCounter;

        projects[projectId] = Project({
            id: projectId,
            title: _title,
            location: _location,
            contractor: _contractor,
            totalBudget: _totalBudget,
            releasedAmount: 0,
            status: ProjectStatus.Active,
            createdAt: block.timestamp
        });

        projectMilestoneCount[projectId] = _milestoneDescriptions.length;

        for (uint i = 0; i < _milestoneDescriptions.length; i++) {
            milestones[projectId][i] = Milestone({
                id: i,
                projectId: projectId,
                description: _milestoneDescriptions[i],
                proofCID: "",
                amount: _milestoneAmounts[i],
                status: MilestoneStatus.Pending,
                submittedAt: 0,
                approvedAt: 0
            });
        }

        emit ProjectCreated(projectId, msg.sender, _totalBudget, block.timestamp);
    }

    function submitMilestone(uint256 _projectId, uint256 _milestoneId, string memory _proofCID) external onlyRole(CONTRACTOR_ROLE) {
        Project storage proj = projects[_projectId];
        require(proj.contractor == msg.sender, "Not the project contractor");
        require(proj.status == ProjectStatus.Active || proj.status == ProjectStatus.MilestoneReview, "Project not active");
        
        Milestone storage m = milestones[_projectId][_milestoneId];
        require(m.status == MilestoneStatus.Pending || m.status == MilestoneStatus.Rejected, "Milestone already submitted/approved");

        m.proofCID = _proofCID;
        m.status = MilestoneStatus.Submitted;
        m.submittedAt = block.timestamp;
        
        proj.status = ProjectStatus.MilestoneReview;

        emit MilestoneSubmitted(_projectId, _milestoneId, msg.sender, _proofCID);
    }

    function approveMilestone(uint256 _projectId, uint256 _milestoneId) external onlyRole(AUDITOR_ROLE) nonReentrant {
        Project storage proj = projects[_projectId];
        Milestone storage m = milestones[_projectId][_milestoneId];

        require(m.status == MilestoneStatus.Submitted, "Milestone not submitted");
        require(proj.status != ProjectStatus.Paused, "Project is paused");

        if (msg.sender == proj.contractor) {
            emit SuspiciousActivity(_projectId, "SELF_APPROVAL", msg.sender);
            revert("Auditor cannot be the contractor");
        }

        m.status = MilestoneStatus.Approved;
        m.approvedAt = block.timestamp;

        if (m.approvedAt - m.submittedAt < 60 seconds) {
            emit SuspiciousActivity(_projectId, "INSTANT_APPROVAL", msg.sender);
        }

        proj.releasedAmount += m.amount;
        if (proj.releasedAmount >= proj.totalBudget) {
            proj.status = ProjectStatus.Completed;
        } else {
            proj.status = ProjectStatus.Active;
        }

        emit MilestoneApproved(_projectId, _milestoneId, msg.sender, m.amount);
        emit FundsReleased(_projectId, proj.contractor, m.amount);

        // REMOVED: ETH Transfer Logic. It is now a pure data registry.
    }

    function rejectMilestone(uint256 _projectId, uint256 _milestoneId, string memory _reason) external onlyRole(AUDITOR_ROLE) {
        Milestone storage m = milestones[_projectId][_milestoneId];
        require(m.status == MilestoneStatus.Submitted, "Milestone not submitted");

        m.status = MilestoneStatus.Rejected;
        projects[_projectId].status = ProjectStatus.Active;

        emit MilestoneRejected(_projectId, _milestoneId, msg.sender, _reason);
    }

    function emergencyPause(uint256 _projectId) external onlyRole(ADMIN_ROLE) {
        projects[_projectId].status = ProjectStatus.Paused;
    }

    function getProject(uint256 _id) external view returns (Project memory) {
        return projects[_id];
    }
    
    function getAllProjects() external view returns (Project[] memory) {
        Project[] memory allProjects = new Project[](projectCounter);
        for (uint i = 1; i <= projectCounter; i++) {
            allProjects[i-1] = projects[i];
        }
        return allProjects;
    }

    function getMilestones(uint256 _projectId) external view returns (Milestone[] memory) {
        uint256 count = projectMilestoneCount[_projectId];
        Milestone[] memory projMilestones = new Milestone[](count);
        for (uint i = 0; i < count; i++) {
            projMilestones[i] = milestones[_projectId][i];
        }
        return projMilestones;
    }
}
