# Phase 2: Core Collaboration - Implementation Plan

## Overview

Phase 2 builds upon the foundation established in Phase 1 by adding core collaboration features including communication tools, approval workflows, task dependencies, and a comprehensive notification system.

**Timeline**: 5-8 weeks  
**Prerequisites**: Phase 1 must be complete (database schema, permissions, change log)

---

## 2.1 Stakeholder Communication Hub (Weeks 1-2)

### Features

#### 2.1.1 Threaded Messaging System
**Description**: Context-aware messaging attached to farm plans, crops, tasks, or document sections.

**Database Schema**:
```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id UUID NOT NULL,
    sender_id UUID NOT NULL REFERENCES users(id),
    sender_name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    context_type VARCHAR(50) CHECK (context_type IN ('farm-plan', 'crop-plan', 'task', 'document', 'general')),
    context_id UUID,
    context_section VARCHAR(255),
    parent_message_id UUID REFERENCES messages(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false
);

CREATE TABLE message_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_size INTEGER,
    file_url TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE message_mentions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(message_id, user_id)
);

CREATE INDEX idx_messages_thread ON messages(thread_id);
CREATE INDEX idx_messages_context ON messages(context_type, context_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_message_mentions_user ON message_mentions(user_id);
```

**API Endpoints**:
- `GET /api/messages?context_type={type}&context_id={id}` - Get messages for a context
- `POST /api/messages` - Create new message
- `PATCH /api/messages/{id}` - Edit message (within time limit)
- `DELETE /api/messages/{id}` - Soft delete message

**UI Components**:
- `MessageThread.tsx` - Threaded conversation display
- `MessageInput.tsx` - Message composer with @mentions and attachments
- `MessageNotification.tsx` - Toast for new messages
- `MessagingPanel.tsx` - Sidebar panel for messages

#### 2.1.2 @Mentions and Notifications
**Features**:
- Autocomplete user mentions while typing
- Generate notifications when users are mentioned
- Link to conversation from notification
- Badge indicators for unread mentions

**Implementation**:
- Parse message content for @username patterns
- Create notification records for each mention
- Add WebSocket support for real-time mentions (optional)

### Deliverables
- Threaded messaging system functional
- @mention system working with notifications
- File attachments supported (images, PDFs)
- Message search and filtering

---

## 2.2 Sequential Approval Workflows (Weeks 3-4)

### Features

#### 2.2.1 Workflow Definition System
**Description**: Define multi-stage approval workflows for plans, documents, and major decisions.

**Database Schema**:
```sql
CREATE TABLE approval_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) CHECK (type IN ('sequential', 'parallel')) DEFAULT 'sequential',
    target_type VARCHAR(50) NOT NULL CHECK (target_type IN ('farm-plan', 'crop-plan', 'financial-report', 'task', 'document')),
    target_id UUID NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'approved', 'rejected', 'cancelled')),
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE approval_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES approval_workflows(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    required_approvals INTEGER DEFAULT 1, -- For parallel workflows
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    deadline TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE approval_stage_approvers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stage_id UUID NOT NULL REFERENCES approval_stages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(100), -- Optional: specify role requirement
    UNIQUE(stage_id, user_id)
);

CREATE TABLE approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stage_id UUID NOT NULL REFERENCES approval_stages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    user_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    comments TEXT,
    signature TEXT, -- Digital signature data
    UNIQUE(stage_id, user_id)
);

CREATE INDEX idx_approval_workflows_target ON approval_workflows(target_type, target_id);
CREATE INDEX idx_approval_stages_workflow ON approval_stages(workflow_id);
CREATE INDEX idx_approvals_stage ON approvals(stage_id);
CREATE INDEX idx_approvals_user ON approvals(user_id);
```

**API Endpoints**:
- `GET /api/approval-workflows?target_type={type}&target_id={id}` - Get workflows for target
- `POST /api/approval-workflows` - Create new approval workflow
- `POST /api/approvals` - Approve or reject a stage
- `PATCH /api/approval-workflows/{id}/cancel` - Cancel workflow

**UI Components**:
- `WorkflowBuilder.tsx` - Visual workflow designer
- `WorkflowProgress.tsx` - Progress indicator for workflows
- `ApprovalCard.tsx` - Card showing approval request
- `ApprovalHistory.tsx` - Complete approval history

#### 2.2.2 Approval Notifications
**Features**:
- Notify users when approval is required
- Remind users of pending approvals (daily digest)
- Notify requesters of approval/rejection
- Escalate overdue approvals

### Deliverables
- Workflow creation and management
- Sequential approval processing
- Approval notifications working
- Visual workflow progress tracking

---

## 2.3 Task Dependencies & Critical Path (Weeks 5-6)

### Features

#### 2.3.1 Task Dependency System
**Description**: Define relationships between tasks (Task B can't start until Task A completes).

**Database Schema**:
```sql
CREATE TABLE task_dependencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    depends_on_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    type VARCHAR(50) DEFAULT 'finish-to-start' CHECK (type IN ('finish-to-start', 'start-to-start', 'finish-to-finish', 'start-to-finish')),
    lag_days INTEGER DEFAULT 0, -- Lag time in days (can be negative for lead time)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(task_id, depends_on_task_id),
    CHECK (task_id != depends_on_task_id) -- Prevent self-dependency
);

CREATE INDEX idx_task_dependencies_task ON task_dependencies(task_id);
CREATE INDEX idx_task_dependencies_depends ON task_dependencies(depends_on_task_id);
```

**API Endpoints**:
- `GET /api/task-dependencies?task_id={id}` - Get dependencies for a task
- `POST /api/task-dependencies` - Create dependency
- `DELETE /api/task-dependencies/{id}` - Remove dependency
- `GET /api/tasks/critical-path?farm_plan_id={id}` - Calculate critical path

**UI Components**:
- `TaskDependencyGraph.tsx` - Visual graph of dependencies
- `CriticalPathView.tsx` - Highlight critical path tasks
- `GanttChart.tsx` - Timeline view with dependencies
- `DependencySelector.tsx` - UI for adding dependencies

#### 2.3.2 Critical Path Analysis
**Features**:
- Automatically calculate critical path
- Highlight tasks that will delay project if delayed
- Show slack time for non-critical tasks
- Warn when critical tasks are at risk

**Algorithm Implementation**:
```typescript
// Pseudocode for critical path calculation
function calculateCriticalPath(tasks: Task[], dependencies: TaskDependency[]) {
  // Build dependency graph
  // Calculate earliest start/finish times (forward pass)
  // Calculate latest start/finish times (backward pass)
  // Identify tasks with zero slack as critical path
  // Return critical path and slack times
}
```

### Deliverables
- Task dependency system working
- Critical path calculation functional
- Visual dependency graph
- Automatic deadline recalculation

---

## 2.4 Enhanced Notification System (Week 7)

### Features

#### 2.4.1 Multi-Channel Notifications
**Description**: Deliver notifications through multiple channels based on priority and user preferences.

**Database Schema Updates**:
```sql
CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(100) NOT NULL,
    in_app BOOLEAN DEFAULT true,
    email BOOLEAN DEFAULT false,
    sms BOOLEAN DEFAULT false,
    push BOOLEAN DEFAULT false,
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, notification_type)
);

CREATE TABLE notification_delivery_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    channel VARCHAR(50) NOT NULL CHECK (channel IN ('in-app', 'email', 'sms', 'push')),
    status VARCHAR(50) CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
    sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**API Endpoints**:
- `GET /api/notification-preferences` - Get user preferences
- `PUT /api/notification-preferences` - Update preferences
- `POST /api/notifications/send` - Trigger notification (internal)

**Email Integration**:
- Use service like SendGrid, AWS SES, or Mailgun
- Template system for notification emails
- Batch digest emails for low-priority notifications

#### 2.4.2 Smart Notification Grouping
**Features**:
- Group similar notifications
- Summarize multiple notifications
- Reduce notification fatigue
- Daily/weekly digest options

### Deliverables
- Multi-channel notification delivery
- User notification preferences
- Email notification system
- Digest notifications for non-urgent items

---

## 2.5 Timeline View & Dashboard Enhancement (Week 8)

### Features

#### 2.5.1 Interactive Timeline
**Description**: Visual timeline showing tasks, milestones, and dependencies.

**UI Components**:
- `TimelineView.tsx` - Main timeline component
- `TimelineTask.tsx` - Task bar with drag-to-resize
- `TimelineMilestone.tsx` - Milestone markers
- `TimelineZoom.tsx` - Zoom controls (day/week/month view)

**Features**:
- Drag tasks to adjust dates
- Visualize task dependencies
- Show critical path highlighted
- Filter by assignee, priority, status
- Export timeline as image/PDF

#### 2.5.2 Enhanced Dashboard
**Description**: Integrate all Phase 1 and Phase 2 features into a unified dashboard.

**Sections**:
1. **Overview Cards**: Tasks, approvals pending, messages, online users
2. **My Tasks**: Filtered list with priorities
3. **Pending Approvals**: Action items requiring approval
4. **Recent Activity**: Change log and messages
5. **Team Status**: Online users and their activities
6. **Quick Actions**: Create task, start workflow, send message

### Deliverables
- Interactive timeline view
- Comprehensive dashboard with all features
- Real-time updates on dashboard
- Responsive mobile layout

---

## Testing Strategy

### Unit Tests
- API endpoint tests for all new endpoints
- Business logic tests (critical path calculation)
- Validation tests for workflows

### Integration Tests
- End-to-end workflow tests
- Notification delivery tests
- WebSocket connection tests

### User Acceptance Tests
- Create and complete approval workflow
- Assign task with dependencies
- Send messages with @mentions
- Receive notifications across channels

---

## Documentation Updates

### User Documentation
- How to create approval workflows
- Understanding task dependencies
- Using the messaging system
- Managing notification preferences

### Developer Documentation
- API endpoint documentation
- Database schema changes
- WebSocket protocol (if implemented)
- Email template system

---

## Success Metrics

### Phase 2 Goals
- **Approval Cycle Time**: < 24 hours average
- **Message Response Time**: < 2 hours during business hours
- **Notification Delivery Rate**: > 99%
- **User Adoption**: > 70% of team using messaging
- **Dashboard Usage**: > 80% daily active users

### Performance Targets
- API response time: < 200ms for reads
- Message delivery: < 1 second
- Notification delivery: < 5 seconds
- Dashboard load time: < 2 seconds

---

## Risk Mitigation

### Technical Risks
1. **WebSocket Scalability**: Start with polling, add WebSocket later if needed
2. **Email Deliverability**: Use reputable email service, monitor bounce rates
3. **Database Performance**: Index optimization, query monitoring

### User Adoption Risks
1. **Change Resistance**: Gradual rollout, training sessions
2. **Notification Fatigue**: Smart defaults, easy preference management
3. **Complexity**: Progressive disclosure, contextual help

---

## Phase 2 Completion Checklist

- [ ] Messaging system deployed and functional
- [ ] Approval workflows working end-to-end
- [ ] Task dependencies implemented
- [ ] Critical path calculation accurate
- [ ] Notification preferences system
- [ ] Email notifications working
- [ ] Timeline view completed
- [ ] Enhanced dashboard deployed
- [ ] All tests passing
- [ ] Documentation updated
- [ ] User training completed
- [ ] Success metrics tracking active

---

## Next Steps After Phase 2

**Phase 3: Advanced Features** will include:
- Parallel approval workflows (already schema-ready)
- Digital signature system
- Virtual brainstorming board
- Scenario planning tools
- Mobile-optimized task execution

---

**Document Version**: 1.0  
**Last Updated**: October 10, 2025  
**Author**: GitHub Copilot  
**Status**: Ready for Implementation
