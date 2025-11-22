const SALES_RESPONSE_PAGE_SIZE = 5;
const SALES_RESPONSE_MAX_RESULTS = 20;

const SalesResponseBuilder = {
  buildBatches(rankedItems, params, offset) {
    const start = offset || 0;
    const cappedLength = Math.min(SALES_RESPONSE_MAX_RESULTS, rankedItems.length);
    const end = Math.min(start + SALES_RESPONSE_PAGE_SIZE, cappedLength);
    const slice = rankedItems.slice(start, end);

    if (slice.length === 0) {
      return [createTextMessage('これ以上の結果はありません。')];
    }

    const messages = [buildFlexCarousel(slice, start)];
    messages.push(buildControlQuickReplyMessage(params, end, end < cappedLength));
    return messages;
  }
};

function buildFlexCarousel(items, startIndex) {
  const contents = items.map((item, idx) => buildFacilityBubble(item, startIndex + idx + 1));
  return {
    type: 'flex',
    altText: '候補リストを表示しています。',
    contents: {
      type: 'carousel',
      contents
    }
  };
}

function buildFacilityBubble(item, rank) {
  const mapUrl = (item.lat != null && item.lng != null)
    ? `https://www.google.com/maps/search/?api=1&query=${item.lat},${item.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.address || '')}`;

  const infoRows = [
    buildInfoRow('依頼件数', formatNumberDisplay(item.requestCount)),
    buildInfoRow('利用件数', formatNumberDisplay(item.usageCount)),
    buildInfoRow('契約率', formatContractRate(item.contractRate)),
    buildInfoRow('平均利用開始日', formatAverageStartLeadTime(item.averageStartDate)),
    buildInfoRow('住所', formatAddress(item.address), { wrap: false, maxLines: 1 }),
    item.distanceKm != null ? buildInfoRow('距離', `${formatNumberDisplay(item.distanceKm)}km`) : null
  ].filter(Boolean);

  return {
    type: 'bubble',
    size: 'micro',
    body: {
      type: 'box',
      layout: 'vertical',
      paddingAll: '14px',
      spacing: 'md',
      contents: [
        {
          type: 'text',
          text: buildTitleText(item, rank),
          weight: 'bold',
          size: 'md',
          wrap: true,
          margin: 'none'
        },
        {
          type: 'box',
          layout: 'vertical',
          spacing: 'xs',
          contents: infoRows
        }
      ]
    },
    footer: {
      type: 'box',
      layout: 'vertical',
      spacing: 'sm',
      margin: 'md',
      contents: [
        {
          type: 'button',
          height: 'sm',
          style: 'primary',
          color: '#3B82F6',
          action: {
            type: 'uri',
            label: 'Mapをみる',
            uri: mapUrl
          }
        }
      ]
    }
  };
}

function buildTitleText(item, rank) {
  const name = item.name || '名称不明';
  return `${rank}位 ${name}`.trim();
}

function buildInfoRow(label, value, options) {
  const valueText = String(value || '-');
  if (options && options.layout === 'vertical') {
    return {
      type: 'box',
      layout: 'vertical',
      spacing: 'xs',
      margin: 'xs',
      contents: [
        { type: 'text', text: label, size: 'sm', color: '#9CA3AF', wrap: true },
        {
          type: 'text',
          text: valueText,
          size: 'sm',
          color: '#111827',
          wrap: true,
          maxLines: (options && options.maxLines) ? options.maxLines : undefined
        }
      ]
    };
  }
  const valueBox = {
    type: 'text',
    text: valueText,
    size: 'sm',
    color: '#111827',
    wrap: !(options && options.wrap === false),
    flex: 4
  };
  if (options && options.maxLines) {
    valueBox.maxLines = options.maxLines;
  }
  if (options && options.wrap === false) {
    valueBox.wrap = false;
  }
  return {
    type: 'box',
    layout: 'horizontal',
    spacing: 'sm',
    margin: 'xs',
    contents: [
      { type: 'text', text: label, size: 'sm', color: '#9CA3AF', wrap: true, flex: 3 },
      valueBox
    ]
  };
}

function buildControlQuickReplyMessage(params, nextOffset, hasMore) {
  const items = [];
  if (hasMore) {
    const base = `lat=${params.lat}&lng=${params.lng}&target=${params.target}&offset=${nextOffset}`;
    items.push(createQuickReplyButton('もっと見る', `action=more&${base}`));
  }
  items.push(createQuickReplyButton('やり直す', 'action=start'));
  return {
    type: 'text',
    text: hasMore ? '続きの候補を見ますか？' : '操作を選択してください。',
    quickReply: { items }
  };
}

function formatContractRate(value) {
  const numeric = parseFloat(String(value !== undefined && value !== null ? value : '').replace(/[^0-9.-]/g, ''));
  if (!isFinite(numeric)) {
    return '-';
  }
  const normalized = numeric <= 1 ? numeric * 100 : numeric;
  const rounded = Math.round(normalized * 10) / 10;
  return `${rounded}%`;
}

function formatAverageStartLeadTime(value) {
  if (!value) {
    return '-';
  }
  if (value instanceof Date) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy/MM/dd');
  }
  const numeric = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
  if (isFinite(numeric)) {
    if (numeric > 1000) {
      const excelEpoch = new Date(Date.UTC(1899, 11, 30));
      const date = new Date(excelEpoch.getTime() + Math.round(numeric * 86400000));
      if (isFinite(date.getTime())) {
        return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy/MM/dd');
      }
    }
    if (numeric <= 0) {
      return '同日開始';
    }
    const rounded = Math.round(numeric);
    return '約' + String(rounded) + '日';
  }
  const text = String(value).trim();
  return text || '-';
}

function formatDateDisplay(value) {
  return formatAverageStartLeadTime(value);
}

function formatNumberDisplay(value) {
  if (value === null || value === undefined) {
    return '-';
  }
  if (typeof value === 'number') {
    return Number.isInteger(value) ? value : Math.round(value * 10) / 10;
  }
  const parsed = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
  if (Number.isNaN(parsed)) {
    return String(value);
  }
  return Number.isInteger(parsed) ? parsed : Math.round(parsed * 10) / 10;
}

function formatAddress(value) {
  if (!value) {
    return '????';
  }
  const cleaned = String(value).replace(/\s+/g, ' ').trim();
  return cleaned || '????';

}
