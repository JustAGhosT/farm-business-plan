# Farm Automation APIs - Implementation Guide

## Overview

This document provides comprehensive information about the 5 new automation APIs implemented for the Farm Business Plan application. All APIs are production-ready, fully tested, and reuse existing/free resources.

---

## 1. 🌦️ Weather Integration API

**Endpoint**: `/api/weather`  
**Method**: GET  
**Provider**: Open-Meteo (free, no API key required)

### Features
- Real-time current weather data
- 7-day forecast (configurable up to 16 days)
- Hourly data: temperature, precipitation, soil moisture, soil temperature
- Weather code translations (WMO standard)
- Farming-specific alerts generation

### Request Parameters
```
GET /api/weather?lat=-24.28&lng=28.42&forecast_days=7
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| lat | number | Yes | Latitude (-90 to 90) |
| lng | number | Yes | Longitude (-180 to 180) |
| forecast_days | number | No | Days to forecast (default: 7, max: 16) |

### Response Structure
```json
{
  "success": true,
  "data": {
    "location": {
      "latitude": -24.28,
      "longitude": 28.42,
      "elevation": 1200,
      "timezone": "Africa/Johannesburg"
    },
    "current": {
      "time": "2025-01-15T14:00",
      "temperature": 28.5,
      "humidity": 45,
      "precipitation": 0,
      "windSpeed": 12,
      "weatherDescription": "Clear sky"
    },
    "daily": [...],
    "hourly": {...},
    "alerts": [
      {
        "type": "frost",
        "severity": "warning",
        "message": "Frost risk: Low temperatures expected",
        "details": "Frost risk for next 2 day(s). Protect sensitive crops."
      }
    ]
  }
}
```

### Alert Types
- **Frost Warning**: Temperatures < 2°C (critical if < 0°C)
- **Heavy Rain**: >25mm per day
- **Drought**: 5+ consecutive days with <1mm rain
- **Wind**: >40 km/h sustained winds
- **Heat**: Temperatures >35°C
- **Optimal Conditions**: Ideal planting weather

### Integration Examples

**React/Next.js Component:**
```tsx
const fetchWeather = async (lat: number, lng: number) => {
  const response = await fetch(`/api/weather?lat=${lat}&lng=${lng}`)
  const data = await response.json()
  
  if (data.success) {
    const criticalAlerts = data.data.alerts.filter(a => a.severity === 'critical')
    if (criticalAlerts.length > 0) {
      // Show notifications
      criticalAlerts.forEach(alert => {
        showNotification(alert.message, alert.details)
      })
    }
  }
}
```

**Daily Weather Check (Cron Job):**
```javascript
// Run daily at 6 AM
const checkWeatherForAllFarms = async () => {
  const farms = await getFarmsWithCoordinates()
  
  for (const farm of farms) {
    const weather = await fetch(`/api/weather?lat=${farm.lat}&lng=${farm.lng}`)
    const data = await weather.json()
    
    // Send alerts to farmers
    if (data.data.alerts.length > 0) {
      await sendEmailAlert(farm.email, data.data.alerts)
    }
  }
}
```

---

## 2. 📅 Automated Task Scheduling API

**Endpoint**: `/api/task-scheduling`  
**Method**: POST

### Features
- Auto-generates tasks based on crop calendars
- Crop-specific schedules (dragon fruit, moringa, lucerne, vegetables)
- Pre-planting, planting, maintenance, and harvest tasks
- Priority levels and categories
- Customizable planting dates

### Request Body
```json
{
  "farm_plan_id": 123,
  "crop_plan_id": 456,  // Optional: generates for all crops if omitted
  "planting_date": "2025-02-01"  // Optional: uses current date if omitted
}
```

### Response
```json
{
  "success": true,
  "data": [
    {
      "id": 789,
      "title": "Soil Preparation - Dragon Fruit",
      "description": "Prepare 2.5 hectares for planting. Till soil, add compost, test pH.",
      "priority": "high",
      "category": "soil_preparation",
      "due_date": "2025-01-18T00:00:00Z",
      "status": "pending"
    },
    // ... more tasks
  ],
  "count": 25,
  "message": "Successfully generated 25 automated tasks"
}
```

### Task Categories
- `soil_preparation` - Pre-planting soil work
- `procurement` - Seed/material ordering
- `planting` - Planting activities
- `irrigation` - Water management
- `fertilization` - Nutrient application
- `pest_control` - Monitoring and treatment
- `maintenance` - Pruning, training, general care
- `harvest` - Harvest prep and execution
- `post_harvest` - Processing and storage

### Crop Calendars

**Dragon Fruit (180-day cycle)**
- Soil prep: 14 days before planting
- Seed order: 21 days before
- Irrigation: Every 7 days
- Fertilizer: Days 30, 90, 150
- Pruning: Days 60, 90
- Harvest: Day 180

**Moringa (60-day cycle)**
- Irrigation: Every 5 days
- Fertilizer: Days 20, 40
- Topping: Day 45
- Harvest: Day 60

**Lucerne (90-day cycle)**
- Irrigation: Every 10 days
- Fertilizer: Days 14, 60
- Harvest: Day 90

### Integration Example

```tsx
const generateTasksForNewCrop = async (farmPlanId: number, cropPlanId: number) => {
  const response = await fetch('/api/task-scheduling', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      farm_plan_id: farmPlanId,
      crop_plan_id: cropPlanId,
      planting_date: '2025-03-01'
    })
  })
  
  const result = await response.json()
  
  if (result.success) {
    console.log(`Generated ${result.count} tasks for your crop`)
    // Refresh task dashboard
    refreshTaskDashboard()
  }
}
```

---

## 3. 🔄 Crop Rotation Planning API

**Endpoint**: `/api/crop-rotation`  
**Method**: POST

### Features
- Multi-year rotation plans (3-5 years recommended)
- Soil health optimization (nitrogen-fixing crops)
- Pest & disease cycle disruption
- Market demand balancing
- Revenue projections
- Seasonal planning

### Request Body
```json
{
  "farm_plan_id": 123,
  "hectares": 2.5,
  "years": 3
}
```

### Response
```json
{
  "success": true,
  "data": {
    "farmPlanId": 123,
    "totalHectares": 2.5,
    "rotationYears": 3,
    "schedule": [
      {
        "year": 2025,
        "season": "Spring/Summer",
        "crop": "Legumes (e.g., Beans, Lucerne)",
        "hectares": 2.5,
        "benefits": "Nitrogen fixation, soil improvement",
        "soilImprovement": "high",
        "marketDemand": "medium",
        "estimatedRevenue": 112500,
        "plantingMonth": "September",
        "harvestMonth": "December",
        "notes": "Fixes nitrogen, improves soil structure"
      },
      // ... more years
    ],
    "principles": {
      "nutrientManagement": "Alternate between nitrogen-fixing and heavy-feeding crops",
      "pestControl": "Rotate crop families to disrupt pest and disease cycles",
      "soilHealth": "Include cover crops and green manure in rotation",
      "marketDiversity": "Balance high-value cash crops with stable staple crops"
    },
    "recommendations": [
      "Always include a nitrogen-fixing crop every 2-3 years to maintain soil fertility",
      // ... more recommendations
    ]
  }
}
```

### Rotation Sequences

**Default 4-Year Sequence:**
1. **Legumes** (Beans, Lucerne) - Nitrogen fixation
2. **Leafy Vegetables** (Spinach, Lettuce) - Utilizes nitrogen
3. **Root Crops** (Carrots, Beetroot) - Different nutrient profile
4. **Fruiting Crops** (Tomatoes, Peppers) - High value

**Perennial Crops:**
- Dragon Fruit: 3-5 year productive cycle
- Moringa: Intensive rotation with annual harvests

### Integration Example

```tsx
const planCropRotation = async (farmPlanId: number) => {
  const response = await fetch('/api/crop-rotation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      farm_plan_id: farmPlanId,
      hectares: 5.0,
      years: 4
    })
  })
  
  const plan = await response.json()
  
  if (plan.success) {
    // Display rotation calendar
    displayRotationCalendar(plan.data.schedule)
    
    // Show estimated revenue over 4 years
    const totalRevenue = plan.data.schedule.reduce(
      (sum, year) => sum + year.estimatedRevenue, 0
    )
    console.log(`Projected 4-year revenue: R${totalRevenue}`)
  }
}
```

---

## 4. 💰 Expense Tracking API

**Endpoint**: `/api/expenses`  
**Methods**: GET, POST, PATCH, DELETE

### Features
- 15 expense categories
- Date range filtering
- Automatic summaries (total, by category, by month)
- Category percentage analysis
- Receipt URL storage
- Vendor tracking

### Expense Categories
1. Seeds & Seedlings
2. Fertilizer & Amendments
3. Pesticides & Herbicides
4. Irrigation
5. Equipment & Tools
6. Labor
7. Fuel & Energy
8. Maintenance & Repairs
9. Transport & Logistics
10. Packaging
11. Marketing & Sales
12. Insurance
13. Utilities
14. Professional Services
15. Other

### GET Request
```
GET /api/expenses?farm_plan_id=123&category=seeds&start_date=2025-01-01&end_date=2025-12-31
```

### POST Request
```json
{
  "farm_plan_id": 123,
  "crop_plan_id": 456,
  "category": "fertilizer",
  "description": "NPK fertilizer for dragon fruit",
  "amount": 2500.00,
  "expense_date": "2025-01-15",
  "payment_method": "bank_transfer",
  "vendor": "AgriSupplies Ltd",
  "receipt_url": "https://storage.example.com/receipt-123.pdf"
}
```

### Response with Summary
```json
{
  "success": true,
  "data": [...],
  "count": 45,
  "summary": {
    "total": 125000,
    "byCategory": {
      "fertilizer": 25000,
      "seeds": 15000,
      "labor": 40000
    },
    "byMonth": {
      "2025-01": 35000,
      "2025-02": 28000
    },
    "categoryPercentages": {
      "fertilizer": "20.00",
      "seeds": "12.00",
      "labor": "32.00"
    }
  }
}
```

### Integration Example

**Expense Dashboard:**
```tsx
const ExpenseDashboard = ({ farmPlanId }) => {
  const [expenses, setExpenses] = useState([])
  const [summary, setSummary] = useState(null)
  
  useEffect(() => {
    fetchExpenses()
  }, [farmPlanId])
  
  const fetchExpenses = async () => {
    const response = await fetch(`/api/expenses?farm_plan_id=${farmPlanId}`)
    const data = await response.json()
    
    setExpenses(data.data)
    setSummary(data.summary)
  }
  
  const addExpense = async (expenseData) => {
    await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expenseData)
    })
    fetchExpenses() // Refresh
  }
  
  return (
    <div>
      <h2>Total Expenses: R{summary?.total.toLocaleString()}</h2>
      <PieChart data={summary?.byCategory} />
      <ExpenseList expenses={expenses} />
    </div>
  )
}
```

---

## 5. 📦 Inventory Management API

**Endpoint**: `/api/inventory`  
**Methods**: GET, POST, PATCH, DELETE

### Features
- Item tracking by category
- Quantity management (add/subtract)
- Reorder level alerts
- Stock status indicators
- Unit cost tracking
- Supplier information

### Stock Status Levels
- `healthy` - Above 150% of reorder level
- `warning` - Between 100-150% of reorder level
- `low_stock` - At or below reorder level
- `out_of_stock` - Quantity is 0

### GET Request
```
GET /api/inventory?farm_plan_id=123&low_stock=true
```

### Response
```json
{
  "success": true,
  "data": [
    {
      "id": 789,
      "item_name": "Dragon Fruit Seeds - Premium",
      "category": "seeds",
      "quantity": 150,
      "unit": "seeds",
      "reorder_level": 100,
      "unit_cost": 15.00,
      "supplier": "DragonSeed Co",
      "isLowStock": false,
      "stockStatus": "healthy"
    }
  ],
  "alerts": {
    "lowStock": 3,
    "critical": 1
  }
}
```

### POST Request
```json
{
  "farm_plan_id": 123,
  "item_name": "NPK Fertilizer 10-10-10",
  "category": "fertilizer",
  "quantity": 500,
  "unit": "kg",
  "reorder_level": 100,
  "unit_cost": 12.50,
  "supplier": "FertCo Ltd",
  "notes": "Bulk purchase discount available"
}
```

### PATCH Request (Add/Subtract Quantity)
```json
{
  "id": 789,
  "action": "subtract",
  "quantity": 50
}
```

### Categories
- seeds
- fertilizer
- pesticides
- equipment
- tools
- fuel
- packaging
- other

### Integration Example

**Inventory Dashboard with Alerts:**
```tsx
const InventoryManagement = ({ farmPlanId }) => {
  const [inventory, setInventory] = useState([])
  const [alerts, setAlerts] = useState({ lowStock: 0, critical: 0 })
  
  useEffect(() => {
    fetchInventory()
  }, [farmPlanId])
  
  const fetchInventory = async () => {
    const response = await fetch(`/api/inventory?farm_plan_id=${farmPlanId}`)
    const data = await response.json()
    
    setInventory(data.data)
    setAlerts(data.alerts)
  }
  
  const useItem = async (itemId, quantity) => {
    const response = await fetch('/api/inventory', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: itemId,
        action: 'subtract',
        quantity: quantity
      })
    })
    
    const result = await response.json()
    
    if (result.alert) {
      showAlert(result.alert.message)
    }
    
    fetchInventory() // Refresh
  }
  
  return (
    <div>
      {alerts.lowStock > 0 && (
        <Alert>
          {alerts.lowStock} item(s) need reordering
          ({alerts.critical} critical)
        </Alert>
      )}
      <InventoryTable items={inventory} onUse={useItem} />
    </div>
  )
}
```

---

## Database Schema

Run the migrations in `db/schema_updates.sql`:

```sql
-- Expenses table
CREATE TABLE expenses (
  id SERIAL PRIMARY KEY,
  farm_plan_id INTEGER NOT NULL REFERENCES farm_plans(id),
  crop_plan_id INTEGER REFERENCES crop_plans(id),
  category VARCHAR(50) NOT NULL,
  description TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  expense_date DATE NOT NULL,
  payment_method VARCHAR(50),
  vendor VARCHAR(255),
  receipt_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory table
CREATE TABLE inventory (
  id SERIAL PRIMARY KEY,
  farm_plan_id INTEGER NOT NULL REFERENCES farm_plans(id),
  item_name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
  unit VARCHAR(50) NOT NULL DEFAULT 'units',
  reorder_level DECIMAL(10, 2) DEFAULT 0,
  unit_cost DECIMAL(10, 2) DEFAULT 0,
  supplier VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Testing

All APIs have been tested and build successfully. To test locally:

```bash
# Start development server
npm run dev

# Test weather API
curl "http://localhost:3000/api/weather?lat=-24.28&lng=28.42"

# Test task scheduling
curl -X POST http://localhost:3000/api/task-scheduling \
  -H "Content-Type: application/json" \
  -d '{"farm_plan_id":1,"planting_date":"2025-02-01"}'

# Test crop rotation
curl -X POST http://localhost:3000/api/crop-rotation \
  -H "Content-Type: application/json" \
  -d '{"farm_plan_id":1,"hectares":2.5,"years":3}'
```

---

## Performance Considerations

- **Weather API**: Cache responses for 1 hour to reduce external API calls
- **Task Scheduling**: Batch insert for better performance
- **Crop Rotation**: Calculations done in memory, no DB writes
- **Expenses/Inventory**: Indexed on farm_plan_id for fast queries

---

## Future Enhancements

1. **Weather API**:
   - Historical weather data analysis
   - Weather-based irrigation recommendations
   - Integration with smart sensors

2. **Task Scheduling**:
   - Email/SMS reminders
   - Calendar integration (Google Calendar, iCal)
   - Mobile push notifications

3. **Crop Rotation**:
   - Machine learning for optimal sequences
   - Market price integration
   - Soil test result integration

4. **Expense Tracking**:
   - OCR for receipt scanning
   - Bank account integration
   - Budget alerts and forecasting

5. **Inventory**:
   - Barcode/QR code scanning
   - Automatic reordering
   - Supplier price comparison

---

## Support

For issues or questions:
- GitHub Issues: https://github.com/JustAGhosT/farm-business-plan/issues
- Documentation: See AI_WIZARD_ENHANCEMENTS.md

---

## License

MIT License - See LICENSE file
