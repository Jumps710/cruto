#!/usr/bin/env python3
import re

# main.gs.jsファイルを読み込む
with open('gas/main.gs.js', 'r', encoding='utf-8') as f:
    content = f.read()

# logSheet.appendRowの前にif (logSheet)がない箇所を検索して修正
# パターン1: 直接logSheet.appendRowを呼んでいる箇所
pattern1 = r'(?<!if \(logSheet\) \{\s{0,10})\s*logSheet\.appendRow\('
replacement1 = r'    if (logSheet) {\n      logSheet.appendRow('

# パターン2: インデントを考慮した修正
lines = content.split('\n')
new_lines = []
i = 0

while i < len(lines):
    line = lines[i]
    
    # logSheet.appendRowを含む行を検出
    if 'logSheet.appendRow(' in line:
        # 直前の行がif (logSheet)でない場合
        if i == 0 or 'if (logSheet)' not in lines[i-1]:
            # インデントを検出
            indent = len(line) - len(line.lstrip())
            
            # if (logSheet)を追加
            if_line = ' ' * indent + 'if (logSheet) {'
            new_lines.append(if_line)
            
            # 元の行のインデントを増やす
            new_lines.append('  ' + line)
            
            # 次の行から対応する}を探して追加
            bracket_count = 1
            j = i + 1
            
            # appendRowの閉じ括弧まで進む
            while j < len(lines) and bracket_count > 0:
                next_line = lines[j]
                if 'appendRow([' in line:  # 初回のみ
                    bracket_count += next_line.count('[') - next_line.count(']')
                if ']);' in next_line:
                    bracket_count = 0
                    new_lines.append('  ' + next_line)
                    new_lines.append(' ' * indent + '}')
                    i = j
                    break
                else:
                    new_lines.append('  ' + next_line)
                j += 1
        else:
            new_lines.append(line)
    else:
        new_lines.append(line)
    
    i += 1

# ファイルに書き戻す
with open('gas/main.gs.js', 'w', encoding='utf-8') as f:
    f.write('\n'.join(new_lines))

print("修正完了: すべてのlogSheet.appendRowにnullチェックを追加しました")