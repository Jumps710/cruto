# GitHub プッシュ設定ガイド

## 方法1: Personal Access Token (PAT) を使用

### 1. GitHub Personal Access Tokenの作成
1. GitHubにログイン
2. Settings → Developer settings → Personal access tokens → Tokens (classic)
3. "Generate new token (classic)" をクリック
4. 必要な権限を選択:
   - `repo` (すべてチェック)
   - `workflow` (GitHub Actions用)
5. トークンをコピー（一度しか表示されません）

### 2. 認証情報を設定
```bash
# トークンを使用してプッシュ
git remote set-url origin https://YOUR_GITHUB_USERNAME:YOUR_TOKEN@github.com/Jumps710/cruto.git
```

### 3. プッシュ
```bash
git push -u origin main
```

## 方法2: SSH認証を使用

### 1. SSH鍵の生成
```bash
ssh-keygen -t ed25519 -C "nonattonolife@gmail.com"
```

### 2. 公開鍵をGitHubに登録
```bash
cat ~/.ssh/id_ed25519.pub
```
コピーして、GitHub → Settings → SSH and GPG keys → New SSH key

### 3. リモートURLをSSHに変更
```bash
git remote set-url origin git@github.com:Jumps710/cruto.git
```

### 4. プッシュ
```bash
git push -u origin main
```

## 方法3: GitHub CLIを使用

```bash
# GitHub CLIのインストール
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh

# ログイン
gh auth login

# プッシュ
git push -u origin main
```

## 推奨: Personal Access Tokenを使用

最も簡単で安全な方法です。