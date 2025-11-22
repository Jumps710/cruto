const SalesDataRepository = {
  fetchTopRankings(target) {
    const sheetName = getSheetNameByTarget(target);
    if (!sheetName) {
      return [];
    }
    const sheet = SpreadsheetApp.openById(ENV.SPREADSHEET_ID).getSheetByName(sheetName);
    if (!sheet) {
      throw new Error('\u5bfe\u8c61\u30b7\u30fc\u30c8\u304c\u898b\u3064\u304b\u308a\u307e\u305b\u3093: ' + sheetName);
    }
    const values = sheet.getDataRange().getValues();
    if (!values || values.length <= 1) {
      return [];
    }

    const headers = values[0].map(function(cell) {
      return cell === null || cell === undefined ? '' : String(cell).trim();
    });
    const columnIndexes = resolveColumnIndexes(headers);

    const records = values.slice(1)
      .map(function(row) {
        return {
          name: toSafeString(row[columnIndexes.name]),
          requestCount: toSafeNumber(row[columnIndexes.requestCount]),
          usageCount: toSafeNumber(row[columnIndexes.usageCount]),
          contractRate: toSafeNumber(row[columnIndexes.contractRate]),
          averageStartDate: row[columnIndexes.averageStartDate],
          address: buildAddress(row, columnIndexes),
          lat: toSafeCoordinate(row[columnIndexes.lat]),
          lng: toSafeCoordinate(row[columnIndexes.lng])
        };
      })
      .filter(function(item) { return item.name; });

    if (records.length === 0) {
      return [];
    }

    const contractScores = records.map(function(item) { return normalizeContractRateForScore(item.contractRate); });
    const requestLogs = records.map(function(item) { return Math.log1p(Math.max(0, item.requestCount)); });
    const usageLogs = records.map(function(item) { return Math.log1p(Math.max(0, item.usageCount)); });

    const maxContractScore = contractScores.length > 0 ? Math.max.apply(null, contractScores) : 0;
    const maxRequestLog = requestLogs.length > 0 ? Math.max.apply(null, requestLogs) : 0;
    const maxUsageLog = usageLogs.length > 0 ? Math.max.apply(null, usageLogs) : 0;

    const weights = { contract: 0.5, request: 0.25, usage: 0.25 };

    const scored = records.map(function(item) {
      const contractComponentRaw = normalizeContractRateForScore(item.contractRate);
      const contractComponent = maxContractScore > 0 ? contractComponentRaw / maxContractScore : 0;
      const requestComponent = maxRequestLog > 0 ? Math.log1p(Math.max(0, item.requestCount)) / maxRequestLog : 0;
      const usageComponent = maxUsageLog > 0 ? Math.log1p(Math.max(0, item.usageCount)) / maxUsageLog : 0;

      const aggregate = (contractComponent * weights.contract) +
        (requestComponent * weights.request) +
        (usageComponent * weights.usage);

      const score = Number((aggregate * 100).toFixed(1));

      return Object.assign({}, item, {
        score: score,
        scoreBreakdown: {
          contract: Number((contractComponent * 100).toFixed(1)),
          request: Number((requestComponent * 100).toFixed(1)),
          usage: Number((usageComponent * 100).toFixed(1))
        }
      });
    });

    const sorted = scored.sort(function(a, b) { return b.score - a.score; });
    const ranked = sorted
      .slice(0, 40)
      .map(function(item, index) {
        return Object.assign({}, item, {
          contractRank: index + 1,
          scoreRank: index + 1
        });
      });
    return ranked;
  }
};

function toSafeNumber(value) {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  if (typeof value === 'number') {
    return value;
  }
  const parsed = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
  return Number.isNaN(parsed) ? 0 : parsed;
}

function toSafeString(value) {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).trim();
}

function toSafeCoordinate(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(num) ? num : null;
}

function sanitizeAddressPart(value) {
  var text = toSafeString(value);
  if (!text) {
    return '';
  }
  if (/^[-0-9]+$/.test(text)) {
    return '';
  }
  return text;
}

function buildAddress(row, indexes) {
  var primaryIndex = indexes.addressPrimary;
  if (primaryIndex !== null && primaryIndex !== undefined) {
    var primary = toSafeString(row[primaryIndex]);
    if (primary && primary !== '0') {
      return primary;
    }
  }
  if (indexes.addressParts && indexes.addressParts.length > 0) {
    var parts = [];
    indexes.addressParts.forEach(function(idx) {
      var part = toSafeString(row[idx]);
      if (part && part !== '0') {
        parts.push(part);
      }
    });
    if (parts.length > 0) {
      return parts.join('');
    }
  }
  var fallback = toSafeString(row[17]) || toSafeString(row[5]);
  if (fallback === '0') {
    return '';
  }
  return fallback;
}

function resolveColumnIndexes(headers) {
  return {
    name: findColumnIndex(headers, ['\u4e8b\u696d\u6240\u540d', '\u540d\u79f0', '\u6a5f\u95a2\u540d'], 0),
    requestCount: findColumnIndex(headers, ['\u4f9d\u983c\u4ef6\u6570', '\u4f9d\u983c\u6570'], 1),
    usageCount: findColumnIndex(headers, ['\u5229\u7528\u4ef6\u6570', '\u5229\u7528\u6570'], 2),
    contractRate: findColumnIndex(headers, ['\u5951\u7d04\u7387', '\u6210\u7d04\u7387'], 3),
    averageStartDate: findColumnIndex(headers, ['\u5e73\u5747\u5229\u7528\u958b\u59cb\u65e5', '\u5e73\u5747\u958b\u59cb\u65e5', '\u5e73\u5747\u5229\u7528\u958b\u59cb\u307e\u3067\u306e\u65e5\u6570'], 4),
    addressPrimary: findColumnIndex(headers, ['\u4f4f\u6240', '\u6240\u5728\u5730', '\u6240\u5728\u5730\uff08\u8a2a\u554f\u5148\uff09', '\u4f4f\u6240\uff08\u8a2a\u554f\u5148\uff09', '\u8a2a\u554f\u5148\u4f4f\u6240'], 17),
    addressParts: findColumnIndexes(headers, ['\u4f4f\u62401', '\u4f4f\u62402', '\u4f4f\u62403', '\u6240\u5728\u57301', '\u6240\u5728\u57302', '\u90fd\u9053\u5e9c\u770c', '\u5e02\u533a\u753a\u6751', '\u756a\u5730', '\u5efa\u7269\u540d']),
    lat: findColumnIndex(headers, ['\u7def\u5ea6', 'lat', 'latitude'], null),
    lng: findColumnIndex(headers, ['\u7d4c\u5ea6', 'lng', 'longitude'], null)
  };
}

function findColumnIndex(headers, candidates, fallbackIndex) {
  for (var i = 0; i < candidates.length; i++) {
    var idx = headers.indexOf(candidates[i]);
    if (idx !== -1) {
      return idx;
    }
  }
  return fallbackIndex;
}

function findColumnIndexes(headers, candidates) {
  var indexes = [];
  candidates.forEach(function(candidate) {
    var idx = headers.indexOf(candidate);
    if (idx !== -1) {
      indexes.push(idx);
    }
  });
  return indexes;
}

function getSheetNameByTarget(target) {
  switch (target) {
    case 'medical':
      return ENV.SHEETS.MEDICAL;
    case 'home':
      return ENV.SHEETS.HOME;
    case 'facility':
      return ENV.SHEETS.FACILITY;
    case 'counsel':
      return ENV.SHEETS.COUNSEL;
    default:
      return null;
  }
}

function normalizeContractRateForScore(value) {
  const numeric = typeof value === 'number' ? value : toSafeNumber(value);
  if (!isFinite(numeric) || numeric <= 0) {
    return 0;
  }
  const normalized = numeric > 1 ? numeric / 100 : numeric;
  if (!isFinite(normalized)) {
    return 0;
  }
  if (normalized < 0) {
    return 0;
  }
  if (normalized > 1) {
    return 1;
  }
  return normalized;
}
