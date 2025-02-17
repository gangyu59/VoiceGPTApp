// 获取页面元素
const micButton = document.getElementById('start-btn');
const chatBox = document.getElementById('chat-box');

// 维护对话历史
let conversationHistory = [];

// 进度条
let progressBar = document.createElement('progress');
progressBar.id = 'speech-progress';
progressBar.value = 0;
progressBar.max = 100;
progressBar.style.display = 'none';
progressBar.style.height = '6px';
progressBar.style.border = 'none';
progressBar.style.position = 'relative';

// 进度条必须在 `chatBox` 内部，以便每次更新宽度
chatBox.appendChild(progressBar);

// 停止播放按钮
let stopButton = document.createElement('button');
stopButton.id = 'stop-btn';
stopButton.innerText = '⏹ 停止播放';
stopButton.style.display = 'none';
stopButton.style.padding = '8px 12px';
stopButton.style.backgroundColor = 'red';
stopButton.style.color = 'white';
stopButton.style.border = 'none';
stopButton.style.borderRadius = '5px';
stopButton.style.cursor = 'pointer';
stopButton.style.height = micButton.offsetHeight + 'px';
stopButton.style.marginLeft = '10px';

// 将停止按钮放在麦克风按钮旁边
micButton.parentNode.insertBefore(stopButton, micButton.nextSibling);

// 监听麦克风按钮点击
micButton.addEventListener('click', function () {
    if (!micButton.disabled) {
        // 预加载空白语音，防止 Safari 阻止播放
        const tempSpeech = new SpeechSynthesisUtterance('');
        window.speechSynthesis.speak(tempSpeech);

        startSpeechRecognition(handleUserSpeech);
    }
});

// 监听停止播放按钮
stopButton.addEventListener('click', function () {
    stopSpeechPlayback();
});

// 处理用户语音输入
function handleUserSpeech(transcript) {
    chatBox.innerHTML += `<div class="user-message"><strong>你:</strong> ${transcript}</div>`;

		// 滚动到底部
    scrollChatToBottom();

    // 记录用户输入到对话历史
    conversationHistory.push({ role: 'user', content: transcript });

    // 禁用麦克风 & 显示沙漏
    disableMic(true);
    showHourglass();

    fetchGPTResponse();
}

// **自动滚动聊天框到底部**
function scrollChatToBottom() {
    chatBox.scrollTop = chatBox.scrollHeight;
}

// GPT 交互
async function fetchGPTResponse() {
    const apiKey = '84fba46b577b46f58832ef36527e41d4'; // 替换为你的 API Key
    const url = 'https://gpt4-111-us.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2024-02-01';

    const headers = {
        'Content-Type': 'application/json',
        'api-key': apiKey,
    };

    const body = JSON.stringify({
        model: 'gpt-4o',
        messages: conversationHistory, // 发送完整的对话历史
        max_tokens: 1000,
        temperature: 0.7
    });

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: body
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        const gptReply = data.choices[0].message.content.trim();

        // 记录 GPT 回复到对话历史
        conversationHistory.push({ role: 'assistant', content: gptReply });

        // 确保 `hourglass` 只在 GPT 生成前出现
        hideHourglass();

        // 显示 GPT 回复
        const messageDiv = document.createElement('div');
        messageDiv.className = 'gpt-message';
        messageDiv.innerHTML = `<strong>GPT:</strong> ${gptReply}`;
        chatBox.appendChild(messageDiv);

        // 让进度条与最新的 GPT 回复对话框宽度一致
        progressBar.style.width = messageDiv.clientWidth + 'px';
        progressBar.style.display = 'block'; // 确保进度条出现

        // 播放 GPT 回复语音，并显示进度条和停止按钮
        textToSpeech(gptReply);

    } catch (error) {
        console.error("fetchGPTResponse error:", error);
        hideHourglass();
        chatBox.innerHTML += `<div class="gpt-message"><strong>GPT:</strong> 抱歉，发生错误！</div>`;
    }
}

// 语音合成
function textToSpeech(text) {
    if ('speechSynthesis' in window) {
        const speech = new SpeechSynthesisUtterance(text);
        speech.lang = 'zh-CN';
        speech.rate = 1.1;
        speech.pitch = 1;

        // 显示进度条 & 停止按钮
        progressBar.style.display = 'block';
        stopButton.style.display = 'inline-block';
        progressBar.value = 0;

        let estimatedDuration = text.length * 80; // 估算语音时长（80ms/字符）
        let startTime = Date.now();

        let interval = setInterval(() => {
            let elapsedTime = Date.now() - startTime;
            progressBar.value = Math.min((elapsedTime / estimatedDuration) * 100, 100);
        }, 500);

        speech.onstart = function () {
            disableMic(true);
        };

        speech.onend = function () {
            disableMic(false);
            clearInterval(interval);
            progressBar.style.display = 'none';
            stopButton.style.display = 'none';
        };

        stopButton.onclick = function () {
            stopSpeechPlayback();
            clearInterval(interval);
        };

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(speech);
    } else {
        console.error('语音合成不被支持');
    }
}

// 停止播放语音
function stopSpeechPlayback() {
    window.speechSynthesis.cancel();
    progressBar.style.display = 'none';
    stopButton.style.display = 'none';
    disableMic(false);
}

// 禁用/启用麦克风按钮
function disableMic(disabled) {
    micButton.disabled = disabled;
    micButton.style.opacity = disabled ? '0.5' : '1';
}

// 显示沙漏 (放大 2 倍，并浮动在 chatbox 上方)
function showHourglass() {
    let existingHourglass = document.getElementById('hourglass');
    if (!existingHourglass) {
        const hourglass = document.createElement('div');
        hourglass.id = 'hourglass';
        hourglass.innerHTML = '⌛ 正在思考...';
        hourglass.style.position = 'absolute'; // 使其浮动
        hourglass.style.top = chatBox.offsetTop + 150 + 'px'; // 放在 chatbox 上方
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