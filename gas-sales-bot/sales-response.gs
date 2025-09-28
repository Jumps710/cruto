const SalesResponseBuilder = {
  buildBatches(rankedItems, params, offset) {
    const start = offset || 0;
    const end = Math.min(start + 3, rankedItems.length);
    const slice = rankedItems.slice(start, end);
    const messages = [];
    if (slice.length === 0) {
      messages.push(createTextMessage('これ以上の候補はありません。'));
      return messages;
    }
    messages.push(buildFlexCarousel(slice, start));
    const nextOffset = end;
    if (nextOffset < rankedItems.length && nextOffset < 9) {
      messages.push(buildMoreQuickReplyMessage(params, nextOffset));
    }
    return messages;
  }
};

function buildFlexCarousel(items, baseIndex) {
  const contents = items.map((item, idx) => buildFacilityBubble(item, baseIndex + idx + 1));
  return {
    type: 'flex',
    altText: '訪問先候補をご確認ください',
    contents: {
      type: 'carousel',
      contents
    }
  };
}

function buildFacilityBubble(item, displayRank) {
  const mapUrl = item.lat && item.lng
    ? `https://www.google.com/maps/search/?api=1&query=${item.lat},${item.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.address)}`;
  return {
    type: 'bubble',
    body: {
      type: 'box',
      layout: 'vertical',
      contents: [
        { type: 'text', text: `${displayRank}. ${item.name}`, weight: 'bold', size: 'md', wrap: true },
        buildInfoBox('依頼件数', item.requestCount),
        buildInfoBox('利用件数', item.usageCount),
        buildInfoBox('契約率', `${item.contractRate}%`),
        buildInfoBox('平均利用開始日', formatDateDisplay(item.averageStartDate)),
        buildInfoBox('住所', item.address || '住所不明'),
        item.distanceKm != null ? buildInfoBox('現在地から', `${item.distanceKm}km`) : null
      ].filter(Boolean)
    },
    footer: {
      type: 'box',
      layout: 'vertical',
      spacing: 'sm',
      contents: [
        {
          type: 'button',
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

function buildInfoBox(label, value) {
  return {
    type: 'box',
    layout: 'horizontal',
    spacing: 'sm',
    contents: [
      { type: 'text', text: label, size: 'sm', color: '#9CA3AF', flex: 3 },
      { type: 'text', text: String(value || '-'), size: 'sm', color: '#111827', wrap: true, flex: 5 }
    ]
  };
}

function buildMoreQuickReplyMessage(params, nextOffset) {
  const base = `lat=${params.lat}&lng=${params.lng}&target=${params.target}&offset=${nextOffset}`;
  return {
    type: 'text',
    text: 'さらに候補を表示しますか？',
    quickReply: {
      items: [
        createQuickReplyButton('もっと見る', `action=more&${base}`)
      ]
    }
  };
}

function formatDateDisplay(value) {
  if (!value) return '-';
  if (value instanceof Date) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy/MM/dd');
  }
  return String(value);
}
