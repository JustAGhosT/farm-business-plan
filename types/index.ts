// Core business plan types
export interface FarmPlan {
  id: string
  name: string
  location: string
  farmSize: number // in hectares
  crops: CropPlan[]
  createdAt: Date
  updatedAt: Date
}

export interface CropPlan {
  id: string
  cropName: string
  variety?: string
  plantingArea: number // in hectares or square meters
  plantingDate?: Date
  harvestDate?: Date
  expectedYield: number
  yieldUnit: string
  financials: CropFinancials
  technicalSpecs: TechnicalSpecifications
  status: 'planned' | 'planted' | 'growing' | 'harvested'
}

export interface CropFinancials {
  initialInvestment: number
  operatingCosts: OperatingCosts
  projectedRevenue: RevenueProjection[]
  breakEvenPoint?: number // in months or harvest cycles
}

export interface OperatingCosts {
  fixed: FixedCosts
  variable: VariableCosts
  totalMonthly: number
  totalAnnual: number
}

export interface FixedCosts {
  utilities: number
  labor: number
  maintenance: number
  insurance: number
  other: { [key: string]: number }
}

export interface VariableCosts {
  seeds: number
  fertilizer: number
  pesticides: number
  water: number
  packaging: number
  other: { [key: string]: number }
}

export interface RevenueProjection {
  year: number
  expectedProduction: number
  pricePerUnit: number
  totalRevenue: number
  netProfit: number
}

export interface TechnicalSpecifications {
  soilType?: string
  phLevel?: number
  irrigationType?: string
  waterRequirement?: number // liters per day/week
  spacing?: string
  supportStructure?: string
  notes?: string
}

// Dashboard and operations types
export interface Task {
  id: string
  title: string
  description: string
  cropId?: string
  dueDate: Date
  status: 'pending' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assignedTo?: string
  assignedBy?: string
  createdBy: string
  createdAt?: Date
  completedAt?: Date
  estimatedDuration?: number // in hours
  actualDuration?: number // in hours
  dependencies?: string[] // IDs of tasks this depends on
  subtasks?: SubTask[]
  tags?: string[]
  requiresApproval?: boolean
  approvedBy?: string
  verificationPhotos?: string[] // URLs to photos
  notes?: string
  recurrence?: RecurrencePattern
}

export interface Activity {
  id: string
  date: Date
  type: 'planting' | 'irrigation' | 'fertilization' | 'pest-control' | 'harvest' | 'maintenance' | 'other'
  cropId?: string
  description: string
  cost?: number
  notes?: string
}

// Financial calculator types
export interface InvestmentCalculation {
  totalInvestment: number
  fundingSources: FundingSource[]
  roi: number // percentage
  paybackPeriod: number // in months
}

export interface FundingSource {
  name: string
  amount: number
  percentage: number
  terms?: string
}

export interface BreakEvenAnalysis {
  fixedCosts: number
  variableCostPerUnit: number
  pricePerUnit: number
  breakEvenUnits: number
  breakEvenRevenue: number
}

// Template library types
export interface CropTemplate {
  id: string
  name: string
  category: 'fruits' | 'vegetables' | 'grains' | 'herbs' | 'forage' | 'other'
  description: string
  growingPeriod: number // in days
  waterRequirements: 'low' | 'medium' | 'high'
  sunRequirements: 'full-sun' | 'partial-shade' | 'shade'
  temperatureRange: {
    min: number
    max: number
  }
  commonVarieties: string[]
  typicalYield: {
    amount: number
    unit: string
    perArea: string
  }
  averagePricePerUnit?: number
  technicalNotes?: string
}

// Market analysis types
export interface MarketAnalysis {
  cropName: string
  localDemand: 'low' | 'medium' | 'high'
  competition: 'low' | 'medium' | 'high'
  averagePrice: number
  priceUnit: string
  seasonality?: string
  targetCustomers: string[]
  distributionChannels: string[]
}

// Risk assessment types
export interface RiskAssessment {
  id: string
  category: 'weather' | 'market' | 'pests' | 'financial' | 'operational' | 'regulatory'
  description: string
  likelihood: 'low' | 'medium' | 'high'
  impact: 'low' | 'medium' | 'high'
  mitigation: string
  status: 'identified' | 'mitigated' | 'monitoring'
}

// Form data types
export interface PlanFormData {
  basicInfo: {
    farmName: string
    location: string
    farmSize: number
    ownerName: string
    contactInfo: string
  }
  climateData: {
    averageTemp: { summer: number; winter: number }
    rainfall: number
    frostRisk: boolean
    growingSeasonLength: number
  }
  soilData: {
    type: string
    phLevel: number
    drainage: 'poor' | 'moderate' | 'good'
    fertility: 'low' | 'medium' | 'high'
  }
  waterResources: {
    source: string
    availability: 'limited' | 'adequate' | 'abundant'
    quality: 'poor' | 'good' | 'excellent'
  }
}

// Export/PDF types
export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv'
  sections: string[]
  includeCharts: boolean
  includeFinancials: boolean
}

// Collaboration types
export interface ApprovalWorkflow {
  id: string
  name: string
  description?: string
  type: 'sequential' | 'parallel'
  stages: ApprovalStage[]
  targetType: 'farm-plan' | 'crop-plan' | 'financial-report' | 'task' | 'document'
  targetId: string
  status: 'pending' | 'in-progress' | 'approved' | 'rejected' | 'cancelled'
  createdBy: string
  createdAt: Date
  completedAt?: Date
}

export interface ApprovalStage {
  id: string
  order: number
  name: string
  approvers: string[] // user IDs
  requiredApprovals: number // for parallel: how many must approve
  status: 'pending' | 'approved' | 'rejected'
  approvals: Approval[]
  deadline?: Date
}

export interface Approval {
  userId: string
  userName: string
  status: 'pending' | 'approved' | 'rejected'
  timestamp?: Date
  signature?: string // digital signature
  comments?: string
}

export interface Collaboration {
  id: string
  userId: string
  userName: string
  targetType: 'farm-plan' | 'crop-plan' | 'task' | 'document'
  targetId: string
  action: 'viewing' | 'editing' | 'commenting'
  section?: string // specific section being worked on
  lastActivity: Date
  isOnline: boolean
}

export interface Permission {
  userId: string
  role: 'owner' | 'manager' | 'agronomist' | 'consultant' | 'viewer' | 'custom'
  canView: boolean
  canEdit: boolean
  canDelete: boolean
  canApprove: boolean
  canInvite: boolean
  customPermissions?: Record<string, boolean>
}

export interface Message {
  id: string
  threadId: string
  senderId: string
  senderName: string
  recipientIds: string[]
  content: string
  contextType?: 'farm-plan' | 'crop-plan' | 'task' | 'document' | 'general'
  contextId?: string
  contextSection?: string
  attachments?: MessageAttachment[]
  mentions: string[] // user IDs mentioned with @
  timestamp: Date
  isRead: boolean
  parentMessageId?: string // for threaded discussions
}

export interface MessageAttachment {
  id: string
  name: string
  type: string
  size: number
  url: string
}

export interface ChangeLog {
  id: string
  targetType: 'farm-plan' | 'crop-plan' | 'task' | 'financial-data' | 'document'
  targetId: string
  userId: string
  userName: string
  action: 'created' | 'updated' | 'deleted' | 'approved' | 'rejected'
  field?: string
  oldValue?: string
  newValue?: string
  timestamp: Date
  description: string
}

export interface Delegation {
  id: string
  delegatorId: string
  delegatorName: string
  delegateId: string
  delegateName: string
  startDate: Date
  endDate: Date
  permissions: Permission
  reason?: string
  status: 'active' | 'completed' | 'cancelled'
}

export interface TaskDependency {
  id: string
  taskId: string
  dependsOnTaskId: string
  type: 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish'
  lag?: number // in days, can be negative for lead time
}

export interface TaskTemplate {
  id: string
  name: string
  description: string
  category: 'planting' | 'irrigation' | 'fertilization' | 'pest-control' | 'harvest' | 'maintenance' | 'general'
  subtasks: SubTask[]
  estimatedDuration: number // in hours
  recurrence?: RecurrencePattern
  assignmentRule?: 'role-based' | 'round-robin' | 'skill-based' | 'manual'
  defaultAssignee?: string
}

export interface SubTask {
  id: string
  title: string
  description?: string
  assignedTo?: string
  status: 'pending' | 'in-progress' | 'completed'
  order: number
  estimatedDuration?: number // in hours
  requiresVerification: boolean
  verificationCriteria?: string
}

export interface RecurrencePattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'seasonal' | 'custom'
  interval: number // every N days/weeks/months
  daysOfWeek?: number[] // 0-6, Sunday=0
  dayOfMonth?: number
  startDate: Date
  endDate?: Date
  weatherTrigger?: WeatherTrigger
}

export interface WeatherTrigger {
  condition: 'temperature-below' | 'temperature-above' | 'frost-warning' | 'rain-expected' | 'drought-conditions'
  threshold?: number
  enabled: boolean
}

export interface Notification {
  id: string
  userId: string
  type: 'task-assigned' | 'approval-requested' | 'approval-completed' | 'mention' | 'deadline-approaching' | 'workflow-update' | 'message' | 'alert'
  title: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  contextType?: string
  contextId?: string
  isRead: boolean
  createdAt: Date
  channels: ('in-app' | 'email' | 'sms' | 'push')[]
  actionUrl?: string
}

export interface BrainstormSession {
  id: string
  title: string
  description?: string
  farmPlanId?: string
  creatorId: string
  participants: string[] // user IDs
  status: 'active' | 'completed' | 'archived'
  ideas: Idea[]
  createdAt: Date
  expiresAt?: Date
}

export interface Idea {
  id: string
  sessionId: string
  authorId: string
  authorName: string
  title: string
  description: string
  category?: string
  votes: Vote[]
  comments: Comment[]
  status: 'proposed' | 'under-discussion' | 'approved' | 'rejected' | 'implemented'
  createdAt: Date
  tags: string[]
}

export interface Vote {
  userId: string
  userName: string
  value: number // e.g., 1 for upvote, -1 for downvote, or 1-5 for rating
  timestamp: Date
}

export interface Comment {
  id: string
  authorId: string
  authorName: string
  content: string
  timestamp: Date
  parentCommentId?: string
  attachments?: MessageAttachment[]
}

export interface Scenario {
  id: string
  farmPlanId: string
  name: string
  description: string
  creatorId: string
  crops: CropPlan[]
  financials: CropFinancials
  risks: RiskAssessment[]
  votes: Vote[]
  comments: Comment[]
  status: 'draft' | 'proposed' | 'approved' | 'rejected'
  createdAt: Date
}

export interface KnowledgeArticle {
  id: string
  title: string
  content: string
  authorId: string
  authorName: string
  category: 'lesson-learned' | 'best-practice' | 'troubleshooting' | 'how-to' | 'reference'
  tags: string[]
  relatedCrops?: string[]
  relatedTasks?: string[]
  attachments?: MessageAttachment[]
  votes: Vote[]
  comments: Comment[]
  views: number
  createdAt: Date
  updatedAt: Date
}

export interface DocumentAnnotation {
  id: string
  documentId: string
  documentType: 'farm-plan' | 'crop-plan' | 'financial-report' | 'document'
  section: string
  authorId: string
  authorName: string
  type: 'comment' | 'suggestion' | 'question' | 'highlight'
  content: string
  suggestedChange?: string
  status: 'open' | 'resolved' | 'accepted' | 'rejected'
  replies: Comment[]
  createdAt: Date
  resolvedAt?: Date
  resolvedBy?: string
}

export interface AuditReport {
  id: string
  title: string
  startDate: Date
  endDate: Date
  targetType: 'farm-plan' | 'all-activities' | 'user' | 'crop-plan'
  targetId?: string
  changes: ChangeLog[]
  approvals: Approval[]
  messages: Message[]
  generatedAt: Date
  generatedBy: string
  format: 'pdf' | 'excel' | 'json'
}
