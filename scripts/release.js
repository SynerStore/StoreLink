/**
 * 发布脚本
 * 
 * 用于自动递增版本号并创建 Git tag
 * 
 * 使用方式:
 *   node scripts/release.js patch    # 0.0.1-beta.1 -> 0.0.2-beta.1
 *   node scripts/release.js minor    # 0.0.1-beta.1 -> 0.1.0-beta.1
 *   node scripts/release.js major    # 0.0.1-beta.1 -> 1.0.0-beta.1
 *   node scripts/release.js 1.2.3   # 自定义版本号
 * 
 *   node scripts/release.js patch --build    # 递增版本号并构建
 *   node scripts/release.js patch --publish  # 递增版本号、构建并发布到 GitHub
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PACKAGE_JSON = path.join(ROOT, 'package.json');

// 版本类型
const VERSION_TYPES = ['patch', 'minor', 'major'];

/**
 * 获取当前版本
 */
function getCurrentVersion() {
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf-8'));
  return pkg.version;
}

/**
 * 递增版本号
 * @param {string} currentVersion 当前版本
 * @param {string} type 版本类型或自定义版本
 * @returns {string} 新版本
 */
function incrementVersion(currentVersion, type) {
  // 如果是自定义版本号
  if (!VERSION_TYPES.includes(type)) {
    return type;
  }

  // 移除 beta 后缀进行处理
  const isBeta = currentVersion.includes('-beta');
  const baseVersion = currentVersion.replace(/-beta\.\d+$/, '');
  
  const parts = baseVersion.split('.').map(Number);
  
  if (parts.length < 3) {
    console.error('Invalid version format. Expected x.y.z');
    process.exit(1);
  }

  const [major, minor, patch] = parts;

  switch (type) {
    case 'patch':
      parts[2] += 1;
      break;
    case 'minor':
      parts[1] += 1;
      parts[2] = 0;
      break;
    case 'major':
      parts[0] += 1;
      parts[1] = 0;
      parts[2] = 0;
      break;
  }

  let newVersion = parts.join('.');
  
  // 如果原来有 beta 后缀，保持
  if (isBeta) {
    newVersion += '-beta.1';
  }

  return newVersion;
}

/**
 * 执行命令
 */
function exec(command, options = {}) {
  console.log(`> ${command}`);
  try {
    return execSync(command, {
      stdio: 'inherit',
      cwd: ROOT,
      ...options,
    });
  } catch (error) {
    console.error(`Command failed: ${command}`);
    process.exit(1);
  }
}

/**
 * 更新 package.json 版本
 */
function updateVersion(newVersion) {
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf-8'));
  const oldVersion = pkg.version;
  pkg.version = newVersion;
  fs.writeFileSync(PACKAGE_JSON, JSON.stringify(pkg, null, 2) + '\n');
  console.log(`Version: ${oldVersion} -> ${newVersion}`);
}

/**
 * 创建 Git tag
 */
function createGitTag(version) {
  const tag = `v${version}`;
  
  // 检查 tag 是否已存在
  try {
    execSync(`git tag ${tag}`, { stdio: 'ignore' });
    console.log(`Created tag: ${tag}`);
  } catch (error) {
    console.log(`Tag ${tag} already exists`);
  }
  
  return tag;
}

/**
 * 构建应用
 */
function buildApp(platform) {
  console.log('\n--- Building app ---');
  
  const buildCmd = platform === 'mac' ? 'make:mac' : 
                   platform === 'win' ? 'make:win' : 
                   platform === 'linux' ? 'make:linux' : 'make';
  
  exec(`npm run ${buildCmd}`);
}

/**
 * 发布到 GitHub
 */
function publishToGitHub() {
  console.log('\n--- Publishing to GitHub ---');
  
  // 确保所有 commits 已推送
  exec('git push');
  
  // 推送 tags
  exec('git push --tags');
  
  console.log('\n✅ Published to GitHub!');
  console.log('Now go to GitHub to create a Release and upload the installer.');
}

/**
 * 主函数
 */
function main() {
  const args = process.argv.slice(2);
  const type = args[0] || 'patch';
  const options = args.slice(1);
  
  const shouldBuild = options.includes('--build');
  const shouldPublish = options.includes('--publish');
  
  console.log('=== Release Script ===\n');
  
  // 获取当前版本
  const currentVersion = getCurrentVersion();
  console.log(`Current version: ${currentVersion}`);
  
  // 计算新版本
  const newVersion = incrementVersion(currentVersion, type);
  console.log(`New version: ${newVersion}\n`);
  
  // 确认
  if (!shouldBuild && !shouldPublish) {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    readline.question(`Create version ${newVersion}? (y/n) `, (answer) => {
      readline.close();
      if (answer.toLowerCase() !== 'y') {
        console.log('Cancelled');
        process.exit(0);
      }
      proceed();
    });
  } else {
    proceed();
  }
  
  function proceed() {
    // 更新版本
    updateVersion(newVersion);
    
    // 创建 Git tag
    createGitTag(newVersion);
    
    // 构建
    if (shouldBuild) {
      buildApp('mac'); // 默认构建 mac 版
      
      if (shouldPublish) {
        publishToGitHub();
        
        console.log('\n=== Next Steps ===');
        console.log('1. Go to GitHub Releases');
        console.log('2. Create a new Release from the tag');
        console.log('3. Upload the installer from dist/');
        console.log('4. Write release notes');
      }
    } else {
      console.log('\n=== Next Steps ===');
      console.log(`1. Review changes: git diff`);
      console.log(`2. Commit: git add . && git commit -m "Release v${newVersion}"`);
      console.log(`3. Push: git push`);
      console.log(`4. Create GitHub Release with installer`);
    }
  }
}

main();
