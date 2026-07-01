const CLIENT_CONFIG = {
  agilent: {
    schema: "public",
    manualTable: "manual_inputs",
    expenseTable: "expenses",
    monthTables: [
      "agilent_trip_data",
      "agilent_child_cab",
      "agilent_backup_cab",
      "agilent_maintenance_security",
      "agilent_spot_rental",
      "agilent_additional_charges",
    ],
    manualDefaults: { amount_recovered_from_employees: 0 },
    expenseDefaults: {
      fuel: 0,
      vehicle_maintenance_cost: 0,
      drivers_salaries: 0,
      vehicle_emi: 0,
      vendor_payment: 0,
      gst: 0,
      employee_salary: 0,
    },
  },
  airindia: {
    schema: "public",
    manualTable: "airindia_manual_inputs",
    expenseTable: "airindia_expenses",
    monthTables: [
      "airindia_trip_data_terminal3",
      "airindia_trip_data_aiaa",
      "airindia_sundries",
      "airindia_penalty_vehicle_wise",
    ],
    manualDefaults: { employee_penalty_t3: 0, employee_penalty_aiaa: 0 },
    expenseDefaults: {
      fuel: 0,
      vehicle_maintenance_cost: 0,
      drivers_salaries: 0,
      vehicle_emi: 0,
      razorpay_transaction_fee: 0,
      vendor_payment: 0,
      employee_salary: 0,
      gst: 0,
    },
  },
};

const REPORT_RPC = {
  agilent: {
    "revenue-summary": "billing_report_agilent_revenue_summary",
    "revenue-mix": "billing_report_agilent_revenue_mix",
    "vehicle-wise-breakup": "billing_report_agilent_vehicle_wise_breakup",
    "ownership-breakup": "billing_report_agilent_ownership_breakup",
    "vehicle-revenue-summary": "billing_report_agilent_vehicle_revenue_summary",
    "pnl-summary": "billing_report_agilent_pnl_summary",
  },
  airindia: {
    "revenue-summary": "billing_report_airindia_revenue_summary",
    "vehicle-revenue-summary": "billing_report_airindia_vehicle_revenue_summary",
    "pnl-summary": "billing_report_airindia_pnl_summary",
  },
};

const SHEET_SPECS = {
  agilent: {
    "trip-data": {
      sheet: "TripData",
      table: "agilent_trip_data",
      requiredMonthHeaders: ["Month"],
      requiredFields: ["vehicle_number"],
      numericFields: ["trip_cost", "mcd", "hr_tax", "raj_up_tax", "fbd_toll", "bijwasan_toll", "manesar_toll", "taxable_amount", "toll"],
      dateFields: ["shift_date"],
      columns: {
        "Plan ID": "plan_id",
        "Roster Employee's": "roster_employee",
        Shift: "shift",
        Direction: "direction",
        "Shift Date": "shift_date",
        VehicleNumber: "vehicle_number",
        Ownership: "ownership",
        "Driver Name": "driver_name",
        Make: "make",
        "Zone Name": "zone_name",
        "Biiling Zone": "billing_zone",
        TripCost: "trip_cost",
        MCD: "mcd",
        "HR Tax": "hr_tax",
        "Raj. & UP Tax": "raj_up_tax",
        "FBD Toll": "fbd_toll",
        "Bijwasan Toll": "bijwasan_toll",
        "Manesar Toll": "manesar_toll",
        "Taxable Amount": "taxable_amount",
        Toll: "toll",
        Remarks: "remarks",
      },
    },
    "child-cab": {
      sheet: "ChildCab",
      table: "agilent_child_cab",
      requiredMonthHeaders: ["Month"],
      requiredFields: ["vehicle_number"],
      numericFields: ["trip_cost"],
      dateFields: ["date"],
      columns: {
        "S. No": "s_no",
        Date: "date",
        "Employee Name": "employee_name",
        "Time Period": "time_period",
        "Chauffer Name": "chauffer_name",
        VehicleNumber: "vehicle_number",
        ownership: "ownership",
        TripCost: "trip_cost",
        Location: "location",
      },
    },
    "backup-cab": {
      sheet: "BackupCab",
      table: "agilent_backup_cab",
      requiredMonthHeaders: ["Month"],
      requiredFields: ["vehicle_number"],
      numericFields: ["trip_cost"],
      dateFields: ["date"],
      columns: {
        Date: "date",
        "Time Period": "time_period",
        "Time Period 2": "time_period_2",
        VehicleNumber: "vehicle_number",
        Ownership: "ownership",
        Tripcost: "trip_cost",
        "Cab Details": "cab_details",
        Location: "location",
        Remark: "remark",
      },
    },
    "maintenance-security": {
      sheet: "MaintenanceSecurity",
      table: "agilent_maintenance_security",
      requiredMonthHeaders: ["Month"],
      requiredFields: ["vehicle_number"],
      numericFields: ["trip_cost"],
      dateFields: ["dated"],
      columns: {
        Dated: "dated",
        "Shift time": "shift_time",
        VehicleNumber: "vehicle_number",
        Ownership: "ownership",
        TripCost: "trip_cost",
        Make: "make",
        Driver: "driver",
        Location: "location",
        Order: "order",
      },
    },
    "spot-rental": {
      sheet: "SpotRental",
      table: "agilent_spot_rental",
      requiredMonthHeaders: ["Month"],
      requiredFields: ["vehicle_number"],
      numericFields: [
        "base_price", "total_hours", "extra_hours", "customer_extra_time_cost_per_hr", "total_km",
        "extra_km", "customer_extra_km_cost_per_km", "all_base_price_total", "extra_hours_cost",
        "extra_km_charge", "chargeable_outstation_allowance", "chargeable_outstation_overnight_allowance",
        "chargeable_night_allowance", "chargeable_early_start_allowance", "garage_end_speedo_km",
        "garage_start_speedo_km", "state_tax_nt", "mcd_nt", "toll_nt", "parking_nt", "guide_charge",
        "miscellaneous", "state_tax", "toll", "parking", "mcd", "total_billing_items_amount",
        "without_gst_total_amount", "vehicle_revenue", "igst_18_invoice", "sgst_2_5_invoice",
        "cgst_2_5_invoice", "igst_5_invoice", "sgst_9_invoice", "cgst_9_invoice", "invoice_tax_amount",
        "invoice_amount",
      ],
      dateFields: ["start_date", "end_date", "invoice_date"],
      columns: {
        "Start Date": "start_date",
        "End Date": "end_date",
        Status: "status",
        "Duty Id": "duty_id",
        "Customer Group": "customer_group",
        VehicleNumber: "vehicle_number",
        Ownership: "ownership",
        "Vehicle Name": "vehicle_name",
        "Duty Type": "duty_type",
        "Base Price": "base_price",
        "Total Hours": "total_hours",
        "Extra Hours": "extra_hours",
        "Customer Extra Time cost/HR": "customer_extra_time_cost_per_hr",
        "Total KM": "total_km",
        "Extra KM": "extra_km",
        "Customer Extra KM cost/KM": "customer_extra_km_cost_per_km",
        "All Base  Price Total": "all_base_price_total",
        "Extra Hours Cost": "extra_hours_cost",
        "Extra KM Charge": "extra_km_charge",
        "Chargeable Outstation allowance": "chargeable_outstation_allowance",
        "Chargeable Outstation overnight allowance": "chargeable_outstation_overnight_allowance",
        "Chargeable Night allowance": "chargeable_night_allowance",
        "Chargeable Early start allowance": "chargeable_early_start_allowance",
        "Garage End Speedo KM": "garage_end_speedo_km",
        "Garage Start Speedo KM": "garage_start_speedo_km",
        "State Tax (N.T)": "state_tax_nt",
        "MCD (N.T)": "mcd_nt",
        "Toll (N.T)": "toll_nt",
        "Parking (N.T)": "parking_nt",
        "Guide Charge": "guide_charge",
        Miscellaneous: "miscellaneous",
        "State Tax": "state_tax",
        Toll: "toll",
        Parking: "parking",
        MCD: "mcd",
        "Total Billing Items Amount": "total_billing_items_amount",
        "Without GST Total Amount": "without_gst_total_amount",
        "Vehicle Revenue": "vehicle_revenue",
        "Invoice Date": "invoice_date",
        "IGST 18 % - Invoice": "igst_18_invoice",
        "SGST2.5% - Invoice": "sgst_2_5_invoice",
        "CGST 2.5% - Invoice": "cgst_2_5_invoice",
        "IGST 5% - Invoice": "igst_5_invoice",
        "SGST 9% - Invoice": "sgst_9_invoice",
        "CGST 9% - Invoice": "cgst_9_invoice",
        "Invoice Tax Amount": "invoice_tax_amount",
        "Invoice Amount": "invoice_amount",
        Labels: "labels",
        "Dispatch Center": "dispatch_center",
        "From city": "from_city",
        "Reporting Address": "reporting_address",
        "To city": "to_city",
        "Drop Address": "drop_address",
        Source: "source",
      },
    },
    "additional-charges": {
      sheet: "AdditionalCharges",
      table: "agilent_additional_charges",
      requiredMonthHeaders: ["Month"],
      requiredFields: ["description"],
      numericFields: ["taxable_amt", "gst_18_percent", "total_amt"],
      dateFields: [],
      columns: {
        Description: "description",
        "Taxable Amt.": "taxable_amt",
        "GST@18%": "gst_18_percent",
        "Total Amt.": "total_amt",
      },
    },
  },
  airindia: {
    "trip-data-terminal3": {
      sheet: "Trip_Data_TERMINAL-3",
      table: "airindia_trip_data_terminal3",
      requiredMonthHeaders: ["Month", "MONTH"],
      requiredFields: ["cab_no"],
      numericFields: ["staff_count", "use_km", "clubbing_km", "total_km", "total", "diff", "pass_km", "toll_amount", "trip_cost", "taxable_amount"],
      dateFields: ["date"],
      columns: {
        SR_NO: "sr_no",
        TRIP_TYPE: "trip_type",
        STAFF_COUNT: "staff_count",
        BILL_MAKE: "bill_make",
        DATE: "date",
        DUTY_TYPE: "duty_type",
        DUTY_TYPE2: "duty_type2",
        UNA: "una",
        ROUTE_NO: "route_no",
        TRIP_ID: "trip_id",
        EMPLOYEE_ID: "employee_id",
        TEAM_TYPE: "team_type",
        GENDER: "gender",
        EMPLOYEE_NAME: "employee_name",
        EMPLOYEE_ADDRESS: "employee_address",
        LOCATION: "location",
        BA_TIME: "ba_time",
        ETD_TIME: "etd_time",
        CAB_NO: "cab_no",
        VEHICLE_NUMBER: "vehicle_number",
        OWNERSHIP: "ownership",
        CAB_TYPE: "cab_type",
        USE_KM: "use_km",
        CLUBBING_KM: "clubbing_km",
        TOTAL_KM: "total_km",
        ONE_SIDE: "one_side",
        TWO_SIDE: "two_side",
        CLUB: "club",
        TOTAL: "total",
        BB: "bb",
        PASS_KM: "pass_km",
        DIFF: "diff",
        MARSHALL: "marshall",
        REPORTING: "reporting",
        VENDOR: "vendor",
        TOLL_NAME: "toll_name",
        TOLL_AMOUNT: "toll_amount",
        TRIP_COST: "trip_cost",
        TAXABLE_AMOUNT: "taxable_amount",
      },
    },
    "trip-data-aiaa": {
      sheet: "Trip_Data_AIAA",
      table: "airindia_trip_data_aiaa",
      requiredMonthHeaders: ["Month", "MONTH"],
      requiredFields: ["una", "cab_no"],
      numericFields: ["staff", "bill_count", "claim", "pass_amount", "guard_cost", "toll_amount", "trip_cost", "taxable_amount", "total"],
      dateFields: ["date"],
      columns: {
        SR_NO: "sr_no",
        STAFF: "staff",
        BILL_COUNT: "bill_count",
        DATE: "date",
        DUTY_TYPE: "duty_type",
        UNA: "una",
        ROUTE_NO: "route_no",
        TRIP_ID: "trip_id",
        EMP_ID: "emp_id",
        TEAM_TYPE: "team_type",
        GENDER: "gender",
        EMP_NAME: "emp_name",
        EMPLOYEE_ADDRESS: "employee_address",
        LOCATION: "location",
        PICKUP_TIME: "pickup_time",
        REPORTING_TIME: "reporting_time",
        VENDOR: "vendor",
        OWNERSHIP: "ownership",
        CAB_NO: "cab_no",
        VEHICLE_NUMBER: "vehicle_number",
        CAB_TYPE: "cab_type",
        USE_ZONE_KM: "use_zone_km",
        CLAIM: "claim",
        PASS_ZONE: "pass_zone",
        PASS_AMOUNT: "pass_amount",
        GUARD_COST: "guard_cost",
        GUARD: "guard",
        REPORING_AREA: "reporting_area",
        BILL_AT: "bill_at",
        TRG_TYPE: "trg_type",
        TOLL_NAME: "toll_name",
        TOLL_AMOUNT: "toll_amount",
        TRIP_COST: "trip_cost",
        TAXABLE_AMOUNT: "taxable_amount",
      },
    },
    sundries: {
      sheet: "SUNDRIES",
      table: "airindia_sundries",
      requiredMonthHeaders: ["Month", "MONTH"],
      requiredFields: ["vehicle_no"],
      numericFields: ["mcd", "no_of_working_days"],
      dateFields: [],
      columns: {
        "Vehicle No.": "vehicle_no",
        "VEH. NO.": "veh_no",
        "VEH. TYPE": "veh_type",
        Ownership: "ownership",
        MCD: "mcd",
        "No. of working Days": "no_of_working_days",
      },
    },
    "penalty-vehicle-wise": {
      sheet: "penalty_VehicleWise",
      table: "airindia_penalty_vehicle_wise",
      requiredMonthHeaders: ["Month", "MONTH"],
      requiredFields: ["vehicle_no"],
      numericFields: ["amount"],
      dateFields: [],
      columns: {
        vehicleNO: "vehicle_no",
        Amount: "amount",
        Remark: "remark",
        Entity: "entity",
        Ownership: "ownership",
      },
    },
  },
};

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...headers,
    },
  });
}

function bytesResponse(base64, contentType, filename) {
  const bytes = base64Decode(base64);
  return new Response(bytes, {
    headers: {
      "content-type": contentType || "application/octet-stream",
      "content-disposition": `attachment; filename="${filename || "report.xlsx"}"`,
    },
  });
}

function csvEscape(value) {
  if (value === null || value === undefined) return "";
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function csvLine(values) {
  return values.map(csvEscape).join(",");
}

function humanizeKey(key) {
  return key.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function tableToCsv(title, rows, summary = []) {
  const lines = [[title], []];
  if (rows.length) {
    const headers = Object.keys(rows[0]);
    lines.push(headers.map(humanizeKey));
    for (const row of rows) lines.push(headers.map((key) => row[key]));
  } else {
    lines.push(["No rows"]);
  }
  if (summary.length) {
    lines.push([], ["Summary"]);
    for (const [key, value] of summary) lines.push([humanizeKey(key), value]);
  }
  return lines.map(csvLine).join("\r\n");
}

function reportToCsv(clientId, reportType, report) {
  const title = `${clientId === "airindia" ? "Air India" : "Agilent"} ${humanizeKey(reportType)} ${report.month || ""}`.trim();
  if (Array.isArray(report.rows)) {
    const summary = Object.entries(report).filter(([key, value]) => key !== "rows" && key !== "month" && typeof value !== "object");
    return tableToCsv(title, report.rows, summary);
  }
  if (Array.isArray(report.items)) {
    const summary = Object.entries(report).filter(([key, value]) => key !== "items" && key !== "month" && typeof value !== "object");
    return tableToCsv(title, report.items, summary);
  }
  if (Array.isArray(report.expenses)) {
    const summary = Object.entries(report).filter(([key, value]) => key !== "expenses" && key !== "month" && typeof value !== "object");
    return tableToCsv(title, report.expenses, summary);
  }

  const expenseRows = Object.values(report).filter((value) => value && typeof value === "object" && "particulars" in value);
  if (expenseRows.length) {
    const summary = Object.entries(report).filter(([key, value]) => key !== "month" && !(value && typeof value === "object"));
    return tableToCsv(title, expenseRows, summary);
  }

  const rows = Object.entries(report).filter(([key]) => key !== "month").map(([key, value]) => ({
    particulars: humanizeKey(key),
    amount: value,
  }));
  return tableToCsv(title, rows);
}

function csvResponse(csv, filename) {
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
    },
  });
}

function safeFilenamePart(value) {
  return String(value).replace(/[^a-z0-9._-]+/gi, "_").replace(/^_+|_+$/g, "");
}

function corsHeaders(request, env) {
  const origin = request.headers.get("origin") || "";
  const allowed = (env.FRONTEND_ORIGIN || "").split(",").map((item) => item.trim()).filter(Boolean);
  const allowOrigin = allowed.includes(origin) ? origin : allowed[0] || "*";
  return {
    "access-control-allow-origin": allowOrigin,
    "access-control-allow-credentials": "true",
    "access-control-allow-methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "access-control-allow-headers": "content-type,authorization",
    "access-control-expose-headers": "content-disposition",
  };
}

function withCors(response, request, env) {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders(request, env))) {
    headers.set(key, value);
  }
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function parseUsers(rawUsers = "admin:admin123:Admin") {
  const users = new Map();
  for (const rawUser of rawUsers.split(",")) {
    const [username, password, name] = rawUser.trim().split(":");
    if (username && password && name) users.set(username, { password, name });
  }
  return users;
}

function base64UrlEncode(bytes) {
  const binary = String.fromCharCode(...bytes);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function base64UrlDecode(value) {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/") + "=".repeat((4 - (value.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function base64Decode(value) {
  const binary = atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function hmac(payload, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return base64UrlEncode(new Uint8Array(signature));
}

async function createToken(username, name, env) {
  const now = Math.floor(Date.now() / 1000);
  const ttl = Number(env.TOKEN_TTL_SECONDS || 43200);
  const payload = base64UrlEncode(new TextEncoder().encode(JSON.stringify({ sub: username, name, iat: now, exp: now + ttl })));
  return `${payload}.${await hmac(payload, env.TOKEN_SECRET)}`;
}

async function decodeToken(token, env) {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) throw statusError(401, "Invalid token");
  const expected = await hmac(payload, env.TOKEN_SECRET);
  if (signature !== expected) throw statusError(401, "Invalid token");
  const data = JSON.parse(new TextDecoder().decode(base64UrlDecode(payload)));
  if (Number(data.exp || 0) < Math.floor(Date.now() / 1000)) throw statusError(401, "Token expired");
  return data;
}

function bearerToken(request) {
  const header = request.headers.get("authorization") || "";
  if (!header.toLowerCase().startsWith("bearer ")) throw statusError(401, "Missing bearer token");
  return header.slice(7);
}

function statusError(status, message, extra = {}) {
  const error = new Error(message);
  error.status = status;
  error.extra = extra;
  return error;
}

async function requireSession(request, env) {
  return decodeToken(bearerToken(request), env);
}

function supabaseHeaders(env, schema) {
  return {
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    "content-type": "application/json",
    accept: "application/json",
    "accept-profile": schema,
    "content-profile": schema,
  };
}

async function supabaseFetch(env, schema, path, init = {}) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw statusError(500, "Supabase secrets are not configured");
  }
  const response = await fetch(`${env.SUPABASE_URL.replace(/\/$/, "")}/rest/v1${path}`, {
    ...init,
    headers: {
      ...supabaseHeaders(env, schema),
      ...(init.headers || {}),
    },
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const message = data?.message || data?.hint || `Supabase request failed with ${response.status}`;
    throw statusError(response.status, message, { supabase: data });
  }
  return data;
}

async function getSingle(env, config, table, month, defaults) {
  const rows = await supabaseFetch(
    env,
    config.schema,
    `/${table}?month=eq.${encodeURIComponent(month)}&limit=1`,
  );
  return rows[0] || { month, ...defaults };
}

async function upsertByMonth(env, config, table, month, payload) {
  const rows = await supabaseFetch(env, config.schema, `/${table}?on_conflict=month`, {
    method: "POST",
    headers: { prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify([{ month, ...payload }]),
  });
  return rows[0];
}

async function insertRows(env, config, table, rows) {
  await supabaseFetch(env, config.schema, `/${table}`, {
    method: "POST",
    headers: { prefer: "return=minimal" },
    body: JSON.stringify(rows),
  });
}

async function listMonths(env, config) {
  const months = new Set();
  for (const table of config.monthTables) {
    try {
      const rows = await supabaseFetch(env, config.schema, `/${table}?select=month`);
      for (const row of rows) {
        if (row.month) months.add(row.month);
      }
    } catch (error) {
      if (error.status !== 404) throw error;
    }
  }
  return { months: [...months].sort() };
}

async function callRpc(env, schema, fnName, payload) {
  try {
    return await supabaseFetch(env, schema, `/rpc/${fnName}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (error) {
    if ([404, 405].includes(error.status)) {
      throw statusError(501, `Create Supabase RPC function: ${fnName}`, { rpc: fnName });
    }
    throw error;
  }
}

function normalizeHeaderMap(row) {
  const map = new Map();
  for (const key of Object.keys(row)) {
    map.set(key.trim(), key);
  }
  return map;
}

function toFloat(value) {
  if (value === null || value === undefined || value === "") return 0;
  const normalized = typeof value === "string" ? value.replaceAll(",", "").trim() : value;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toDate(value) {
  if (value === null || value === undefined || value === "") return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
}

function toText(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text || null;
}

function normalizeUploadRows(spec, rawRows) {
  if (!Array.isArray(rawRows)) throw statusError(400, "Upload payload must include rows array");
  const warnings = new Set();
  const records = [];
  let month = "unknown";

  for (const rawRow of rawRows) {
    const headerMap = normalizeHeaderMap(rawRow);
    const monthHeader = spec.requiredMonthHeaders.find((header) => headerMap.has(header));
    if (!monthHeader) throw statusError(400, "Uploaded sheet is missing the required 'Month' column.");

    const record = { month: toText(rawRow[headerMap.get(monthHeader)]) };
    if (record.month && month === "unknown") month = record.month;

    for (const [sourceHeader, targetField] of Object.entries(spec.columns)) {
      const actualHeader = headerMap.get(sourceHeader);
      if (!actualHeader) {
        warnings.add(`Column '${sourceHeader}' not found in uploaded file; defaulting to empty/0.`);
      }
      const value = actualHeader ? rawRow[actualHeader] : null;
      if (spec.numericFields.includes(targetField)) {
        record[targetField] = toFloat(value);
      } else if (spec.dateFields.includes(targetField)) {
        record[targetField] = toDate(value);
      } else {
        record[targetField] = toText(value);
      }
    }

    const hasRequiredText = spec.requiredFields.some((field) => record[field]);
    const hasNumericValue = spec.numericFields.some((field) => record[field]);
    if (record.month && (hasRequiredText || hasNumericValue)) records.push(record);
  }

  if (!records.length) throw statusError(400, "No valid rows found in the uploaded file.");
  return { records, month, warnings: [...warnings] };
}

async function handleAuth(request, env, segments) {
  if (request.method === "POST" && segments[1] === "login") {
    const { username, password } = await request.json();
    const user = parseUsers(env.AUTH_USERS).get(username);
    if (!user || user.password !== password) throw statusError(401, "Invalid username or password");
    return json({
      access_token: await createToken(username, user.name, env),
      token_type: "bearer",
      user: { username, name: user.name },
    });
  }

  if (request.method === "GET" && segments[1] === "me") {
    const payload = await requireSession(request, env);
    return json({ username: payload.sub, name: payload.name });
  }

  if (request.method === "POST" && segments[1] === "verify") {
    const { token } = await request.json();
    const payload = await decodeToken(token, env);
    return json({ active: true, username: payload.sub, name: payload.name });
  }

  throw statusError(404, "Auth route not found");
}

async function handleClient(request, env, segments, url) {
  await requireSession(request, env);
  const clientId = segments[1];
  const config = CLIENT_CONFIG[clientId];
  if (!config) throw statusError(404, `Unknown client backend: ${clientId}`);

  const area = segments[2];
  if (request.method === "GET" && area === "months") {
    return json(await listMonths(env, config));
  }

  if (["manual-inputs", "expenses"].includes(area)) {
    const month = decodeURIComponent(segments[3] || "");
    if (!month) throw statusError(400, "Missing month");
    const table = area === "manual-inputs" ? config.manualTable : config.expenseTable;
    const defaults = area === "manual-inputs" ? config.manualDefaults : config.expenseDefaults;

    if (request.method === "GET") {
      return json(await getSingle(env, config, table, month, defaults));
    }
    if (request.method === "POST") {
      return json(await upsertByMonth(env, config, table, month, await request.json()));
    }
  }

  if (request.method === "GET" && area === "reports") {
    const reportType = segments[3];
    const fnName = REPORT_RPC[clientId]?.[reportType];
    if (!fnName) throw statusError(404, `Unknown report: ${reportType}`);
    const month = url.searchParams.get("month");
    if (!month) throw statusError(400, "Missing month");
    return json(await callRpc(env, config.schema, fnName, { client_id: clientId, report_month: month }));
  }

  if (request.method === "GET" && area === "export") {
    const reportType = segments[3];
    const month = url.searchParams.get("month");
    if (!month) throw statusError(400, "Missing month");
    const fnName = REPORT_RPC[clientId]?.[reportType];
    if (!fnName) throw statusError(404, `Unknown report: ${reportType}`);
    const report = await callRpc(env, config.schema, fnName, { client_id: clientId, report_month: month });
    const csv = reportToCsv(clientId, reportType, report);
    return csvResponse(csv, `${clientId}_${reportType}_${safeFilenamePart(month)}.csv`);
  }

  if (request.method === "POST" && area === "upload") {
    const sheetType = segments[3];
    const spec = SHEET_SPECS[clientId]?.[sheetType];
    if (!spec) throw statusError(404, `Unknown sheet type: ${sheetType}`);
    const payload = await request.json();
    const { records, month, warnings } = normalizeUploadRows(spec, payload.rows);
    await insertRows(env, config, spec.table, records);
    return json({
      sheet: spec.sheet,
      month,
      rows_inserted: records.length,
      warnings,
    });
  }

  throw statusError(404, "Client route not found");
}

async function route(request, env) {
  const url = new URL(request.url);
  const segments = url.pathname.replace(/^\/api\/?/, "").replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);

  if (request.method === "OPTIONS") return new Response(null, { status: 204 });
  if (segments[0] === "health") return json({ status: "ok", runtime: "cloudflare-worker" });
  if (segments[0] === "wake") return json({ status: "ok", services: [] });
  if (segments[0] === "auth") return handleAuth(request, env, segments);
  if (segments[0] === "clients") return handleClient(request, env, segments, url);
  throw statusError(404, "Route not found");
}

export default {
  async fetch(request, env) {
    try {
      return withCors(await route(request, env), request, env);
    } catch (error) {
      const status = error.status || 500;
      return withCors(json({ detail: error.message || "Internal server error", ...error.extra }, status), request, env);
    }
  },
};
