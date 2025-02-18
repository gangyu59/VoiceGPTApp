// **utils.js - 复制功能相关**
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        console.log('已复制到剪贴板！');
    } catch (err) {
        console.error('复制失败，尝试手动复制:', err);
        manualCopyFallback(text);
    }
}

// **备用方法（如果 `navigator.clipboard` 失败）**
function manualCopyFallback(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy'); // 兼容旧版浏览器
    document.body.removeChild(textArea);
    console.log('已复制到剪贴板！');
}

// 显示沙漏 (放大 2 倍，并浮动在 chatbox 上方)
function showHourglass() {
    let existingHourglass = document.getElementById('hourglass');
    if (!existingHourglass) {
        const hourglass = document.createElement('div');
        hourglass.id = 'hourglass';
        hourglass.innerHTML = '⌛ 正在思考...';
        hourglass.style.position = 'absolute'; // 使其浮动
        hourglass.style.top = chatBox.offsetTop + 300 + 'px'; // 放在 chatbox 上方
        hourglass.style.left = '50%';
        hourglass.style.transform = 'translateX(-50%)';
        hourglass.style.padding = '10px 20px';
        hourglass.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        hourglass.style.color = 'white';
        hourglass.style.borderRadius = '8px';
        hourglass.style.fontSize = '24px'; // 放大字体
        hourglass.style.fontWeight = 'bold';
        hourglass.style.zIndex = '1000'; // 确保在最上层
        document.body.appendChild(hourglass); // 添加到 body 以浮动显示
    }
}

// 隐藏沙漏
function hideHourglass() {
    const hourglass = document.getElementById('hourglass');
    if (hourglass) {
        hourglass.remove();
    }
}