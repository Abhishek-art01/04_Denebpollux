export const CLIENTS = [
  {
    id: "agilent",
    name: "Agilent",
    subtitle: "Billing Dashboard",
    defaultDashboard: "pnl-summary",
    noDataMessage:
      "Go to Upload Data to add your TripData, ChildCab, BackupCab, MaintenanceSecurity, SpotRental, and AdditionalCharges sheets for a month. Each sheet must include a Month column.",
    dashboards: [
      { key: "pnl-summary", label: "PNL / MIS Summary" },
      { key: "revenue-summary", label: "Detailed Revenue Summary" },
      { key: "revenue-mix", label: "Revenue Mix by Source" },
      { key: "vehicle-breakup", label: "Vehicle-wise Revenue Breakup" },
      { key: "ownership-breakup", label: "Revenue by Ownership Type" },
      { key: "vehicle-revenue-summary", label: "Vehicle Revenue Summary" },
    ],
    sheets: [
      {
        key: "tripData",
        title: "TripData",
        description:
          "Plan ID, Roster Employee's, Shift, Direction, Shift Date, VehicleNumber, Ownership, Driver Name, Make, Zone Name, Billing Zone, TripCost, MCD, HR Tax, Raj. & UP Tax, FBD/Bijwasan/Manesar Toll, Taxable Amount, Toll, Remarks, Month.",
      },
      {
        key: "childCab",
        title: "ChildCab",
        description:
          "S. No, Date, Employee Name, Time Period, Chauffer Name, VehicleNumber, Ownership, TripCost, Location, Month.",
      },
      {
        key: "backupCab",
        title: "BackupCab",
        description:
          "Date, Time Period, Time Period 2, VehicleNumber, Ownership, TripCost, Cab Details, Location, Remark, Month.",
      },
      {
        key: "maintenanceSecurity",
        title: "MaintenanceSecurity",
        description:
          "Dated, Shift time, VehicleNumber, Ownership, TripCost, Make, Driver, Location, Order, Month.",
      },
      {
        key: "spotRental",
        title: "SpotRental",
        description:
          "Start Date, End Date, Status, Duty Id, VehicleNumber, Ownership, Total Billing Items Amount, Without GST Total Amount, Invoice Amount, and other duty/tax columns, plus Month.",
      },
      {
        key: "additionalCharges",
        title: "AdditionalCharges",
        description:
          "Description, Taxable Amt., GST@18%, Total Amt., Month. Description should mention Manpower / Technology / Dashcam / Razorpay for auto-categorization.",
      },
    ],
  },
  {
    id: "airindia",
    name: "Air India",
    subtitle: "Billing Dashboard",
    defaultDashboard: "pnl-summary",
    noDataMessage:
      "Go to Upload Data to add your Trip_Data_TERMINAL-3, Trip_Data_AIAA, SUNDRIES, and penalty_VehicleWise sheets for a month. Each sheet must include Month and Ownership columns.",
    dashboards: [
      { key: "pnl-summary", label: "PNL / MIS Summary" },
      { key: "revenue-summary", label: "Detailed Revenue Summary" },
      { key: "vehicle-revenue-summary", label: "Vehicle Revenue Summary" },
    ],
    sheets: [
      {
        key: "tripDataTerminal3",
        title: "Trip_Data_TERMINAL-3",
        description:
          "SR_NO, TRIP_TYPE, STAFF_COUNT, BILL_MAKE, DATE, MONTH, DUTY_TYPE, DUTY_TYPE2, UNA, ROUTE_NO, TRIP_ID, EMPLOYEE_ID, TEAM_TYPE, GENDER, EMPLOYEE_NAME, EMPLOYEE_ADDRESS, LOCATION, BA_TIME, ETD_TIME, CABNO., VEHICLE_NUMBER, OWNERSHIP, CAB_TYPE, USE_KM, CLUBBING_KM, TOTAL_KM, ONE_SIDE, TWO_SIDE, CLUB, TOTAL, BB, PASS_KM, DIFF, MARSHALL, REPORTING, VENDOR, TOLL_NAME, TOLL_AMOUNT, TRIP_COST, TAXABLE_AMOUNT.",
      },
      {
        key: "tripDataAIAA",
        title: "Trip_Data_AIAA",
        description:
          "CAB NO, Cab Type, TripCost, toll amount, Ownership, Month, and the AIAA trip columns.",
      },
      {
        key: "sundries",
        title: "SUNDRIES",
        description:
          "Vehicle No., VEH. NO., MCD, Ownership, Month, and sundry billing columns.",
      },
      {
        key: "penaltyVehicleWise",
        title: "penalty_VehicleWise",
        description:
          "Vehicle, Amount, Entity (T-3 or AIAA), Ownership, Month, and penalty columns.",
      },
    ],
  },
];

export const DEFAULT_CLIENT_ID = "agilent";

export function getClientConfig(clientId) {
  return CLIENTS.find((client) => client.id === clientId) || CLIENTS[0];
}
